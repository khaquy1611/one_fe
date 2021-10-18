import Base from './Base';

class ComboSME extends Base {
	getPackageCombo = (id) => this.apiGet(`/detail/${id}`);

	getDataCalculate = (data) => this.apiPostWithoutPrefix('/api/sme-portal/subscription/calculate/combo/new', data);

	getListPopupByType = async (type, { id, quantity, unitLimitedList }) => {
		const api = {
			VOLUME: `/api/portal/combos/calculate/volume/type/ADDON/${id}/quantity/${quantity}`,
			STAIR_STEP: `/api/portal/combos/calculate/stair-step/type/ADDON/${id}/quantity/${quantity}`,
			TIER: `/api/sme-portal/subscription/calculate/tier/addons/${id}/${quantity}`,
		}[type];
		if (type === 'TIER') {
			const res = await this.apiPostWithoutPrefix(api, {
				unitLimitedNews: unitLimitedList,
			});
			return res;
		}
		const res = await this.apiPostWithoutPrefix(api, { unitLimitedNews: [] });
		return res;
	};

	getListCombo = async (params) => {
		const res = await this.apiGet('', params);
		const data = this.formatResPagination(res);
		return data;
	};

	getDetailCombo = (id) => this.apiGetWithoutPrefix(`/api/sme-portal/combos/${id}`);

	getServicePackCombo = (id) => this.apiGet(`/${id}/pricing`);

	// Đăng ký dùng thử combo
	reqRegisterComboTrial = ({ comboPlanId }) =>
		this.apiPostWithoutPrefix('/api/sme-portal/subscription/combo/trial', {
			comboPlanId,
		});

	// Thông tin dịch vụ
	getDataInfoComBo = ({ serviceId, pricingId }) =>
		this.apiGetWithoutPrefix(`/api/portal/subscription/combo/${serviceId}/basic/${pricingId}`);

	//
	getOrderServiceProcess = async (id) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/combos/subscription/${id}/order-service`);
		return res;
	};
}
export default new ComboSME('/sme-portal/combos');
