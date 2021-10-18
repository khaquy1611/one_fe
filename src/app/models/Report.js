import { range } from 'opLodash';
import Base from './Base';

class Report extends Base {
	getAllPagination = async (query) => {
		const res = await this.apiGet('/admin-portal/report/subscription', query);
		return this.formatResPagination(res);
	};

	exportFileSub = async (param) => {
		try {
			const res = await this.apiDownload('/admin-portal/report/subscription/download', param);
			return res;
		} catch (e) {
			return e;
		}
	};

	getAllServiceForDropdownList = (query) => this.apiGet('/admin-portal/report/service-combo', query);

	getAllPricingForDropdownList = (query) => this.apiGet('/admin-portal/report/service-combo/plan', query);

	getAllEmployeeCodeForDropdownList = (query) => this.apiGet('/admin-portal/report/employee-code', query);

	getAllService = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				manuFacture: 'AppName',
				service: 'CRM',
				servicePack: 'Gói cơ bản',
				totalNumberOfRegis: Math.round(Math.random() * (20 - 0) + 0),
				totalNumberOfRenewals: Math.round(Math.random() * (20 - 0) + 0),
				totalNumberOfCancel: Math.round(Math.random() * (20 - 0) + 0),
				totalNumberOfReactive: Math.round(Math.random() * (20 - 0) + 0),
				totalNumberOfPackagesChange: Math.round(Math.random() * (20 - 0) + 0),
			})),
		});

	getAllSubscriber = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				province: 'Hà Nội',
				code: '1223432',
				status: 'Hoạt động',
				cusName: 'Viettel',
				tax: '1234567891011-123',
				address: 'Mễ Trì- Nam Từ Liêm- Hà Nội',
				phone: '0989999999',
				email: 'random@gmail.com',
				service: 'CRM',
				servicePack: 'Gói cơ bản',
				date: '2021/10/23',
				startDate: '2021/10/23',
				numOfCycle: Math.round(Math.random() * (20 - 0) + 0),
				cyclePayment: 'Hàng năm',
				amountPaidBeforeTax: '99,999,999',
				taxPayment: '9,999,999',
				amountPaidAfterTax: '99,999,999',
			})),
		});

	getAllRevenue = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				service: 'CRM',
				servicePack: 'Gói cơ bản',
				amountPaidBeforeTax: '99,999,999',
				taxPayment: '9,999,999',
				amountPaidAfterTax: '99,999,999',
			})),
		});

	getAllPromotion = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				couponName: 'Khuyến mại',
				status: 'Đang sử dụng',
				applicableLevel: '50%',
				numberOfUses: 'Vĩnh viễn',
				totalCoupon: '1000',
				couponUsed: '400',
				totalAmountOfPromotion: '999,999,999',
			})),
		});

	getAllCouponDetail = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				province: 'Hà Nội',
				cusName: 'Viettel',
				code: '1223432',
				mainService: 'CRM',
				couponUsed: '400',
				totalAmountOfPromotion: '999,999,999',
			})),
		});

	getAllTrialSummary = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				service: 'CRM',
				servicePack: 'Gói cơ bản',
				numberOfTrialSubscriptions: '300',
				inTrail: '500',
				officialRegistration: '400',
				noneOfficialRegistration: '450',
			})),
		});

	getAllUserSummary = async (page = 1, pageSize = 10) =>
		this.formatResPagination({
			content: range(pageSize).map((item, index) => ({
				id: index,
				province: 'Hà Nội',
				totalCustomer: '400',
				totalManufacture: '300',
				customerPurchasedService: '500',
				supplierSoldProduct: '450',
			})),
		});

	cycleType = {
		DAILY: {
			text: 'Ngày',
			value: 'DAILY',
		},
		WEEKLY: {
			text: 'Tuần',
			value: 'WEEKLY',
		},
		MONTHLY: {
			text: 'Tháng',
			value: 'MONTHLY',
		},
		YEARLY: {
			text: 'Năm',
			value: 'YEARLY',
		},
	};

	activeOptions = {
		ALL: {
			text: 'Tất cả',
			value: 'ALL',
		},
		FUTURE: {
			text: 'Đang chờ',
			value: 'FUTURE',
		},
		IN_TRIAL: {
			text: 'Dùng thử',
			value: 'IN_TRIAL',
		},
		ACTIVE: {
			text: 'Hoạt động',
			value: 'ACTIVE',
		},
		CANCELED: {
			text: 'Đã hủy',
			value: 'CANCELED',
		},
		NON_RENEWING: {
			text: 'Kết thúc',
			value: 'NON_RENEWING',
		},
	};

	serviceStatus = {
		0: {
			text: 'Đang cài đặt',
			value: 0,
		},
		1: {
			text: 'Đã cài đặt',
			value: 1,
		},
		2: {
			text: 'Gặp sự cố',
			value: 2,
		},
	};
}
export default new Report('');
