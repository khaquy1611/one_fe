import { intersection, toUpper } from 'opLodash';

export default class Portal {
	constructor(role, path, roleName, roles) {
		this.role = role;
		this.path = path;
		this.roleName = roleName;
		this.roles = roles || [];
	}

	createPath = (link) => this.path + link;

	getRolesForPortal = (userRoles) => {
		let rolesFake = [...userRoles];
		if (rolesFake[0]?.id) {
			rolesFake = rolesFake.map((el) => el.id);
		}
		return intersection(this.roles, rolesFake);
	};

	canAccessPortal = (user) => this.getRolesForPortal(user?.roles || []).length > 0;

	// canAccessPortal = (userRoles) => {
	// 	if (userRoles?.portals?.includes(this.name?.toUpperCase())) return true;
	// 	return false;
	// };
}
