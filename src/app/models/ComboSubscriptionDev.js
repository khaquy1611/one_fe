import { toLower } from 'opLodash';
import Base from './Base';

class ComboSubscriptionDev extends Base {
	getListComboSubscription = async (query, typePortal) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/${typePortal === 'DEV' ? 'dev-portal' : 'admin-portal'}/subscription/combo`,
			query,
		);
		return this.formatResPagination(res);
	};

	insertComboTrial = (body) => this.apiPostWithoutPrefix('/api/dev-admin-portal/subscription/combo', body);

	getListComboPopup = async (query) => {
		try {
			const res = await this.apiGetWithoutPrefix(`/api/portal/subscription/combo-plan`, query);
			return this.formatResPagination(res);
		} catch (e) {
			return e;
		}
	};

	insertCombo = (body) => this.apiPostWithoutPrefix('/api/portal/subscription/combo', body);

	getDataCalRealCombo = (body) => this.apiPostWithoutPrefix(`/api/portal/subscription/combo/calculate/new`, body);

	getDetailComboBefore = (id) => this.apiGetWithoutPrefix(`/api/portal/subscription/combo-plan/${id}`);

	getPromotionpopup = async (companyId, id, typePortal, price, quantity, params) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/portal/subscription/combo-plan/coupons/${companyId}/${id}?portalType=${typePortal}&price=${price} &quantity=${quantity}`,
			params,
		);
		return this.formatResPaginationCoupon(res);
	};

	getPromotionTotal = async (companyId, pricingId, addonIds, typePortal, price, quantity, param) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/portal/subscription/combo-plan/total/coupons/${companyId}/${pricingId}?addonIds=${addonIds}&portalType=${typePortal}&price=${price} &quantity=${quantity}`,
			param,
		);
		return this.formatResPaginationCoupon(res);
	};

	activeComboSub = (id, typePortal) =>
		this.apiPutWithoutPrefix(
			`/api/${typePortal === 'DEV' ? 'dev-portal' : 'admin-portal'}/combos/activate/${id}/subscription`,
		);

	destroySubscriptionCombo = ({ id, paymenType }) =>
		this.apiDeleteWithoutPrefix(
			`/api/dev-admin-portal/subscription/combo-plan/cancel/${id}?paymenType=${paymenType}`,
		);

	deleteSubscriptionCombo = (data) =>
		this.apiDeleteWithoutPrefix(
			`/api/${data.type === 'DEV' ? 'dev-portal' : 'admin-portal'}/subscription/combo-plan/${data.id}/delete`,
		);

	generalScreen = (id) => this.apiGetWithoutPrefix(`/api/portal/combos/subscription/${id}/common`);

	generalScreenTrial = (id) => this.apiGetWithoutPrefix(`/api/portal/combos/subscription_trial/${id}/common`);

	descriptionCombo = (id) => this.apiGetWithoutPrefix(`/api/dev-portal/combos/subscription/${id}/detail`);

	insertIntrialtoActive = (body) =>
		this.apiPostWithoutPrefix(`/api/portal/subscription/combo/${body.subscriptionId}`, body);

	getBillSubCombo = async (id, param) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/subscription/${id}/combo/list-billings`, param);
		return this.formatResPagination(res);
	};

	updateComboActive = (data) => this.apiPutWithoutPrefix(`/api/dev-portal/combos/${data.subscriptionId}`, data);

	updateComboFuture = (data) =>
		this.apiPutWithoutPrefix(`/api/dev-portal/combos/waiting/${data.subscriptionId}`, data);

	changeComboPlan = (data) =>
		this.apiPutWithoutPrefix(`/api/portal/subscription/update/${data.subscriptionId}/combo`, data);

	activeSubscriptionCombo = (id, typePortal) =>
		this.apiPutWithoutPrefix(
			`/api/${typePortal === 'DEV' ? 'dev-portal' : 'admin-portal'}/subscription/activate/${id}`,
		);

	updateComboTrial = (data) =>
		this.apiPutWithoutPrefix(`/api/portal/subscription/${data.subscriptionId}/update-sub-combo-try`, data);

	detailComboChange = (id, typePortal, subscriptionId) =>
		this.apiGetWithoutPrefix(
			`/api/portal/subscription/combo-plan/${id}?subscriptionId=${subscriptionId}&portal=${typePortal}`,
		);

	// Popup xem trước chi phí chung cho combo va dich vu
	postPreviewCost = ({ cycleNo, subscriptionInfo, typePortal }) =>
		this.apiPostWithoutPrefix(
			`/api/${toLower(typePortal)}-portal/subscription/combo/bill-incurred?cycleNo=${cycleNo}`,
			subscriptionInfo,
		);

	getCouponInfoByCouponCode = (couponCode, type, comboId, companyId, price, quantity = 0, portalType, addonIds) => {
		const SUPSCRIPTION_PRICING = '3';
		const SUPSCRIPTION_ADDON = '2';
		const TOTAL_SUBSCRIPTION = '5';
		let url = `/api/coupon-item/check?code=${couponCode}&type=${type}&companyId=${companyId}&price=${price}&quanlity=${quantity}&portalType=${portalType}`;
		switch (type) {
			case SUPSCRIPTION_PRICING:
				url += `&comboId=${comboId}`;
				break;
			case SUPSCRIPTION_ADDON:
				url += `&addonId=${comboId}`;
				break;
			case TOTAL_SUBSCRIPTION:
				url += `&comboId=${comboId}&addonIds=${addonIds}`;
				break;
			default:
				break;
		}

		return this.apiGetWithoutPrefix(url, {});
	};

	// Lấy danh sách tên KH cho popup chọn KH
	getSmeName = (params) => this.apiGetWithoutPrefix('/api/portal/subscription/sme-name', params);

	// Lấy danh sách người đại diện cho popup chọn KH
	getAdminName = (params) => this.apiGetWithoutPrefix('/api/portal/subscription/sme/admin-name', params);

	// Lấy danh sách tỉnh thành cho popup chọn KH
	getListAddress = (params) => this.apiGetWithoutPrefix('/api/portal/subscription/sme-province', params);

	// Lấy danh sách mã số thuê cho popup chọn KH
	getListTin = (params) => this.apiGetWithoutPrefix('/api/portal/subscription/sme-tin', params);

	// Lấy danh sách tên Combo dịch vụ cho popup chọn gói combo dịch vụ
	getComboName = (params) => this.apiGetWithoutPrefix('/api/portal/combos/combo_name', params);

	// Lấy danh sách tên gói Combo dịch vụ cho popup chọn gói combo dịch vụ
	getComboPricingName = (params) => this.apiGetWithoutPrefix('/api/portal/combos/combo_plan_name', params);

	// Lấy danh sách chu kỳ thanh toán cho popup chọn gói combo dịch vụ
	getComboPeriod = (params) => this.apiGetWithoutPrefix('/api/portal/combos/comboPlan/cycle_type', params);

	// Lấy danh sách nhà phát triên cho popup chọn gói combo dịch vụ
	getDevelopName = (params) => this.apiGetWithoutPrefix('/api/portal/combos/develop_name', params);

	tagStatus = {
		ACTIVE: {
			color: 'success',
			text: 'Hoạt động',
			value: 'ACTIVE',
		},
		IN_TRIAL: {
			color: 'default',
			text: 'Dùng thử',
			value: 'IN_TRIAL',
		},
		FUTURE: {
			color: 'geekblue',
			text: 'Đang chờ',
			value: 'FUTURE',
		},
		CANCELED: {
			color: 'error',
			text: 'Đã hủy',
			value: 'CANCELED',
		},
		NON_RENEWING: {
			color: 'default',
			text: 'Kết thúc',
			value: 'NON_RENEWING',
		},
	};

	statusArray = [
		{
			value: '',
			label: 'all',
			color: '',
		},
		{
			value: 'ACTIVE',
			label: 'Hoạt động',
			color: 'success',
		},
		{
			value: 'IN_TRIAL',
			label: 'Dùng thử',
			color: 'default',
		},
		{
			value: 'FUTURE',
			label: 'Đang chờ',
			color: 'geekblue',
		},
		{
			value: 'CANCELLED',
			label: 'Đã hủy',
			color: 'error',
		},
		{
			value: 'NON_RENEWING',
			label: 'Kết thúc',
			color: 'default',
		},
	];

	tagStatusBill = {
		INIT: {
			color: '#78909C',
			text: 'Khởi tạo',
			value: 'INIT',
		},
		WAITING: {
			color: '#135ea8',
			text: 'Chờ thanh toán',
			value: 'WAITING',
		},
		PAID: {
			color: '#22AAA1',
			text: 'Đã thanh toán',
			value: 'PAID',
		},
		FAILURE: {
			color: '#f90b0b',
			text: 'Thanh toán thất bại',
			value: 'FAILURE',
		},
		OUT_OF_DATE: {
			color: '#FFB300',
			text: 'Quá hạn thanh toán',
			value: 'OUT_OF_DATE',
		},
	};
}

export default new ComboSubscriptionDev('/api/dev-portal/subscription');
