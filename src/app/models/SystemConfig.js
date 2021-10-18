import Base from './Base';

class SystemConfig extends Base {
	customizeUpdatePromotionSystem = async (body) => {
		const res = await this.apiPut(`/config`, body);
		return res;
	};
}
export default new SystemConfig('/admin-portal/system-param');
