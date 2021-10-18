import Base from './Base';

class DevCoupon extends Base {
	// create coupon admin
	createCoupon = (query) => this.apiPost('', query);

	updateCoupon = (data) => this.apiPut(`/${data.id}`, data.body);

	updateDraftCoupon = (data) => this.apiPut(`/${data.id}/draft`, data.body);

	putOnOffStatus = (data) => this.apiPut(`/${data.id}/status/${data.status}`);

	editCoupon = (data) => this.apiPut(`/${data.id}/draft`, data.body);

	confirmUpdateCoupon = (data) => this.apiDelete(`/${data.id}/action/${data.status}`);
}
export default new DevCoupon('/dev-portal/coupon');
