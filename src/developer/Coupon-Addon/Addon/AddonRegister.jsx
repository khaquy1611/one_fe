import React, { useState } from 'react';
import { message, Form } from 'antd';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { DX, AddonDev } from 'app/models';
import { convertToNumber, convertToArrNumber, checkAlertPopup } from 'app/validator';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useDispatch } from 'react-redux';
import { idInactiveActions } from 'actions';
import RegisterAddonForm from 'admin/Coupon-Addon/Addon/components/RegisterAddonForm';
import { useLng } from 'app/hooks';

const EXIST_ERROR = 'error.data.exists';

export default function AddonRegister() {
	const { tMessage, tValidation, tMenu } = useLng();
	const dispatch = useDispatch();
	const history = useHistory();
	const [form] = Form.useForm();
	const { id } = useParams();
	const [errorService, setError] = useState('');
	const goBack = () => {
		history.push(DX.dev.createPath('/promotion/addon'));
	};

	const insertAddon = useMutation(AddonDev.insertAddon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'extraService' }));
			goBack();
		},
		onError: (e) => {
			if (e.errorCode === EXIST_ERROR && e.field === 'name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'extraServiceName' })],
					},
				]);
				form.scrollToField('name', { behavior: 'smooth', block: 'center' });
			}
			if (e.errorCode === EXIST_ERROR && e.field === 'code') {
				form.setFields([
					{
						name: 'code',
						errors: [tValidation('opt_isDuplicated', { field: 'extraServiceCode' })],
					},
				]);
				form.scrollToField('code', { behavior: 'smooth', block: 'center' });
			}
			// get all id inactive
			if (!Number.isNaN(parseInt(e.message, 10)) && typeof parseInt(e.message, 10) === 'number') {
				dispatch(idInactiveActions.getAllIdInactive(convertToArrNumber(e.message)));
			}

			// check alert popup
			if (!!form.getFieldValue('serviceId').id && e.field === 'id' && e.errorCode === 'error.object.inactive') {
				message.error({
					content: `Dịch vụ áp dụng ${form.getFieldValue('serviceId').serviceName} không hoạt động`,
					duration: 5,
					className: 'msg-coupon',
				});
				setError(form.getFieldValue('serviceId').id);
			} else if (form.getFieldValue('listPricingBonus').list.length > 0 && e.field === 'listPricingBonus')
				message.error({
					content: checkAlertPopup(
						e,
						form.getFieldValue('listPricingBonus').list,
						'pricingId',
						'pricingName',
					),
					duration: 5,
					className: 'msg-coupon',
				});
		},
	});

	const onFinish = (values) => {
		const dataCreate = {
			...values,
			serviceId: values.serviceId.id,
			price: convertToNumber(values.price) || 0,
			setupFee: convertToNumber(values.setupFee),
			hasTax: values.hasTax === true ? 'YES' : 'NO',
		};

		insertAddon.mutate({
			addonId: id,
			data: dataCreate,
		});
	};

	const addonRegister = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'extraService',
			url: DX.dev.createPath('/promotion/addon'),
		},
		{
			isName: true,
			name: tMenu('opt_create', { field: 'extraService' }),
			url: '',
		},
	];

	return (
		<>
			<UrlBreadcrumb breadcrumbs={addonRegister} />
			<RegisterAddonForm
				onFinish={onFinish}
				form={form}
				goBack={goBack}
				errorService={errorService}
				checkStatus
			/>
		</>
	);
}
