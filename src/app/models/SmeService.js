import Base from './Base';

class SmeService extends Base {
	getServicesByCategoryId = ({ id }) => this.apiGet(`/${id}`);

	getDetail = async (id) => {
		try {
			const res = await this.apiGet(`/${id}`);
			return res.body || res;
		} catch (e) {
			return null;
		}
	};

	getAllPaginationByType = async ({ sort, ...query }) => {
		const afterFix = {
			bestseller: 'top-selling',
			latest: 'newest',
			trend: 'top-trending',
		}[sort];
		if (afterFix) {
			const res = await this.apiGetWithoutPrefix(`/api/portal/service-recommend/${afterFix}`, query);
			return this.formatResPagination(res)
		}
		const records = await this.getAllPagination({ sort, ...query });
		return records;
	}
}
export default new SmeService('/sme-portal/services');
