import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Base from './Base';

class Categories extends Base {
	updateDisplayed = (data) => this.apiPut(`/${data.id}/status`, data);

	getAllForDropdownList = () => this.apiGet('/getAll');

	getDetail = async (id) => {
		try {
			const res = await this.apiGet(`/${id}`);
			return res.body || res;
		} catch (e) {
			return e;
		}
	};

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

export default new Categories('/admin-portal/categories');
