import { createSelector, createSlice } from '@reduxjs/toolkit';

const initialState = {};

const imagePrivateSlice = createSlice({
	name: 'imagePrivate',
	initialState,
	reducers: {
		setImage(state, { payload }) {
			state[payload.id] = payload;
		},
		clear(state, { payload }) {
			state[payload.id] = null;
		},
	},
});

export const imagePrivateActions = imagePrivateSlice.actions;

const stateImage = (state) => state.imagePrivate;
const selectImage = createSelector(stateImage, (state) => state);

export const imageSelects = {
	selectImage,
};

export default imagePrivateSlice.reducer;
