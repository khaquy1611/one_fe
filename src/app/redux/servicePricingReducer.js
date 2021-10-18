import { createSelector, createSlice } from '@reduxjs/toolkit';
import { isEmpty } from 'opLodash';

const initialState = {
	paymentCycle: { 0: 0 },
	cycleType: { 0: 'MONTHLY' },
};

function getPreAllValue(arr = []) {
	const tempPaymentCycle = [];
	const tempCycleType = [];

	arr.forEach((el, i) => {
		tempPaymentCycle.push(el.paymentCycle);
		tempCycleType.push(el.cycleType);
	});
	return { paymentCycle: { ...tempPaymentCycle }, cycleType: { ...tempCycleType } };
}

const servicePricingSlice = createSlice({
	name: 'preValue',
	initialState,
	reducers: {
		reset() {
			return initialState;
		},
		initPricingInfo(state, { payload }) {
			const { pricingStrategies } = payload;
			if (!isEmpty(pricingStrategies)) {
				const preState = getPreAllValue(pricingStrategies);
				state.paymentCycle = preState.paymentCycle;
				state.cycleType = preState.cycleType;
			}
		},

		getCurrentPayment(state, { payload }) {
			const key = Object.keys(payload)[0];
			state.paymentCycle[key] = parseInt(payload[key], 10);
		},

		getCurrentCycleType(state, { payload }) {
			const key = Object.keys(payload)[0];
			state.cycleType[key] = payload[key];
		},

		removeCurrentPayment(state, { payload }) {
			const key = payload;
			delete state.paymentCycle[key];
			delete state.cycleType[key];

			const tempPayment = Object.values(state.paymentCycle);
			const tempCycleType = Object.values(state.cycleType);
			state.paymentCycle = { ...tempPayment };
			state.cycleType = { ...tempCycleType };
		},
	},
});

export const servicePricingActions = servicePricingSlice.actions;

const statePreValue = (state) => state.pricingInfo;
const selectPricingInfo = createSelector(statePreValue, (pricingInfo) => pricingInfo);

export const servicePricingSelects = { selectPricingInfo };

export default servicePricingSlice.reducer;
