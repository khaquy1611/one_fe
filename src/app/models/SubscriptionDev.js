import { toLower } from 'opLodash';
import Base from './Base';

class SubscriptionDev extends Base {
	getSMESubscriptionPagination = async (query) => {
		const res = await this.apiGetWithoutPrefix('/api/dev-portal/subscription/sme-companies', query);
		return this.formatResPagination(res);
	};

	getEMPpopup = async (query) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/subscription/sme`, query);
		return this.formatResPagination(res);
	};

	getPricingpopup = async (query) => {
		try {
			const res = await this.apiGetWithoutPrefix(`/api/portal/subscription/pricing`, query);
			return this.formatResPagination(res);
		} catch (e) {
			console.log(e);
			return e;
		}
	};

	getAddonpopup = async (query) => {
		const res = await this.apiGetWithoutPrefix(`/api/portal/subscription/addons`, query);
		return this.formatResPagination(res);
	};

	getPromotionpopup = async (type, companyId, id, typePortal, price, quantity, params) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/portal/subscription/${type}/coupons/${companyId}/${id}?portalType=${typePortal}&price=${price} &quantity=${quantity}`,
			params,
		);
		return this.formatResPaginationCoupon(res);
	};

	getListPopupByType = async (type, { planId, quantity, typeSub, body, subscriptionId, pricingMultiPlanId }) => {
		try {
			const typeTier = toLower(typeSub);
			if (type === 'tier') {
				const res = await this.apiPostWithoutPrefix(
					`/api/portal/subscription/calculate/tier/${typeTier}/${planId}/${quantity}${
						subscriptionId ? `?subscriptionId=${subscriptionId}` : ''
					}`,
					body,
				);
				return res;
			}
			const res = await this.apiPostWithoutPrefix(
				`/api/portal/subscription/calculate/${type}/type/${typeSub}/${planId}/quantity/${quantity}${
					pricingMultiPlanId ? `?pricingMultiPlanId=${pricingMultiPlanId}` : ''
				}`,
				body,
			);
			return res;
		} catch (error) {
			return null;
		}
	};

	getListSubscription = async (query) => {
		const res = await this.apiGetWithoutPrefix('/api/portal/subscription', query);
		return this.formatResPagination(res);
	};

	getDataCalculate = (type, typeModal, { planId, body }) =>
		this.apiPostWithoutPrefix(`/api/portal/subscription/calculate/${type}/${typeModal}/${planId}`, body);

	getDetailSub = (planId, typePortal, pricingPeriodId) =>
		this.apiGetWithoutPrefix(
			`/api/${typePortal === 'DEV' ? 'dev' : 'admin'}-portal/subscription/pricing/${planId}${
				pricingPeriodId !== null ? `?pricingPeriodId=${pricingPeriodId}` : ''
			}`,
		);

	addExtraFee = (data) => this.apiPostWithoutPrefix(`/api/portal/subscription/fees-apply`, data);

	exportFileSub = async (param) => {
		try {
			const res = await this.apiDownload('/export', param);
			return res;
		} catch (e) {
			return e;
		}
	};

	getDataCalculatePrice = ({ planId, subcriptionInfo }) =>
		this.apiPost(`/calculate/pricing/${planId}`, subcriptionInfo);

	// getDataCalReal = (body) => this.apiPost(`/pricing/calculate`, body);
	getDataCalReal = (body) => this.apiPost(`/pricing/calculate/new`, body);

	getPromotionTotal = async (companyId, pricingId, addonIds, typePortal, price, quantity, param) => {
		const res = await this.apiGet(
			`/total/coupons/${companyId}/${pricingId}?addonIds=${addonIds}&portalType=${typePortal}&price=${price}&quantity=${quantity}`,
			param,
		);
		return this.formatResPaginationCoupon(res);
	};

	insertTrial = (body) => this.apiPostWithoutPrefix('/api/dev-admin-portal/subscription', body);

	insertReal = (body) => this.apiPost('/pricing', body);

	putRenewSubscriptionDev = ({ id, cycleQuantity, typePortal, renewType }) =>
		this.apiPut(`/renew/${id}?cycleQuantity=${cycleQuantity}&portalType=${typePortal} &renewType=${renewType}`);

	getDescription = (id) => this.apiGetWithoutPrefix(`/api/portal/subscription/detail/${id}`);

	getBillSub = async (id, param) => {
		const res = await this.apiGet(`/${id}/list-billings`, param);
		return this.formatResPagination(res);
	};

	getListEmpBill = async (id, serviceId, typePortal, param) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/${typePortal === 'DEV' ? 'dev' : 'admin'}-portal/subscription/${id}/users/${serviceId}`,
			param,
		);
		return this.formatResPagination(res);
	};

	destroySubscriptionIntrial = ({ id, paymenType }) =>
		this.apiPut(`/${id}/general-description?paymentType=${paymenType}`);
	//	destroySubscriptionIntrial = (id) => this.apiPut(`/${id}/general-description`);

	activeSubscription = (dataActive) => {
		const res = this.apiPutWithoutPrefix(
			`/api/${dataActive.type === 'DEV' ? 'dev-portal' : 'admin-portal'}/subscription/activate/${dataActive.id}`,
		);
		return res;
	};

	destroySubscriptionActive = ({ id, paymenType }) =>
		this.apiPut(`/${id}/official-joint-screen?paymentType=${paymenType}`);
	//	destroySubscriptionActive = (id) => this.apiPut(`/${id}/official-joint-screen`);

	// tab ghi nợ pricing
	getListDebitBalance = async (id, typePortal, params) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/${typePortal}-portal/subscription/pricing/${id}/credit-notes`,
			params,
		);
		return this.formatResPagination(res);
	};

	// tab lịch sử subscription
	getHistorySubscription = async (id, typePortal) => {
		const res = await this.apiGetWithoutPrefix(`/api/${typePortal}-portal/subscription/${id}/history`);
		return this.formatResPagination(res);
	};

	// Popup xem trước chi phí chung cho combo va dich vu
	postPreviewCost = ({ cycleNo, subscriptionInfo, typePortal }) =>
		this.apiPostWithoutPrefix(
			`/api/${toLower(typePortal)}-portal/subscription/pricing/bill-incurred?cycleNo=${cycleNo}`,
			subscriptionInfo,
		);

	// tab ghi nợ combo
	getComboListDebitBalance = async (id, typePortal, params) => {
		const res = await this.apiGetWithoutPrefix(
			`/api/${typePortal}-portal/subscription/combo-plan/${id}/credit-notes`,
			params,
		);
		return this.formatResPagination(res);
	};

	getListBillingSubscription = async (id, param, typePortal) => {
		const res = await this.apiGet(`/${id}/list-billings`, param);
		return this.formatResPagination(res);
	};

	updateReal = (data) => this.apiPut(`/update/${data.subscriptionId}`, data);

	insertSubFromIntrial = (data) => this.apiPost(`/${data.subscriptionId}/pricing`, data);

	changePricingSub = (data) => this.apiPut(`/update/${data.subscriptionId}/pricing`, data);

	getPayment = (id) =>
		this.apiGet(`/${id}/payment
	`);

	getListMemorize = async (id) => {
		const res = await this.apiGet(`${id}/credit-notes`);
		return this.formatResPagination(res);
	};

	deleteSupscription = (data) =>
		this.apiDeleteWithoutPrefix(
			`/api/${data.type === 'DEV' ? 'dev-portal' : 'admin-portal'}/subscription/${data.id}/delete`,
		);

	updateSubscriptionInTrial = (data) => this.apiPut(`/${data.subscriptionId}/general-information`, data);

	updateSubscriptionFuture = (data) =>
		this.apiPutWithoutPrefix(`/api/dev-portal/subscription/waiting/${data.subscriptionId}`, data);

	detailChangeSubs = (id, typePortal, subscriptionId) =>
		this.apiGetWithoutPrefix(
			`/api/${
				typePortal === 'DEV' ? 'dev' : 'admin'
			}-portal/subscription/pricing/${id}?subscriptionId=${subscriptionId}&portal=${typePortal}`,
		);

	// Lấy danh sách thuê bao order
	getOrderServiceSubscription = async (query) => {
		let res;
		const newQuery = { ...query };
		if (!query.fromDate) delete newQuery.fromDate;
		if (!query.toDate) delete newQuery.toDate;
		if (query.portalType === 'ADMIN') {
			res = await this.apiGetWithoutPrefix('/api/admin-portal/subscription/order-service', newQuery);
		} else {
			res = await this.apiGetWithoutPrefix('/api/dev-portal/subscription/order-service', newQuery);
		}

		return this.formatResPagination(res);
	};

	// Lấy danh sách thuê bao order
	getOrderServiceProcess = async ({ id, typePortal }) => {
		let res;
		if (typePortal === 'ADMIN') {
			res = await this.apiGetWithoutPrefix(`/api/admin-portal/subscription/${id}/order-service/progress`);
		} else {
			res = await this.apiGetWithoutPrefix(`/api/dev-portal/subscription/${id}/order-service/progress`);
		}
		return res;
	};

	// Hủy đơn hàng order service
	cancelOrderServiceProcess = async ({ id, typePortal, action }) => {
		let res;
		if (typePortal === 'ADMIN') {
			res = await this.apiPutWithoutPrefix(`/api/admin-portal/subscription/${id}/order-service/${action}`);
		} else {
			res = await this.apiPutWithoutPrefix(`/api/dev-portal/subscription/${id}/order-service/${action}`);
		}
		return res;
	};

	// Lấy danh sách bậc giá của gói bậc thang, lũy kế unit của addon
	getListUnitAddon = async (addonsId) =>
		this.apiGetWithoutPrefix(`/api/portal/subscription/addon/price-before-tax?addonIds=${addonsId}`);

	// Lấy tên dịch vụ dropdown list popup gói dịch vụ
	getServiceDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/subscription/service-filter`, params);

	// Lấy tên gói dịch vụ dropdown list popup gói dịch vụ
	getPricingDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/subscription/pricing-filter`, params);

	// Lấy chu kỳ cho dropdown list popup gói dịch vụ
	getPeriodDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/subscription/pediod-filter`, params);

	// Lấy tên dịch vụ dropdown list popup  dịch vụ  bổ sung
	getServiceAddonDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/addons/service-filter`, params);

	// Lấy tên dịch vụ dropdown list popup  dịch vụ  bổ sung
	getAddonNameDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/addons/addon-filter`, params);

	// Lấy chu kỳ thanh toán dropdown list popup  dịch vụ  bổ sung
	getPeriodAddonDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/addons/pediod-filter`, params);

	// Lấy danh sách nhà phát triển dropdown list popup  dịch vụ  bổ sung
	getDevelopAddonDrop = async (params) => this.apiGetWithoutPrefix(`/api/portal/addons/user-filter`, params);

	// Lấy danh sách nhà phát triển dropdown list popup  gói dịch vụ
	getDevelopPricing = async (params) => this.apiGetWithoutPrefix(`/api/portal/subscription/user-filter`, params);

	tagStatus = {
		ACTIVE: {
			color: 'success',
			text: 'Hoạt động',
			value: 'ACTIVE',
		},
		IN_TRIAL: {
			color: 'default',
			text: 'Dùng thử',
			value: 'IN_TRIAL',
		},
		FUTURE: {
			color: 'geekblue',
			text: 'Đang chờ',
			value: 'FUTURE',
		},
		CANCELED: {
			color: 'error',
			text: 'Đã hủy',
			value: 'CANCELED',
		},
		NON_RENEWING: {
			color: 'default',
			text: 'Kết thúc',
			value: 'NON_RENEWING',
		},
	};

	tagStatusNew = {
		ACTIVE: {
			color: 'success',
			text: 'Hoạt động',
			value: 'ACTIVE',
		},
		IN_TRIAL: {
			color: 'default',
			text: 'Dùng thử',
			value: 'IN_TRIAL',
		},
		FUTURE: {
			color: 'geekblue',
			text: 'Đang chờ',
			value: 'FUTURE',
		},
		CANCELLED: {
			color: 'error',
			text: 'Đã hủy',
			value: 'CANCELLED',
		},
		NON_RENEWING: {
			color: 'default',
			text: 'Kết thúc',
			value: 'NON_RENEWING',
		},
	};

	tagStatusBill = {
		INIT: {
			color: '#78909C',
			text: 'Khởi tạo',
			value: 'INIT',
		},
		WAITING: {
			color: '#135ea8',
			text: 'Chờ thanh toán',
			value: 'WAITING',
		},
		PAID: {
			color: '#22AAA1',
			text: 'Đã thanh toán',
			value: 'PAID',
		},
		FAILURE: {
			color: '#f90b0b',
			text: 'Thanh toán thất bại',
			value: 'FAILURE',
		},
		OUT_OF_DATE: {
			color: '#FFB300',
			text: 'Quá hạn thanh toán',
			value: 'OUT_OF_DATE',
		},
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

export default new SubscriptionDev('/portal/subscription');
