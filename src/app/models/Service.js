import Base from './Base';

class Service extends Base {
	getListFeature = async (serviceId, query) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/features/${serviceId}/list`, query);
		return this.formatResPagination(res);
	};

	deleteFeature = (id) => this.apiDelete(`/features/${id}`);

	createFeature = (data) => this.apiPost(`/features`, data);

	getListHistory = async (id, query) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/action-log/service/${id}`, query);
		return this.formatResPagination(res);
	};

	updateFeature = ({ id, name }) =>
		this.apiPut(`/features/${id}`, {
			name,
		});

	getDataDropdown = async (id) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/action-log/find-all/service/${id}`);
		return res;
	};
}
export default new Service('/dev-portal');
