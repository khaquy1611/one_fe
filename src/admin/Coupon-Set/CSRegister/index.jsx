import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, message, Spin } from 'antd';
import { useMutation } from 'react-query';
import { useLng } from '../../../app/hooks';
import { AdminCoupon, DevCoupon, DX } from '../../../app/models';
import { idInactiveActions } from '../../../app/redux/idInactive';
import { checkAlertPopup, convertToArrNumber } from '../../../app/validator';
import { UrlBreadcrumb } from '../../../app/components/Atoms';
import CouponSetForm from '../../../app/components/Molecules/CouponSetForm';
import DevCouponSet from '../../../app/models/DevCouponSet';

const COUPON = 'COUPON';
const DISCOUNT = 'DISCOUNT';
const TIMES = 'TIMES';
const EXIST_ERROR = 'error.data.exists';

function Index(props) {
	const dispatch = useDispatch();
	const history = useHistory();
	const [isDirty, setDirty] = useState(true);
	const [form] = Form.useForm();
	const { tMessage, tMenu, tValidation } = useLng();

	const goBack = () => {
		history.replace(DX.admin.createPath('/promotion/coupon-set'));
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

	const postMutation = useMutation(DevCouponSet.createCouponSet, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'couponSetResult' }));
			goBack();
		},
		onError: (e) => {
			if (e.errorCode === EXIST_ERROR) {
				// message.error('Tạo Bộ mã khuyến mại thất bại');
				// message.error(tMessage('opt_badlyCreated', { field: 'couponSetResult' }));
				form.setFields([
					{
						name: 'name',
						errors: ['Tên bộ mã khuyến mãi đã tồn tại'],
					},
				]);
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
		},
	});

	const handleSubmit = (value) => {
		const dataCreate = {
			...value,
			name: value.name,
			code: value.code1,
			totalCouponCode: value.amount,
			lengthCouponCode: value.length,
			prefix: value.prefix,
			suffix: value.suffix,
			generateType: value.type,
			couponId: Number(value.couponId),
		};

		if (form.getFieldError('maximumPromotion').length === 0) {
			postMutation.mutate({ ...dataCreate });
		}
	};

	const breadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'couponSet',
			url: DX.admin.createPath('/promotion/coupon-set'),
		},

		{
			isName: true,
			name: tMenu('opt_create', { field: 'couponSet' }),
			url: '',
		},
	];

	return (
		<div className="pb-8">
			<Spin spinning={postMutation.isLoading}>
				<UrlBreadcrumb breadcrumbs={breadcrumb} />
				<h1 className="font-semibold text-xl mt-4">{tMenu('opt_create', { field: 'couponSet' })}</h1>
				<div className="max-w-6xl mt-10 mx-auto">
					<CouponSetForm
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
			</Spin>
		</div>
	);
}

export default Index;
