import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Base from './Base';

class SubcriptionPlanDev extends Base {
	getAllPagination = async (query) => {
		const res = await this.apiGet('', query);
		return this.formatResPagination(res);
	};

	updateDisplayed = (data) => this.apiPut(`/${data.id}/displayed/${data.status}`);

	updateApproveStatus = (data) => this.apiPut(`/${data.id}/approve`, data.body);

	getDetail = async (id) => {
		try {
			const res = await this.apiGet(`/${id}`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getListPricingForService = async (id) => {
		try {
			const res = await this.apiGet(`/service/${id}`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	updateRecommendedSubscription = (data) => this.apiPut(`/order-list/${data.serviceId}`, data.body);

	paymentRateValue = {
		ALL_IN: {
			value: 'trọn gói',
		},
		MONTHLY: {
			value: 'tháng',
		},
		YEARLY: {
			value: 'năm',
		},
	};

	selectPricesType = [
		{
			label: '/Người dùng',
			value: 'PERSON',
		},
		{
			label: 'Không giới hạn',
			value: 'UNLIMITED',
		},
	];

	selectPaymentRate = [
		{
			label: 'Trọn gói',
			value: 'ALL_IN',
		},
		{
			label: 'Hàng tháng',
			value: 'MONTHLY',
		},
		{
			label: 'Hàng năm',
			value: 'YEARLY',
		},
		{
			label: 'Ngày',
			value: 'DATE',
		},
	];

	selectCycleType = [
		{
			label: 'Ngày',
			value: 'DAILY',
		},
		{
			label: 'Tuần',
			value: 'WEEKLY',
		},
		{
			label: 'Tháng',
			value: 'MONTHLY',
		},
		{
			label: 'Năm',
			value: 'YEARLY',
		},
	];

	selectDurationType = [
		{
			label: 'Ngày',
			value: 'DAY',
		},
		{
			label: 'Tuần',
			value: 'WEEK',
		},
		{
			label: 'Tháng',
			value: 'MONTH',
		},
		{
			label: 'Năm',
			value: 'YEAR',
		},
	];

	selectPricingPlan = [
		{
			label: 'Cố định - Flat Rate',
			value: 'FLAT_RATE',
		},
		{
			label: 'Đơn vị - Per Unit',
			value: 'UNIT',
		},
		{
			label: 'Lũy kế - Tier',
			value: 'TIER',
		},
		{
			label: 'Khối lượng - Volume',
			value: 'VOLUME',
		},
		{
			label: 'Bậc thang - Stair step',
			value: 'STAIR_STEP',
		},
	];

	formatPricingPlanToText = {
		FLAT_RATE: 'Cố định',
		UNIT: 'Đơn vị',
		TIER: 'Lũy kế',
		STAIR_STEP: 'Bậc thang',
		VOLUME: 'Khối lượng',
	};

	getTimeFormCode = {
		DAILY: 'day',
		WEEKLY: 'week',
		MONTHLY: 'month',
		YEARLY: 'year',
		undefined: '-',
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
}
export default new SubcriptionPlanDev('/dev-portal/pricing');
