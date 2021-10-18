import { range } from 'opLodash';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	ExclamationCircleOutlined,
	ClockCircleOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
} from '@ant-design/icons';
import Base from './Base';

class AdminCombo extends Base {
	getAllPagination = async (query) => {
		const res = await this.apiGet('/admin-portal/combos', query);
		return this.formatResPagination(res);
	};

	getAllServiceByDevId = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				name: 'AppName',
				numberOfCombo: Math.round(Math.random() * (20 - 0) + 0),
				displayed: Math.round(Math.random()),
				createdBy: 'Nguyễn Vinh Hưởng',
				portal: Math.round(Math.random()),
				updatedTime: '15/06/2012',
				statusApprove: Math.round(Math.random() * (3 - 0) + 0),
			})),
		});

	insert = (data) => this.apiPost('/admin-portal/combos', data);

	getOneById = (id, process) => this.apiGet(`/admin-portal/combos/${id}/tab/${process}`);

	putRequestApprove = (id) => this.apiPutWithoutPrefix(`/api/admin-portal/combos/${id}/request-approve`);

	putApproveCombo = (data) => this.apiPut(`/admin-portal/combos/approve/${data.id}`, data.body);

	updateCombo = (data) => this.apiPut(`/portal/combos/${data.id}`, data.body);

	deleteCombo = (id) => this.apiDeleteWithoutPrefix(`/api/portal/combos/${id}`);

	putOnOffStatus = ({ id, displayedStatus }) => this.apiPut(`/admin-portal/combos/${id}/status/${displayedStatus}`);

	getListHistoryByComboId = async (id, query) => {
		const res = await this.apiGet(`/portal/action-log/combos/${id}`, query);
		return this.formatResPagination(res);
	};

	getDetailComboByComboId = async (id) => {
		const res = await this.apiGet(`/admin-portal/combos/${id}/tab/HISTORY`);
		return res.body || res;
	};

	getListDeveloper = async (query) => {
		const res = await this.apiGet('/portal/combos/createBy', query);
		return this.formatResPagination(res);
	};

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

	createdBy = {
		DEV: {
			color: 'default',
			text: 'Dev',
			value: 'Dev',
		},
		ADMIN: {
			color: 'processing',
			text: 'Admin',
			value: 'Admin',
		},
	};

	selectComboOwner = [
		{
			value: 'VNPT',
			label: 'vnpt',
		},
		{
			value: 'OTHER',
			label: 'other',
		},
	];

	selectComboType = [
		{
			value: 'SAAS',
			label: 'software',
		},
		{
			value: 'OTHER',
			label: 'other',
		},
	];
}
export default new AdminCombo('');
