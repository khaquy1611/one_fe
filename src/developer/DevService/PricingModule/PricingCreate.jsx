import { Form, message } from 'antd';
import CommonPricingForm from 'app/CommonPricing/CommonPricingForm';
import { useLng } from 'app/hooks';
import { DX, Pricing } from 'app/models';
import { convertError } from 'app/validator/isInt';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';

export default function PricingCreate() {
	const { id } = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const [selectTaxOption, setSelectTaxOption] = useState([]);
	const [selectCurrencyOption, setSelectCurrencyOption] = useState([]);
	const [selectUnitOption, setSelectUnitOption] = useState([]);
	const [selectFeatureOption, setSelectFeatureOption] = useState([]);
	const { tMessage, tValidation, tLowerField, tField } = useLng();
	const insertPricing = useMutation(Pricing.insertPricingByServiceId, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'servicePackage' }));
			setTimeout(() => {
				history.push(DX.dev.createPath(`/service/list/${id}?tab=3`));
			}, 500);
		},
		onError: (e) => {
			if (e.errorCode === 'error.data.exists' && e.field === 'pricingCode') {
				form.setFields([
					{
						name: 'pricingCode',
						errors: [tValidation('opt_isDuplicated', { field: 'packageCode' })],
					},
				]);
				form.scrollToField('pricingCode', { behavior: 'smooth', block: 'center' });
			} else if (e.errorCode === 'error.data.exists' && e.field === 'pricingName') {
				form.setFields([
					{
						name: 'pricingName',
						errors: [tValidation('opt_isDuplicated', { field: 'packageName' })],
					},
				]);
				form.scrollToField('pricingName', { behavior: 'smooth', block: 'center' });
			} else if (
				(e.errorCode === 'error.object.inactive' || e.errorCode === 'error.object.not.found') &&
				e.field === 'currencyId'
			) {
				const arr = e.message.split(' ');
				const currencyName = selectCurrencyOption.find((el) => el.id === parseInt(arr[0], 10))?.currencyType;
				message.error(`${tField('currency')} ${currencyName} ${tLowerField('isNotWorking')}`);

				form.setFields([
					{
						name: 'currencyId',
						errors: [tValidation('opt_isNotWorked', { field: 'currency' })],
					},
				]);
			} else if (
				(e.errorCode === 'error.object.inactive' || e.errorCode === 'error.object.not.found') &&
				e.field === 'unitId'
			) {
				const arr = e.message.split(' ');
				const unitName = selectUnitOption.find((el) => el.id === parseInt(arr[0], 10))?.name;
				message.error(`${tField('unit')} ${unitName} ${tLowerField('isNotWorking')}`);
			} else if (e.errorCode === 'error.tax.invalid' && e.field === 'taxList') {
				const arr = e.message.split('|');
				const error = convertError(arr, selectTaxOption);

				if (error.type === 'DELETE' || error.type === 'INACTIVE')
					message.error(`${tMessage('tax')}: ${error.msg} ${tLowerField('isNotWorking')}`);
			} else if (e.errorCode === 'error.object.deleted' && e.field === 'id' && e.object === 'feature') {
				const index = e.message.indexOf(' deleted.');
				const error = convertError([index], selectFeatureOption);

				if (error.type === 'DELETE')
					message.error(`${tMessage('feature')}: ${error.msg} ${tLowerField('isNotWorking')}`);
			} else if (e.errorCode === 'error.pricing.addons.invalid' && e.field === 'addonList') {
				const index = e.message.indexOf(' deleted.');
				if (index > -1) {
					const ids = e.message.slice(0, index).split(',');
					const addonPicks = form.getFieldValue('addonList');
					let errorMes = '';
					errorMes = addonPicks.filter((el) => el.id.toString() === ids[0])[0]?.name;
					message.error(`${tMessage('extraService')}: ${errorMes} ${tLowerField('isNotExisting')}`);
				}
			} else if (
				e.errorCode === 'error.payment.cycle.pricing.greater.than.or.equal.addon' &&
				e.field === 'cycleType'
			) {
				message.error(tMessage('err_payment_cycle_pricing_greater_than_or_equal_addon'));
			} else if (e.errorCode === 'error.object.not.found' && e.field === 'id' && e.object !== 'addons') {
				message.error(tMessage('error_object_not_found_id_addons'));
			} else if (
				e.errorCode === 'error.private.addon.greater.than.max.accepted.value' ||
				e.errorCode === 'error.public.addon.greater.than.max.accepted.value'
			)
				message.error('Số lượng gói dịch vụ bổ sung trong gói dịch vụ không được vượt quá 30 gói');
		},
	});

	const onFinish = (values) => {
		insertPricing.mutate({
			serviceId: id,
			data: values,
		});
	};

	const servicePackRegister = [
		{
			name: 'servicePackage',
			url: '',
		},
		{
			name: 'newRegistration',
			url: '',
		},
	];

	return (
		<>
			<CommonPricingForm
				breadcrumbs={servicePackRegister}
				onFinish={onFinish}
				form={form}
				loading={insertPricing.isLoading}
				setSelectTaxOption={setSelectTaxOption}
				setSelectCurrencyOption={setSelectCurrencyOption}
				setSelectUnitOption={setSelectUnitOption}
				setSelectFeatureOption={setSelectFeatureOption}
				canLoadOption
				data={{}}
			/>
		</>
	);
}
