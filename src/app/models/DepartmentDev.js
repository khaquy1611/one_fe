import Base from './Base';

class DepartmentDev extends Base {
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

	getCityInfo = async (id) => {
		try {
			const res = await this.apiGetWithoutPrefix(`/auth-server/api/users/countries/${id}/provinces`);
			return res;
		} catch (e) {
			return [];
		}
	};

	getAllDepartment = () => this.apiGet('/tree-department/list-all')
}
export default new DepartmentDev('/user-portal');
