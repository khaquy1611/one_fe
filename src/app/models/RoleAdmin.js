import Base from './Base';

export const SLEEP = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class RoleAdmin extends Base {
	updateStatus = async (payload) => {
		const res = await this.apiPut(`/${payload.id}/${payload?.body?.status}`);
		return res;
	};

	getPermissions = async (portal) => {
		const res = await this.apiGet(`/permission?portalType=${portal}`);
		return res;
	};

	getAllPermissions = async () => {
		const res = await this.apiGet(`/permission/all`);
		const result = {
			dev: [],
			sme: [],
			admin: [],
		};
		res.DEV.forEach((parent) => {
			parent.subPermissions.forEach((child) => {
				result.dev.push(child.code);
			});
		});
		res.SME.forEach((parent) => {
			parent.subPermissions.forEach((child) => {
				result.sme.push(child.code);
			});
		});
		res.ADMIN.forEach((parent) => {
			parent.subPermissions.forEach((child) => {
				result.admin.push(child.code);
			});
		});
		return result;
	};
}

export default new RoleAdmin('/users-admin/authorization', true);
