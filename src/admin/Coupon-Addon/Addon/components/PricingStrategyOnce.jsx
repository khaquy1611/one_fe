import React, { useEffect, useState } from 'react';
import { cloneDeep, trim } from 'opLodash';
import { SubcriptionPlanDev } from 'app/models';
import PricingStrategyOnceForm from './PricingStrategyOnceForm';

export default function CommonPricingStrategy({
	data,
	form,
	disabled,
	pricingPlanForm,
	setPricingPlanForm,
	selectUnitOption,
	selectCurrencyOption,
	loadingCurrency,
	loadingUnit,
	currencySelector,
	setCurrencySelector,
	objectCheck,
}) {
	const [totalPayment, setTotalPayment] = useState(0);
	const [estimateTotal, setEstimateTotal] = useState(0);
	const [dataRange, setDataRange] = useState([]);

	function estimateTotalPayment(value, type) {
		value = parseInt(trim(value), 10);
		if (Number.isNaN(value) || value === 0) {
			setTotalPayment(0);
			return;
		}
		const arrPricingRange = [...cloneDeep(form.getFieldValue('unitLimitedList'))];
		let priceInx = 0;
		let check = true;
		let stop = false;
		let totalTier = 0;
		arrPricingRange.forEach((e, i) => {
			e.price = e.price === 0 ? 0 : parseInt(e.price.toString().replaceAll(/\D/g, ''), 10);
			if (i === 0) {
				if (value >= 1 && value <= e.unitTo) {
					priceInx = i;
					stop = true;
					totalTier += value * e.price;
				} else totalTier += (trim(e.unitTo) ? e.unitTo : value) * e.price;
			} else if (i !== arrPricingRange.length - 1) {
				if (arrPricingRange[i - 1].unitTo >= arrPricingRange[i].unitTo) check = false;
				if (value >= arrPricingRange[i - 1].unitTo + 1 && value <= arrPricingRange[i].unitTo) {
					totalTier += (value - arrPricingRange[i - 1].unitTo) * e.price;
					priceInx = i;
					stop = true;
				} else totalTier += stop ? 0 : (e.unitTo - arrPricingRange[i - 1].unitTo) * e.price;
			} else if (value >= arrPricingRange[i - 1].unitTo + 1) {
				totalTier += stop ? 0 : (value - arrPricingRange[i - 1].unitTo) * e.price;
				priceInx = i;
			}
		});
		if (!check) {
			setTotalPayment(0);
			return;
		}
		// eslint-disable-next-line default-case
		switch (type) {
			case SubcriptionPlanDev.selectPricingPlan[2].value: // Lũy kế
				setTotalPayment(totalTier);
				break;
			case SubcriptionPlanDev.selectPricingPlan[3].value: // Khối lượng
				setTotalPayment(value * arrPricingRange[priceInx].price);
				break;
			case SubcriptionPlanDev.selectPricingPlan[4].value: // Bậc thang
				setTotalPayment(value > 0 ? arrPricingRange[priceInx].price : 0);
				break;
		}
	}

	function onSelectPricingPlan(option) {
		if (!option) return;
		setPricingPlanForm(option.value);
		const val = form.getFieldValue('estimatePayment');
		if (val) {
			estimateTotalPayment(val, option.value);
		}
	}

	useEffect(() => {
		if (data.id) {
			onSelectPricingPlan({ value: data.pricingPlan });
			if (
				data.pricingPlan !== SubcriptionPlanDev.selectPricingPlan[0].value &&
				data.pricingPlan !== SubcriptionPlanDev.selectPricingPlan[1].value
			) {
				const arr = [];
				data.unitLimitedList.forEach((e) => {
					if (e.unitTo > 0) arr.push(e.unitTo);
				});
				setDataRange([...arr]);
			}
		}
	}, [data.pricingPlan]);

	function onChangePayment(value) {
		setEstimateTotal(value.target.value);
		estimateTotalPayment(value.target.value, pricingPlanForm);
	}

	function onChangeInputRange() {
		if (estimateTotal > 0) estimateTotalPayment(estimateTotal, pricingPlanForm);
	}

	return (
		<PricingStrategyOnceForm
			form={form}
			disabled={disabled}
			pricingPlanForm={pricingPlanForm}
			totalPayment={totalPayment}
			onSelectPricingPlan={onSelectPricingPlan}
			onChangePayment={onChangePayment}
			onChangeInputRange={onChangeInputRange}
			selectUnitOption={selectUnitOption}
			selectCurrencyOption={selectCurrencyOption}
			selectPricingPlan={SubcriptionPlanDev.selectPricingPlan}
			loadingUnit={loadingUnit}
			loadingCurrency={loadingCurrency}
			dataRange={dataRange}
			setDataRange={setDataRange}
			currencySelector={currencySelector}
			setCurrencySelector={setCurrencySelector}
			objectCheck={objectCheck}
		/>
	);
}
