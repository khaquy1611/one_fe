import Base from './Base';

class AdminCoupon extends Base {
	// create coupon admin
	createCoupon = (query) => this.apiPost('', query);

	updateCoupon = (data) => this.apiPut(`/${data.id}`, data.body);

	updateDraftCoupon = (data) => this.apiPut(`/${data.id}/draft`, data.body);

	putApproveCoupon = (data) => this.apiPut(`/${data.id}/approve`, data.body);

	putOnOffStatus = (data) => this.apiPut(`/${data.id}/status/${data.status}`);

	confirmUpdateCoupon = (data) => this.apiDelete(`/${data.id}/action/${data.status}`);

	// on send approve
	putRequestApprove = (id) => this.apiPutWithoutPrefix(`/api/portal/coupon/${id}/request-approve`);

	deleteCoupon = (body) => this.apiDeleteWithoutPrefix(`/api/portal/coupon`, body);

	getListEnterprise = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/coupon/enterprise`, params);
		return this.formatResPagination(res);
	};

	getListAddon = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/coupon/popup-addons`, params);
		return this.formatResPagination(res);
	};

	getListPricing = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/pricing`, params);
		return this.formatResPagination(res);
	};

	getListPromotionDev = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/dev-portal/coupon`, params);
		return this.formatResPagination(res);
	};

	getListPromotionAdmin = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/admin-portal/coupon`, params);
		return this.formatResPagination(res);
	};

	getPromotionCode = (params) => this.apiGetWithoutPrefix(`/api/portal/generate/key`, params);

	// Danh sách dịch vụ cho popup dịch vụ KM
	getServiceDrop = (params) => this.apiGetWithoutPrefix(`/api/portal/coupon/search-service`, params);

	// Danh sách gói dịch vụ cho popup dịch vụ KM
	getPricingDrop = (params) => this.apiGetWithoutPrefix(`/api/portal/coupon/search-pricing`, params);

	// Danh sách danh mục cho popup dịch vụ KM
	getCategoryDrop = (params) => this.apiGetWithoutPrefix(`/api/portal/coupon/search-category`, params);

	// Danh sách chu kỳ cho popup dịch vụ KM
	getPeriodDrop = (params) => this.apiGetWithoutPrefix(`/api/portal/coupon/search-pricing-plan`, params);

	displayApprove = [
		{
			value: '',
			label: 'all',
		},
		{
			value: 'UNAPPROVED',
			label: 'notApprovedYet',
		},
		{
			value: 'AWAITING_APPROVAL',
			label: 'pending',
		},
		{
			value: 'APPROVED',
			label: 'approved',
		},
		{
			value: 'REJECTED',
			label: 'reject',
		},
	];

	displayOptions = [
		{
			value: '',
			label: 'all',
		},
		{
			value: 'ACTIVE',
			label: 'active',
		},
		{
			value: 'INACTIVE',
			label: 'inactive',
		},
	];

	displayOptionsFormatStc = [
		{
			value: '',
			label: 'all',
		},
		{
			value: '0',
			label: 'inUse',
		},
		{
			value: '1',
			label: 'use',
		},
		// {
		// 	value: '2',
		// 	label: 'outOfDate',
		// },
	];

	displayOptionsStatusFormatStc = [
		{
			value: '',
			label: 'all',
		},
		{
			value: '0',
			label: '0',
		},
		{
			value: '1',
			label: '1',
		},
		{
			value: '2',
			label: '2',
		},
	];

	durationOptions = [
		{
			value: 'ALL',
			label: 'all',
		},
		{
			value: 'UNEXPIRED',
			label: 'inUse',
		},
		{
			value: 'EXPIRED',
			label: 'outOfDate',
		},
	];

	displayAuthorize = [
		{
			value: 'ALL',
			label: 'all',
		},
		{
			value: 'ADMIN',
			label: 'admin',
		},
		{
			value: 'DEV',
			label: 'dev',
		},
	];
}
export default new AdminCoupon('/admin-portal/coupon');
