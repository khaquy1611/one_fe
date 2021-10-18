import Base from './Base';

class CommonEvaluate extends Base {
	getListComment = async (id, params) => {
		const res = await this.apiGet(`/${id}/comment`, params);
		return this.formatResPagination(res);
	};

	getEvalutionService = (id) => this.apiGet(`/${id}`);

	getOneByIdAdmin = (id) => this.apiGet(`/${id}`);
}
export default new CommonEvaluate('/portal/rating/service');
