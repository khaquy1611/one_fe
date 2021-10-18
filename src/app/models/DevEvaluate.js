import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Base from './Base';

class DevEvaluate extends Base {
	updateResponseComment = ({ id, query }) => this.apiPut(`/response-comment/${id}`, query);

	createResponseComment = ({ id, query }) => this.apiPost(`/response-comment/${id}`, query);

	getAllPagination = async (query) => {
		const res = await this.apiGet('/service', query);
		return this.formatResPagination(res);
	};

	getOneByIdDev = (id) => this.apiGet(`/service/${id}`);

	tagDisplay = {
		VISIBLE: {
			color: 'processing',
			text: 'Hiện',
			icon: EyeOutlined,
			value: 'VISIBLE',
		},
		INVISIBLE: {
			color: 'default',
			text: 'Ẩn',
			icon: EyeInvisibleOutlined,
			value: 'INVISIBLE',
		},
	};
}

export default new DevEvaluate('/dev-portal/rating');
