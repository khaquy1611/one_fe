import Base from './Base';

class SaasDev extends Base {
	getOneByIdDescription = async (id) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/services/${id}/description`);
		return res.body;
	};

	getOneByIdBasic = async (id) => {
		const res = await this.apiGet(`/${id}/basic`);
		return res.body;
	};

	approveProduct = ({ id }) => this.apiPut(`/${id}/request-for-approval`);

	updateServiceDescription = (data) => this.apiPut(`/${data.id}/description`, data.body);

	updateStatus = (data) => this.apiPut(`/${data.id}/displayed/${data.status}`, {});

	updateByIdBySaas = (data) => this.apiPut(`/${data.id}/basic`, data);

	getDetail = async (id) => {
		try {
			const res = await this.apiGet(`/${id}/basic`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	statusConfig = {
		0: {
			color: 'red',
			text: 'saas.status.reject',
		},
		1: {
			color: 'green',
			text: 'saas.status.approved',
		},
		2: {
			color: 'orange',
			text: 'saas.status.awaiting',
		},
		3: {
			color: 'default',
			text: 'saas.status.unapproved',
		},
	};

	languageType = {
		1: {
			text: 'saas.productType.1',
		},
		2: {
			text: 'saas.productType.2',
		},
		3: {
			text: 'saas.productType.3',
		},
		4: {
			text: 'saas.productType.4',
		},
		5: {
			text: 'saas.productType.5',
		},
		6: {
			text: 'saas.productType.6',
		},
	};

	selectServiceOwner = [
		{
			value: 'SAAS',
			label: 'software',
		},
		{
			value: 'NONE',
			label: 'other',
		},
	];

	selectServiceOwnerVNPT = [
		{
			value: 'VNPT',
			label: 'vnpt',
		},
		{
			value: 'NONE_VNPT',
			label: 'other',
		},
	];
}
export default new SaasDev('/dev-portal/services');
