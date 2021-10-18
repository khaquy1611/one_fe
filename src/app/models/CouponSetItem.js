import Base from './Base';

class CouponSetItem extends Base {
	// createCouponSet = (query) => this.apiGet('', query);
	search = async (query) => {
		const res = await this.apiGet('/search2', query);
		return this.formatResPagination(res);
	};

	batchDelete = (body) => this.apiPost('/batch-delete', body);

	// type=1 for check main , type=2 for check addon
	checkCouponCode = ({ code, pricingId, type }) =>
		this.apiGet(`/check?code=${code}&pricingId=${pricingId}&type=${type}`);

	check = (query) => this.apiGet('/check', query);

	export = (query) => this.apiGet('/export', query);
}
export default new CouponSetItem('/coupon-item');
