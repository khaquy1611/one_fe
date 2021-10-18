import { Button, Form, message } from 'antd';
import { Evaluate } from 'app/CommonEvaluation';
import CommentItem from 'app/CommonEvaluation/CommentItem';
import { usePaginateInfinity, useQueryUrl, useUser, useLng } from 'app/hooks';
import { DX } from 'app/models';
import CommonEvaluate from 'app/models/CommonEvaluate';
import SmeEvaluate from 'app/models/SmeEvaluate';
import { trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import ModalNotification from 'sme/LoginPage/components/ModalNotification';
import ModalCreateEvaluate from './ModalCreateEvaluate';

const successModal = {
	iconType: 'SUCCESS_CMT',
	title: 'thanksForSharing',
	subTile: 'yourRatingIsHelpful',
	textButton: 'close',
	typeButton: 'default',
};

function EvaluateService({ dataEvaluate, allowRating, serviceId, refreshDataEvaluate, type }) {
	const { user } = useUser();
	const CAN_EVALUATE = DX.canAccessFuture2('sme/evaluate-service', user.permissions);

	const CAN_UPDATE_EVALUATE = DX.canAccessFuture2('update-evaluate-service', user.permissions);
	const [isModalShow, setModalShow] = useState();
	const [isDirty, setDirty] = useState();
	const [isError, setError] = useState();
	const [form] = Form.useForm();
	const [count, setCount] = useState(0);
	const { tMessage, tOthers, tButton } = useLng();
	const [modalEditEvaluation, setModalEditEvaluation] = useState(false);
	const [dataUpdate, setDataUpdate] = useState();

	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');

	const { canLoadMore, loadMore, data: content, refetch, isFetching } = usePaginateInfinity(
		(params) => CommonEvaluate.getListComment(serviceId, params),
		[paramFollow],
	);
	const showMoreResponse = () => {
		loadMore();
	};

	const [infoModal, setInfoModal] = useState({});
	useEffect(() => {
		refetch();
	}, [user]);

	const insertComment = useMutation(SmeEvaluate.insertComment, {
		onSuccess: () => {
			setModalShow(false);
			refreshDataEvaluate();
			refetch();
			const value = count + 1;
			setCount(value);
			setInfoModal(successModal);
			setModalEditEvaluation(true);
			setDirty(false);
			setError(false);
			form.resetFields();
		},
		onError: () => {
			setModalShow(false);
			form.resetFields();
			message.error(tMessage('isCrashed'));
		},
	});

	const updateCommentMutate = useMutation(SmeEvaluate.updateComment, {
		onSuccess: () => {
			setModalShow(false);
			refreshDataEvaluate();
			refetch();
			const value = count + 1;
			setCount(value);
			setInfoModal(successModal);
			setModalEditEvaluation(true);
			setDirty(false);
			setError(false);
			form.resetFields();
		},
		onError: () => {
			setModalShow(false);
			form.resetFields();
			message.error(tMessage('isCrashed'));
		},
	});

	const updateLikeEvaluate = useMutation(SmeEvaluate.updateLikeEvaluate, {
		onSuccess: () => {
			refetch();
		},
	});

	const createNewEvaluate = (valueForm) => {
		if (!valueForm.display || !valueForm.request || !valueForm.speed || !valueForm.support) {
			setError(true);
			return;
		}
		const rating = [
			{ criteriaId: 1, ratingPoint: valueForm.request },
			{ criteriaId: 2, ratingPoint: valueForm.speed },
			{ criteriaId: 3, ratingPoint: valueForm.display },
			{ criteriaId: 4, ratingPoint: valueForm.support },
		];

		const value = { rating, comment: valueForm.comment };
		insertComment.mutate({ id: serviceId, request: value });
	};
	const onFinish = (valueForm) => {
		if (!dataUpdate) {
			createNewEvaluate(valueForm);
		} else {
			if (
				valueForm.display === 0 ||
				valueForm.request === 0 ||
				valueForm.speed === 0 ||
				valueForm.support === 0
			) {
				setError(true);
				return;
			}

			const ratingOwner = dataEvaluate?.ratingOwner;
			const rating = [
				{
					ratingId: ratingOwner?.ratingDetail[0].ratingId,
					ratingPoint: valueForm.request || ratingOwner.ratingDetail[0].ratingPoint,
				},
				{
					ratingId: ratingOwner.ratingDetail[1].ratingId,
					ratingPoint: valueForm.speed || ratingOwner.ratingDetail[1].ratingPoint,
				},
				{
					ratingId: ratingOwner.ratingDetail[2].ratingId,
					ratingPoint: valueForm.display || ratingOwner.ratingDetail[2].ratingPoint,
				},
				{
					ratingId: ratingOwner.ratingDetail[3].ratingId,
					ratingPoint: valueForm.support || ratingOwner.ratingDetail[3].ratingPoint,
				},
			];

			const value = {
				rating,
				comment: typeof valueForm.comment === 'string' ? trim(valueForm.comment) : ratingOwner.commentContent,
			};

			if (!serviceId) {
				createNewEvaluate(valueForm);
				return;
			}
			updateCommentMutate.mutate({ id: serviceId, request: value });
		}
	};

	function updateLikeStatus(id) {
		if (user.id) updateLikeEvaluate.mutate(id);
	}

	const updateComment = (id) => {
		if (dataEvaluate?.ratingOwner) {
			setDataUpdate(dataEvaluate?.ratingOwner);
			setModalShow(true);
		}
	};
	return (
		<div className="text-base">
			{allowRating === 'YES' && dataEvaluate?.ratingQuantity === 0 && (
				<div className="font-semibold mb-5 text-center">{tOthers('beTheFirstRating')}</div>
			)}
			{dataEvaluate.ratingQuantity !== 0 && (
				<Evaluate
					className="font-bold text-xl mb-5 text-primary uppercase"
					isSme
					data={dataEvaluate}
					title={tOthers('ratingDetail')}
					initRate={false}
				/>
			)}
			{dataEvaluate.ratingQuantity === 0 && (allowRating === 'NO' || dataEvaluate?.allowResponse === 'NO') && (
				<>
					<div className="font-bold text-xl mb-5 text-primary uppercase">{tOthers('ratingDetail')}</div>
					<div className="font-bold">{tOthers('beTheFirstRating')}</div>
				</>
			)}

			{user.roles.length > 0 && allowRating === 'YES' && (
				<div className="mt-8 mb-4">
					<div className="font-bold text-xl text-primary mb-8 uppercase">{tOthers('yourRating')}</div>
					{user.roles.length > 0 && allowRating === 'YES' && dataEvaluate?.ratingOwner && (
						<div className="mb-2 pb-2">
							<CommentItem
								type={type}
								data={dataEvaluate?.ratingOwner}
								refetch={refetch}
								updateLikeStatus={updateLikeStatus}
								commenter={`${user.firstname} ${user.lastname}`}
								isUpdate
								updateComment={updateComment}
							/>
						</div>
					)}
					<hr style={{ border: 'none', borderBottom: '1px solid #CFD8DC' }} />
					<Evaluate
						isSme
						allowRating={allowRating}
						data={dataEvaluate?.ratingOwner}
						initRate
						onClick={() => {
							if (!dataEvaluate?.ratingOwner && CAN_EVALUATE) {
								setDataUpdate(dataEvaluate?.ratingOwner);
								setModalShow(true);
							}
						}}
					/>
				</div>
			)}
			{user.roles.length > 0 && allowRating === 'YES' && !dataEvaluate?.ratingOwner && CAN_EVALUATE && (
				<Button
					type="link"
					text-base
					className="font-bold text-xl text-primary uppercase mb-2 ml-2"
					onClick={() => {
						setModalShow(true);
					}}
				>
					{tButton('writeRating')}
				</Button>
			)}

			{allowRating === 'YES' &&
				dataEvaluate.ratingQuantity !== 0 &&
				content.length === 0 &&
				(dataEvaluate?.ratingOwner === null || dataEvaluate?.ratingOwner?.commentContent === null) && (
					<div className="font-semibold mb-4 mt-6">{tOthers('beTheFirstRating')}</div>
				)}
			{dataEvaluate.ratingQuantity !== 0 && (allowRating === 'NO' || dataEvaluate?.allowResponse === 'NO') ? (
				<>
					<div className="font-bold text-xl text-primary my-8 uppercase">{tOthers('detailReview')}</div>
					{content.length === 0 ? (
						<div className="font-semibold mb-4 mt-6 text-base">{tOthers('noServiceReview')}</div>
					) : (
						''
					)}
				</>
			) : (
				''
			)}
			{dataEvaluate?.allowRating === 'YES' && dataEvaluate.ratingQuantity !== 0 && content.length !== 0 && (
				<div className="font-bold text-xl text-primary my-8 uppercase">{tOthers('detailReview')}</div>
			)}
			{content?.length > 0 &&
				content.map((item) => (
					<CommentItem type={type} data={item} refetch={refetch} updateLikeStatus={updateLikeStatus} />
				))}

			{canLoadMore && (
				<div className="text-center mt-6">
					<Button
						type="link"
						htmlType="button"
						className="text-blue-600 hover:text-blue-800"
						onClick={showMoreResponse}
						loading={isFetching}
					>
						{content?.length < 20 ? (
							<div>{tButton('watchAllReview')}</div>
						) : (
							<div>{tButton('watchMore')}</div>
						)}
					</Button>
				</div>
			)}
			<ModalCreateEvaluate
				isDirty={isDirty}
				setDirty={setDirty}
				isModalShow={isModalShow}
				setModalShow={setModalShow}
				onFinish={onFinish}
				form={form}
				isError={isError}
				setError={setError}
				dataUpdate={dataUpdate}
				isLoading={updateCommentMutate.isLoading || insertComment.isLoading}
			/>
			<ModalNotification
				visibleModal={modalEditEvaluation}
				setVisibleModal={setModalEditEvaluation}
				infoModal={{
					...infoModal,
					redirectPage: `${DX.sme.createPath(`/service/${serviceId}?tab=2`)}`,
				}}
			/>
		</div>
	);
}

export default EvaluateService;
