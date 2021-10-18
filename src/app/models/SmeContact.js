import Base from './Base';

class SmeContact extends Base {
	getContactProvinces = async () => {
		try {
			const res = await this.apiGet('/portal/contacts');
			return res.body || res;
		} catch (e) {
			return [];
		}
	};

	sendContact = ({ id, data }) => this.apiPost(`/portal/contacts/${id}`, data);
}
export default new SmeContact('');
