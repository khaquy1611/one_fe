import { Form, Tag, Tooltip, message, Spin } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { CouponForm } from 'app/components/Molecules';
import { DX, AdminCoupon, SaasAdmin } from 'app/models';
import { useUser, useLng } from 'app/hooks';
import { useQuery, useMutation } from 'react-query';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
	convertToArrObj,
	convertToNumber,
	checkAlertPopup,
	convertTime,
	convertToArrNumber,
	convertToArrObjForPricing,
} from 'app/validator';
import moment from 'moment';

import { useDispatch } from 'react-redux';
import { idInactiveActions } from 'actions';

const AWAIT_APPROVAL = 'AWAITING_APPROVAL';
const APPROVED = 'APPROVED';
const REJECTED = 'REJECTED';
const DISCOUNT = 'DISCOUNT';
const NONE = 'NONE';
const ADMIN = 'ADMIN';
const YES = 'YES';
const TIMES = 'TIMES';
const EXIST_ERROR = 'error.data.exists';
const DATE_ERROR = 'error.valid.future.or.present';
const OVER_ERROR = 'error.out.of.quantity';
const NOT_NULL_ERROR = 'error.valid.not.null';

export default function EditCoupon() {
	const dispatch = useDispatch();
	const { user } = useUser();
	const history = useHistory();
	const { id } = useParams();
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { tMessage, tValidation, tFilterField } = useLng();
	const rootAdmin = !user.isAdminProvince;
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('admin/update-coupon-by-admin', user.permissions);

	const { data: couponInfo } = useQuery(
		['getEditCouponInfo', id],
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
		history.replace(DX.admin.createPath(`/promotion/coupon/${id}/detail`));
	};

	const editCoupon = [
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
			name: couponInfo.nameDraft || couponInfo.name,
			url: '',
		},
	];

	const putUpdateMutation = useMutation(AdminCoupon.updateCoupon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdateRequested', { field: 'prom' }));
			goBack();
		},
		onError: (e) => {
			if (e.errorCode === EXIST_ERROR && e.field === 'name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isRequired', { field: 'promName' })],
					},
				]);
				form.scrollToField('name', { behavior: 'smooth', block: 'center' });
			} else if (e.errorCode === EXIST_ERROR && e.field === 'promotionCode') {
				form.setFields([
					{
						name: 'promotionCode',
						errors: [tValidation('opt_isRequired', { field: 'promCode' })],
					},
				]);
				form.scrollToField('promotionCode', { behavior: 'smooth', block: 'center' });
			} else if (e.errorCode === DATE_ERROR && e.field === 'startDate') {
				form.setFields([
					{
						name: 'rangeDate',
						errors: [tValidation('err_startDate')],
					},
				]);
				form.scrollToField('rangeDate', { behavior: 'smooth', block: 'center' });
			} else if (e.errorCode === NOT_NULL_ERROR && e.field === 'discountSupplierType')
				form.setFields([
					{
						name: 'discountSupplierType',
						errors: [tValidation('selectDiscountForSupplier')],
					},
				]);

			// get all id inactive
			if (!Number.isNaN(parseInt(e.message, 10)) && typeof parseInt(e.message, 10) === 'number') {
				dispatch(idInactiveActions.getAllIdInactive(convertToArrNumber(e.message)));
			}

			// check alert popup
			if (form.getFieldValue('promotionGroup').list.length > 0 && e.field === 'couponPricing')
				message.error({
					content: checkAlertPopup(e, form.getFieldValue('promotionGroup').list, 'pricingId', 'pricingName'),
					duration: 5,
					className: 'msg-coupon',
				});
			else if (form.getFieldValue('enterpriseGroup').list.length > 0 && e.field === 'couponEnterprise')
				message.error({
					content: checkAlertPopup(e, form.getFieldValue('enterpriseGroup').list, 'userId', 'name'),
					duration: 5,
					className: 'msg-coupon',
				});
			else if (form.getFieldValue('pricingGroup').list.length > 0 && e.field === 'couponPricingApply')
				message.error({
					content: checkAlertPopup(e, form.getFieldValue('pricingGroup').list, 'pricingId', 'pricingName'),
					duration: 5,
					className: 'msg-coupon',
				});
			else if (form.getFieldValue('addonGroup').list.length > 0 && e.field === 'couponAddons')
				message.error({
					content: checkAlertPopup(e, form.getFieldValue('addonGroup').list, 'addonsId', 'name'),
					duration: 5,
					className: 'msg-coupon',
				});
			else if (form.getFieldValue('supplierGroup').list.length > 0 && e.field === 'suppliers')
				message.error({
					content: checkAlertPopup(e, form.getFieldValue('supplierGroup').list, 'userId', 'name'),
					duration: 5,
					className: 'msg-coupon',
				});
		},
	});

	const handleSubmit = (value) => {
		const dataEdit = {
			...value,
			startDate: convertTime(value.rangeDate, 0),
			endDate: convertTime(value.rangeDate, 1),
			maxUsed: convertToNumber(value.maxUsed),
			minimum: convertToNumber(value.minimum),
			minimumAmount: convertToNumber(value.minimumAmount),
			limitedQuantity: convertToNumber(value.limitedQuantity),
			maximumPromotion: convertToNumber(value.maximumPromotion),
			discountValue: convertToNumber(value.discountValue),
			discountAmount: convertToNumber(value.discountAmount),
			type: value.promotionGroup.type === DISCOUNT ? TIMES : value.type,
			couponPricing: value.promotionGroup?.list?.filter((el) => el.id),
			promotionType: value.promotionGroup?.type,
			couponEnterprise: convertToArrObj(value.enterpriseGroup?.list, 'userId'),
			enterpriseType: value.enterpriseGroup?.type,
			couponPricingApply: value.pricingGroup?.list?.filter((el) => el.id),
			pricingType: value.pricingGroup.type,
			suppliers: convertToArrObj(value.supplierGroup?.list, 'userId'),
			supplierType: value.supplierGroup?.type,
			discountSupplierType: value.supplierGroup?.type !== NONE ? value.discountSupplierType : undefined,
			couponAddons: value.addonGroup?.list?.filter((el) => el.id),
			addonsType: value.addonGroup?.type,
		};

		if (form.getFieldError('maximumPromotion').length === 0) {
			putUpdateMutation.mutate({ id, body: { ...dataEdit } });
		}
	};

	// ------------------------- button save with approved ------------------------//
	const putUpdateDraftMutation = useMutation(AdminCoupon.updateDraftCoupon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'prom' }));
			goBack();
		},
		onError: (e) => {
			if (e.errorCode === EXIST_ERROR && e.field === 'name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'promName' })],
					},
				]);
				form.scrollToField('name', { behavior: 'smooth', block: 'center' });
			} else if (e.errorCode === OVER_ERROR && e.field === 'maxUsed') {
				form.setFields([
					{
						name: 'maxUsed',
						errors: [tValidation('err_maxUsed')],
					},
				]);
				form.scrollToField('maxUsed', { behavior: 'smooth', block: 'center' });
			}
		},
	});

	const updateDraftCoupon = () => {
		const dataUpdate = {
			name: form.getFieldValue('name'),
			status: form.getFieldValue('status'),
			maxUsed: convertToNumber(form.getFieldValue('maxUsed')),
			endDate: convertTime(form.getFieldValue('rangeDate'), 1),
		};
		putUpdateDraftMutation.mutate({ id, body: dataUpdate });
	};

	if (id && couponInfo.loading) {
		return (
			<div className="text-center">
				<Spin tip="Loading..." />
			</div>
		);
	}

	// (!CAN_UPDATE_BY_ADMIN && couponInfo?.createdBy !== user.id)
	if (
		!CAN_UPDATE_BY_ADMIN ||
		couponInfo.approve === AWAIT_APPROVAL ||
		couponInfo.approve === REJECTED ||
		couponInfo.portalType !== ADMIN ||
		(rootAdmin && couponInfo.adminType === 'PROVINCE_ADMIN') ||
		(!rootAdmin && couponInfo.adminType === 'TOTAL_ADMIN')
	)
		history.replace(`${DX.admin.createPath('/promotion/coupon')}`);

	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={editCoupon} />
			<div className="flex items-center mt-4">
				<Tooltip placement="topLeft" title={couponInfo.nameDraft || couponInfo.name}>
					<div className="font-semibold text-xl truncate max-w-lg">
						{couponInfo.nameDraft || couponInfo.name}
					</div>
				</Tooltip>

				<Tag className="block ml-4 text-sm font-normal" color={tagApproveInfo?.color}>
					{tFilterField('approvalStatusOptions', tagApproveInfo?.text)}
				</Tag>
			</div>
			<div className="max-w-6xl mt-10 mx-auto">
				<CouponForm
					className="mt-12"
					form={form}
					couponInfo={couponInfo}
					handleSubmit={handleSubmit}
					updateDraftCoupon={updateDraftCoupon}
					setDirty={setDirty}
					isDirty={isDirty}
					goBack={goBack}
					onlyView={couponInfo.approve === APPROVED || !CAN_UPDATE_BY_ADMIN}
					checkStatus={couponInfo.approve !== APPROVED}
					checkApproved
					typeCoupon="EDIT"
				/>
			</div>
		</div>
	);
}
