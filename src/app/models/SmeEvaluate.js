import Base from './Base';

class SmeEvaluate extends Base {
	getServiceDetailSme = (id) => this.apiGet(`${id}`);

	insertComment = ({ id, request }) => this.apiPost(`${id}`, request);

	updateComment = ({ id, request }) => this.apiPut(`${id}`, request);

	updateLikeEvaluate = (id) => this.apiPost(`like-comment/${id}`);
}
export default new SmeEvaluate('/sme-portal/rating/');
