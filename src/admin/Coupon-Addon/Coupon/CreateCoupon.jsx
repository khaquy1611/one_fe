import { Form, message } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { CouponForm } from 'app/components/Molecules';
import { AdminCoupon, DX } from 'app/models';
import {
	convertToArrObj,
	convertToNumber,
	checkAlertPopup,
	convertTime,
	convertToArrNumber,
	convertToArrObjForPricing,
} from 'app/validator';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useLng } from 'app/hooks';
import { useDispatch } from 'react-redux';
import { idInactiveActions } from 'actions';

const COUPON = 'COUPON';
const NONE = 'NONE';
const DISCOUNT = 'DISCOUNT';
const TIMES = 'TIMES';
const EXIST_ERROR = 'error.data.exists';

export default function CreateCoupon() {
	const dispatch = useDispatch();
	const history = useHistory();
	const [isDirty, setDirty] = useState(true);
	const [form] = Form.useForm();
	const { tMessage, tValidation, tMenu } = useLng();
	const goBack = () => {
		history.replace(DX.admin.createPath('/promotion/coupon'));
	};

	const getPromotionCode = async () => {
		try {
			const res = await AdminCoupon.getPromotionCode({ type: COUPON });
			form.setFieldsValue(res);
			return res;
		} catch (e) {
			return e;
		}
	};

	useEffect(() => {
		getPromotionCode();
	}, []);

	const postMutation = useMutation(AdminCoupon.createCoupon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'prom' }));
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
			} else if (e.errorCode === EXIST_ERROR && e.field === 'promotionCode') {
				form.setFields([
					{
						name: 'promotionCode',
						errors: [tValidation('opt_isDuplicated', { field: 'promCode' })],
					},
				]);
				form.scrollToField('promotionCode', { behavior: 'smooth', block: 'center' });
			}

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
			else if (form.getFieldValue('pricingGroup').list.length > 0 && e.field === 'couponPricingApply') {
				message.error({
					content: checkAlertPopup(e, form.getFieldValue('pricingGroup').list, 'pricingId', 'pricingName'),
					duration: 5,
					className: 'msg-coupon',
				});
			} else if (form.getFieldValue('addonGroup').list.length > 0 && e.field === 'couponAddons')
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
		const dataCreate = {
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
			couponPricing:
				value.promotionGroup?.list?.filter((el) => el.id)?.length > 0
					? value.promotionGroup?.list?.filter((el) => el.id)
					: undefined,
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
		console.log('va', value);
		if (form.getFieldError('maximumPromotion').length === 0) {
			postMutation.mutate({ ...dataCreate });
		}
	};

	const createCoupon = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'prom',
			url: DX.admin.createPath('/promotion/coupon'),
		},
		{
			name: 'opt_create/prom',
			url: '',
		},
	];

	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={createCoupon} />
			<h1 className="font-semibold text-xl mt-4">{tMenu('opt_create', { field: 'prom' })}</h1>
			<div className="max-w-6xl mt-10 mx-auto">
				<CouponForm
					className="mt-12"
					form={form}
					handleSubmit={handleSubmit}
					checkApproved
					setDirty={setDirty}
					isDirty={isDirty}
					goBack={goBack}
					checkStatus
				/>
			</div>
		</div>
	);
}
