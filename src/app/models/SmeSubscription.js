import Cookie from 'js-cookie';
import Base from './Base';

class SMESubscription extends Base {
	allowSubscript = 'YES';

	trialIsAllowed = 'TRIAL';

	officialPack = 'OFFICIAL';

	notAllowSubscript = 'NO';

	getCustomerInfo = async () => {
		const res = await this.apiGet('/customer');
		return res;
	};

	getAllPagination = async (query) => {
		const res = await this.apiGet('/plan-service', query);
		return this.formatResPagination(res);
	};

	customizeGetServicePackage = (serviceId) => this.apiGet(`/service/${serviceId}/pricing`);

	// lấy thông tin subscription sau khi đăng ký
	getSubscription = (id) => this.apiGet(`/detail/${id}`);

	// xóa subscription ở danh danh thuê bao
	deleteSubscription = (id) => this.apiDelete(`/${id}/delete`);

	modifyUserUsing = ({ id, query, typeSubscription }) =>
		this.apiPut(`/${id}/users${typeSubscription ? `?type=${typeSubscription}` : ''}`, query);

	// hủy dịch vụ
	putUnsubscribe = (id) => this.apiDelete(`/pricing/cancel/${id}`);

	// gia hạn dịch vụ và combo
	putRenewal = ({ id, renewType }) =>
		this.apiPutWithoutPrefix(`/api/portal/subscription/renew/${id}?portalType=SME&renewType=${renewType}`);

	// kích hoạt lại dịch vụ
	putReactive = (id) => this.apiPut(`/activate/${id}`);

	// lấy thông tin gói dịch vụ
	getServiceAfterSubscription = (pricingId) => this.apiGet(`/detail/${pricingId}`);

	// chỉnh sửa thông tin gói dịch vụ
	putServiceAfterSubscription = async (id, query) => {
		const ipAddress = await this.getClientIp();
		window?.AFF_VNPT?.removeCookie();
		const res = await this.apiPut(`/update/${id}?ipAddress=${ipAddress}`, query);
		return res;
	};

	// Popup xem trước chi phí
	postPreviewCost = ({ cycleNo, subscriptionInfo }) =>
		this.apiPost(`/bill-incurred?cycleNo=${cycleNo}`, subscriptionInfo);

	// đổi gói dịch vụ
	putChangePackOfService = (id, query) => this.apiPut(`/update/${id}/pricing`, query);

	getServiceOfSubscription = (id) => this.apiGet(`/${id}/list-service`);

	getPaymentMethodSubscription = (id) => this.apiGetWithoutPrefix(`/api/portal/subscription/${id}/payment`);

	putPaymentMethodSubscription = ({ id, paymentMethod }) => this.apiPut(`/${id}/payment/${paymentMethod}`);

	getListServiceUsing = async (query) => {
		const res = await this.apiGet('/active', query);
		return this.formatResPagination(res);
	};

	getListUserUsing = async (id, serviceId, query) => {
		const res = await this.apiGet(`/${id}/users/${serviceId}`, query);
		return this.formatResPagination(res);
	};

	addSubscription = async (data) => {
		const ipAddress = await this.getClientIp();
		const trafficId = Cookie.get('aff_content');
		window?.AFF_VNPT?.removeCookie();
		const res = await this.apiPost(
			data.subscriptionId ? `/${data.subscriptionId}?ipAddress=${ipAddress}` : `?ipAddress=${ipAddress}`,
			{
				...data,
				trafficId,
			},
		);
		return res;
	};

	// lịch sử hoạt động của subscription
	getHistorySubscription = async (id, params) => {
		const res = await this.apiGet(`/${id}/history`, params);
		return this.formatResPagination(res);
	};

	getListSubscribe = async (query) => {
		const res = await this.apiGet('/services', query);
		return this.formatResPagination(res);
	};

	getListDeveloper = async (query) => {
		const res = await this.apiGet('/dev-companies', query);
		return this.formatResPagination(res);
	};

	// Lấy danh sách chi tiết khối lượng - volume
	getListPopupByType = async (type, { planId, quantity, typeSub, unitLimitedList }) => {
		const api = {
			PRICING: `/api/portal/subscription/calculate/tier/pricing/${planId}/${quantity}`,
			ADDON: `/api/sme-portal/subscription/calculate/tier/addons/${planId}/${quantity}`,
		}[typeSub];
		if (type === 'tier') {
			const res = await this.apiPostWithoutPrefix(api, {
				unitLimitedNews: unitLimitedList,
			});
			return res;
		}
		const res = await this.apiPost(`/calculate/${type}/type/${typeSub}/${planId}/quantity/${quantity}`, {});
		return res;
	};

	// lấy danh sách chi tiết subscription
	getDetailService = ({ planId, getSubscriptionId, idPricingMultiPlanId }) =>
		this.apiGet(`/pricing/${planId}`, {
			subscriptionId: getSubscriptionId,
			pricingMultiPlanId: idPricingMultiPlanId,
		});

	getDataCalculate = ({ planId, subcriptionInfo }) =>
		this.apiPost(`/calculate/new/pricing/${planId}`, subcriptionInfo);

	// Tạo preOder trên cache
	reqCreatePreOder = () => this.apiPostWithoutPrefix('/api/sme-portal/pre-order');

	// check preOder đã được đang ký trên cache
	reqCheckPreOder = ({ preOrderId }) => this.apiGetWithoutPrefix(`/api/sme-portal/pre-order/${preOrderId}`);

	// Lưu thông tin preOrder khi subscription trên cache
	reqSavePreOrder = ({ preOrderId, data }) =>
		this.apiPostWithoutPrefix('/api/portal/pre-order', {
			id: preOrderId,
			data,
		});

	// Đăng ký dùng thử gói dịch vụ
	reqRegisterSubscriptionTrial = ({ pricingId }) =>
		this.apiPostWithoutPrefix('/api/sme-portal/subscription/trial', {
			pricingId,
		});

	// lấy thông tin dịch vụ khi subscription
	getDataInfoSubscription = ({ serviceId, pricingId }) => this.apiGet(`/service/${serviceId}/basic/${pricingId}`);

	// -------------------------------------COMBO-----------------------------------
	getListComboSubscription = async (query) => {
		const res = await this.apiGet('/combo', query);
		return this.formatResPagination(res);
	};

	// chi tiết subscription combo
	getComboSubscriptionCombo = (comboId) => this.apiGetWithoutPrefix(`/api/sme-portal/combos/subscription/${comboId}`);

	// lấy các dịch vụ của combo
	getServiceOfCombo = (id) => this.apiGetWithoutPrefix(`/api/sme-portal/combos/${id}/list-service`);

	// chi tiết combo pack subscription
	getComboPackDetailSubscription = (id) => this.apiGet(`/${id}/combo`);

	// chỉnh sửa thông tin combo pack subscription
	putComboAfterSubscription = async (id, query) => {
		const ipAddress = await this.getClientIp();
		window?.AFF_VNPT?.removeCookie();
		const res = await this.apiPut(`/edit/${id}/combo?ipAddress=${ipAddress}`, query);
		return res;
	};

	// đổi gói combo
	putChangeComboPack = (id, query) => this.apiPut(`/update/${id}/combo`, query);

	// hủy combo
	putUnsubscribeCombo = (id) => this.apiDelete(`/combo-plan/cancel/${id}`);

	// kích hoạt lại combo
	putReactiveCombo = (id) => this.apiPutWithoutPrefix(`/api/sme-portal/combos/activate/${id}/subscription`);

	// xóa combo subscription ở danh danh thuê bao combo
	deleteComboSubscription = (id) => this.apiDelete(`/combo-plan/${id}/delete`);

	// lịch sử hoạt động của combo subscription
	getHistoryComboSubscription = async (id, params) => {
		const res = await this.apiGetWithoutPrefix(`/api/sme-portal/subscription-combo/${id}/history`, params);
		return this.formatResPagination(res);
	};

	// Yêu cầu tạo hợp đồng điện tử
	postCreateEContract = (id) => this.apiPost(`/${id}/e-contract`);

	// Lấy danh sách hợp đồng điện tử
	getAllPaginationEContract = async (query) => {
		let res = [];
		res = await this.apiGet('/e-contract', query);
		const result = {
			content: res?.data,
			totalElements: res?.totalElements,
			size: res?.size,
		};
		return this.formatResPagination(result);
	};

	// Xem chi tiết hợp đồng điện tử
	getDetailEContract = async (id) => {
		const res = await this.apiGet(`/${id}/e-contract`);
		let data = {};
		try {
			data = JSON.parse(res.data);
			if (data.object.uri) {
				const blobData = await fetch(data.object.uri).then((t) =>
					t.blob().then(
						(b) =>
							new Blob([b], {
								type: 'application/pdf',
							}),
					),
				);
				data.object.uri = URL.createObjectURL(blobData);
			}

			// eslint-disable-next-line no-empty
		} catch (error) {}
		return {
			...res,
			data: data?.object,
		};
	};

	// Tải về hợp đồng điện tử
	downloadDetailEContract = async (id) => {
		const res = await this.apiGet(`/${id}/e-contract`);
		let data = {};
		try {
			data = JSON.parse(res.data);
			if (data.object.uri) {
				const blobData = await fetch(data.object.uri).then((t) =>
					t.blob().then(
						(b) =>
							new Blob([b], {
								type: 'application/pdf',
							}),
					),
				);
				return blobData;
			}
			// eslint-disable-next-line no-empty
		} catch (error) {}
		return null;
	};

	// Kiểm tra tồn tại của gói, dịch vụ bổ sung, khuyến mại
	checkExistSubscription = (data) =>
		this.apiPutWithoutPrefix(
			`/api/portal/subscription/${data.comboPlanIds ? 'combo/' : ''}check-exist-items`,
			data,
		);

	// Lấy danh sách thuê bao order
	getOrderServiceSubscription = async (query) => {
		const newQuery = { ...query };
		if (!query.fromDate) delete newQuery.fromDate;
		if (!query.toDate) delete newQuery.toDate;
		const res = await this.apiGet('/order-service', newQuery);
		return this.formatResPagination(res);
	};

	// Lấy danh sách thuê bao order
	getOrderServiceProcess = async (id) => {
		const res = await this.apiGet(`/${id}/order-service/progress`);
		return res;
	};

	// Hủy đơn hàng order service
	cancelOrderServiceProcess = async ({ id, action }) => {
		const res = await this.apiPut(`/${id}/order-service/${action}`);
		return res;
	};

	// Lấy danh sách dịch vụ order đã subscription
	getMyService = async (query) => {
		let res;
		if (query.tab === 'orderService') {
			res = await this.apiGet('/order-service/owned', { ...query, tab: undefined });
			res = {
				content: res.data,
				totalElements: res.totalPage,
			};
			// res = await this.getAll(query);
		} else {
			res = await this.getAll({ ...query, tab: undefined });
		}

		return this.formatResPagination(res);
	};

	pricesArray = [
		{
			label: 'user',
			value: 'PERSON',
		},
		{
			label: 'unlimitedUser',
			value: 'UNLIMITED',
		},
	];

	comboTypeArray = [
		{
			value: '',
			label: 'all',
			color: '',
		},
		{
			value: 'SERVICE',
			label: 'serviceComboType',
		},
		{
			value: 'ORDER',
			label: 'serviceOrder',
		},
	];

	statusArray = [
		{
			value: '',
			label: 'all',
			color: '',
		},
		{
			value: 'FUTURE',
			label: 'waiting',
			color: '#FFB300',
		},
		{
			value: 'IN_TRIAL',
			label: 'trial',
			color: '#6874E8',
		},
		{
			value: 'ACTIVE',
			label: 'working',
			color: '#22AAA1',
		},
		{
			value: 'CANCELLED',
			label: 'canceled',
			color: '#78909C',
		},
		{
			value: 'NON_RENEWING',
			label: 'end',
			color: '#78909C',
		},
	];

	tagStatus = {
		ACTIVE: {
			color: '#22AAA1',
			text: 'Hoạt động',
			value: 'ACTIVE',
			label: 'working',
		},
		IN_TRIAL: {
			color: '#6874E8',
			text: 'Dùng thử',
			value: 'IN_TRIAL',
			label: 'trial',
		},
		FUTURE: {
			color: '#FFB300',
			text: 'Đang chờ',
			value: 'FUTURE',
			label: 'waiting',
		},
		CANCELED: {
			color: '#78909C',
			text: 'Đã hủy',
			label: 'canceled',
			value: 'CANCELED',
		},
		NON_RENEWING: {
			color: '#78909C',
			text: 'Kết thúc',
			label: 'end',
			value: 'NON_RENEWING',
		},
	};

	statusEmployee = [
		// activeStatusOptions
		{
			value: '',
			label: 'all',
		},
		{
			value: 'ACTIVE',
			label: 'active',
			color: '#6C8EE1',
		},
		{
			value: 'INACTIVE',
			label: 'inactive',
			color: '#CCC',
		},
	];

	statusDebitBalance = [
		// debitBalanceOptions
		{
			value: '',
			label: 'all',
		},
		{
			value: 'ADJUSTED',
			label: 'adjusted',
			color: '#22AAA1',
		},
		{
			value: 'REFUNDED',
			label: 'refunded',
			color: '#22AAA1',
		},
		{
			value: 'UNADJUSTED',
			label: 'unadjusted',
			color: '#FFB300',
		},
		{
			value: 'UNFUNDED',
			label: 'unfunded',
			color: '#FFB300',
		},
		{
			value: 'INACTIVATED',
			label: 'disable',
			color: '#78909C',
		},
	];

	debitBalanceType = [
		{
			value: '',
			label: 'all',
		},
		{
			value: 'REFUNDING_PAYMENT',
			label: 'payment_refund',
		},
		{
			value: 'ADJUSTING_PAYMENT',
			label: 'payment_adjust',
		},
	];

	paymentArray = [
		{
			label: 'daily',
			value: 'DAILY',
		},
		{
			label: 'weekly',
			value: 'WEEKLY',
		},
		{
			label: 'monthly',
			value: 'MONTHLY',
		},
		{
			label: 'yearly',
			value: 'YEARLY',
		},
	];

	convertTimeDay = {
		DAILY: 'Ngày',
		WEEKLY: 'Tuần',
		MONTHLY: 'Tháng',
		YEARLY: 'Năm',
	};

	formatPricingPlan = {
		VOLUME: 'volume',
		TIER: 'tier',
		STAIR_STEP: 'stair-step',
		UNIT: 'unit',
	};

	formatPricingPlanToText = {
		VOLUME: 'Khối lượng',
		TIER: 'Lũy kế',
		STAIR_STEP: 'Bậc thang',
		UNIT: 'Đơn vị',
		undefined: '[null]',
	};

	orderServiceProcess = {
		0: {
			color: '#78909C',
			text: 'ordered',
			value: '0',
		},
		1: {
			color: '#FFBE5B',
			text: 'receipted',
			value: '1',
		},
		2: {
			color: '#5081b9',
			text: 'deployed',
			value: '2',
		},
		4: {
			color: '#50B98F',
			text: 'completed',
			value: '4',
		},
		3: {
			color: '#F77178',
			text: 'canceled',
			value: '3',
		},
	};

	orderServiceProcessStep = [
		{
			key: 0,
			title: 'ordered',
		},
		{
			key: 1,
			title: 'receipted',
		},
		{
			key: 2,
			title: 'deployed',
		},
		{
			key: 4,
			title: 'completed',
		},
		{
			key: 3,
			title: 'canceled',
		},
	];

	orderServiceProcessDHSX = {
		1: 'Mới tiếp nhận',
		2: 'Đã thanh toán',
		3: 'Đang điều hành thi công',
		4: 'Đã giao thi công',
		5: 'Đã thi công xong',
		6: 'Đã hoàn thành',
		7: 'Thoái trả',
		8: 'Đã lấy dữ liệu',
		9: 'Khai báo tổng đài',
		10: 'Đang chờ hoàn công',
		11: 'Đối soát hồ sơ',
		14: 'Xác minh nợ',
		15: 'Xét duyệt nợ cước',
		16: 'KDV Xử lý khóa máy',
		17: 'Thoái trả tạm',
		18: 'Đang chờ tư vấn',
		19: 'Tư vấn không thành công',
		21: 'Outbound xác minh nợ cước',
		22: 'TTĐH - Kiểm tra đường truyền',
		23: 'TTVT - Hoàn công dịch vụ',
		25: 'VNPT-NET Khai báo tổng đài',
		26: 'Đối soát hồ sơ Bán chéo',
		27: 'NVKD xác minh',
		28: 'Đang chờ đối tác xử lý',
		29: 'Vip - Khai báo dịch vụ',
		30: 'VNPT Media/IT - Khai báo dịch vụ',
		31: 'Lãnh đạo TTVT duyệt',
	};
}
export default new SMESubscription('/sme-portal/subscription');
