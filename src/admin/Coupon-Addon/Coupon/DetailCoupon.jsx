import React, { useState, useEffect } from 'react';
import { UrlBreadcrumb, DrawerApproval } from 'app/components/Atoms';
import { DX, AdminCoupon, SaasAdmin } from 'app/models';
import { useQuery, useMutation } from 'react-query';
import { useUser, useQueryUrl, useLng } from 'app/hooks';
import { Form, Tag, Button, Modal, Tooltip, message, Spin } from 'antd';
import { CouponForm } from 'app/components/Molecules';
import { ExclamationCircleOutlined, MinusOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { trim } from 'opLodash';
import moment from 'moment';

const APPROVED = 'APPROVED';
const UNAPPROVED = 'UNAPPROVED';
const WAIT_APPROVAL = 'AWAITING_APPROVAL';
const REJECTED = 'REJECTED';
const ADMIN = 'ADMIN';
const ACCEPT = 'ACCEPT';
const RESTORE = 'RESTORE';
const YES = 'YES';
const NO = 'NO';
const USED_ERROR = 'error.coupon.has.been.used';

function ButtonShowModal({ openApproveForm }) {
	const { tButton } = useLng();
	return (
		<Button
			type="primary"
			onClick={() => {
				openApproveForm();
			}}
			className="fixed bottom-0 h-14 px-6 right-0 z-max rounded-none"
		>
			<div className="items-center">
				<span className="text-base mr-4">{tButton('opt_approve', { field: 'prom' })}</span>
				<MinusOutlined />
			</div>
		</Button>
	);
}

export default function DetailCoupon() {
	const history = useHistory();
	const { id } = useParams();
	const query = useQueryUrl();
	const version = query.get('version');
	const { user } = useUser();
	const rootAdmin = !user.isAdminProvince;
	const [form] = Form.useForm();
	const [formApprove] = Form.useForm();
	const [showModal, setShowModal] = useState(false);
	const [approve, setApproveStatus] = useState('');
	const [typeLoading, setTypeLoading] = useState('');
	const [isDirty, setDirty] = useState(true);
	const { tFilterField, tMessage, tButton, tValidation, tField, tOthers, tLowerField } = useLng();

	const CAN_APPROVED = DX.canAccessFuture2('admin/approved-coupon', user.permissions);
	const CAN_DELETE = DX.canAccessFuture2('admin/delete-coupon', user.permissions);
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('admin/update-coupon-by-admin', user.permissions);
	const CAN_REQUEST_APPROVED_BY_ADMIN = DX.canAccessFuture2(
		'admin/request-approved-coupon-by-admin',
		user.permissions,
	);

	const { putApproveCoupon, deleteCoupon, putRequestApprove, confirmUpdateCoupon } = AdminCoupon;

	const { refetch, data: couponInfo } = useQuery(
		['getDetailCouponInfo', id, version],
		async () => {
			const res = await AdminCoupon.getOneById(id);
			return res;
		},
		{
			onSuccess: (res) => {
				[].concat(res.couponPricing).forEach((e) => {
					e.idPick = `${e.pricingId}-${e.type === 'COMBO' ? 'comboPlanIds' : 'pricingIds'}`;
				});
				[].concat(res.couponPricingApply).forEach((e) => {
					e.idPick = `${e.pricingId}-${e.type === 'COMBO' ? 'comboPlanIds' : 'pricingIds'}`;
				});
				if (res.isConfirm !== YES && res.approve === APPROVED && res.nameDraft) {
					form.setFieldsValue({
						name: res.nameDraft,
						status: res.statusDraft,
						maxUsed: res.maxUsedDraft,
						rangeDate: [
							res.startDate ? moment(res.startDate, 'DD/MM/YYYY') : undefined,
							res.endDateDraft ? moment(res.endDateDraft, 'DD/MM/YYYY') : undefined,
						],
					});
				}
				if (version) {
					form.setFieldsValue({
						name: res.name,
						status: res.status,
						maxUsed: res.maxUsed,
						rangeDate: [
							res.startDate ? moment(res.startDate, 'DD/MM/YYYY') : undefined,
							res.endDate ? moment(res.endDate, 'DD/MM/YYYY') : undefined,
						],
					});
				}
			},
			initialData: {
				loading: true,
			},
			enabled: !!id,
			cacheTime: 0,
		},
	);

	const tagApproveInfo = SaasAdmin.tagStatus[couponInfo.approve] || {};

	const goBack = () => {
		if (version) history.push(DX.admin.createPath(`/promotion/coupon/${id}/detail`));
		else history.push(DX.admin.createPath('/promotion/coupon'));
	};

	const goEditCoupon = () => {
		history.push(DX.admin.createPath(`/promotion/coupon/${id}/edit`));
	};

	// ----------------------------- button delete -----------------------------//
	const onMutateDelete = useMutation(deleteCoupon, {
		onSuccess: (res) => {
			if (res) message.success(res.message);
			else message.success(tMessage('opt_successfullyDeleted', { field: 'prom' }));
			goBack();
		},
		onError: (e) => {
			if (e.errorCode === USED_ERROR && CAN_DELETE) return message.error(tMessage('err_promIsUsed'));

			// if (e.errorCode === USED_ERROR && ROLE_ADMIN) return message.errorCode(tMessage('err_prom_NOT_OWN'));

			return message.error(tMessage('opt_badlyDeleted', { field: 'prom' }));
		},
	});

	const onDeleteCoupon = () => {
		Modal.confirm({
			title: `${tMessage('opt_wantToDelete', { field: 'prom' })}`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateDelete.mutate({ ids: [id] });
			},
			onCancel: () => {},
			confirmLoading: onMutateDelete.isLoading,
		});
	};

	// ------------------------- button request approve ------------------------//
	const onMutateRequest = useMutation(putRequestApprove, {
		onSuccess: () => {
			refetch();
			goBack();
			message.success(tMessage('opt_successfullySendApproved', { field: 'prom' }));
		},
		onError: () => {
			message.error('Gửi yêu cầu phê duyệt không thành công');
		},
	});

	const onRequestApprove = () => {
		Modal.confirm({
			title: `${tMessage('opt_wantToApprove')}`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateRequest.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: onMutateRequest.isLoading,
		});
	};

	// ------------------------- button confirm with approved ------------------------//
	const onMutateConfirm = useMutation(confirmUpdateCoupon, {
		onSuccess: () => {
			refetch();
			history.replace(DX.admin.createPath(`/promotion/coupon/${id}/detail`));
		},
		onError: () => {
			message.error('Xác nhận bản cập nhật không thành công');
		},
	});

	const onConfirm = () => {
		Modal.confirm({
			title: `${tMessage('pushNewProm')}`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateConfirm.mutate({ id, status: ACCEPT });
			},
			onCancel: () => {},
		});
	};

	// ------------------------- button restore with approved ------------------------//
	const onRestore = () => {
		Modal.confirm({
			title: `${tMessage('restoreDataBeforeUpdated')}`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateConfirm.mutate({ id, status: RESTORE });
			},
			onCancel: () => {},
		});
	};

	// ------------------------- button rollback coupon with approved ---------------------//
	const rollbackCoupon = () => {
		history.push(DX.admin.createPath(`/promotion/coupon/${id}/detail?version=OLD`));
	};

	// ---------------------------- modal approve -----------------------------//
	const openApproveForm = () => {
		if (couponInfo.approve === SaasAdmin.tagStatus.AWAITING_APPROVAL.value) {
			setShowModal(true);
		} else {
			Modal.info({
				title: tMessage('notification'),
				content: tMessage('noneApprovalRequest'),
			});
		}
	};

	const onMutateApprove = useMutation(putApproveCoupon, {
		onSuccess: () => {
			if (approve === SaasAdmin.tagStatus.APPROVED.value)
				message.success(tMessage('opt_successfullyApproved', { field: 'prom' }));
			else if (approve === SaasAdmin.tagStatus.UNAPPROVED.value)
				message.success(tMessage('opt_successfullyUpdateRequested', { field: 'prom' }));
			else message.success(tMessage('opt_successfullyRejected', { field: 'prom' }));
			setShowModal(false);
			formApprove.resetFields();
			refetch();
		},
		onError: () => {
			message.error('Phê duyệt chương trình khuyến mại không thành công');
		},
	});

	useEffect(() => {
		if (approve) {
			onMutateApprove.mutate({
				id,
				body: {
					approveStatus: approve,
					comment: formApprove.getFieldValue('comment') || 'approve',
				},
			});
		}
	}, [approve]);

	const handleClickApprove = () => {
		setTypeLoading(SaasAdmin.tagStatus.APPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.APPROVED.value);
	};

	const handleClickUnApprove = () => {
		const data = formApprove.getFieldValue('comment');
		if (!trim(data)) {
			formApprove.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.UNAPPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.UNAPPROVED.value);
	};

	const handleClickReject = () => {
		const data = formApprove.getFieldValue('comment');
		if (!trim(data)) {
			formApprove.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.REJECTED.value);
		setApproveStatus(SaasAdmin.tagStatus.REJECTED.value);
	};

	// -------------------------------------------------------------//

	const editCouponBreadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'prom',
			url: DX.admin.createPath('/promotion/coupon'),
		},
		{
			isName: true,
			name: !version ? couponInfo.nameDraft || couponInfo.name : couponInfo.name,
			url: '',
		},
	];

	if (id && couponInfo.loading) {
		return (
			<div className="text-center">
				<Spin tip="Loading..." />
			</div>
		);
	}
	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={editCouponBreadcrumb} />
			<div className="flex justify-start items-center mt-4">
				<Tooltip
					placement="topLeft"
					title={!version ? couponInfo.nameDraft || couponInfo.name : couponInfo.name}
				>
					<div className="font-semibold text-xl truncate max-w-lg">
						{!version ? couponInfo.nameDraft || couponInfo.name : couponInfo.name}
					</div>
				</Tooltip>
				<Tag className="block ml-4 text-sm font-normal" color={tagApproveInfo?.color}>
					{tFilterField('approvalStatusOptions', tagApproveInfo?.text)}
				</Tag>
			</div>
			<div className="max-w-6xl mt-10 mx-auto relative">
				{(couponInfo.createdBy === user.id ||
					(couponInfo.adminType === 'PROVINCE_ADMIN' && !rootAdmin) ||
					(couponInfo.adminType === 'TOTAL_ADMIN' && rootAdmin)) && (
					<div className="absolute -top-20 right-0">
						{couponInfo.approve === APPROVED && version && CAN_UPDATE_BY_ADMIN && (
							<Button type="primary" size="middle" onClick={onRestore}>
								{tButton('restore')}
							</Button>
						)}

						{!version &&
							couponInfo.approve !== WAIT_APPROVAL &&
							couponInfo.approve !== REJECTED &&
							CAN_UPDATE_BY_ADMIN && (
								<Button type="primary" size="middle" onClick={goEditCoupon}>
									{tButton('update')}
								</Button>
							)}

						{couponInfo.approve === UNAPPROVED && CAN_REQUEST_APPROVED_BY_ADMIN && (
							<Button size="middle" type="default" className="ml-4" onClick={onRequestApprove}>
								{tButton('approvalRequest')}
							</Button>
						)}

						{couponInfo.approve === APPROVED &&
							couponInfo.isConfirm === NO &&
							couponInfo.nameDraft &&
							!version &&
							CAN_APPROVED && (
								<Button size="middle" type="default" className="ml-4" onClick={onConfirm}>
									{tButton('opt_confirm')}
								</Button>
							)}
					</div>
				)}
				<CouponForm
					className="mt-12"
					form={form}
					onlyView
					couponInfo={couponInfo}
					onDeleteCoupon={onDeleteCoupon}
					goBack={goBack}
					setDirty={setDirty}
					isDirty={isDirty}
					rollbackCoupon={rollbackCoupon}
					rollbackStatus={
						couponInfo.isConfirm !== YES &&
						couponInfo.nameDraft &&
						couponInfo.portalType === ADMIN &&
						!version
					}
					typeCoupon="EDIT"
				/>
			</div>
			{/* approve button */}
			{couponInfo.approve === WAIT_APPROVAL &&
				CAN_APPROVED &&
				(couponInfo.portalType === 'DEV' ||
					(couponInfo.adminType === 'TOTAL_ADMIN' && rootAdmin) ||
					(couponInfo.adminType === 'PROVINCE_ADMIN' && !rootAdmin)) && (
					<ButtonShowModal openApproveForm={openApproveForm} />
				)}

			{/* -------------- */}
			<DrawerApproval
				closeForm={() => {
					setShowModal(false);
					formApprove.resetFields();
				}}
				visible={showModal}
				form={formApprove}
				handleClickApprove={handleClickApprove}
				handleClickUnApprove={handleClickUnApprove}
				handleClickReject={handleClickReject}
				loading={onMutateApprove.isLoading}
				typeLoading={typeLoading}
				title={tField('opt_approve', { field: 'prom' })}
				textAcceptBtn={tButton('accept')}
				content={
					<p>
						{tOthers('inCase')} <b>{tOthers('reject')} </b> {tLowerField('or')}{' '}
						<b>{tOthers('updateRequest')} </b> {tLowerField('giveDevReason')}
					</p>
				}
				approved={SaasAdmin.tagStatus.APPROVED.value}
				unApproved={SaasAdmin.tagStatus.REJECTED.value}
				rejected={SaasAdmin.tagStatus.UNAPPROVED.value}
			/>
		</div>
	);
}
