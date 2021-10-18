import Base, { getNewToken, getTokenByUsernamePassword, logout, logoutSSO } from './Base';
import DX from './DX';

const pathRole = {
	[DX.admin.role]: '-admin',
	[DX.dev.role]: '-dev',
	[DX.sme.role]: '-sme',
};

class Users extends Base {
	ACC_STATUS = {
		INACTIVE: 'INACTIVE',
		DENIED: 'DENIED',
		DENIED_FROM_LOGIN: 'DENIED_FROM_LOGIN',
	};

	getMyProfile = async () => {
		const user = await this.apiGet('/profile');
		const permissionData = [];
		const portalData = [];
		const adminPermission = [];
		const smePermission = [];
		const devPermission = [];

		user.roles.forEach((role) => {
			let isAdmin = false;
			let isDev = false;
			let isSme = false;
			role.portal?.forEach((x) => {
				portalData.push(x.name);
				if (x.name === 'ADMIN') isAdmin = true;
				if (x.name === 'DEV') isDev = true;
				if (x.name === 'SME') isSme = true;
			});

			role.permissions?.forEach((permission) => {
				if (!permissionData.includes(permission.code) && permission.parentId !== -1) {
					permissionData.push(permission.code);
				}
				if (isAdmin && !adminPermission.includes(permission.code) && permission.parentId !== -1) {
					adminPermission.push(permission.code);
				}
				if (isSme && !smePermission.includes(permission.code) && permission.parentId !== -1) {
					smePermission.push(permission.code);
				}
				if (isDev && !devPermission.includes(permission.code) && permission.parentId !== -1) {
					devPermission.push(permission.code);
				}
			});
		});

		return {
			...user,
			permissions: {
				adminPermission,
				smePermission,
				devPermission,
				permissionData,
			},
			portals: portalData,
		};
	};

	updateBusinessInfoDev = ({ id, values }) => this.apiPut(`/${id}/developer`, values);

	getPersonalProfileByAdmin = async (id) => {
		const user = await this.apiGet(`/${id}`);
		return user;
	};

	getSmeInforByAdmin = async (id, portal) => {
		const user = await this.apiGet(`/${id}/business?portalType=${portal}`);

		return user;
	};

	getEmployeeInforByID = async (id) => {
		const user = await this.apiGet(`-sme/employees/${id}`);
		return user;
	};

	getSmeInfor = async () => {
		const user = await this.apiGet(`/business`);

		return user;
	};

	updateMyProfileDev = (user) => this.apiPut('-dev/profile', user);

	// updateProfileAdmin = (user) => this.apiPut("-admin/profile", user);

	updateProfileUser = (user) => this.apiPut('/profile', user);

	updateProfileAnotherUser = ({ id, values }) => this.apiPut(`/${id}`, values);

	updateEntepriseDevProfile = (user) => this.apiPut('-dev/profile-enterprise', user);

	updateEntepriseSmeProfile = ({ id, values }) => this.apiPut(`/${id}/sme`, values);

	updateSmeProfile = (values) => this.apiPut(`/sme`, values);

	updateEmployeeInforById = ({ id, values }) => this.apiPut(`-sme/employees/${id}`, values);

	getListUserByType = (role) => async (params) => {
		const res = await this.apiGet(pathRole[role], params);
		const data = this.formatResPagination(res);
		return data;
	};

	getListAccountDevAdmin = (role) => async (params) => {
		const res = await this.apiGet(`${pathRole[role]}/developers`, params);
		const data = this.formatResPagination(res);
		return data;
	};

	getNewToken = getNewToken;

	getTokenByUsernamePassword = getTokenByUsernamePassword;

	logout = logout;

	logoutSSO = logoutSSO;

	registerDev = (registerDev) => this.apiPost('-dev/register', registerDev);

	registerSme = (registerSme) => this.apiPost('-sme/register', registerSme);

	forgotPassword = (query) => this.apiPut('/forgot-password', query);

	resetPassword = ({ id, resetToken, newPassword }) =>
		this.apiPut(`/${id}/reset-password/${resetToken}`, newPassword);

	activeAccount = ({ id, activeKey }) => this.apiGet(`/verify/${id}/${activeKey}`);

	changePassword = (changePassword) => this.apiPut('/change-password', changePassword);

	insert = (data) => this.apiPost('/new', data);

	insertAdminByAdmin = (data) => {
		// const roles = data.roles.map((idRole) => ({
		// 	id: idRole,
		// }));
		const dataFormat = {
			...data,
		};
		return this.apiPost('-admin', dataFormat);
	};

	insertDevAdmin = async (data) => {
		const dataFormat = { ...data };
		const res = await this.apiPost('-dev/developers', dataFormat);
		return res;
	};

	updateAccountByDevAdmin = async ({ id, data }) => {
		const dataFormat = { ...data };
		const res = await this.apiPut(`-dev/developers/${id}`, dataFormat);
		return res;
	};

	getInfoAccountByDevAdmin = async (id) => {
		const res = await this.apiGet(`-dev/developers/${id}`);
		return res;
	};

	activeStatusByDevAdmin = async ({ id, status }) => {
		const res = await this.apiPut(`-dev/${id}/status/${status}`);
		return res;
	};

	updateById = async ({ id, data, isCustomer, portalType }) => {
		const dataFormat = {
			...data,
		};
		const res = await this.apiPut(
			`-admin/${id}${isCustomer ? `/customers?portalType=${portalType}` : ''}`,
			dataFormat,
		);
		return res;
	};

	activeStatusById = async ({ id, data }) => {
		const res = await this.apiPut(`-admin/${id}/status/${data.status}`);
		return res;
	};

	deleteById = (id) => this.apiDelete(`-admin/${id}`);

	getCountry = () => this.apiGet('/countries');

	getProvince = (id) => this.apiGet(`/countries/${id}/provinces`);

	getInfoAccount = ({ id, isCustomer }) =>
		this.apiGet(`${isCustomer ? '-admin' : ''}/${id}${isCustomer ? '/customers' : ''}`);

	getSmeDetailByAdmin = async (id) => {
		try {
			const user = await this.apiGet(`/${id}/business`);
			return user;
		} catch (e) {
			return null;
		}
	};

	// xác nhận tài khoản developer thành sme và ngược lại
	activeOnPortal = async (portal) => {
		const res = await this.apiPut(`/${portal}/active-on-portal`);
		await this.getNewToken({ status: 401 });
		return res;
	};

	// roles = [
	// 	{
	// 		id: 1,
	// 		name: 'ROLE_SUPER_ADMIN',
	// 		text: 'Super admin',
	// 		portal: DX.admin.role,
	// 	},
	// 	{
	// 		id: 2,
	// 		name: 'ROLE_ADMIN',
	// 		text: 'Admin',
	// 		portal: DX.admin.role,
	// 	},
	// 	{
	// 		id: 3,
	// 		name: 'ROLE_DEV',
	// 		text: 'Developer',
	// 		portal: DX.dev.role,
	// 	},
	// 	{
	// 		id: 4,
	// 		name: 'ROLE_SME',
	// 		text: 'SME',
	// 		portal: DX.sme.role,
	// 	},
	// ];

	// getRolesPortal = (portal) => this.roles.filter((item) => item.portal === portal);

	// adminRoles = this.getRolesPortal(DX.admin.role);

	// devRoles = this.getRolesPortal(DX.dev.role);

	// smeRoles = this.getRolesPortal(DX.sme.role);

	registerByVnpt = (registerByVnpt) => this.apiPostWithoutPrefix('/api/sme-users/register', registerByVnpt);

	getTaxCodeInfo = ({ taxCode, provinceId }) =>
		this.apiPostWithoutPrefix(`/api/users-sme/get-tax-code`, { taxCode, provinceId });

	getRepresentAdmin = ({ id }) => this.apiGet(`/${id}/represent`);

	setRepresentAdmin = (data) => this.apiPut(`/${data.id}/represent`, data);
}

export default new Users('/users', true);
