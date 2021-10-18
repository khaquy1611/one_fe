import { range } from 'opLodash';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Base from './Base';

class AdminAddon extends Base {
	deleteComment = async ({ id }) => {
		try {
			const res = await this.apiDelete(`/comment/${id}`);
			return res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	deleteResponseComment = async ({ id }) => {
		try {
			const res = await this.apiDelete(`/response-comment/${id}`);
			return res;
		} catch (e) {
			console.log(e);
			throw e;
		}
	};

	insertAddon = ({ data }) => this.apiPost(`/admin-portal/addons`, data);

	deleteAddon = (body) => this.apiDeleteWithoutPrefix(`/api/admin-portal/addons`, body);

	putApproveAddon = (data) => this.apiPut(`/admin-portal/addons/approve/${data.id}`, data.body);

	putRequestApprove = (id) => this.apiPutWithoutPrefix(`/api/portal/addons/${id}/request-approve`);

	getPromotionCode = (params) => this.apiGetWithoutPrefix(`/api/portal/generate/key`, params);

	getListPricingAddonOnce = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/addons/pricing/once`, params);
		return this.formatResPagination(res);
	};

	getListPricingAddonPeriodic = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/addons/pricing/periodic`, params);
		return this.formatResPagination(res);
	};

	getListServiceAddon = async (params) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/addons/service`, params);
		return this.formatResPagination(res);
	};

	getAllPagination = async (query) => {
		const res = await this.apiGet('/admin-portal/addons', query);
		return this.formatResPagination(res);
	};

	getOneAddonById = (id) => this.apiGet(`/admin-portal/addons/${id}`);

	updateAddon = (data) => this.apiPut(`/admin-portal/addons/${data.id}`, data.body);

	putOnOffStatus = ({ id, displayedStatus }) => this.apiPut(`/admin-portal/addons/${id}/status`, { displayedStatus });

	getDataDropDown = async (params, type) => this.apiGetWithoutPrefix(`/api/portal/addons/filter-addon-apply`, params);

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
			value: 'VISIBLE',
			label: 'show',
		},
		{
			value: 'INVISIBLE',
			label: 'hide',
		},
	];

	statusOptions = [
		{
			value: '',
			label: 'all',
		},
		{
			value: 'LIMITED',
			label: 'inUse ',
		},
		{
			value: 'UNLIMITED',
			label: 'outOfDate',
		},
	];

	displayAuthorize = [
		{
			value: '',
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

	statusConfig = {
		0: {
			color: 'red',
			text: 'reject',
		},
		1: {
			color: 'green',
			text: 'approved',
		},
		2: {
			color: 'orange',
			text: 'pending',
		},
		3: {
			color: 'default',
			text: 'notApprovedYet',
		},
	};

	tagDisplay = {
		VISIBLE: {
			color: 'processing',
			text: 'show',
			icon: EyeOutlined,
			value: 'VISIBLE',
		},
		INVISIBLE: {
			color: 'default',
			text: 'hide',
			icon: EyeInvisibleOutlined,
			value: 'INVISIBLE',
		},
	};

	paymentRateValue = {
		ALL_IN: {
			value: 'all-in',
		},
		MONTHLY: {
			value: 'month',
		},
		YEARLY: {
			value: 'year',
		},
	};

	selectPaymentRate = [
		{
			label: 'all_in',
			value: 'ALL_IN',
		},
		{
			label: 'monthly',
			value: 'MONTHLY',
		},
		{
			label: 'yearly',
			value: 'YEARLY',
		},
		{
			label: 'daily',
			value: 'DATE',
		},
	];

	selectTime = [
		{
			label: 'day',
			value: 'DAILY',
		},
		{
			label: 'week',
			value: 'WEEKLY',
		},
		{
			label: 'month',
			value: 'MONTHLY',
		},
		{
			label: 'year',
			value: 'YEARLY',
		},
	];

	serviceType = [
		{
			label: 'all',
			value: '',
		},
		{
			label: 'once',
			value: 'ONCE',
		},
		{
			label: 'periodic',
			value: 'PERIODIC',
		},
	];

	CHOOSE_PRICING = {
		NOT_SELECTED: 'NOT_SELECTED',
		OPTION: 'OPTION',
	};

	TYPE_TIME = {
		DAILY: 'DAILY',
		WEEKLY: 'WEEKLY',
		MONTHLY: 'MONTHLY',
		YEARLY: 'YEARLY',
	};
}
export default new AdminAddon('');
