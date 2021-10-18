import { createSelector, createSlice } from '@reduxjs/toolkit';

const initialState = {};

const idInactiveSlice = createSlice({
	name: 'idInactive',
	initialState,
	reducers: {
		getAllIdInactive(state, { payload }) {
			state.idArr = payload;
		},
	},
});

export const idInactiveActions = idInactiveSlice.actions;

const stateId = (state) => state.idInactive;
const selectId = createSelector(stateId, (state) => state);

export const idSelects = {
	selectId,
};

export default idInactiveSlice.reducer;
