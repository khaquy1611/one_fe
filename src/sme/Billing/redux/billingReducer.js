import { createSelector, createSlice } from '@reduxjs/toolkit';
import { isEmpty, isNil, pick } from 'opLodash';
import { IN_ADDON, IN_PRICING } from '../constant';

const initialState = {
	addonList: [],
	couponList: [],

	// ex : {... , type : 0}  : 0 is main , 1 is addon , 2 is coupons
	couponUserTypedList: [],
	coupons: [],
	inLoading: true,
	countCal: 0,
	countCalDetail: 0,
	pricing: {},
	checkAmountZero: {},
	amountChecked: 1,
	couponChecked: {},
};
function checkAvailableCoupon(coupons, amountChecked, totalAmountPreTaxFinal) {
	let haveChangeChecked = false;
	for (let j = 0; j < coupons.length; j++) {
		const coupon = coupons[j];
		if (!isNil(coupon.minimumAmount) && !isNil(totalAmountPreTaxFinal)) {
			if (totalAmountPreTaxFinal >= coupon.minimumAmount) {
				coupons[j].disabled = false;
			} else {
				coupons[j].disabled = true;
			}
		}
		if (!isNil(coupon.minimum) && !coupons[j].disabled) {
			if (amountChecked < coupon.minimum) {
				coupons[j].disabled = true;
			}
		}
		if (coupons[j].disabled && coupons[j].checked) {
			coupons[j].checked = false;
			haveChangeChecked = true;
		}
	}
	return haveChangeChecked;
}
function checkAvailable(state, totalAmountPreTaxFinal) {
	let haveChangeChecked = false;
	for (let i = 0; i < state.addonList.length; i++) {
		if (state.addonList[i].checked) {
			haveChangeChecked =
				haveChangeChecked ||
				checkAvailableCoupon(state.addonList[i].couponList, state.amountChecked, totalAmountPreTaxFinal);
		}
	}
	haveChangeChecked =
		haveChangeChecked || checkAvailableCoupon(state.coupons, state.amountChecked, totalAmountPreTaxFinal);
	haveChangeChecked =
		haveChangeChecked || checkAvailableCoupon(state.couponList, state.amountChecked, totalAmountPreTaxFinal);
	if (haveChangeChecked) {
		state.countCal++;
	}
}

const billingSlice = createSlice({
	name: 'billing-sme',
	initialState,
	reducers: {
		reset() {
			return initialState;
		},
		initBilling(state, { payload }) {
			Object.assign(state, payload);
			state.countCal = 0;
			state.countCalDetail = 0;

			// checkAvailable(state);
			state.inLoading = false;
		},
		changeAmountPricing(state, { payload }) {
			const { amount } = payload;

			if (state.quantity) state.preQuantity = state.quantity;
			state.quantity = amount;
			if (!amount) {
				state.checkAmountZero.pricing = true;
			} else {
				delete state.checkAmountZero.pricing;
			}

			state.countCal++;
			state.countCalDetail++;
		},
		changeAmountAddon(state, { payload }) {
			const { index, amount } = payload;
			if (state.addonList[index].quantity) state.addonList[index].preQuantity = state.addonList[index].quantity;
			state.addonList[index].quantity = amount;
			if (!amount) {
				state.checkAmountZero[index] = true;
			} else {
				delete state.checkAmountZero[index];
			}

			state.countCal++;
			state.countCalDetail++;
		},
		handleCheckCouponOnPricing(state, { payload }) {
			const { index, coupon } = payload;
			// const { isCheckBox } = state;
			state.countCal++;
			state.countCalDetail++;
			const { isCheckBox } = state;
			if (!isCheckBox) {
				state.couponChecked = { ...coupon, type: 'in-pricing' };
				return;
			}
			state.couponChecked = { ...coupon };
			state.couponList[index].checked = !state.couponList[index].checked;
		},

		handleAddCouponUserTyped(state, { payload }) {
			state.couponUserTypedList = [...state.couponUserTypedList, payload];
			// add coupon typed to list coupon
			if (payload.type === IN_PRICING) {
				state.couponList = [...state.couponList, payload];
				state.couponChecked = { ...payload, type: IN_PRICING };
			}
			if (payload.type.includes(IN_ADDON)) {
				const addonIndex = +payload.type.split('-')[2];
				state.addonList[addonIndex].couponList = [...state.addonList[addonIndex].couponList, payload];
				state.couponChecked = { ...payload, type: IN_ADDON };
			}
			// if(payload.type === IN_TOTAL){
			//
			// }

			state.countCal++;
			state.countCalDetail++;
		},
		handleRemoveCouponUserTyped(state, { payload }) {
			state.couponUserTypedList = state.couponUserTypedList.filter((el) => el.code !== payload.code);
			if (payload.type === IN_PRICING) {
				state.couponList = state.couponList.filter((el) => el.code !== payload.code);
			}
			if (payload.type.includes(IN_ADDON)) {
				const addonIndex = +payload.type.split('-')[2];
				state.addonList[addonIndex].couponList = state.addonList[addonIndex].couponList.filter(
					(el) => el.code !== payload.code,
				);
			}

			state.countCal++;
			state.countCalDetail++;
			state.couponChecked = null;
		},

		handleCheckAddon(state, { payload }) {
			const { index } = payload;
			state.addonList[index].checked = !state.addonList[index].checked;
			if (state.addonList[index].checked) {
				state.amountChecked++;
			} else {
				state.amountChecked--;
			}
			for (let i = 0; i < state.coupons.length; i++) {
				const addonDepend = state.coupons[i].addonDepend || [];
				if (addonDepend.length) {
					state.coupons[i].disabled = addonDepend.some((addonId) => {
						const addon = state.addonList.find((addonInList) => addonInList.id === addonId);
						if (addon && addon.checked) {
							return false;
						}
						return true;
					});
				}
			}

			checkAvailable(state);
			state.countCal++;
			state.countCalDetail++;
		},
		handleCheckCouponOnAddon(state, { payload }) {
			const { index, indexCoupon, coupon } = payload;
			const { isCheckBox } = state;
			state.countCal++;
			state.countCalDetail++;
			if (!isCheckBox) {
				state.couponChecked = { ...coupon, type: 'in-addon' };
				return;
			}
			state.addonList[index].couponList[indexCoupon].checked = !state.addonList[index].couponList[indexCoupon]
				.checked;
		},
		handleCheckCouponOnTotal(state, { payload }) {
			const { index, coupon } = payload;
			const { isCheckBox } = state;
			state.countCal++;
			if (!isCheckBox) {
				state.couponChecked = { ...coupon, type: 'in-total' };
				return;
			}
			state.coupons[index].checked = !state.coupons[index].checked;
		},
		applyCalculate(state, { payload }) {
			state.totalAmountAfterTaxFinal = payload.totalAmountAfterTaxFinal;
			state.totalAmountPreTax = payload.totalAmountPreTax;
			state.totalAmountPreTaxFinal = payload.totalAmountPreTaxFinal;
			state.pricing = {
				...payload.object,
				invoiceCoupon: [...payload.object?.invoiceCouponPrices, ...payload.object?.invoiceCouponPercents],
			};
			state.price = payload.object?.price;
			const getInfoCoupon = (id, initData, couponsApply) => {
				// if (!isNil(initData.minimumAmount)) {
				// 	if (initData.disabled && state.totalAmountPreTaxFinal >= initData.minimumAmount) {
				// 		initData.disabled = false;
				// 	} else if (!initData.disabled) {
				// 		initData.disabled = true;
				// 	}
				// }
				// if (!isNil(initData.minimum)) {
				// 	if (initData.disabled && state.amountChecked >= initData.minimum) {
				// 		initData.disabled = false;
				// 	} else if (!initData.disabled) {
				// 		initData.disabled = true;
				// 	}
				// }
				const indexCal = couponsApply.findIndex((el) => el.id === id);
				if (indexCal > -1) {
					return { ...initData, pricingInfo: couponsApply[indexCal] };
				}
				return { ...initData, pricingInfo: {} };
			};
			// state.coupons = state.coupons.map((coupon) =>
			// 	getInfoCoupon(coupon.couponId, coupon, [
			// 		...payload.object?.invoiceCouponPrices,
			// 		...payload.object?.invoiceCouponPercents,
			// 	]),
			// );
			state.couponList = state.couponList.map((coupon) =>
				getInfoCoupon(coupon.couponId, coupon, [
					...payload.object?.couponPrices,
					...payload.object?.couponPercent,
				]),
			);

			payload.addons.forEach((addon) => {
				const indexAddon = state.addonList.findIndex((el) => el.id === addon.id);
				if (indexAddon > -1) {
					state.addonList[indexAddon] = {
						...state.addonList[indexAddon],
						...addon,
						couponList: state.addonList[indexAddon].couponList.map((coupon) =>
							getInfoCoupon(coupon.couponId, coupon, [...addon.couponPrices, ...addon.couponPercent]),
						),
						invoiceCoupon: [
							...(addon.invoiceCouponPercents || []),
							...(addon.invoiceCouponPrices || []),
						].map((coupon) => {
							const findCoupon = state.coupons.find((el) => el.couponId === coupon.id) || {};
							return {
								...coupon,
								...pick(findCoupon, [
									'couponName',
									'promotionType',
									'discountValue',
									'discountType',
									'code',
									'timesUsedType',
									'couponValue',
								]),
							};
						}),
					};
				}
			});
			checkAvailable(state, state.totalAmountPreTax);
		},
		setPreOrderId(state, { payload }) {
			const { preOrderId } = payload;
			state.preOrderId = preOrderId;
		},
	},
});

export const billingActions = billingSlice.actions;

const stateBilling = (state) => state.billingSme;
const selectBillingInfo = createSelector(stateBilling, (billingSme) => billingSme);
const selectPricingId = createSelector(stateBilling, (billingSme) => billingSme.pricingId);
const selectListCouponUserType = createSelector(stateBilling, (billingSme) => billingSme.couponUserTypedList);
const selectCouponList = createSelector(stateBilling, (billingSme) => billingSme.couponList);
const selectAddons = createSelector(stateBilling, (billingSme) => billingSme.addons);
const selectCoupons = createSelector(stateBilling, (billingSme) => billingSme.coupons);
const selectCountCal = createSelector(stateBilling, (billingSme) => billingSme.countCal);
const haveTax = createSelector(
	stateBilling,
	(billingSme) =>
		!isEmpty(billingSme.taxList) ||
		billingSme.addonList.some((addon) => addon.checked && (!isEmpty(addon.tax) || !isEmpty(addon.taxList))),
);
const haveTaxAddon = createSelector(stateBilling, (billingSme) =>
	billingSme.addonList.some((addon) => addon.checked && !isEmpty(addon.tax)),
);

export const billingSelects = {
	selectBillingInfo,
	haveTax,
	selectCouponList,
	selectAddons,
	selectCoupons,
	selectCountCal,
	haveTaxAddon,
	selectPricingId,
	selectListCouponUserType,
};

export default billingSlice.reducer;
