import Base from './Base';

class AdminEvaluate extends Base {
	deleteComment = ({ id }) => this.apiDelete(`/comment/${id}`);

	deleteResponseComment = ({ id }) => this.apiDelete(`/response-comment/${id}`);
}
export default new AdminEvaluate('/admin-portal/rating');
