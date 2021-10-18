import moment from 'moment';
import { isEmpty as _isEmpty, uniqBy as _uniqBy, isNaN } from 'opLodash';

const ENTERPRISE_ERROR = 'error.coupon.enterprise.invalid';
const PRICE_APPLY_ERROR = 'error.coupon.pricing.apply.invalid';
const PRICING_ERROR = 'error.coupon.pricing.invalid';
const ADDON_ERROR = 'error.coupon.addons.invalid';
const SUPPLIER_ERROR = 'error.coupon.suppliers.invalid';
const PRICING_ERROR_ADDON = 'error.pricing.addons.invalid';
const ADDON_ERROR_SUB = 'error.addon.invalid';
const PROMOTION_ERROR_SUB = 'error.coupon.invalid';
const DUPLICATE_COMBO_SUP_TRY = 'error.duplicate.pricing.try';
const DUPLICATE_COMBO_SUP = 'error.duplicate.pricing';
const PRICING_ADDON_COMBO_SUP = 'error.pricing.not.found';
const SERVICE_ERROR_SUB = 'error.service.invalid';
const COUPON_ERROR_SUB = 'error.coupon.out.of.quantity';
const ADDON_DUBPLICATE_SUB = 'error.subscription.addon.user';

const isInt = (n) => {
	if (Number(n) % 1 !== 0) {
		const residual = Number(n) - Math.floor(Number(n));
		if (residual >= 0.5) return Number(n);
		return Number(n) + 0.5;
	}
	return Number(n);
};

const textError = (ids = [], dataOption = []) => {
	let errorMes = '';
	ids.forEach((el) => {
		const nameArr = dataOption.filter((value) => value.id === parseInt(el, 10));
		if (errorMes === '') {
			errorMes = nameArr[0].name;
		} else errorMes = errorMes.concat(', ').concat(nameArr[0].name);
	});
	return errorMes;
};

const convertError = (arrError = [], dataOption = []) => {
	const msgObject = {};

	arrError.forEach((text) => {
		const d = text.indexOf(' deleted.');
		const i = text.indexOf(' inactive.');
		if (d > -1) {
			const ids = text.slice(0, d).split(',');
			msgObject.msg = textError(ids, dataOption);
			msgObject.type = 'DELETE';
		}
		if (i > -1) {
			const ids = text.slice(0, i).split(',');
			msgObject.msg = textError(ids, dataOption);
			msgObject.type = 'INACTIVE';
		}
	});
	return msgObject;
};

const convertBusinessScale = (value) => {
	if (!value || value === 1) return 1;
	if (value <= 9) return 2;
	if (value <= 99) return 3;
	if (value <= 299) return 4;
	return 5;
};

const convertToNumber = (value) => {
	if (!value) {
		return undefined;
	}

	if (typeof value !== 'number') {
		const temp = value.replace(/[^0-9]/g, '');
		return parseInt(temp, 10);
	}

	return value;
};

const convertToArrObj = (arr = [], type) => {
	const temp = [];
	arr.map((el) => temp.push({ [type]: el[type] }));
	if (temp.length > 0) return temp;
	return undefined;
};

const convertToArrObjForPricing = (arr = []) => {
	const temp = [];
	arr.map((el) => temp.push({ pricingId: el.pricingId, type: el.type }));
	if (temp.length > 0) return temp;
	return undefined;
};

const convertToArrNumber = (errorString) => {
	const arr = errorString
		.replace(/\|/g, ',')
		.replace(' deleted.', '')
		.replace(' inactive.', '')
		.replace(' not found.', '')
		.split(',');
	return arr.map(Number);
};
const convertToArrNumberSub = (errorString) => {
	const arr = errorString
		.replace(/\|/g, ',')
		.replace(' invalid', '')
		.replace('Coupon ', '')
		.replace('Version of pricing ', '')
		.split(',');
	return arr.map(Number);
};

const checkAlertPopup = (e, couponArr, id, name, comboName) => {
	let errorMes = '';
	let message = '';
	const arr = e.message
		.replace(/\|/g, ',')
		.replace(' deleted.', '')
		.replace(' inactive.', '')
		.replace(' not found.', '')
		.replace(' invalid', '')
		.replace('Coupon ', '')
		.replace('Addon ', '')
		.replace('Duplicate ', '')
		.replace(' pricing not found.', '')
		.replace('Service ', '')
		.replace(' invalid.', '')
		.replace('[', '')
		.replace('] addon were duplicate')
		.replace('Addons with names ')
		.replace(' in used')
		.split(',');

	arr.forEach((el) => {
		const arrFilter = couponArr.filter((value) => value[id] === parseInt(el, 10));
		if (errorMes === '') {
			errorMes = arrFilter[0][name];
		} else errorMes = errorMes.concat(', ').concat(arrFilter[0][name]);
	});

	if (e.errorCode === PRICE_APPLY_ERROR || e.errorCode === PRICING_ERROR || e.errorCode === PRICING_ERROR_ADDON)
		message = `Gói dịch vụ ${errorMes} không hoạt động`;
	else if (e.errorCode === ENTERPRISE_ERROR) message = `Doanh nghiệp ${errorMes} không hoạt động`;
	else if (e.errorCode === ADDON_ERROR) message = `Dịch vụ bổ sung ${errorMes} không hoạt động`;
	else if (e.errorCode === SUPPLIER_ERROR) message = `Nhà cung cấp ${errorMes} không hoạt động`;
	else if (e.errorCode === PROMOTION_ERROR_SUB) message = `Khuyến mại ${errorMes} không hoạt động.`;
	else if (e.errorCode === ADDON_ERROR_SUB || e.errorCode === PRICING_ADDON_COMBO_SUP)
		message = `Gói dịch vụ ${errorMes} không hoạt động.`;
	else if (e.errorCode === SERVICE_ERROR_SUB) message = `Dịch vụ ${errorMes} không hoạt động.`;
	else if (e.errorCode === ADDON_DUBPLICATE_SUB) message = `Dịch vụ ${errorMes} đang được khách hàng sử dụng.`;

	return message;
};

const checkAlertPopupSubCombo = (e, couponArr, id, name) => {
	let errorMes = '';
	let message = '';
	let errorComboPlan = '';
	const arr = e.message
		.replace(/\|/g, ',')
		.replace('Duplicate.pricing.try ', '')
		.replace('Duplicate.pricing ', '')
		.split(',');
	_uniqBy(arr).forEach((el) => {
		const arrFilter = couponArr.filter((value) => value[id] === parseInt(el, 10));
		if (isNaN(parseInt(el, 10))) {
			if (errorMes === '') errorMes = el;
			else errorMes = errorMes.concat(', ').concat(el);
		} else if (errorComboPlan === '') errorComboPlan = arrFilter[0][name];
		else errorComboPlan = errorComboPlan.concat(', ').concat(arrFilter[0][name]);
	});
	if (e.errorCode === DUPLICATE_COMBO_SUP_TRY)
		message = `Dịch vụ ${errorComboPlan} trong gói combo ${errorMes} đang được khách hàng dùng thử.`;
	else if (e.errorCode === DUPLICATE_COMBO_SUP)
		message = `Dịch vụ ${errorComboPlan} trong gói combo ${errorMes} đang được khách hàng đang dùng.`;
	return message;
};

const checkAlertPopupPromotion = (e) => {
	let errorMes = '';
	let message = '';
	const arr = e.message.replace(/\|/g, ',').replace('Coupon ', '').replace('out of quantity.', '').split(',');
	_uniqBy(arr).forEach((el) => {
		if (errorMes === '') errorMes = el;
		else errorMes = errorMes.concat(', ').concat(el);
	});
	if (e.errorCode === COUPON_ERROR_SUB) message = `Khuyến mại ${errorMes} không đủ điều kiện để áp dụng.`;
	return message;
};

function handlePromotionValue(data) {
	const arr = data?.replace(/\|/g, ',').replace('%', '').replace(' VND', '').replaceAll('.', '');
	return Number.parseInt(arr, 10);
}
function sortCoupon(data) {
	const couponPercent = data
		?.filter((coupon) => coupon.discountType === 'PERCENT')
		?.sort((a, b) => handlePromotionValue(a.promotionValue) - handlePromotionValue(b.promotionValue));

	const couponPrice = data
		?.filter((coupon) => coupon.discountType === 'PRICE')
		.sort((a, b) => handlePromotionValue(a.promotionValue) - handlePromotionValue(b.promotionValue));

	const couponPromotion = data?.filter((coupon) => coupon.discountType === null);
	const dataFinal = [...couponPrice, ...couponPercent, ...couponPromotion];
	if (data?.length > 0) return dataFinal;
	return [];
}

const convertTime = (rangeDate = [], number) => {
	if (!_isEmpty(rangeDate) && rangeDate[number]) return moment(rangeDate[number]).format('DD/MM/YYYY');
	return null;
};

export {
	isInt,
	convertBusinessScale,
	convertToNumber,
	convertToArrObj,
	checkAlertPopup,
	convertTime,
	convertToArrNumber,
	convertToArrNumberSub,
	checkAlertPopupSubCombo,
	convertToArrObjForPricing,
	checkAlertPopupPromotion,
	sortCoupon,
	convertError,
};
