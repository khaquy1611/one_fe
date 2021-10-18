import { Spin } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { DX, Pricing, SubcriptionPlanDev } from 'app/models';
import { cloneDeep, isEmpty, trim } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import PricingFormContent from './PricingFormContent';

export default function CommonPricingForm({
	breadcrumbs = [],
	data = {},
	objectCheck,
	disabled,
	onFinish,
	form,
	portal,
	// canLoadOption,
	loading,
	setSelectTaxOption,
	setSelectCurrencyOption,
	setSelectUnitOption,
	setSelectFeatureOption,
}) {
	const { id } = useParams();
	const [currencyDefault, setCurrencyDefault] = useState(0);

	const { data: selectFeatureOption, isFetching: loadingFeature } = useQuery(
		['getListFeaturesByServiceId', id],
		async () => {
			try {
				const res = await Pricing.getListFeaturesByServiceId(id);
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
			// enabled: canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: selectTaxOption, isFetching: loadingTax } = useQuery(
		['getListTaxCode', id],
		async () => {
			try {
				const res = await Pricing.getListTaxCode();
				if (!isEmpty(data.taxList))
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
			// enabled: canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: selectCurrencyOption, isFetching: loadingCurrency } = useQuery(
		['getListCurrency', id],
		async () => {
			try {
				const res = await Pricing.getListCurrency();
				const arr = [];
				res.forEach((e) => {
					arr.push({
						value: e.id,
						label: e.currencyType,
					});
					if (e.currencyType.toUpperCase() === 'VND') {
						setCurrencyDefault(e.id);
					}
				});
				setSelectCurrencyOption && setSelectCurrencyOption(res);
				return arr;
			} catch (err) {
				return [];
			}
		},
		{
			initialData: [],
			// enabled: canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: selectUnitOption, isFetching: loadingUnit } = useQuery(
		['getListUnit', id],
		async () => {
			try {
				const res = await Pricing.getListUnit();
				setSelectUnitOption && setSelectUnitOption(res);
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
			// enabled: canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const convertTax = (taxValue, typeHas, typeTax) => {
		taxValue[typeHas] = taxValue[typeHas] === true ? 'YES' : 'NO';
		taxValue[typeTax].forEach((e) => {
			e.percent = parseFloat(e.percent.toString().replaceAll(',', '.'));
		});
	};

	const onFinishForm = (formValues) => {
		const values = { ...cloneDeep(formValues) };
		if (DX.checkApplyTaxList(selectTaxOption, values.taxList)) {
			const dataStrategies = values.pricingStrategies;

			dataStrategies.forEach((el, index) => {
				if (values.defaultCircle === index) el.defaultCircle = 'YES';
				else el.defaultCircle = 'NO';

				if (
					el.pricingPlan !== SubcriptionPlanDev.selectPricingPlan[0].value &&
					el.pricingPlan !== SubcriptionPlanDev.selectPricingPlan[1].value
				) {
					el.price = null;
					el.freeQuantity = null;
					el.unitLimitedList?.forEach((e, i) => {
						e.price = parseInt(e.price.toString().replaceAll(/\D/g, ''), 10);
						if (i === 0) {
							e.unitFrom = 1;
							if (el.unitLimitedList.length === 1) {
								e.unitTo = -1;
							}
						} else if (i < el.unitLimitedList.length - 1) {
							e.unitFrom = el.unitLimitedList[i - 1].unitTo + 1;
						} else if (i === el.unitLimitedList.length - 1) {
							e.unitFrom = el.unitLimitedList[i - 1].unitTo + 1;
							e.unitTo = -1;
						}
					});
				} else {
					if (el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[0].value) {
						el.unitId = null;
						el.freeQuantity = null;
					}
					el.price = parseInt(el.price.toString().replaceAll(/\D/g, ''), 10);
					el.unitLimitedList = null;
				}

				if (el.addonList?.length > 0) {
					el.addonList.forEach((e) => {
						e.isRequired = e.isRequired === true ? 'YES' : 'NO';
					});
				}

				el.numberOfCycles = el.numberOfCycles || -1;
			});

			if (values.addonList?.length > 0) {
				values.addonList.forEach((e) => {
					e.isRequired = e.isRequired === true ? 'YES' : 'NO';
				});
			}

			if (values.taxList?.length > 0) convertTax(values, 'hasTax', 'taxList');
			if (values.setupFeeTaxList?.length > 0) convertTax(values, 'hasTaxSetupFee', 'setupFeeTaxList');

			if (isEmpty(values.hasChangeQuantity)) values.hasChangeQuantity = 'NONE';
			else if (values.hasChangeQuantity.length === 2) values.hasChangeQuantity = 'ALL';
			else values.hasChangeQuantity = `${values.hasChangeQuantity[0]}`;

			if (values.activeDateType === 'UNLIMITED') values.activeDate = -1;
			const res = {
				...values,
				pricingName: trim(values.pricingName),
				setupFee: values.setupFee ? parseInt(values.setupFee.toString().replaceAll(/\D/g, ''), 10) : 0,
			};

			console.log('formValues', res);
			onFinish(res);
		}
	};

	if (loadingUnit)
		return (
			<div className="text-center mt-28">
				<Spin spinning />
			</div>
		);

	return (
		<>
			<UrlBreadcrumb breadcrumbs={breadcrumbs} />
			<PricingFormContent
				data={data}
				objectCheck={objectCheck}
				disabled={disabled}
				selectDurationType={SubcriptionPlanDev.selectDurationType}
				selectFeatureOption={selectFeatureOption}
				selectTaxOption={selectTaxOption}
				selectCurrencyOption={selectCurrencyOption}
				selectUnitOption={selectUnitOption}
				onFinish={onFinishForm}
				form={form}
				currencyDefault={currencyDefault}
				loadingFeature={loadingFeature}
				loadingTax={loadingTax}
				loadingCurrency={loadingCurrency}
				loadingUnit={loadingUnit}
				loading={loading}
				portal={portal}
				// canLoadOption={canLoadOption}
			/>
		</>
	);
}

CommonPricingForm.propTypes = {
	breadcrumbs: PropTypes.arrayOf(PropTypes.object),
	data: PropTypes.objectOf(),
	disabled: PropTypes.bool,
	// canLoadOption: PropTypes.bool,
	// onFinish: PropTypes.func,
};

CommonPricingForm.defaultProps = {
	breadcrumbs: [],
	data: {},
	disabled: false,
	// canLoadOption: false,
	// onFinish: noop,
};
