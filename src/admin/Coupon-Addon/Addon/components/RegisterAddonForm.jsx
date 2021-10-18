import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { AddonAdmin, Pricing, DX, SubcriptionPlanDev } from 'app/models';
import { cloneDeep, isEmpty, noop, trim } from 'opLodash';
import { UrlBreadcrumb } from 'app/components/Atoms';
import RegisterAddonFormContent from './RegisterAddonFormContent';

function formatUnitLimit(unitLimitedList) {
	unitLimitedList?.forEach((e, i) => {
		e.price = parseInt(e.price.toString().replaceAll(/\D/g, ''), 10);
		if (i === 0) {
			e.unitFrom = 1;
			if (unitLimitedList.length === 1) {
				e.unitTo = -1;
			}
		} else if (i < unitLimitedList.length - 1) {
			e.unitFrom = unitLimitedList[i - 1].unitTo + 1;
		} else if (i === unitLimitedList.length - 1) {
			e.unitFrom = unitLimitedList[i - 1].unitTo + 1;
			e.unitTo = -1;
		}
	});
}

function isUnitLimitPlan(plan) {
	const FLAT_RATE = SubcriptionPlanDev.selectPricingPlan[0].value;
	const UNIT = SubcriptionPlanDev.selectPricingPlan[1].value;

	return plan !== FLAT_RATE && plan !== UNIT;
}

export default function RegisterAddonForm({
	breadcrumbs,
	data,
	disabled,
	setSelectTaxOption,
	portal,
	canLoadOption,
	onFinish,
	onDeleteAddon,
	isEdit,
	form,
	typeAddon,
	errorService,
	type,
}) {
	const { id, addonId } = useParams();
	const [currencyDefault, setCurrencyDefault] = useState(0);
	const [currencySelector, setCurrencySelector] = useState('');
	const [unitIdDefault, setUnitIdDefault] = useState(null);
	const [dataRange, setDataRange] = useState({ 0: [] });
	const [triggerPaymentCycle, setTriggerPaymentCycle] = useState({ 0: '' });
	const [pricingPlanItem, setPricingPlanItem] = useState({ 0: 'FLAT_RATE' });
	const [triggerErrorTitle, setTriggerErrorTitle] = useState([]);

	const { data: selectTaxOption, refetch: refetchTax, isFetching: loadingTax } = useQuery(
		['getListTaxCode', id],
		async () => {
			try {
				const res = await Pricing.getListTaxCode();
				setSelectTaxOption && setSelectTaxOption(res);
				data.taxList &&
					data.taxList.forEach((tax) => {
						if (!res.find((item) => item.id === tax.taxId)) {
							res.push({ id: tax.taxId, name: tax.taxName });
						}
					});
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
			enabled: portal !== 'admin' && canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: selectCurrencyOption, refetch: refetchCurrency, isFetching: loadingCurrency } = useQuery(
		['getListCurrency', id],
		async () => {
			try {
				const res = await Pricing.getListCurrency();
				const arr = [];
				if (data.currencyId && !res.find((item) => item.id === data.currencyId)) {
					res.push({ id: data.currencyId, currencyType: data.currencyName });
				}
				res.forEach((e) => {
					arr.push({
						value: e.id,
						label: e.currencyType,
					});
					if (e.currencyType.toUpperCase() === 'VND') {
						setCurrencyDefault(e.id);
						setCurrencySelector('VND');
					}
				});
				return arr;
			} catch (err) {
				return [];
			}
		},
		{
			initialData: [],
			enabled: portal !== 'admin' && canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: selectUnitOption, refetch: refetchUnit, isFetching: loadingUnit } = useQuery(
		['getListUnit', id],
		async () => {
			try {
				const res = await Pricing.getListUnit();
				if (res.length > 0) {
					setUnitIdDefault(res[0].id);
				} else setUnitIdDefault(null);
				if (data.unitId && !res.find((item) => item.id === data.unitId)) {
					res.push({ id: data.unitId, name: data.unitName });
				}
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
			enabled: portal !== 'admin' && canLoadOption,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);
	const onTriggerData = (arr = []) => {
		if (!isEmpty(arr)) {
			const allRange = {};
			const allPayment = {};
			const allPricingPlan = {};

			arr.forEach((el, index) => {
				const arrItem = [];
				if (el.pricingPlan) allPricingPlan[index] = el.pricingPlan;
				if (el.pricingPlan !== 'FLAT_RATE' && el.pricingPlan !== 'UNIT') {
					el.unitLimitedList?.forEach((e) => {
						if (e.unitTo > 0) arrItem.push(e.unitTo);
					});
				}
				if (!isEmpty(arrItem)) {
					allRange[index] = [...arrItem];
				}
				if (el.paymentCycle) allPayment[index] = el.paymentCycle;
			});

			setDataRange({ ...allRange });
			setTriggerPaymentCycle({ ...allPayment });
			setPricingPlanItem({ ...allPricingPlan });
		}
	};

	const onFinishForm = (formValues) => {
		const values = { ...cloneDeep(formValues) };

		if (DX.checkApplyTaxList(selectTaxOption, values.taxList)) {
			if (isUnitLimitPlan(values.pricingPlan)) {
				formatUnitLimit(values.unitLimitedList);
			}

			if (values.taxList?.length > 0) {
				values.taxList.forEach((e) => {
					e.percent = parseFloat(e.percent.toString().replaceAll(',', '.'));
				});
			}

			// param once
			const pricingId = [];
			const comboPlanId = [];
			const multiPlanId = [];

			values.multiPlanId?.forEach((e) => {
				if (e?.id === -1) pricingId.push(e.pricingId || e.pricing.id);
				else if ((e.type || e.service.type) === 'SERVICE') {
					multiPlanId.push(e.id);
				} else {
					comboPlanId.push(e.id);
				}
			});
			const arrMultiPlanId = {
				pricingId,
				comboPlanId,
				multiPlanId,
			};

			// param periodic
			values.pricingStrategies?.forEach((i) => {
				const pricingIdPeriodic = [];
				const comboPlanIdPeriodic = [];
				const multiPlanIdPeriodic = [];

				i.multiPlanId?.forEach((e) => {
					if (e.multiPlanId === -1) pricingIdPeriodic.push(e.planId);
					else if (e.type === 'SERVICE') {
						multiPlanIdPeriodic.push(e.multiPlanId);
					} else {
						comboPlanIdPeriodic.push(e.multiPlanId);
					}
				});
				const arrMultiPlanId2 = {
					pricingId: pricingIdPeriodic,
					comboPlanId: comboPlanIdPeriodic,
					multiPlanId: multiPlanIdPeriodic,
				};
				i.multiPlanId = arrMultiPlanId2;
				if (isUnitLimitPlan(i.pricingPlan)) {
					formatUnitLimit(i.unitLimitedList);
				}
			});

			const res = {
				...values,
				setupFeeHasTax: values.setupFeeHasTax === true ? 'YES' : 'NO',
				currencyId: 1,
				multiPlanId: arrMultiPlanId,
				price: trim(values?.price) ? parseInt(values.price.toString().replaceAll(/\D/g, ''), 10) : null,
				setupFee: trim(values?.setupFee) ? parseInt(values.setupFee.toString().replaceAll(/\D/g, ''), 10) : 0,
			};
			onFinish(res);
		}
	};

	return (
		<>
			<UrlBreadcrumb breadcrumbs={breadcrumbs} />
			<RegisterAddonFormContent
				data={data}
				disabled={disabled}
				checkApproved
				checkStatus
				onDeleteAddon={onDeleteAddon}
				selectTaxOption={selectTaxOption}
				onFinish={onFinishForm}
				loadingTax={loadingTax}
				selectCurrencyOption={selectCurrencyOption}
				loadingCurrency={loadingCurrency}
				currencyDefault={currencyDefault}
				pricingPlanItem={pricingPlanItem}
				setPricingPlanItem={setPricingPlanItem}
				currencySelector={currencySelector}
				setCurrencySelector={setCurrencySelector}
				triggerPaymentCycle={triggerPaymentCycle}
				setTriggerPaymentCycle={setTriggerPaymentCycle}
				dataRange={dataRange}
				setDataRange={setDataRange}
				onTriggerData={onTriggerData}
				selectUnitOption={selectUnitOption}
				loadingUnit={loadingUnit}
				selectTime={AddonAdmin.selectTime}
				selectPaymentRate={AddonAdmin.selectPaymentRate}
				form={form}
				isEdit={isEdit}
				triggerErrorTitle={triggerErrorTitle}
				unitIdDefault={unitIdDefault}
				typeAddon={typeAddon}
				errorService={errorService}
				type={type}
			/>
		</>
	);
}

RegisterAddonForm.propTypes = {
	breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
	data: PropTypes.objectOf(),
	disabled: PropTypes.bool,
	onFinish: PropTypes.func,
};

RegisterAddonForm.defaultProps = {
	data: {},
	disabled: false,
	onFinish: noop,
};
