/* eslint-disable no-param-reassign */
import { isEmpty, trim } from 'opLodash';
import Base from './Base';

class Pricing extends Base {
	getDetail = async (id) => {
		try {
			const res = await this.apiGet(`/admin-portal/pricing/${id}`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getOneByPricingId = async (id) => {
		try {
			const res = await this.apiGet(`/admin-portal/pricing/${id}`);
			return res.body || res;
		} catch (e) {
			console.log(e);
			return [
				{
					id: '1',
					serviceName: 'abc',
					code: 'xyz',
					status: 'APPROVE',
					price: 'R',
					type: '',
					paymentRate: '',
					trialDays: '',
					description: '',
					features: [],
					cause: '',
				},
			];
		}
	};

	updateApproveServicePackStatus = async (data) => {
		try {
			const res = await this.apiPut(`/admin-portal/pricing/${data.id}/approve`, data.body);
			return res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	getDetailCommonPortal = async (portal, id, type) => {
		try {
			const res = await this.apiGet(`/${portal}-portal/pricing/${id}/type/${type}`);
			return res.body || res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	getListFeaturesByServiceId = async (serviceId) => {
		try {
			const res = await this.apiGet(`/portal/features/${serviceId}`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getListTaxCode = async () => {
		try {
			const res = await this.apiGet(`/portal/listTax`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	// ----------------------addon-------------------------------
	getListAddons = async (portal, query) => {
		const res = await this.apiGet(`/${portal}-portal/pricing/addon`, query);
		return this.formatResPagination(res);
	};

	// all service for addon
	getServiceDrop = (portal, params) => this.apiGet(`/${portal}-portal/pricing/service-filter`, params);

	// all service pack for addon
	getPricingDrop = (portal, params) => this.apiGet(`/${portal}-portal/pricing/addon-filter`, params);

	// all period for addon
	getPeriodDrop = (portal, params) => this.apiGet(`/${portal}-portal/pricing/period-filter`, params);

	getListCurrency = async () => {
		try {
			const res = await this.apiGet('/portal/listCurrency');
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getListUnit = async () => {
		try {
			const res = await this.apiGet('/portal/unit/listUnit');
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	insertPricingByServiceId = ({ serviceId, data }) => this.apiPost(`/dev-portal/pricing/service/${serviceId}`, data);

	updateDisplayed = ({ pricingId, status }) => this.apiPut(`/dev-portal/pricing/${pricingId}/status/${status}`);

	requestApprove = ({ pricingId }) => this.apiPut(`/dev-portal/pricing/${pricingId}/request-for-approval`);

	deletePricing = ({ pricingId }) => this.apiDelete(`/dev-portal/pricing/${pricingId}`);

	getListPricingForAdmin = (id) => this.apiGet(`/admin-portal/pricing/service/${id}`);

	updateApproveStatus = ({ id, body }) => this.apiPut(`/admin-portal/pricing/approve/${id}`, body);

	updatePricing = ({ id, serviceId, body }) => this.apiPut(`/dev-portal/pricing/${id}/service/${serviceId}`, body);

	getListPricingHistory = async (portal, id, query) => {
		const res = await this.apiGet(`/${portal}-portal/pricing/${id}/history`, query);
		return this.formatResPagination(res);
	};

	getDetailService = async (portal, id) => {
		try {
			const res = await this.apiGet(`/${portal}-portal/services/${id}/basic`);
			return res.body || res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	getDetailPricingHistory = async (portal, id, approve) => {
		try {
			const res = await this.apiGet(`/${portal}-portal/pricing/${id}/approve/${approve}`);
			return res.body || res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	transformData = (res = {}) => {
		const convertTax = (taxValue, typeHas, typeTax) => {
			taxValue[typeHas] = taxValue[typeHas] === 'YES';
			taxValue[typeTax]?.forEach((e) => {
				e.percent = e.percent.toString().replaceAll('.', ',');
			});
		};

		if (res.taxList?.length > 0) convertTax(res, 'hasTax', 'taxList');
		if (res.setupFeeTaxList?.length > 0) convertTax(res, 'hasTaxSetupFee', 'setupFeeTaxList');

		if (res.addonList?.length > 0) {
			res.addonList.forEach((e) => {
				e.isRequired = e.isRequired === 'YES';
			});
		}

		if (res.pricingStrategies) {
			res.pricingStrategies.forEach((el, index) => {
				if (el.defaultCircle === 'YES') res.defaultCircle = index;

				if (el.pricingPlan === 'FLAT_RATE' || el.pricingPlan === 'UNIT') {
					el.price = el.price?.toLocaleString('vi-VN');
					el.unitLimitedList = [{}];
				} else {
					el.unitLimitedList.forEach((e) => {
						e.price = e.price?.toLocaleString('vi-VN');
					});
				}

				if (!isEmpty(el.addonList)) {
					el.addonList.forEach((e) => {
						e.isRequired = e.isRequired === 'YES';
					});
				}

				if (el.numberOfCycles === -1) el.numberOfCycles = '';
			});
		}

		if (res.featureList.length > 0) {
			res.featureListDup = res.featureList;
			res.featureList = res.featureList.map((e) => e.id);
		}

		if (res.hasChangeQuantity === 'ALL') res.hasChangeQuantity = ['INCREASE', 'DECREASE'];
		else if (!isEmpty(res.hasChangeQuantity)) res.hasChangeQuantity = [].concat(res.hasChangeQuantity);
		else res.hasChangeQuantity = [];

		if (res.activeDate > 0) res.activeDateType = 'LIMITED';
		else {
			res.activeDate = null;
			res.activeDateType = 'UNLIMITED';
		}
		return res;
	};
}
export default new Pricing('');
