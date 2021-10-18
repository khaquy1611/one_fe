/* eslint-disable no-param-reassign */
import DX from 'app/models/DX';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { isEmpty, trim } from 'opLodash';

const initialState = {
	pricingCombo: [],
	totalPrice: 0, // Tổng tiền trước khi giảm
	amount: 0, // Tổng tiền sau khi giảm
	discountValue: 0,
	discountType: null,
	showPricing: false,
	countReload: 0,
	disableBtn: false,
	changeValueAmount: false,
};

const PricingPlan = ['FLAT_RATE', 'UNIT', 'TIER', 'VOLUME', 'STAIR_STEP'];

const convertTimePeriodType = (periodValue, periodType) => {
	periodValue = parseInt(periodValue, 10) || 0;
	switch (periodType) {
		case 'WEEKLY':
			return periodValue * 7;
		case 'MONTHLY':
			return periodValue * 30;
		case 'YEARLY':
			return periodValue * 365;
		default:
			return periodValue;
	}
};

function getPriceConvertForPricing({
	quantity,
	freeQuantity,
	type,
	formulas,
	paymentSub,
	cycleSub,
	periodValue,
	periodType,
	totalPriceBeforeConvert,
}) {
	let totalPrice = 0;
	if (!totalPriceBeforeConvert) {
		if (typeof formulas !== 'number') {
			if (isEmpty(formulas))
				return {
					priceAfterConvert: 0,
				};
		}
		if (quantity === 0 && type !== PricingPlan[0])
			return {
				priceAfterConvert: 0,
			};
		if (type === PricingPlan[0]) {
			totalPrice = formulas;
		} else if (type === PricingPlan[1]) {
			if (typeof freeQuantity !== 'number') freeQuantity = 0;
			const left = quantity - freeQuantity;
			if (left > 0) {
				totalPrice = left * formulas;
			} else totalPrice = 0;
		} else {
			let priceInx = 0;
			let stop = false;
			let totalTier = 0;
			[].concat(formulas).forEach((e, i) => {
				if (i === 0) {
					if (quantity >= 1 && quantity <= e.unitTo) {
						priceInx = i;
						stop = true;
						totalTier += quantity * e.price;
					} else
						totalTier += (trim(e.unitTo) && e.unitTo.toString() !== '-1' ? e.unitTo : quantity) * e.price;
				} else if (i !== formulas.length - 1) {
					if (quantity >= formulas[i - 1].unitTo + 1 && quantity <= formulas[i].unitTo) {
						totalTier += (quantity - formulas[i - 1].unitTo) * e.price;
						priceInx = i;
						stop = true;
					} else totalTier += stop ? 0 : (e.unitTo - formulas[i - 1].unitTo) * e.price;
				} else if (quantity >= formulas[i - 1].unitTo + 1) {
					totalTier += stop ? 0 : (quantity - formulas[i - 1].unitTo) * e.price;
					priceInx = i;
				}
			});
			if (type === PricingPlan[2]) totalPrice = totalTier;
			if (type === PricingPlan[3]) totalPrice = quantity * formulas[priceInx].price;
			if (type === PricingPlan[4]) totalPrice = formulas[priceInx].price;
		}
	} else {
		totalPrice = totalPriceBeforeConvert;
	}
	// Quy đổi theo periodValue & periodType
	let priceConvert = 0;
	if (paymentSub === periodValue && cycleSub === periodType) {
		priceConvert = totalPrice;
	} else {
		const periodValueConvert = convertTimePeriodType(periodValue, periodType);
		const periodValuePricing = convertTimePeriodType(paymentSub, cycleSub);
		priceConvert = (totalPrice * periodValueConvert) / periodValuePricing;
		priceConvert = DX.formatNumberCurrency(priceConvert, 'int');
	}
	return {
		priceBeforeConvert: totalPrice,
		priceAfterConvert: priceConvert,
	};
}

function calculateDiscount({ discountType, discountValue, totalPrice }) {
	if (isEmpty(discountType) || isEmpty(discountValue)) {
		return totalPrice;
	}
	let priceAfter = 0;
	if (discountType === 'PERCENT') {
		const discount = parseFloat(trim(discountValue.toString()).replaceAll(',', '.'));
		priceAfter = totalPrice - (totalPrice * discount) / 100;
		priceAfter = DX.formatNumberCurrency(priceAfter, 'int');
	} else {
		const discount = parseInt(trim(discountValue.toString()).replaceAll(/\D/g, ''), 10);
		priceAfter = totalPrice - discount;
	}
	return priceAfter;
}

const comboPricingSlice = createSlice({
	name: 'combo-pricing',
	initialState,
	reducers: {
		reset() {
			return initialState;
		},
		initComboPricing(state, { payload }) {
			Object.assign(state, payload);
			state.showPricing = true;
		},
		insertPricingList(state, { payload }) {
			const { list } = payload;
			if (!isEmpty(list)) {
				[].concat(list).forEach((el) => {
					state.pricingCombo.push(el);
				});
			}
		},
		deleteSubPricingList(state, { payload }) {
			const { index } = payload;
			if (typeof index === 'number' && index >= 0) {
				const priceLeft = state.totalPrice - state.pricingCombo[index].price;
				const valueDiscount = calculateDiscount({
					discountType: state.discountType,
					discountValue: state.discountValue,
					totalPrice: priceLeft,
				});
				state.totalPrice = Number.isNaN(priceLeft) ? 0 : priceLeft;
				state.amount = Number.isNaN(valueDiscount) ? 0 : valueDiscount;
				if (state.pricingCombo.length === 1) state.showPricing = false;
				state.pricingCombo.splice(index, 1);
				state.countReload++;
				state.changeValueAmount = false;
			}
		},
		resetPeriodValue(state) {
			state.totalPrice = 0;
			state.amount = 0;
			state.pricingCombo.forEach((e) => {
				e.price = 0;
			});
			state.changeValueAmount = false;
		},
		calculateOneSubPrice(state, { payload }) {
			const { index, formName, changeValue, periodValue, periodType, discountType, discountValue } = payload;
			state.discountValue = discountValue;
			state.discountType = discountType;
			let quantityValue = 0;
			let freeQuantityValue = 0;
			const obj = { ...state.pricingCombo[index] };
			if (formName === 'quantity') {
				quantityValue = changeValue;
				freeQuantityValue = obj?.freeQuantity || 0;
			} else {
				quantityValue = obj?.quantity || 0;
				freeQuantityValue = changeValue;
			}
			if (!periodValue) state.pricingCombo[index].quantity = quantityValue;
			const pricing = state.pricingCombo[index];
			const priceLeft = state.totalPrice - pricing.price;
			const { priceBeforeConvert, priceAfterConvert } = getPriceConvertForPricing({
				quantity: quantityValue,
				freeQuantity: freeQuantityValue,
				type: pricing.pricingPlan,
				formulas: pricing.formulas,
				paymentSub: pricing.periodValue,
				cycleSub: pricing.periodType,
				periodValue,
				periodType,
			});
			const valueDiscount = calculateDiscount({
				discountType,
				discountValue,
				totalPrice: priceLeft + priceAfterConvert,
			});
			state.pricingCombo[index] = {
				...obj,
				quantity: quantityValue,
				freeQuantity: freeQuantityValue,
				priceBeforeConvert,
				price: priceAfterConvert,
			};
			state.totalPrice = priceLeft + priceAfterConvert;
			state.amount = valueDiscount;
			state.changeValueAmount = false;
		},
		calculateChangeAllPricing(state, { payload }) {
			const { periodValue, periodType } = payload;
			let totalPrice = 0;
			state.pricingCombo.forEach((e) => {
				if (!e?.priceBeforeConvert) {
					const { priceBeforeConvert, priceAfterConvert } = getPriceConvertForPricing({
						quantity: e.quantity || 0,
						freeQuantity: e.freeQuantity || 0,
						type: e.pricingPlan,
						formulas: e.formulas,
						paymentSub: e.periodValue,
						cycleSub: e.periodType,
						periodValue,
						periodType,
					});
					e.priceBeforeConvert = priceBeforeConvert;
					e.price = priceAfterConvert;
					totalPrice += priceAfterConvert;
				} else {
					const { priceAfterConvert } = getPriceConvertForPricing({
						totalPriceBeforeConvert: e.priceBeforeConvert,
						paymentSub: e.periodValue,
						cycleSub: e.periodType,
						periodValue,
						periodType,
					});
					e.price = priceAfterConvert;
					totalPrice += priceAfterConvert;
				}
			});
			state.totalPrice = totalPrice;
		},
		calculateTotalPriceAfterDiscount(state, { payload }) {
			const { periodValue, discountType, discountValue } = payload;
			state.discountValue = discountValue;
			state.discountType = discountType;
			if (typeof periodValue !== 'number') {
				state.amount = 0;
				state.changeValueAmount = false;
				return;
			}

			let price = 0;
			state.pricingCombo.forEach((e) => {
				price += e.price;
			});
			state.totalPrice = !Number.isNaN(price) ? price : 0;
			const valueDiscount = calculateDiscount({ discountType, discountValue, totalPrice: price });
			state.amount = valueDiscount;
			state.changeValueAmount = false;
		},
		initDirtyForm(state) {
			state.disableBtn = true;
		},
		setDirtyForm(state) {
			if (state.disableBtn) state.disableBtn = false;
		},
		setChangeValueAmount(state) {
			if (!state.changeValueAmount) state.changeValueAmount = true;
		},
	},
});

export const comboPricingActions = comboPricingSlice.actions;

const stateComboPricing = (state) => state.comboPricing;
const selectPriceList = createSelector(stateComboPricing, (comboPricing) =>
	comboPricing.pricingCombo.map((e) => e.price),
);
const selectPricingList = createSelector(stateComboPricing, (comboPricing) => comboPricing.pricingCombo);
const selectTotalPrice = createSelector(stateComboPricing, (comboPricing) => comboPricing.totalPrice);
const selectPriceAfterDiscount = createSelector(stateComboPricing, (comboPricing) => comboPricing.amount);
const selectShowPricing = createSelector(stateComboPricing, (comboPricing) => comboPricing.showPricing);
const selectReload = createSelector(stateComboPricing, (comboPricing) => comboPricing.countReload);
const selectDisableBtn = createSelector(stateComboPricing, (comboPricing) => comboPricing.disableBtn);
const selectChangeValueAmount = createSelector(stateComboPricing, (comboPricing) => comboPricing.changeValueAmount);

export const comboPricingSelects = {
	selectPriceList,
	selectPricingList,
	selectTotalPrice,
	selectPriceAfterDiscount,
	selectShowPricing,
	selectReload,
	selectDisableBtn,
	selectChangeValueAmount,
};

export default comboPricingSlice.reducer;
