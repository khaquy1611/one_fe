import Base from './Base';

class DevCouponSet extends Base {
	search = async (query) => {
		const res = await this.apiGet('/search2', query);
		return this.formatResPagination(res);
	};

	createCouponSet = (query) => this.apiPost('', query);

	updateCouponSet = (data) => this.apiPut(`/${data.id}`, data.body);

	updateDraftCouponSet = (data) => this.apiPut(`/${data.id}/draft`, data.body);

	putOnOffStatus = (data) => this.apiPut(`/${data.id}/status/${data.status}`);

	editCouponSet = (data) => this.apiPut(`/${data.id}`, data.body);

	confirmUpdateCouponSet = (data) => this.apiDelete(`/${data.id}/action/${data.status}`);

	deleteCopuonSetById = ({ id }) => this.apiDelete(`/${id}`);

	getListCoupon = async (query) => {
		const res = await this.apiGet('/coupon-list', query);
		return this.formatResPagination(res);
	};
}
export default new DevCouponSet('/coupon-set');
