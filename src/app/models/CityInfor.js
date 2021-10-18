import Base from './Base';

class CityInfor extends Base {
	getAllNation = async (query) => {
		try {
			const res = await this.apiGet('/countries', query);
			return res;
		} catch (e) {
			return [];
		}
	};

	getProvinceById = async (id) => {
		try {
			const res = await this.apiGet(`/countries/${id}/provinces`);
			return res;
		} catch (e) {
			return [];
		}
	};

	getDistrictById = async (id, code) => {
		try {
			const res = await this.apiGet(`/provinces/${id}/${code}/districts`);
			return res;
		} catch (e) {
			return [];
		}
	};

	getWardById = async (id, code) => {
		try {
			const res = await this.apiGet(`/districts/${id}/${code}/ward`);
			return res;
		} catch (e) {
			return [];
		}
	};

	getStreetById = async (id, code) => {
		try {
			const res = await this.apiGet(`/ward/${id}/${code}/street`);
			return res;
		} catch (e) {
			return [];
		}
	};
}
export default new CityInfor('/users', true);
