/* eslint-disable no-param-reassign */
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { isEmpty, trim } from 'opLodash';
import Base from './Base';
import DX from './DX';
import SubcriptionPlanDev from './SubcriptionPlanDev';

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
class ComboPricing extends Base {
	getListPricingByComboId = async (id) => {
		try {
			const res = await this.apiGet(`/portal/combos/${id}/tab/pricing`);
			return res.data;
		} catch (e) {
			return [];
		}
	};

	getDetailComboPlanByPricingId = async (id, type) => {
		try {
			const res = await this.apiGet(`/portal/combos/combo-plan/detail/${id}`, { status: type });
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getOneComboById = async (portal, comboId, process) =>
		this.apiGet(`/${portal}-portal/combos/${comboId}/tab/${process}`);

	// tạo gói combo
	insertComboPricing = ({ comboId, data }) => this.apiPost(`/portal/combos/${comboId}/pricing`, data);

	updateComboPricing = ({ comboId, comboPlanId, body }) =>
		this.apiPut(`/portal/combos/${comboId}/pricing/${comboPlanId}`, body);

	updateRecommendedPricing = (data) =>
		this.apiPut(`/portal/combos/tab/pricing/order-list/${data.comboId}`, data.body);

	updateDisplayed = ({ portal, pricingId, status }) =>
		this.apiPut(`/portal/combos/tab/pricing/status/${pricingId}/status/${status}`);

	requestApprove = ({ portal, comboId }) => this.apiPut(`/${portal}-portal/combo-plans/${comboId}/request-approve`);

	updateApproveStatusComboPlan = async (data) => {
		try {
			const res = await this.apiPut(`/admin-portal/combos/combo-plan/approve/${data.id}`, data.body);
			return res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	deletePricing = ({ comboPlanId }) => this.apiDelete(`/portal/combos/tab/pricing/deleted/${comboPlanId}`);

	getListPricingForCombo = async (portal, query) => {
		const res = await this.apiGet(`/${portal}-portal/combos/pricing`, query);
		return this.formatResPagination(res);
	};

	getListAddons = async ({ portal, query }) => {
		const res = await this.apiGet(`/${portal}-portal/combos/pricing-addon`, query);
		return this.formatResPagination(res);
	};

	getListFeatures = async () => {
		try {
			const res = await this.apiGet('/portal/features');
			return res.body || res;
		} catch (e) {
			return [];
		}
	};

	getListPricingForCombo = async (portal, query) => {
		const res = await this.apiGet(`/${portal}-portal/combos/pricing`, query);
		return this.formatResPagination(res);
	};

	getListAddons = async ({ portal, query }) => {
		const res = await this.apiGet(`/${portal}-portal/combos/pricing-addon`, query);
		return this.formatResPagination(res);
	};

	getListHistoryByComboPlanId = async ({ id, query }) => {
		const res = await this.apiGet(`/portal/action-log/combo-plans/${id}`, query);
		return this.formatResPagination(res);
	};

	tagDisplay = {
		VISIBLE: {
			color: 'success',
			text: 'saas.use.enable',
			icon: EyeOutlined,
			value: 'VISIBLE',
		},
		INVISIBLE: {
			color: 'default',
			text: 'saas.use.disable',
			icon: EyeInvisibleOutlined,
			value: 'INVISIBLE',
		},
	};

	selectDiscountType = [
		{
			label: 'Số tiền',
			value: 'PRICE',
		},
		{
			label: '%',
			value: 'PERCENT',
		},
	];

	transformData = (value) => {
		if (value?.pricingCombo?.length > 0) {
			value.pricingCombo.forEach((el, index) => {
				el.pricingId = el.id;
				el.index = index;
				if (
					el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[0].value ||
					el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[1].value
				) {
					el.formulas = el.price;
				}
				if (el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[0].value) {
					delete el.price;
					el.showInputCount = false;
				} else {
					el.price = 0;
					el.showInputCount = true;
				}
				if (el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[1].value) {
					el.showInputFree = true;
				} else el.showInputFree = false;
			});
		}
		if (value?.taxList?.length > 0) {
			value.hasTax = value.hasTax === 'YES';
			value.taxList.forEach((e) => {
				e.percent = e.percent.toString().replaceAll('.', ',');
			});
		}
		if (value?.addonList?.length > 0) {
			value.addonList.forEach((e) => {
				e.isRequired = e.isRequired === 'YES';
			});
		}
		if (value.numOfPeriod === -1) value.numOfPeriod = '';
		if (trim(value?.setupFee)) value.setupFee = value.setupFee.toLocaleString('vi-VN');

		if (value?.discountType === 0) {
			value.discountType = 'PERCENT';
		} else value.discountType = 'PRICE';

		if (value.discountType === 'PRICE' && value.discountValue) {
			value.discountValue = value.discountValue.toLocaleString('vi-VN');
		} else if (value.discountType === 'PERCENT' && value.discountValue) {
			value.discountValue = value.discountValue.toString().replaceAll('.', ',');
		}
		if (!trim(value?.amount)) {
			value.amount = 0;
		}

		if (value.featureList?.length > 0) {
			value.featureListDup = value.featureList;
			value.featureList = value.featureList.map((e) => e.id);
		} else value.featureList = [];

		if (value.cancelDate === 'RIGHT_NOW') value.cancelDate = 0;
		else value.cancelDate = 1;

		if (value.activeDate > 0) value.activeDateType = 'LIMITED';
		else {
			value.activeDate = null;
			value.activeDateType = 'UNLIMITED';
		}
		return value;
	};

	getPriceConvertForPricing = ({
		quantity,
		freeQuantity,
		type,
		formulas,
		paymentSub,
		cycleSub,
		periodValue,
		periodType,
	}) => {
		let totalPrice = 0;
		if (typeof formulas !== 'number') {
			if (isEmpty(formulas)) return 0;
		}
		if (quantity === 0 && type !== PricingPlan[0]) return 0;
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
		return priceConvert;
	};
}
export default new ComboPricing('');
