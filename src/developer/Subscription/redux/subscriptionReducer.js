/* eslint-disable no-param-reassign */
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { sortCoupon } from 'app/validator/isInt';
import { isEmpty, isNil, union } from 'opLodash';

const initialState = {
	pricingInfo: {
		pricingValue: [],
		couponList: [],
	},
	addonsList: [],
	coupons: [],
	inLoading: true,
	countCal: 0,
	formValue: {},
	extraFee: [],
	addonsOrigin: [],
	couponListId: [],
};

const subSlice = createSlice({
	name: 'subscription-dev-admin',
	initialState,
	reducers: {
		initPricingInfo(state, { payload }) {
			const { noNeedCalculate } = payload;
			state.pricingInfo = payload;
			//	state.pricingInfo.couponList = sortCoupon(payload.couponList);
			state.formValue = payload.formValue;
			//	state.coupons = sortCoupon(payload.coupons);
			if (state.pricingInfo.quantity === undefined || state.pricingInfo.quantity === 0) {
				state.pricingInfo.quantity = 1;
			}

			state.addonsList = payload.addonsList?.map((addon) => {
				// console.log(addon.isRequired === 'YES' || addon.bonusType === 'ONCE');
				// addon.canNotDelete === (addon.isRequired === 'YES' || addon.bonusType === 'ONCE');
				if (addon.isRequired === 'YES' || addon.bonusType === 'ONCE') {
					addon.canNotDelete = true;
				} else addon.canNotDelete = false;
				if (addon.quantity === undefined || addon.quantity === 0) {
					addon.quantity = 1;
				}
				//	addon.couponList = sortCoupon(addon.couponList);
				addon.couponList?.map((coupon) => {
					coupon.canNotDelete = true;
					return coupon;
				});
				return addon;
			});

			if (payload.coupons) {
				state.coupons = payload.coupons.map((coupon) => {
					coupon.canNotDelete = true;
					return coupon;
				});
			}
			if (payload.extraFee || payload.customFee || payload.onceTimeFee) {
				state.pricingInfo.extraFee = (payload.extraFee || payload.customFee || payload.onceTimeFee).map(
					(extraFee) => {
						extraFee.canNotDelete = true;
						return extraFee;
					},
				);
			}
			if (payload.couponList) {
				state.pricingInfo.couponList = payload.couponList.map((coupon) => {
					coupon.canNotDelete = true;
					return coupon;
				});
			}
			if (payload.extraFee || payload.customFee || payload.onceTimeFee) {
				state.extraFee = (payload.extraFee || payload.customFee || payload.onceTimeFee).map((extraFee) => {
					extraFee.canNotDelete = true;
					return extraFee;
				});
			}
			state.addonsOrigin = payload.addonsOrigin || [];
			if (!noNeedCalculate) {
				state.countCal++;
			}
		},
		reset() {
			return initialState;
		},
		initBilling(state, { payload }) {
			Object.assign(state, payload);
			state.inLoading = false;
		},
		handleUpdatePricing(state, { payload }) {
			const { noNeedCalculate, ...update } = payload;
			Object.assign(state.pricingInfo, update);
			if (state.pricingInfo.quantity) state.pricingInfo.preQuantity = state.pricingInfo.quantity;
			if (payload.couponList) {
				state.pricingInfo.couponList = sortCoupon(payload.couponList);
			}
			if (!noNeedCalculate) {
				state.countCal++;
			}
		},
		handleUpdatePricingByCode(state, { payload }) {
			const { noNeedCalculate, ...update } = payload;
			if (state.pricingInfo.quantity) state.pricingInfo.preQuantity = state.pricingInfo.quantity;
			if (payload.couponList) {
				if (!state.couponListId.includes(payload.couponList[0].id)) {
					state.couponListId.push(payload.couponList[0].id);
					if (state.pricingInfo.couponList === null || state.pricingInfo.couponList === undefined) {
						state.pricingInfo.couponList = [];
					}
					state.pricingInfo.couponList = [...state.pricingInfo.couponList, payload.couponList[0]];
				}
			}
			if (!noNeedCalculate) {
				state.countCal++;
			}
		},
		handleAddCouponPricing(state, { payload }) {
			if (state.pricingInfo.couponList === undefined) {
				state.pricingInfo.couponList = [];
			}

			if (state.couponListId.length === 0 || !state.couponListId.includes(payload.id)) {
				state.couponListId.push(payload.id);
				state.pricingInfo.couponList.push(payload);
				state.countCal++;
			}
		},
		handleDeleteCouponPricing(state, { payload }) {
			const { indexCoupon, couponId } = payload;
			const index = state.couponListId.indexOf(couponId);
			if (index > -1) {
				state.couponListId.splice(index, 1);
			}
			state.pricingInfo.couponList = [
				...state.pricingInfo.couponList.slice(0, indexCoupon),
				...state.pricingInfo.couponList.slice(indexCoupon + 1),
			];
			state.countCal++;
		},
		handleDeleteAddon(state, { payload }) {
			const { indexAddon } = payload;
			state.addonsList = [...state.addonsList.slice(0, indexAddon), ...state.addonsList.slice(indexAddon + 1)];
			state.countCal++;
		},
		handleDeleteCouponAddon(state, { payload }) {
			const { indexAddon, indexCoupon, couponId } = payload;
			const index = state.couponListId.indexOf(couponId);
			if (index > -1) {
				state.couponListId.splice(index, 1);
			}
			state.addonsList[indexAddon].couponList = [
				...state.addonsList[indexAddon].couponList.slice(0, indexCoupon),
				...state.addonsList[indexAddon].couponList.slice(indexCoupon + 1),
			];
			state.countCal++;
		},
		handleDeleteExtraFee(state, { payload }) {
			const { indexExtra } = payload;
			state.extraFee = [...state.extraFee.slice(0, indexExtra), ...state.extraFee.slice(indexExtra + 1)];
			state.countCal++;
		},
		handleDeleteCoupon(state, { payload }) {
			const { indexCoupon, couponId } = payload;
			const index = state.couponListId.indexOf(couponId);
			if (index > -1) {
				state.couponListId.splice(index, 1);
			}
			state.coupons = [...state.coupons.slice(0, indexCoupon), ...state.coupons.slice(indexCoupon + 1)];
			state.countCal++;
		},
		handleUpdateAddon(state, { payload }) {
			const { index, update } = payload;
			if (state.addonsList[index].quantity)
				state.addonsList[index].preQuantity = state.addonsList[index].quantity;

			Object.assign(state.addonsList[index], update);
			if (update.couponList) {
				state.addonsList[index].couponList = sortCoupon(update.couponList);
			}
			if (!payload.noNeedCalculate) {
				state.countCal++;
			}
		},
		handleAddCouponAddon(state, { payload }) {
			const { indexAddon, coupon } = payload;
			if (!state.couponListId.includes(coupon.id)) {
				state.couponListId.push(coupon.id);
				state.addonsList[indexAddon].couponList = state.addonsList[indexAddon].couponList
					? state.addonsList[indexAddon].couponList
					: [];
				state.addonsList[indexAddon].couponList = [...state.addonsList[indexAddon].couponList, coupon];
				state.countCal++;
			}
		},
		handleUpdateAddonCode(state, { payload }) {
			const { index, update } = payload;
			if (state.addonsList[index].quantity)
				state.addonsList[index].preQuantity = state.addonsList[index].quantity;

			if (!state.couponListId.includes(payload.update.couponList[0].id)) {
				state.couponListId.push(payload.update.couponList[0].id);
				if (state.addonsList[index].couponList === null || state.addonsList[index].couponList === undefined) {
					state.addonsList[index].couponList = [];
				}
				state.addonsList[index].couponList = [
					...state.addonsList[index].couponList,
					payload.update.couponList[0],
				];
			}
			if (!payload.noNeedCalculate) {
				state.countCal++;
			}
		},
		handleUpdateSubInfo(state, { payload }) {
			Object.assign(state.formValue, payload);
		},
		handleAddExtraFee(state, { payload }) {
			state.extraFee.push(payload);
			state.countCal++;
		},
		handleChangeAddonList(state, { payload: addonList }) {
			// if (state.addonsList && state.addonsList.length > 0) {
			// 	for (let i = 0; i < addonList.length; i++) {
			// 		for (let j = 0; j < state.addonsList.length; j++) {
			// 			if (addonList[i].id === state.addonsList[j].id) {
			// 				addonList[i] = state.addonsList[j];PPB
			// 				break;
			// 			}
			// 		}
			// 	}
			// }
			state.addonsList = state.addonsList.filter(
				(el) => el.canNotDelete || addonList.find((ol) => ol.id === el.id),
			);
			addonList.forEach((addon) => {
				if (!state.addonsList.find((ol) => ol.id === addon.id)) {
					if (isNil(addon.quantity)) {
						addon.quantity = 1;
					}
					state.addonsList.push(addon);
				}
			});
			// state.addonsList = addonList.map((el) => {
			// 	if (isNil(el.quantity)) {
			// 		el.quantity = 1;
			// 	}
			// 	return el;
			// });
			state.countCal++;
		},
		handleChangeCoupon(state, { payload }) {
			state.coupons = sortCoupon(payload);
			state.countCal++;
		},
		handleAddCouponTotal(state, { payload }) {
			state.coupons.push(payload);
			state.countCal++;
		},
		handleChangeCouponCode(state, { payload }) {
			if (!state.couponListId.includes(payload[0].id)) {
				state.couponListId.push(payload[0].id);
				if (state.coupons === null || state.coupons === undefined) {
					state.coupons = [];
				}
				state.coupons = [...state.coupons, payload[0]];
				state.coupons = sortCoupon(state.coupons);
			}
			state.countCal++;
		},
		// changeAmountAddon(state, { payload }) {
		// 	const { index, amount } = payload;
		// 	state.addonList[index].quantity = amount;
		// 	for (let i = 0; i < state.addonList[index].couponList.length; i++) {
		// 		const coupon = state.addonList[index].couponList[i];
		// 		if (isNil(coupon.minimum)) {
		// 			return;
		// 		}
		// 		if (coupon.disabled && amount >= coupon.minimum) {
		// 			state.addonList[index].couponList[i].disabled = false;
		// 		} else if (!coupon.disabled) {
		// 			state.addonList[index].couponList[i].disabled = true;
		// 		}
		// 	}
		// 	state.countCal++;
		// },
		// handleCheckCouponOnPricing(state, { payload }) {
		// 	const { index, coupon } = payload;
		// 	const { isCheckBox } = state;
		// 	if (!isCheckBox) {
		// 		state.couponChecked = { ...coupon, type: 'in-pricing' };
		// 		return;
		// 	}
		// 	state.couponList[index].checked = !state.couponList[index].checked;
		// 	state.countCal++;
		// },
		// handleCheckAddon(state, { payload }) {
		// 	const { index } = payload;
		// 	state.addonList[index].checked = !state.addonList[index].checked;
		// 	for (let i = 0; i < state.coupons.length; i++) {
		// 		const addonDepend = state.coupons[i].addonDepend || [];
		// 		if (addonDepend.length) {
		// 			state.coupons[i].disabled = addonDepend.some((addonId) => {
		// 				const addon = state.addonList.find((addonInList) => addonInList.id === addonId);
		// 				if (addon && addon.checked) {
		// 					return false;
		// 				}
		// 				return true;
		// 			});
		// 		}
		// 	}
		// 	state.countCal++;
		// },
		// handleCheckCouponOnAddon(state, { payload }) {
		// 	const { index, indexCoupon, coupon } = payload;
		// 	const { isCheckBox } = state;
		// 	if (!isCheckBox) {
		// 		state.couponChecked = { ...coupon, type: 'in-addon' };
		// 		return;
		// 	}
		// 	state.addonList[index].couponList[indexCoupon].checked = !state.addonList[index].couponList[indexCoupon]
		// 		.checked;
		// 	state.countCal++;
		// },
		// handleCheckCouponOnTotal(state, { payload }) {
		// 	const { index, coupon } = payload;
		// 	const { isCheckBox } = state;
		// 	if (!isCheckBox) {
		// 		state.couponChecked = { ...coupon, type: 'in-total' };
		// 		return;
		// 	}
		// 	state.coupons[index].checked = !state.coupons[index].checked;
		// 	state.countCal++;
		// },
		applyCalculate(state, { payload }) {
			state.totalAmountAfterTaxFinal = payload.totalAmountAfterTaxFinal;
			state.totalAmountPreTax = payload.totalAmountPreTax;
			state.totalAmountPreTaxFinal = payload.totalAmountPreTaxFinal;
			state.pricingInfo = {
				...state.pricingInfo,
				...payload.object,
			};
			function getCoupons(conponsOrigin, couponsApply) {
				conponsOrigin?.forEach((couponOrigin) => {
					const couponApply = couponsApply.find(
						(el) => (el.id || el.couponId) === (couponOrigin.id || couponOrigin.couponId),
					);
					if (couponApply) {
						Object.assign(couponOrigin, couponApply);
					}
				});
			}
			// getCoupons(state.coupons, payload.coupons);
			getCoupons(state.pricingInfo.couponList, payload.object.coupons);

			payload.addons.forEach((addon) => {
				const indexAddon = state.addonsList.findIndex((el) => el.id === addon.id);
				if (indexAddon > -1) {
					state.addonsList[indexAddon] = {
						...state.addonsList[indexAddon],
						...addon,
					};
					getCoupons(state.addonsList[indexAddon].couponList, addon.coupons);
				}
			});
		},
	},
});

export const subActions = subSlice.actions;

const subInfo = (state) => state.subscription;
const selectSubInfo = createSelector(subInfo, (sub) => sub);
// const selectCouponList = createSelector(stateBilling, (app) => app.couponList);
// const selectAddons = createSelector(stateBilling, (app) => app.addons);
// const selectCoupons = createSelector(stateBilling, (app) => app.coupons);
// const selectCountCal = createSelector(stateBilling, (app) => app.countCal);
// const isNoTax = createSelector(stateBilling, (app) => isEmpty(app.taxList) && !app.addonHaveTax);
const haveTax = createSelector(
	subInfo,
	(sub) => !isEmpty(sub.pricingInfo?.taxList) || sub.addonsList.some((addon) => !isEmpty(addon.taxList)),
);
export const subSelects = {
	selectSubInfo,
	haveTax,
	// isNoTax,
	// selectCouponList,
	// selectAddons,
	// selectCoupons,
	// selectCountCal,
};

export default subSlice.reducer;
