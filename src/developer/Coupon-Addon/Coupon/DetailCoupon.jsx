import React, { useState } from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { DX, AdminCoupon, SaasAdmin, DevCoupon } from 'app/models';
import { useQuery, useMutation } from 'react-query';
import { useUser, useQueryUrl, useLng } from 'app/hooks';
import { Form, Tag, Button, Modal, Tooltip, message, Spin } from 'antd';
import { CouponForm } from 'app/components/Molecules';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

const APPROVED = 'APPROVED';
const UNAPPROVED = 'UNAPPROVED';
const WAIT_APPROVAL = 'AWAITING_APPROVAL';
const REJECTED = 'REJECTED';
const ACCEPT = 'ACCEPT';
const RESTORE = 'RESTORE';
const YES = 'YES';
const NO = 'NO';
const USED_ERROR = 'error.coupon.has.been.used';

export default function DetailCoupon() {
	const history = useHistory();
	const query = useQueryUrl();
	const version = query.get('version');
	const { id } = useParams();
	const { user } = useUser();
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(true);
	const { tMessage, tFilterField, tButton } = useLng();

	const { deleteCoupon, putRequestApprove } = AdminCoupon;

	const { refetch, data: couponInfo } = useQuery(
		['getDetailDevCouponInfo', id, version],
		async () => {
			const res = await DevCoupon.getOneById(id);
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
		if (version) history.push(DX.dev.createPath(`/promotion/coupon/${id}/detail`));
		else history.push(DX.dev.createPath('/promotion/coupon'));
	};

	const goEditCoupon = () => {
		history.push(DX.dev.createPath(`/promotion/coupon/${id}/edit`));
	};

	// ----------------------------- button delete -----------------------------//
	const onMutateDelete = useMutation(deleteCoupon, {
		onSuccess: (res) => {
			if (res) message.success(res.message);
			else message.success(tMessage('opt_successfullyDeleted', { field: 'prom' }));
			goBack();
		},
		onError: (e) => {
			if (e.errorCode === USED_ERROR) return message.error(tMessage('opt_isUsed', { field: 'prom' }));
			return message.error(tMessage('opt_badlyDeleted', { field: 'prom' }));
		},
	});

	const onDeleteCoupon = () => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'prom' }),
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
	});

	const onRequestApprove = () => {
		Modal.confirm({
			title: tMessage('opt_wantToApprove'),
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
	const onMutateConfirm = useMutation(DevCoupon.confirmUpdateCoupon, {
		onSuccess: () => {
			refetch();
			history.replace(DX.dev.createPath(`/promotion/coupon/${id}/detail`));
		},
	});

	const onConfirm = () => {
		Modal.confirm({
			title: tMessage('pushNewProm'),
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
			title: tMessage('restoreDataBeforeUpdated'),
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
		history.push(DX.dev.createPath(`/promotion/coupon/${id}/detail?version=OLD`));
	};

	const editCouponBreadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'prom',
			url: DX.dev.createPath('/promotion/coupon'),
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
				<div className="absolute -top-20 right-0">
					{couponInfo.approve === APPROVED && version && (
						<Button type="primary" size="middle" onClick={onRestore}>
							{tButton('restore')}
						</Button>
					)}

					{!version &&
						couponInfo.approve !== WAIT_APPROVAL &&
						couponInfo.approve !== REJECTED &&
						DX.canAccessFuture2('dev/update-coupon-by-dev', user.permissions) && (
							<Button
								type="primary"
								size="middle"
								onClick={goEditCoupon}
								disabled={couponInfo.approve === WAIT_APPROVAL}
							>
								{tButton('update')}
							</Button>
						)}

					{couponInfo.approve === UNAPPROVED &&
						DX.canAccessFuture2('dev/request-approved-coupon-by-dev', user.permissions) && (
							<Button size="middle" type="default" className="ml-4" onClick={onRequestApprove}>
								{tButton('approvalRequest')}
							</Button>
						)}

					{couponInfo.approve === APPROVED &&
						couponInfo.isConfirm === NO &&
						couponInfo.nameDraft &&
						!version && (
							<Button size="middle" type="default" className="ml-4" onClick={onConfirm}>
								{tButton('opt_confirm')}
							</Button>
						)}
				</div>
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
					rollbackStatus={couponInfo.isConfirm !== YES && couponInfo.nameDraft && !version}
				/>
			</div>
		</div>
	);
}
