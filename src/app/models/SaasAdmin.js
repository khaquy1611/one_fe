import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	ExclamationCircleOutlined,
	ClockCircleOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
} from '@ant-design/icons';
import Base from './Base';

class SaasAdmin extends Base {
	getOneById = async (id) => {
		const res = await this.apiGet(`/${id}`);
		return res.body || res;
	};

	getDetail = async (id) => {
		try {
			const res = await this.apiGet(`/${id}`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getOneBasicById = async (id) => {
		const res = await this.apiGet(`/${id}/basic`);
		return res.body || res;
	};

	approveProduct = async ({ id }) => {
		const STATUS_PENDING = 2;
		const res = await this.apiPut(`/${id}/approve/${STATUS_PENDING}`);
		return res;
	};

	getOneByIdBasic = async (id) => {
		const res = await this.apiGet(`/${id}/basic`);
		return res.body;
	};

	updateApproveStatus = (data) => this.apiPut(`/${data.id}/approve`, data.body);

	tagStatus = {
		// approvalStatusOptions
		UNAPPROVED: {
			color: 'default',
			text: 'notApprovedYet',
			icon: ClockCircleOutlined,
			value: 'UNAPPROVED',
		},
		APPROVED: {
			color: 'success',
			text: 'approved',
			icon: CheckCircleOutlined,
			value: 'APPROVED',
		},
		AWAITING_APPROVAL: {
			color: 'warning',
			text: 'pending',
			icon: ExclamationCircleOutlined,
			value: 'AWAITING_APPROVAL',
		},
		REJECTED: {
			color: 'error',
			text: 'reject',
			icon: CloseCircleOutlined,
			value: 'REJECTED',
		},
	};

	tagStatusSTC = {
		// approvalStatusOptions
		1: {
			color: 'success',
			text: '0',
			icon: CheckCircleOutlined,
			value: 'APPROVED',
		},
		0: {
			color: 'default',
			text: '1',
			icon: ClockCircleOutlined,
			value: 'REJECTED',
		},
		2: {
			color: 'error',
			text: '2',
			icon: ExclamationCircleOutlined,
			value: 'AWAITING_APPROVAL',
		},
	};

	tagDisplay = {
		// displayStatusOptions
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

	displayOptions = [
		{
			value: 'UNSET',
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

	approvalStatusOptions = [
		{
			value: 'UNSET',
			label: 'all',
		},
		{
			value: 'APPROVED',
			label: 'approved',
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
			value: 'REJECTED',
			label: 'reject',
		},
	];

	// displayOptionsServicePack = [
	// 	{
	// 		value: null,
	// 		label: 'saas.list.all',
	// 	},
	// 	{
	// 		value: 'VISIBLE',
	// 		label: 'saas.list.public',
	// 	},
	// 	{
	// 		value: 'INVISIBLE',
	// 		label: 'saas.list.private',
	// 	},
	// ];

	// statusOptionsServicePack = [
	// 	{
	// 		value: null,
	// 		label: 'saas.list.all',
	// 	},
	// 	{
	// 		value: 'UNAPPROVED',
	// 		label: 'saas.status.unapproved',
	// 	},
	// 	{
	// 		value: 'APPROVED',
	// 		label: 'saas.status.approved',
	// 	},
	// 	{
	// 		value: 'AWAITING_APPROVAL',
	// 		label: 'saas.status.awaiting',
	// 	},
	// 	{
	// 		value: 'REJECTED',
	// 		label: 'saas.status.reject',
	// 	},
	// ];
}

export default new SaasAdmin('/admin-portal/services');
