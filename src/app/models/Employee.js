import Base from './Base';
import DX from './DX';

class Employee extends Base {
	getListUserByType = (role) => async (params) => {
		const res = await this.apiGet('-sme/employees', params);
		const data = this.formatResPagination(res);
		return data;
	};

	getListAdmin = this.getListUserByType(DX.admin.role);

	getListDev = this.getListUserByType(DX.dev.role);

	activeAccount = ({ id, activeKey }) => this.apiGet(`/active/${id}/${activeKey}`);

	insert = (data) => this.apiPost('/new', data);

	updateById = ({ id, status }) => this.apiPut(`-sme/${id}/status/${status}`);

	insertEmployee = (data) => this.apiPost('-sme/smeemployees', data);

	getFile = () => this.apiDownload('-sme/import/download');

	uploadFile = (data) => this.apiPost('-sme/import', data);
}

export default new Employee('/users', true);
