export class ExportCouponSetDTO {
	code = '';

	couponSet = {
		code: '',

		prefix: '',

		suffix: '',

		discountValue: 0,

		discountAmount: 0,

		endDate: Date.now(),
	};

	subscriptionInfo = {
		serviceName: null,

		pricingName: null,
	};

	customerInfo = {
		taxInfo: null,

		companyName: null,

		customerName: null,
	};

	totalMoneyDiscount = null;
}
export const FAKEDATA = [
	['abc', 'AAA', 'FFF', 'AAAasdasdFFF', 1555, 10, '20/11/2221', 'box', 'do', '123123123', 'vnpt', 'sypv', 50000],
	['abc', 'AAA1', 'FFF2', 'AAAasdasdFFF', 1555, 10, '20/11/2221', 'box', 'do', '123123123', 'vnpt2', 'sypv', 50000],
];
export const ExportCouponHeader = [
	[
		'Mã couponset',
		'Prefix',
		'Suffix',
		'Mã KM bao gồm prefix & suffix',
		'Chiết khấu theo số tiền',
		'Chiết khấu theo phần trăm (%)',
		'Ngày sử dụng khuyến mại',
		'Sản phẩm ',
		'Gói cước',
		'MST',
		'Tên doanh nghiệp',
		'Account',
		'Số tiền đã áp dụng khuyến mại.',
	],
];
export function getDataTransform(data) {
	return data.map((item) => [
		item?.couponSet?.code,
		item?.couponSet?.prefix,
		item?.couponSet?.suffix,
		item?.code,
		item?.couponSet?.discountAmount,
		item?.couponSet?.discountValue,
		item?.couponSet?.endDate,

		item?.subscriptionInfo?.serviceName,
		item?.subscriptionInfo?.pricingName,

		item?.customerInfo?.taxInfo,
		item?.customerInfo?.companyName,
		item?.customerInfo?.customerName,
		item?.totalMoneyDiscount,
	]);
}
