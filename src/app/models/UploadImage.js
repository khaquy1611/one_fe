import Base from './Base';

class UploadImage extends Base {
	insertImage = async (data) => {
		try {
			const res = await this.apiPut('/portal/services/file', data);
			return res.body[0];
		} catch (e) {
			return [];
		}
	};

	insert = async (data) => {
		try {
			const res = await this.apiPut('/portal/services/file', data);
			return res.body[0];
		} catch (e) {
			return [];
		}
	};

	insertUserImage = async (data) => {
		try {
			const res = await this.apiPost('/portal/user/file ', data);
			return res.body[0];
		} catch (e) {
			return [];
		}
	};

	uploadSecret = async (data) => {
		try {
			const res = await this.apiPost('/portal/file/private', data);
			return res.body[0];
		} catch (e) {
			return [];
		}
	};

	downloadFileSecret = async ({ id, portal }) => {
		try {
			const res = await this.apiDownload(`/portal/file/${id}`, { portalType: portal.toUpperCase() });
			return res;
		} catch (e) {
			return [];
		}
	};
}
export default new UploadImage('');
