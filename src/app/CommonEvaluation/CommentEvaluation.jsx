import React, { useState } from 'react';

import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	LikeFilled,
	LikeOutlined,
	SendOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popover, Rate, Tooltip } from 'antd';
import ResponseIcon from 'app/icons/ResponseIcon';
import { useMutation } from 'react-query';
import DevEvaluate from 'app/models/DevEvaluate';
import AdminEvaluate from 'app/models/AdminEvaluate';
import { isInt } from 'app/validator';
import { trim } from 'opLodash';
import { DX } from 'app/models';
import useUser from '../hooks/useUser';

function CommentEvaluation({
	type,
	data = {},
	onChangeSave,
	formCreate,
	refetch,
	isUpdate,
	updateLikeStatus,
	updateComment,
}) {
	const { user } = useUser();
	const CAN_RESPONSE_DEV =
		type === 'dev' &&
		(DX.canAccessFuture2('dev/response-service', user.permissions) ||
			DX.canAccessFuture2('dev/response-combo', user.permissions));
	const CAN_DELETE_ADMIN = type === 'admin' && DX.canAccessFuture2('admin/delete-comment-service', user.permissions);
	const CAN_UPDATE_SME = type === 'sme' && DX.canAccessFuture2('sme/update-evaluate-service', user.permissions);

	const [isDirty, setDirty] = useState(false);
	const mutationDelete = useMutation(AdminEvaluate.deleteComment, {
		onSuccess: () => {
			message.success('Xóa nhận xét thành công');
			refetch();
		},
	});
	function setChangeValue() {
		if (trim(formCreate.getFieldValue('content')) === '') setDirty(false);
		setDirty(true);
	}
	function openModal() {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa nhận xét?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Đồng ý',
			cancelText: 'Hủy',
			onOk: () => {
				mutationDelete.mutate({
					id: data.commentId,
				});
			},
		});
	}
	const [isReply, setReply] = useState();
	const mutationCreateFeedback = useMutation(DevEvaluate.createResponseComment, {
		onSuccess: () => {
			refetch();
			setReply(false);
		},
		onError: (err) => {},
	});

	function submitCreateRes() {
		const createResponse = {
			responseContent: formCreate.getFieldValue('content'),
		};
		mutationCreateFeedback.mutate({
			id: data?.commentId,
			query: createResponse,
		});
		setDirty(false);
	}

	const updateStatusLike = (id) => {
		if (!isUpdate) {
			updateLikeStatus(id);
		}
	};

	const updateCommentStatus = (id) => {
		updateComment(id);
	};

	const content = (
		<div className="w-98">
			<h4 className="mb-2 font-semibold">Đánh giá</h4>
			{data.ratingDetail.length > 0 &&
				data.ratingDetail.map((item) => (
					<div className="flex justify-between items-center" key={item.ratingId}>
						<div className="mb-2">{item.criteria}</div>
						<div className="mb-2">
							<Rate
								className="text-base"
								allowHalf
								disabled
								style={{ color: '#F4BF1B' }}
								value={isInt(item.avgRating) || isInt(item.ratingPoint)}
							/>
						</div>
					</div>
				))}
		</div>
	);

	return (
		<div>
			{/* header */}
			<div className="flex justify-between">
				<div className="w-full flex gap-4">
					<div className="w-14 h-14 rounded-full overflow-hidden">
						<img
							className="object-cover w-full h-full"
							alt={data?.userName || 'No name'}
							title={data?.userName || 'No name'}
							src={data.icon || data.externalLinkIcon || '/images/NoImageNew.svg'}
						/>
					</div>
					<div className="w-full" style={{ width: 'calc(100% - 3.5rem)' }}>
						{type === 'sme' && (
							<>
								<Tooltip placement="bottomLeft" title={data.companyName || ''}>
									<div className="font-bold line-clamp-2 mb-1">{data.companyName || ''}</div>
								</Tooltip>
								<div className="text-sm line-clamp-1">{data.userName || ''}</div>
							</>
						)}
						{(type === 'dev' || type === 'admin') && (
							<div className="">
								<Tooltip placement="bottomLeft" title={data.companyName || ''}>
									<span className="inline-block max-w-lg font-medium mr-1 text-primary truncate">
										{data.companyName}
									</span>
								</Tooltip>

								<span className="inline-block max-w-xl truncate">&bull; {data.userName}</span>
							</div>
						)}

						<Popover placement="topLeft" content={content} trigger="hover">
							<Button type="text" className="p-0 cursor-default border-none">
								<Rate
									allowHalf
									disabled
									value={isInt(data.avgRating)}
									className="text-sm focus-within:bg-gray-50"
									style={{ color: '#F4BF1B' }}
								/>
							</Button>
						</Popover>
						<span style={{ color: '#999' }} className="ml-2 text-sm">
							{data.commentTime || data.timeRating}
						</span>
					</div>
				</div>

				<div className="flex mx-6 mr-1.5">
					{type === 'sme' && isUpdate && CAN_UPDATE_SME && (
						<Button
							type="text"
							icon={<EditOutlined width="w-4" />}
							className="border-none"
							onClick={() => updateCommentStatus(data?.commentId)}
						/>
					)}

					{type === 'admin' && CAN_DELETE_ADMIN && (
						<Button type="text" onClick={openModal} className="">
							<DeleteOutlined width="w-4" />
						</Button>
					)}

					{type === 'dev' && !data.responseDetail && CAN_RESPONSE_DEV && (
						<Button
							type="text"
							icon={<ResponseIcon width="w-4" />}
							onClick={() => setReply(true)}
							className="py-0"
						>
							Trả lời
						</Button>
					)}

					<Button
						type="text"
						icon={
							data.statusLiked?.toLowerCase() === 'liked' ? (
								<LikeFilled className="text-primary focus-within:bg-gray-50" />
							) : (
								<LikeOutlined className="text-primary focus-within:bg-gray-50" />
							)
						}
						className={(data?.responseDetail && 'border-none', 'py-0 border-none')}
						onClick={() => updateStatusLike(data?.commentId)}
						disabled={type !== 'sme' || isUpdate}
					>
						&nbsp;{data.liked}
					</Button>
				</div>
			</div>

			<div
				className="mt-1 overflow-y-auto font-medium beauty-scroll break-words"
				style={{
					whiteSpace: 'pre-wrap',
					marginLeft: type === 'sme' ? '4.5rem' : 0,
				}}
			>
				{data.commentContent}
			</div>

			{isReply && (
				<Form
					className="w-11/12 ml-auto mt-3 mb-3"
					disabled={!isReply}
					onClick={onChangeSave}
					form={formCreate}
					onFinish={submitCreateRes}
					onValuesChange={setChangeValue}
				>
					<Form.Item name="content">
						<Input.TextArea id="content" maxLength={500} showCount autoFocus />
					</Form.Item>
					<Form.Item className="text-right">
						<Button
							className="mr-4"
							onClick={() => {
								formCreate.resetFields();
								setReply(false);
								setDirty(false);
							}}
						>
							Hủy
						</Button>
						<Button
							type="primary"
							icon={<SendOutlined width="w-4" />}
							htmlType="submit"
							disabled={!isDirty}
							loading={mutationCreateFeedback.isLoading}
						>
							Gửi phản hồi
						</Button>
					</Form.Item>
				</Form>
			)}
		</div>
	);
}

export default CommentEvaluation;
