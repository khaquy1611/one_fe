import { random, range } from 'opLodash';
import Base from './Base';

class SmeProfile extends Base {
	getBussinessScale = () => this.apiGet(`/business/scale`);

	getBussinessArea = () => this.apiGet(`/business/areas`);

	getRepresent = () => this.apiGet('/represent');

	setRepresent = (data) => this.apiPut(`/represent`, data);

	getFolkes = () => this.apiGet('/folkes');

	getPersonalCertType = () => this.apiGet('/personal-cert-types');
}
export default new SmeProfile('/users', true);
