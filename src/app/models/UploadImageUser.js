import Base from './Base';

class UploadImageUser extends Base {
	insertImage = async (data) => {
		try {
			const res = await this.apiPut('/users/file', data);
			return res.body[0];
		} catch (e) {
			return null;
		}
	};
}
export default new UploadImageUser('', true);
