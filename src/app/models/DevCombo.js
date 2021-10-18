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

class DevCombo extends Base {
	getAllPagination = async (query) => {
		const res = await this.apiGet('/dev-portal/combos', query);
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

	insert = (data) => this.apiPost('/dev-portal/combos', data);

	getOneByIdDescription = async (id) => {
		const res = await this.apiGetWithoutPrefix(`/api/dev-porta/combos/${id}/${process}`);
		return res.body;
	};

	getOneById = async (id, process) => this.apiGet(`/dev-portal/combos/${id}/tab/${process}`);

	putRequestApprove = (id) => this.apiPutWithoutPrefix(`/api/dev-portal/combos/${id}/request-approve`);

	deleteCombo = (id) => this.apiDeleteWithoutPrefix(`/api/portal/combos/${id}`);

	putOnOffStatus = ({ id, displayedStatus }) => this.apiPut(`/dev-portal/combos/${id}/status/${displayedStatus}`);

	getDetailComboByComboId = async (id) => {
		const res = await this.apiGet(`/dev-portal/combos/${id}/tab/HISTORY`);
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
}
export default new DevCombo('');
