import { createSelector, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { isObject } from 'opLodash';

const initialState = {
	lng: localStorage.getItem('i18nextLng') || i18next.language,
	user: {
		loading: true,
		roles: [],
	},
	notifyToken: null,
	categoryList: [],
	settings: {},
};

const appSlice = createSlice({
	name: 'counter',
	initialState,
	reducers: {
		changeLanguage(state, { payload }) {
			state.lng = payload;
			i18next.changeLanguage(payload);
		},
		updateUser(state, { payload }) {
			let newUser;
			if (!payload || !isObject(payload)) {
				newUser = {};
			} else {
				newUser = { ...payload };
			}
			newUser.name = `${newUser.lastname} ${newUser.firstname}`;
			newUser.time = new Date().getTime();
			if (!newUser.roles) {
				newUser.roles = [];
			}
			if (newUser.roles[0]?.id) {
				newUser.roles = newUser.roles.map((r) => r.id);
			}
			localStorage.setItem('user', JSON.stringify(newUser));
			newUser.adminProvinceId = newUser?.department?.provinceId;
			newUser.isAdminProvince = !!newUser.adminProvinceId;
			state.user = newUser;
		},
		changeStatus(state, { payload }) {
			state.user.statusACCOUNT = payload;
		},
		updateNotifyToken(state, { payload }) {
			state.notifyToken = payload;
		},
		initCategoryList(state, { payload }) {
			state.categoryList = payload;
		},
		updateSetting(state, { payload }) {
			Object.assign(state.settings, payload);
		},
	},
});

export const appActions = appSlice.actions;

const stateApp = (state) => state.app;
const selectLanguage = createSelector(stateApp, (app) => app.lng);
const selectUser = createSelector(stateApp, (app) => app.user);
const selectSetting = createSelector(stateApp, (app) => app.settings);
const selectNotifyToken = createSelector(stateApp, (app) => app.notifyToken);
const selectCategoryState = createSelector(stateApp, (app) => ({
	categoryList: app.categoryList,
}));

export const appSelects = {
	selectLanguage,
	selectUser,
	selectNotifyToken,
	selectCategoryState,
	selectSetting,
};

export default appSlice.reducer;
