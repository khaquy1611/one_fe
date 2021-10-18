/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { DX, SubcriptionPlanDev, Pricing, ComboPricing } from 'app/models';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { cloneDeep, isEmpty, trim } from 'opLodash';
import { useDispatch } from 'react-redux';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import ComboPricingFormContent from './ComboPricingFormContent';

function ComboPricingForm({
	data,
	objectCheck,
	disabled,
	getComboType,
	getComboOwner,
	onFinish,
	form,
	portal,
	canLoadOption,
	loading,
	setSelectTaxOption,
	setSelectFeatureOption,
}) {
	const { id } = useParams();
	const dispatch = useDispatch();

	const { data: selectTaxOption, isFetching: loadingTax } = useQuery(
		['getListTaxCode', id, data],
		async () => {
			try {
				const res = await Pricing.getListTaxCode();
				data.taxList &&
					data.taxList.forEach((tax) => {
						if (!res.find((item) => item.id === tax.taxId)) {
							res.push({ id: tax.taxId, name: tax.taxName });
						}
					});
				setSelectTaxOption && setSelectTaxOption(res);
				return res.map((e) => ({
					value: e.id,
					label: e.name,
				}));
			} catch (err) {
				return [];
			}
		},
		{
			initialData: [],
			enabled: canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);
	const { data: selectFeatureOption, isFetching: loadingFeature } = useQuery(
		['getListFeatures', id, data],
		async () => {
			try {
				const res = await ComboPricing.getListFeatures();
				data.featureList &&
					data.featureList.forEach((e) => {
						if (!res.find((item) => item.id === e.id)) {
							res.push({ id: e.id, name: e.name });
						}
					});
				setSelectFeatureOption && setSelectFeatureOption(res);
				return res.map((e) => ({
					value: e.id,
					label: e.name,
				}));
			} catch (err) {
				return [];
			}
		},
		{
			initialData: [],
			enabled: canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const onChangePricePricingByCycle = (formValues) => {
		let value = {};
		if (isEmpty(formValues)) {
			value = form.getFieldsValue(['periodValue', 'periodType', 'discountType', 'discountValue']);
		} else value = { ...formValues };
		if (!value.periodValue) return;

		const { periodValue, periodType, discountType, discountValue } = value;
		dispatch(
			comboPricingActions.calculateChangeAllPricing({
				periodValue,
				periodType,
			}),
		);
		dispatch(
			comboPricingActions.calculateTotalPriceAfterDiscount({
				periodValue,
				discountType,
				discountValue,
			}),
		);
	};

	const onChangePriceFormValue = (value, key) => {
		let valueForm = form.getFieldsValue([
			'periodValue',
			'periodType',
			'pricingCombo',
			'discountType',
			'discountValue',
		]);
		if (key === 'periodValue') {
			value = trim(value.toString()).replaceAll(/\D/g, '');
			if (!value || value === '0') {
				if (!isEmpty(valueForm.pricingCombo)) {
					dispatch(comboPricingActions.resetPeriodValue());
				}
				return;
			}
			if (value.length > 3) return;
			value = parseInt(value, 10);
		} else if (!value || isEmpty(value)) return;

		valueForm = {
			...valueForm,
			[key]: value,
		};
		onChangePricePricingByCycle(valueForm);
	};

	const onChangeDiscount = (value, key) => {
		let valueForm = form.getFieldsValue(['periodValue', 'discountType', 'discountValue']);
		if (key === 'discountType') {
			dispatch(
				comboPricingActions.calculateTotalPriceAfterDiscount({
					periodValue: valueForm.periodValue,
					discountType: null,
					discountValue: null,
				}),
			);
			return;
		}
		const indexDot = value.indexOf(',');
		if (indexDot > -1) {
			const str = value.substring(indexDot + 1);
			if (str.length > 2) return;
		}
		valueForm = {
			...valueForm,
			[key]: value,
		};
		dispatch(comboPricingActions.calculateTotalPriceAfterDiscount(valueForm));
	};

	const onFinishForm = (formValues) => {
		const values = { ...cloneDeep(formValues) };
		if (isEmpty(values.pricingCombo) || values.pricingCombo?.length < 2) {
			message.error('Gói combo ít nhất 2 dịch vụ. Bạn vui lòng kiểm tra lại.');
			return;
		}
		if (DX.checkApplyTaxList(selectTaxOption, values.taxList)) {
			if (values.taxList?.length > 0) {
				values.hasTax = values.hasTax === true ? 'YES' : 'NO';
				values.taxList.forEach((e) => {
					e.id = e.taxId;
					e.percent = parseFloat(e.percent.toString().replaceAll(',', '.'));
				});
			}
			if (values.addonList?.length > 0) {
				values.addonList.forEach((e) => {
					e.isRequired = e.isRequired === true ? 'YES' : 'NO';
				});
			}
			if (values.discountType === ComboPricing.selectDiscountType[0].value && values.discountValue) {
				values.discountValue = parseInt(trim(values.discountValue.toString()).replaceAll(/\D/g, ''), 10);
			} else if (values.discountType === ComboPricing.selectDiscountType[1].value && values.discountValue) {
				values.discountValue = parseFloat(trim(values.discountValue.toString()).replaceAll(',', '.'));
			}
			if (values.activeDateType === 'UNLIMITED') values.activeDate = -1;
			const pricingComboAmount = [].concat(values.pricingCombo).map((e) => {
				const amount = ComboPricing.getPriceConvertForPricing({
					quantity: e.quantity,
					freeQuantity: e.freeQuantity,
					type: e.pricingPlan,
					formulas: e.formulas,
					paymentSub: e.periodValue,
					cycleSub: e.periodType,
					periodValue: values.periodValue,
					periodType: values.periodType,
				});
				return {
					pricingId: e.id,
					freeQuantity: e.freeQuantity,
					quantity: e.quantity,
					amount,
				};
			});
			const res = {
				...values,
				name: trim(values.name),
				description: trim(values.description),
				setupFee: trim(values?.setupFee) ? parseInt(values.setupFee.toString().replaceAll(/\D/g, ''), 10) : 0,
				numOfPeriod: trim(values?.numOfPeriod) ? values.numOfPeriod : -1,
				amount: trim(values?.amount) ? parseInt(values.amount.toString().replaceAll(/\D/g, ''), 10) : 0,
				updateReason: trim(values?.updateReason),
				pricingCombo: [...pricingComboAmount],
			};
			onFinish(res);
		}
	};
	return (
		<ComboPricingFormContent
			data={data}
			objectCheck={objectCheck}
			disabled={disabled}
			selectPeriodType={SubcriptionPlanDev.selectCycleType}
			selectTaxOption={selectTaxOption}
			selectFeatureOption={selectFeatureOption}
			selectDurationType={SubcriptionPlanDev.selectCycleType}
			onFinish={onFinishForm}
			form={form}
			loadingTax={loadingTax}
			getComboType={getComboType}
			getComboOwner={getComboOwner}
			loadingFeature={loadingFeature}
			loading={loading}
			portal={portal}
			canLoadOption={canLoadOption}
			onChangePriceFormValue={onChangePriceFormValue}
			onChangeDiscount={onChangeDiscount}
		/>
	);
}

ComboPricingForm.propTypes = {
	data: PropTypes.objectOf(),
	disabled: PropTypes.bool,
	// canLoadOption: PropTypes.bool,
	// onFinish: PropTypes.func,
};

ComboPricingForm.defaultProps = {
	data: {},
	disabled: false,
	// canLoadOption: false,
	// onFinish: noop,
};

export default ComboPricingForm;
