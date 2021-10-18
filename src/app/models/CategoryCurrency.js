import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Base from './Base';

class CategoryCurrency extends Base {
	customizePagination = async (query) => {
		const res = await this.apiGet('portal/currency', query);
		return this.formatResPagination(res);
	};

	customizeUpdateDisplayed = (data) => this.apiPut(`admin-portal/currency/${data.id}/status`, data);

	customizeDelete = (id) => this.apiDelete(`admin-portal/currency/deleted/${id}`);

	customizeAdd = (data) => this.apiPost('admin-portal/currency', data);

	customizeGetDetail = (id) => this.apiGet(`portal/currency/${id}`);

	customizeModify = (data) => this.apiPut(`admin-portal/currency/${data.id}`, data);

	tagDisplay = {
		ACTIVE: {
			color: 'processing',
			text: 'switch.enable',
			icon: EyeOutlined,
			value: 'ACTIVE',
		},
		INACTIVE: {
			color: 'default',
			text: 'switch.disable',
			icon: EyeInvisibleOutlined,
			value: 'INACTIVE',
		},
	};
}

export default new CategoryCurrency('/');
