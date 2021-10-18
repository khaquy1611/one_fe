import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Base from './Base';

class CategoryTax extends Base {
	checkAllowDelete = (id) => this.apiGet(`/${id}/preDelete`);

	updateStatusTax = (data) => this.apiPut(`/${data.id}/status/${data.status}`);

	tagDisplay = {
		VISIBLE: {
			color: 'processing',
			text: 'switch.enable',
			icon: EyeOutlined,
			value: 'VISIBLE',
		},
		INVISIBLE: {
			color: 'default',
			text: 'switch.disable',
			icon: EyeInvisibleOutlined,
			value: 'INVISIBLE',
		},
	};
}

export default new CategoryTax('/admin-portal/tax');
