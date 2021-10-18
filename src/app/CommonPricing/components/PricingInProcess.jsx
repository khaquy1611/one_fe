import { Form, message } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { DX, Pricing } from 'app/models';
import { convertError } from 'app/validator/isInt';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import CommonPricingForm from '../CommonPricingForm';

export default function PricingInProcess({ portal, pricingInfo, objectCheck }) {
	const { user } = useUser();
	const { id, pricingId } = useParams();
	const [form] = Form.useForm();
	const history = useHistory();
	const [selectTaxOption, setSelectTaxOption] = useState([]);
	const [selectCurrencyOption, setSelectCurrencyOption] = useState([]);
	const [selectUnitOption, setSelectUnitOption] = useState([]);
	const [selectFeatureOption, setSelectFeatureOption] = useState([]);
	const { tMessage, tValidation, tLowerField, tField } = useLng();

	const updatePricing = useMutation(Pricing.updatePricing, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'servicePackage' }));
			setTimeout(() => {
				history.push(DX.dev.createPath(`/service/list/${id}?tab=3`));
			}, 500);
		},
		onError: (e) => {
			if (e.errorCode === 'error.object.not.found' && e.field === 'id' && e.object !== 'addons') {
				message.error(tMessage('error_object_not_found_id_addons'));
			} else if (e.errorCode === 'error.data.exists' && e.field === 'pricingCode') {
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
				if (index > -1) {
					const ids = e.message.slice(0, index).split(',');
					let errorMes = '';
					ids.forEach((element) => {
						const feature = selectFeatureOption.filter((value) => value.id === parseInt(element, 10));
						if (errorMes === '') {
							errorMes = feature[0].name;
						} else errorMes = errorMes.concat(', ').concat(feature[0].name);
					});
					message.error(`${tMessage('feature')}: ${errorMes} ${tLowerField('isDisabled')}`);
				}
			} else if (e.errorCode === 'error.pricing.addons.invalid' && e.field === 'addonList') {
				let index = e.message.indexOf(' deleted.');
				if (index === -1) index = e.message.indexOf(' not found.');
				if (index > -1) {
					const ids = e.message.slice(0, index).split(',');
					const addonPicks = form.getFieldValue('addonList');
					let errorMes = '';
					errorMes = addonPicks.filter((el) => el.id.toString() === ids[0])[0]?.name;
					message.error(`${tMessage('extraService')} ${errorMes}  ${tLowerField('isNotExisting')}`);
				}
			} else if (
				e.errorCode === 'error.payment.cycle.pricing.greater.than.or.equal.addon' &&
				e.field === 'cycleType'
			) {
				message.error(tMessage('err_payment_cycle_pricing_greater_than_or_equal_addon'));
			} else if (
				e.errorCode === 'error.private.addon.greater.than.max.accepted.value' ||
				e.errorCode === 'error.public.addon.greater.than.max.accepted.value'
			)
				message.error('Số lượng gói dịch vụ bổ sung trong gói dịch vụ không được vượt quá 30 gói');
		},
	});

	const onFinish = (values) => {
		if (portal === 'dev') {
			if (pricingInfo.hasApproved === 'YES') values.pricingCode = pricingInfo.pricingCode;
			updatePricing.mutate({
				id: pricingId,
				serviceId: id,
				body: values,
			});
		}
	};

	return (
		<CommonPricingForm
			data={pricingInfo}
			objectCheck={objectCheck}
			onFinish={onFinish}
			form={form}
			loading={updatePricing.isLoading}
			portal={portal}
			disabled={
				portal === 'admin' ||
				(portal === 'dev' && !DX.canAccessFuture2('dev/update-service-pack', user.permissions)) ||
				pricingInfo.approveStatus === 'AWAITING_APPROVAL'
			}
			setSelectTaxOption={setSelectTaxOption}
			setSelectCurrencyOption={setSelectCurrencyOption}
			setSelectUnitOption={setSelectUnitOption}
			setSelectFeatureOption={setSelectFeatureOption}
		/>
	);
}
