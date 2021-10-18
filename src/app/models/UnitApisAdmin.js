import Base from './Base';

class UnitApisAdmin extends Base {
	updateDisplayed = (data) => this.apiPut(`/${data.id}/status`, { ...data.body });
}
export default new UnitApisAdmin('/admin-portal/unit');
