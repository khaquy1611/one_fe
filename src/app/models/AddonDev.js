import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Base from './Base';

class AddonDev extends Base {
	getAllPagination = async (query) => {
		const res = await this.apiGet('/dev-portal/addons', query);
		return this.formatResPagination(res);
	};

	deleteAddon = (body) => this.apiDeleteWithoutPrefix(`/api/dev-portal/addons`, body);

	getPromotionCode = (params) => this.apiGetWithoutPrefix(`/api/portal/generate/key`, params);

	insertAddon = ({ data }) => this.apiPost(`/dev-portal/addons`, data);

	getOneAddonById = (id) => this.apiGet(`/dev-portal/addons/${id}`);

	updateAddon = (data) => this.apiPut(`/dev-portal/addons/${data.id}`, data.body);

	putOnOffStatus = ({ id, displayedStatus }) => this.apiPut(`/dev-portal/addons/${id}/status`, { displayedStatus });

	putRequestApprove = (id) => this.apiPutWithoutPrefix(`/api/portal/addons/${id}/request-approve`);

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

	CHOOSE_PRICING = {
		NOT_SELECTED: 'NOT_SELECTED',
		ALL: 'ALL',
		OPTION: 'OPTION',
	};
}

export default new AddonDev('');
