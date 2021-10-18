import Base from './Base';

class Subscription extends Base {
	updateStatus = (data) => this.apiPut(`/department/${data.id}/status/${data.status}/${data.portalType}`);

	deleteDepartmentById = ({ id, portalType }) => this.apiDelete(`/department/${id}/${portalType}`);

	insertDepartment = (data) => this.apiPost(`/department`, data);

	getAllPagination = async (query) => {
		const res = await this.apiGet('/department', query);
		return this.formatResPagination(res);
	};

	getAllTreeDepartPagination = (query) => this.apiGet('/tree-department', query);

	getAllEmpAdd = async (portalType, query) => {
		const res = await this.apiGet(`/department/${portalType}/users`, query);
		return this.formatResPagination(res);
	};

	updateDepartmentById = ({ id, portalType, data }) => this.apiPut(`/department/${id}/${portalType}`, data);

	getOneByIdDepartment = (id, portalType) => this.apiGet(`/department/${id}/${portalType}`);

	tagStatus = {
		UNAPPROVED: {
			color: 'default',
			text: 'saas.status.unapproved',
			value: 'UNAPPROVED',
		},
		APPROVED: {
			color: 'success',
			text: 'saas.status.approved',
			value: 'APPROVED',
		},
		AWAITING_APPROVAL: {
			color: 'warning',
			text: 'saas.status.awaiting',
			value: 'AWAITING_APPROVAL',
		},
		REJECTED: {
			color: 'error',
			text: 'saas.status.reject',

			value: 'REJECTED',
		},
	};
}

export default new Subscription('/user-portal');
