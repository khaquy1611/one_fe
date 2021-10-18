import { isNumber } from '@antv/util';
import { Form, message, Modal } from 'antd';
import { useLng, useQueryUrl } from 'app/hooks';
import { DX, SubscriptionDev } from 'app/models';
import { convertToArrNumber } from 'app/validator';
import { checkAlertPopup, checkAlertPopupPromotion } from 'app/validator/isInt';
import moment from 'moment';
import { cloneDeep, dropRight, isObject, uniqBy, uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import NewSubscription from './NewSubscription';
import { subActions, subSelects } from './redux/subscriptionReducer';

const timeMod = {
	NOW: 'NOW',
	CHOOSE: 'CHOOSE',
};
const CYCLE_TYPE_TEXT = {
	DAILY: 'DAILY',
	WEEKLY: 'WEEKLY',
	MONTHLY: 'MONTHLY',
	YEARLY: 'YEARLY',
};

const CYCLE_TYPE = {
	DAILY: 'ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
function getListError(e, couponArr, id) {
	const arrFilter = [];
	const arr = e.message.replace(/\|/g, ',').replace(' invalid', '').replace('Coupon ', '').split(',');
	arr.forEach((el) => {
		//	arrFilter.push(couponArr.map((value) => value[id] === parseInt(el, 10)));
		couponArr.map((value) => {
			if (value && value[id] === parseInt(el, 10)) {
				arrFilter.push(value);
			}
			return arrFilter;
		});
	});
	return arrFilter;
}
function checkSetupFee(value) {
	if (value.setupFee?.price !== null || (value.setupFee !== null && !isObject(value.setupFee)))
		return value.setupFee?.price ?? value.setupFee;
	return 0;
}
function couponListNotExist(dataCheckExist) {
	const uniqCouponNotExists = uniqBy(dataCheckExist.flat(2), 'id');
	return uniqCouponNotExists
		.map((item) => {
			if (item.promotionType === 'PRODUCT') {
				return item?.listProduct?.map((element) => ` ${element.serviceName} - ${element.productName}`);
			}
			if (item.discountType === 'PERCENT') {
				return `giảm ${item.promotionValue}`;
			}
			return `giảm ${item.discountValue ? DX.formatNumberCurrency(item.discountValue) : item.promotionValue} `;
		})
		.filter((item) => !!item)
		.join(', ');
}
function getIndexCoupon(infor, value, array) {
	infor?.map((ListCoupons, index) => {
		value?.flat(2)?.map((couponErr) => {
			if (couponErr.id === ListCoupons.id) {
				array.push(index);
			}
			return null;
		});
		return null;
	});
}
function checkStartAt(checkChangeSub, formValue) {
	if (checkChangeSub && moment.isMoment(formValue.startedAt)) return moment(formValue.startedAt).format('DD/MM/YYYY');
	if (checkChangeSub && !moment.isMoment(formValue.startedAt)) return formValue.startedAt;
	return undefined;
}
function checkSmeID(checkChangeSub, smeId, serviceIdIn, smeInFor, formValue) {
	if (checkChangeSub && smeId) return smeId;
	if (serviceIdIn) return smeInFor.smeId;
	return formValue?.smeInfo[0]?.id;
}

function SubscriptionService({
	typePortal = 'DEV',
	typeSupscrip = 'create',
	dataDetail = [],
	extraFee: extraFeeDetail,
	coupons: couponsDetail,
	typeChange = '',
	typeGeneral,
	checkAdmin,
	isOrderService,
}) {
	const [form] = Form.useForm();
	const { pathname } = useLocation();
	const pathToList = dropRight(pathname.split('/')).join('/');
	const query = useQueryUrl();

	const smeId = query.get('smeId');
	const [isTrial, setTrial] = useState();
	const modRegister = query.get('isTrial');
	const { tLowerField, tMenu } = useLng();
	const { id } = useParams();
	const [periodIdPricing, setPeriodIdPricing] = useState();
	useEffect(() => {
		if (modRegister === 'true') {
			setTrial(true);
		} else {
			setTrial(false);
		}
	}, [modRegister]);

	function setBreadcrumb() {
		if (modRegister !== null) {
			return 'Tạo thuê bao dùng thử';
		}
		if (modRegister === null && typeChange !== 'changeSubscription') {
			return 'Tạo thuê bao';
		}
		if (typeChange === 'changeSubscription') {
			return 'Đổi gói dịch vụ';
		}
		return '';
	}
	const breadcrumbs = [
		{
			name: 'opt_manage/subscriber',
			url: '',
		},
		{
			name: 'subscriberListDev',
			url: pathToList,
		},
		{
			isName: true,
			// name: ` ${tMenu('opt_create', { field: 'subscriber' })} ${
			// 	modRegister !== null ? tLowerField('trial') : ''
			// }`,
			name: setBreadcrumb(),
			url: '',
		},
	];
	const {
		pricingInfo,
		addonsList,
		countCal,
		totalAmountPreTax,
		formValue,
		totalAmountPreTaxFinal,
		totalAmountAfterTaxFinal,
		extraFee,
		coupons,
		isInit,
		addonsOrigin,
	} = useSelector(subSelects.selectSubInfo);
	const serviceId = formValue.pricingValue && formValue.pricingValue[0]?.id;
	const periodId = (formValue.pricingValue && formValue.pricingValue[0]?.periodId) || -1;
	function getNextDate(cycleType, paymentCycle) {
		if (cycleType === CYCLE_TYPE_TEXT.DAILY) {
			return moment().add(paymentCycle, 'days');
		}
		if (cycleType === CYCLE_TYPE_TEXT.WEEKLY) {
			return moment().add(paymentCycle * 7, 'days');
		}
		if (cycleType === CYCLE_TYPE_TEXT.MONTHLY) {
			return moment().add(paymentCycle, 'months');
		}
		return moment().add(paymentCycle, 'years');
	}
	const checkChangeSub = query.get('change-subscription') !== 'true';
	const subIdChange = query.get('subscriptionId');
	const dispatch = useDispatch();
	const serviceIdIn = query.get('serviceIdIn');
	const periodIdChange = query.get('periodId');
	const serviceIdChange = query.get('change-subscription');
	const subscriptionId = query.get('subscriptionId');
	const giveUnit = pricingInfo.pricingPlan !== 'FLAT_RATE' && pricingInfo.pricingPlan !== 'UNIT';
	const history = useHistory();

	const [dataDetailSub, setDataDetailSub] = useState();
	const [listAddonsId, setListAddonId] = useState([]);
	const isService = history.location.pathname.indexOf('service') !== -1;
	useEffect(() => () => dispatch(subActions.reset()), []);
	const [valueAddon, setValueAddon] = useState([]);
	const { data: dataDetailPri, refetch } = useQuery(
		['getPricingInfo', serviceId, periodId, serviceIdIn, id],
		async () => {
			const res = await SubscriptionDev.getDetailSub(
				serviceId || serviceIdIn || id,
				typePortal,
				(serviceId && periodIdPricing) || periodIdChange,
			);
			setDataDetailSub(res);
			let paymentCycleText = '';

			if (res.changePricing === 'END_CYCLE') res.changePricing = 'END_OF_PERIOD';

			if (res.paymentCycle < 0) {
				paymentCycleText = 'Không giới hạn';
			} else {
				paymentCycleText = `${res.paymentCycle} ${CYCLE_TYPE[res.cycleType]}`;
			}
			const defaultValue = {
				//	startChargeAtMod: res.pricingType === 'PREPAY' ? timeMod.NOW : timeMod.CHOOSE,

				startChargeAt:
					res.pricingType === 'POSTPAID'
						? getNextDate(res.cycleType, res.paymentCycle).format('DD/MM/YYYY')
						: moment().format('DD/MM/YYYY'),
				startedAtMod: timeMod.NOW,
				paymentCycleText,
				trialType: res.trialType,
				numberOfTrial: 1,
				numberOfCycles: res.numberOfCycles > 0 ? res.numberOfCycles : '',
			};
			if (typeSupscrip === 'create') {
				defaultValue.startedAt = moment();
			}

			addonsOrigin &&
				checkChangeSub &&
				addonsOrigin.forEach((addon) => {
					const addonClone = cloneDeep(addon);
					if (!res.addonsList.find((el) => el.id === addonClone.id)) {
						res.addonsList = [addonClone, ...res.addonsList];
					}
				});
			if (id === undefined || !checkChangeSub) {
				res.addonsList = dispatch(
					subActions.initPricingInfo({
						...res,
						formValue: {
							...formValue,
							...defaultValue,
						},
						addonsList: res.addonsList,
					}),
				);
			} else {
				res.addonsList = dispatch(
					subActions.handleUpdatePricing({
						...res,
					}),
				);
			}

			form.setFieldsValue({
				...defaultValue,
			});

			return res;
		},
		{
			enabled:
				((!!serviceId || !!serviceIdIn) && isService) ||
				(typeChange === 'changeSubscription' && !!id && isService),
		},
	);

	const { data: smeInFor } = useQuery(
		['getSmeInfo', serviceIdIn],
		async () => {
			const data = await SubscriptionDev.getDescription(subscriptionId);

			return data;
		},
		{
			enabled: !!serviceIdIn,
		},
	);
	function checkNumberOfCycle(value) {
		if (value.numberOfCycles || value.numberOfCycles === '') {
			return value.numberOfCycles !== '' ? value.numberOfCycles : -1;
		}
		return pricingInfo.numberOfCycles;
	}
	const calculating = React.useRef(null);
	const listAddon = [];
	const subPrice = {
		subscriptionId: parseInt(id, 10),
		calculateType: 'PRICING',
		addons: addonsList.map((addon) => ({
			id: addon.id,
			//	price: addon.price,
			price: addon.price ?? (addon.listUnitLimited && addon?.listUnitLimited[0]?.price),

			quantity: addon.quantity,
			setupFee: checkSetupFee(addon),
			unitLimitedList:
				addon.pricingPlan !== 'FLAT_RATE' && addon.pricingPlan !== 'UNIT'
					? addon.unit ||
					  addon.unitLimitedList?.map((item) => ({
							unitFrom: item.unitFrom,
							unitTo: item.unitTo,
							price: item.price ?? item.unitPrice,
					  })) ||
					  []
					: undefined,
			couponList: (addon.couponList || []).map((el) => el.id || el.couponId),
			addonMultiPlanId: addon.addonMultiPlanId || addon.periodId || null,
		})),
		couponList: coupons?.map((el) => el.id || el.couponId),
		otherFeeList: extraFee.map((extra) => ({
			id: extra.id,
			name: extra.name,
			feeAmount: extra.feeAmount || extra.price,
		})),
		pricing: {
			id: pricingInfo.pricingId,
			setupFee: checkSetupFee(pricingInfo),

			price: pricingInfo.price ?? (pricingInfo.listUnitLimited && pricingInfo?.listUnitLimited[0]?.price),
			pricingMultiPlanId:
				periodIdPricing ||
				pricingInfo.pricingMultiPlanId ||
				(isNumber(periodIdChange) ? periodIdChange : Number.parseInt(periodIdChange, 10) || null) ||
				null,
			quantity: pricingInfo.quantity,
			couponList: (pricingInfo.couponList || pricingInfo.couponPricings || [])
				.filter((el) => el.promotionType !== 'PRODUCT')
				.map((el) => el.id || el.couponId),
			unitLimitedList:
				pricingInfo.pricingPlan !== 'FLAT_RATE' && pricingInfo.pricingPlan !== 'UNIT'
					? pricingInfo.unit ||
					  pricingInfo.unitLimitedList?.map((item) => ({
							unitFrom: item.unitFrom,
							unitTo: item.unitTo,
							price: item.price ?? item.unitPrice,
					  })) ||
					  []
					: undefined,
			hasTax: pricingInfo.hasTax,
		},
	};

	useQuery(
		['getCalculate', countCal],
		async () => {
			calculating.current = countCal;
			addonsList.map((addon) => {
				addon.quantity < 1 && listAddon.push(addon);
				return listAddon;
			});
			if (calculating.current > countCal) {
				return;
			}

			if (pricingInfo.quantity > 0 && listAddon.length === 0) {
				const res = await SubscriptionDev.getDataCalReal(subPrice);
				res.object.coupons = [...res.object.couponPercent, ...res.object.couponPrices];
				res.addons.map((addon) => {
					addon.coupons = [...addon.couponPercent, ...addon.couponPrices];
					return addon;
				});
				if (calculating.current > countCal) {
					return;
				}

				dispatch(subActions.applyCalculate(res));
			}
		},
		{
			enabled: countCal > 0 && isService,
		},
	);
	const { isFetching } = useQuery(
		['previewCost', countCal],
		async () => {
			calculating.current = countCal;
			addonsList.map((addon) => {
				addon.quantity < 1 && listAddon.push(addon);
				return listAddon;
			});
			if (calculating.current > countCal) {
				return;
			}

			if (pricingInfo.quantity > 0 && listAddon.length === 0) {
				const res = await SubscriptionDev.postPreviewCost({
					cycleNo: pricingInfo.currentCycle,
					subscriptionInfo: { subscriptionId: parseInt(subscriptionId, 10), ...subPrice },
					typePortal,
				});
				if (calculating.current > countCal) {
					return;
				}
				dispatch(subActions.handleUpdatePricing({ previewCost: res, noNeedCalculate: true }));
			}
		},
		{
			initialData: [],
			enabled: !!pricingInfo.currentCycle && pricingInfo.subscriptionStatus === 'ACTIVE',
		},
	);
	const [couponSetCodeIdList, setCpSetCodeList] = useState([]);
	const [couponIDList, setCpIdList] = useState([]);

	const handleSetCouponSetCode = (codeId, cpId) => {
		if (!couponIDList.includes(cpId) && !couponSetCodeIdList.includes(codeId)) {
			setCpIdList([...couponIDList, cpId]);
			setCpSetCodeList([...couponSetCodeIdList, codeId]);
		}
	};

	const handleRemoveCouponSetCode = (codeId, cpId) => {
		const indexCodeId = couponSetCodeIdList.indexOf(codeId);
		if (indexCodeId > -1) {
			couponSetCodeIdList.splice(indexCodeId, 1);
		}
		const indexCpId = couponIDList.indexOf(cpId);
		if (indexCpId > -1) {
			couponIDList.splice(indexCpId, 1);
		}
	};

	const changeInfoPricing = (update) => {
		dispatch(subActions.handleUpdatePricing(update));
	};

	const changeInfoPricingByCode = (update, type) => {
		switch (type) {
			case 1:
				dispatch(subActions.handleUpdatePricingByCode(update));
				break;
			case 2:
				dispatch(subActions.handleUpdateAddonCode(update));
				break;
			case 3:
				dispatch(subActions.handleChangeCouponCode(update));
				break;
			default:
		}
	};

	const changeInfoCaculate = (update) => {
		dispatch(subActions.handleUpdatePricing(update));
	};

	const changeInfoPrice = (update) => {
		dispatch(subActions.handleUpdatePricing(update));
	};
	const changeInfoAddon = (update, index, noNeedCalculate) => {
		dispatch(subActions.handleUpdateAddon({ update, index, noNeedCalculate }));
	};

	const changeInfoSub = (update) => {
		dispatch(subActions.handleUpdateSubInfo(update));
	};
	const addExtraFee = (fee) => {
		dispatch(subActions.handleAddExtraFee(fee));
	};
	const changeCoupon = (fee) => {
		dispatch(subActions.handleChangeCoupon(fee));
	};
	const changeAddonList = (fee) => {
		dispatch(subActions.handleChangeAddonList(fee));
	};
	const handleDeleteCouponPricing = (indexCoupon, couponId, couponItemId) => {
		handleRemoveCouponSetCode(couponItemId, couponId);
		dispatch(subActions.handleDeleteCouponPricing({ indexCoupon, couponId }));
	};
	const handleDeleteCouponAddon = (indexAddon, indexCoupon, couponId, couponItemId) => {
		handleRemoveCouponSetCode(couponItemId, couponId);
		dispatch(subActions.handleDeleteCouponAddon({ indexAddon, indexCoupon, couponId }));
	};
	const handleDeleteAddon = (indexAddon) => {
		dispatch(subActions.handleDeleteAddon({ indexAddon }));
	};
	const handleDeleteExtraFee = (indexExtra) => {
		dispatch(subActions.handleDeleteExtraFee({ indexExtra }));
	};
	const handleDeleteCoupon = (indexCoupon, couponId, couponItemId) => {
		handleRemoveCouponSetCode(couponItemId, couponId);
		dispatch(subActions.handleDeleteCoupon({ indexCoupon, couponId }));
	};
	const { data: listUnitAddon } = useQuery(
		['listUnitAddon', listAddonsId],
		async () => {
			const res = await SubscriptionDev.getListUnitAddon(listAddonsId);
			setListAddonId([]);

			return res;
		},
		{
			onSuccess: (res) => {
				valueAddon.forEach((addon) => {
					res.forEach((ol) => {
						if (ol.id === addon.id) {
							addon.unitLimitedList = ol.unitLimitedNews;
						}
					});
				});

				changeAddonList(valueAddon);
			},
		},
		{
			enabled: listAddonsId.length > 0,
		},
	);

	const listAddonCoupon = [];
	addonsList?.map((addon) =>
		addon.couponList?.map((addons) =>
			listAddonCoupon.push({
				...addons,
			}),
		),
	);

	const totalCoupon = [listAddonCoupon, coupons, pricingInfo.couponList].flat();
	function deleteCouponError(value) {
		const arrayIndexPricing = [];
		const arrayIndexAddon = [];
		const arraySumCoupon = [];
		getIndexCoupon(pricingInfo.couponList, value, arrayIndexPricing);
		getIndexCoupon(listAddonCoupon, value, arrayIndexAddon);
		addonsList?.map((addon, indexAddon) => {
			addon.couponList?.map((couponAddon, indexCoupon) =>
				value?.flat(2)?.map((couponErr) => {
					if (couponErr.id === couponAddon.id) {
						arrayIndexAddon.push(indexCoupon);
					}
					return null;
				}),
			);
			_uniqBy(arrayIndexAddon)
				?.reverse()
				?.map((item) => handleDeleteCouponAddon(indexAddon, item));
			arrayIndexAddon.length = 0;
			return null;
		});
		getIndexCoupon(coupons, value, arraySumCoupon);
		arrayIndexPricing?.reverse()?.map((item) => handleDeleteCouponPricing(item));
		arraySumCoupon?.reverse()?.map((item) => handleDeleteCoupon(item));
	}
	const changePricingSub = useMutation(SubscriptionDev.changePricingSub, {
		onSuccess: (res, vari) => {
			console.log(vari);
			if (vari.startAt === 'NOW') message.success('Đổi gói dịch vụ thành công');
			else message.success(' Thuê bao sẽ được đổi gói dịch vụ khi kết thúc chu kỳ');

			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.invalid.data' && e.field === 'quantity') {
				message.error('Gói cố định chỉ được mua 1 gói');
			} else if (e.errorCode === 'error.addon.inactive') {
				message.error('Dịch vụ bổ sung đã tắt');
			} else if (e.errorCode === 'error.subscription.user' && e.field === 'userId') {
				message.error('Khách hàng đang chọn đang sử dụng dịch vụ này.');
			} else if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} hiện không khả dụng.`);
			} else if (e.errorCode === 'error.wrong.user' && e.field === 'companyId') {
				message.error(`Khách hàng đang chọn hiện không khả dụng.`);
			} else if (e.errorCode === 'error.duplicate' && e.field === 'id') {
				message.error(`Khách hàng đang chọn đang sử dụng dịch vụ này.`);
			} else if (e.errorCode === 'error.coupon.invalid') {
				console.log(convertToArrNumber(e.message));
			} else if (e.errorCode === 'error.object.serviceType.invalid') {
				message.error(`Loại dịch vụ không hợp lệ`);
			} else message.error('Đổi gói dịch vụ thất bại');
		},
	});

	const updateTrial = useMutation(SubscriptionDev.updateSubscriptionInTrial, {
		onSuccess: () => {
			message.success('Thuê bao dùng thử đã được cập nhật thành công');
			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.not.change' && e.field === 'Id') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else message.error('Chỉnh sửa thất bại');
		},
	});

	const updateFuture = useMutation(SubscriptionDev.updateSubscriptionFuture, {
		onSuccess: () => {
			message.success('Thuê bao đã được chỉnh sửa thành công ');
			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.object.in.used' && e.object === 'pricing') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.object.inactive' && e.object === 'pricing') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} không hoạt động.`);
			} else message.error('Chỉnh sửa thất bại');
		},
	});

	const insertSub = useMutation(isTrial ? SubscriptionDev.insertTrial : SubscriptionDev.insertReal, {
		onSuccess: () => {
			if (isTrial) message.success('Thuê bao dùng thử đã được tạo thành công');
			else message.success('Thuê bao đã được tạo thành công ');
			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.addon.inactive') {
				message.error('Dịch vụ bổ sung đã tắt');
			} else if (e.errorCode === 'error.subscription.user' && e.field === 'userId') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.pricing.not.found' && e.field === 'id') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} không hoạt động.`);
			} else if (e.errorCode === 'error.wrong.user' && e.field === 'companyId') {
				message.error(`Khách hàng ${formValue.smeInfo[0].companyName} không hoạt động.`);
			} else if (e.errorCode === 'error.duplicate' && e.field === 'id') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.coupon.invalid') {
				Modal.error({
					title: 'Đã có lỗi xảy ra',
					content: `Khuyến mại ${couponListNotExist(getListError(e, totalCoupon, 'id'))} không hoạt động.`,
					onOk: () => deleteCouponError(getListError(e, totalCoupon, 'id')),
					okText: 'Đồng ý',
				});
			} else if (e.errorCode === 'error.pricing.ver.invalid') {
				message.error(`Dịch vụ ${pricingInfo.pricingName} đã có phiên bản mới. Vui lòng chọn lại.`);
			} else if (e.errorCode === 'error.user.not.found') {
				message.error(`Khách hàng ${formValue.smeInfo[0].companyName} không hoạt động.`);
			} else if (
				e.errorCode === 'error.pricing.official.not.found' ||
				(e.errorCode === 'error.object.not.found' && e.object === 'pricing')
			) {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} không hoạt động.`);
			} else if (e.errorCode === 'error.object.not.found' && e.object === 'services') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} không hoạt động.`);
			} else if (e.errorCode === 'error.invalid.status' && e.object === 'pricing') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} không hoạt động.`);
			} else if (e.errorCode === 'error.subscription.in.trial' && e.object === 'subscription') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng dùng thử.`);
			} else if (e.errorCode === 'error.duplicate.pricing') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.duplicate.pricing.try') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng dùng thử.`);
			} else if (e.errorCode === 'error.addon.invalid' && e.object === 'addons') {
				message.error(checkAlertPopup(e, addonsList, 'id', 'name'));
			} else if (e.errorCode === 'error.duplicate.service.try') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng dùng thử.`);
			} else if (e.errorCode === 'error.duplicate.service') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.service.invalid') {
				message.error(checkAlertPopup(e, addonsList, 'id', 'objectName'));
			} else if (e.errorCode === 'error.subscription.addon.user') {
				message.error(checkAlertPopup(e, addonsList, 'id', 'name'));
			} else if (e.errorCode === 'error.coupon.out.of.quantity') {
				message.error(checkAlertPopupPromotion(e));
			} else if (e.errorCode === 'error.pricing.not.tried') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} không thể đăng ký dùng thử.`);
			} else if (e.errorCode === 'error.can.not.use.milti.coupon') {
				Modal.error({
					title: 'Đã có lỗi xảy ra',
					content: `Thuê bao chỉ cho phép chọn duy nhất một khuyến mại`,
					okText: 'Đồng ý',
				});
			} else message.error('Thêm mới thất bại');
		},
	});

	const updateSub = useMutation(SubscriptionDev.updateReal, {
		onSuccess: () => {
			message.success('Cập nhật thuê bao thành công.');

			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.invalid.data' && e.field === 'quantity') {
				message.error('Gói cố định chỉ được mua 1 gói');
			} else if (e.errorCode === 'error.addon.inactive') {
				message.error('Dịch vụ bổ sung đã tắt');
			} else if (e.errorCode === 'error.subscription.user' && e.field === 'userId') {
				message.error('Khách hàng đang chọn đang sử dụng dịch vụ này.');
			} else if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} hiện không khả dụng.`);
			} else if (e.errorCode === 'error.wrong.user' && e.field === 'companyId') {
				message.error(`Khách hàng đang chọn hiện không khả dụng.`);
			} else message.error('Thêm mới thất bại');
		},
	});

	const insertSubFromIntrial = useMutation(SubscriptionDev.insertSubFromIntrial, {
		onSuccess: () => {
			message.success('Thuê bao đã được đăng ký chính thức thành công');
			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.wrong.user') {
				message.error(`Khách hàng ${formValue.smeInfo[0].companyName} không hoạt động.`);
			} else if (e.errorCode === 'error.subscription.user' && e.field === 'userId') {
				message.error(`Dịch vụ ${pricingInfo.serviceName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
				message.error(`Gói dịch vụ ${pricingInfo.pricingName} hiện không khả dụng.`);
			} else if (e.errorCode === 'error.wrong.user' && e.field === 'companyId') {
				message.error(`Khách hàng đang chọn hiện không khả dụng.`);
			} else message.error('Thêm mới thất bại');
		},
	});
	const disableSmeAccount = !!serviceIdIn || !!serviceIdChange;

	function onFinish(value) {
		const objectUpdateTrial = {
			pricingId: pricingInfo.pricingId,
			subscriptionId: id || subscriptionId,
			cycleType: formValue.trialType || pricingInfo.trialType,
			trialDay: parseInt(formValue.numberOfTrial, 10),
			startedAt: formValue.startedAt,
			pricingMultiPlanId: pricingInfo.pricingMultiPlanId || periodIdPricing,
		};
		const objectUpdateFuture = {
			subscriptionId: id || subscriptionId,
			pricing: {
				id: pricingInfo.pricingId,
				price: pricingInfo.price,
				setupFee: checkSetupFee(pricingInfo),
				couponIds: pricingInfo.couponList?.map((el) => ({
					id: el.id || el.couponId,
				})),
				quantity: pricingInfo.quantity,
				pricingMultiPlanId: periodIdPricing || pricingInfo.pricingMultiPlanId || null,
				unitLimitedList: giveUnit ? pricingInfo.unit || pricingInfo.unitLimitedList || [] : undefined,
			},
			addons: addonsList.map((addon) => ({
				...addon,
				unitLimitedList:
					addon.pricingPlan !== 'FLAT_RATE' && addon.pricingPlan !== 'UNIT'
						? addon.unit || addon.unitLimitedList || []
						: undefined,
				numberOfCycles: addon.bonusValue,
				setupFee: checkSetupFee(addon),
				cycleType: addon.type,
				addonMultiPlanId: addon.addonMultiPlanId || addon.periodId || null,

				couponList: addon.couponList?.map((el) => ({
					id: el.id || el.couponId,
				})),
			})),
			couponList: coupons?.map((el) => ({
				id: el.id || el.couponId,
			})),
			otherFee: extraFee,
			cycleType: pricingInfo.cycleType,
			//	numberOfCycles: pricingInfo.numberOfCycles || value.numberOfCycles,
			numberOfCycles: checkNumberOfCycle(value),

			startedAt: moment.isMoment(formValue.startChargeAt)
				? formValue.startChargeAt.format('DD/MM/YYYY')
				: formValue.startChargeAt,
			paymentRequestDate:
				formValue.startChargeAtMod === timeMod.NOW
					? moment().format('DD/MM/YYYY')
					: moment(formValue.startChargeAt).format('DD/MM/YYYY'),
		};
		let objectIns = null;
		if (isTrial) {
			objectIns = {
				companyId: formValue.smeInfo[0].id,
				pricingId: pricingInfo.pricingId,

				trialType: formValue.trialType,
				trialValue: parseInt(formValue.numberOfTrial, 10),
				pricingMultiPlanId: pricingInfo.pricingMultiPlanId || periodIdPricing,
				startedAt: moment(value.startedAt).format('DD/MM/YYYY'),
			};
		} else {
			objectIns = {
				startAt: value.paymentType || query.get('changePricing'),
				subscriptionId: checkChangeSub ? id || subscriptionId : subIdChange,
				companyId: checkSmeID(checkChangeSub, smeId, serviceIdIn, smeInFor, formValue),
				typePortal,
				pricingId: pricingInfo.pricingId,
				quantity: pricingInfo.quantity,

				setupFee: checkSetupFee(pricingInfo),
				couponList: coupons.map((el) => ({
					id: el.id || el.couponId,
				})),
				pricingMultiPlanId:
					periodIdPricing ||
					pricingInfo.pricingMultiPlanId ||
					(isNumber(periodIdChange) ? periodIdChange : Number.parseInt(periodIdChange, 10) || null),
				addonsList: addonsList.map((addon) => ({
					...addon,
					unitLimitedList:
						addon.pricingPlan !== 'FLAT_RATE' && addon.pricingPlan !== 'UNIT'
							? addon.unit || addon.unitLimitedList || []
							: undefined,
					numberOfCycles: addon.bonusValue,
					setupFee: checkSetupFee(addon),
					cycleType: addon.type,
					couponList: addon.couponList?.map((el) => ({
						id: el.id || el.couponId,
					})),
					addonMultiPlanId: addon.addonMultiPlanId || addon.periodId || null,
				})),
				price: pricingInfo.price,
				otherFeeList: extraFee.map((data) => ({
					...data,
					feeAmount: data.price || data.feeAmount,
				})),
				couponPricings: pricingInfo.couponList?.map((el) => ({
					id: el.id || el.couponId,
				})),
				numberOfCycles: checkNumberOfCycle(value),
				trialType: pricingInfo.trialType,
				trialValue: formValue.numberOfCycles,
				unitLimitedList: pricingInfo.unit || pricingInfo.unitLimitedList || [],
				startedAt: checkChangeSub ? moment(formValue.startedAt).format('DD/MM/YYYY') : undefined,
				startChargeAt: value.startChargeAt,
				setCouponItemId: couponSetCodeIdList,
			};
		}

		if (
			typeSupscrip === 'create' &&
			serviceIdIn === null &&
			serviceIdChange !== 'true' &&
			dataDetail.subscriptionStatus !== 'IN_TRIAL' &&
			dataDetail.subscriptionStatus !== 'FUTURE'
		)
			return insertSub.mutate(objectIns);
		if (
			typeSupscrip === 'detail' &&
			serviceIdIn === null &&
			serviceIdChange !== 'true' &&
			dataDetail.subscriptionStatus !== 'IN_TRIAL' &&
			dataDetail.subscriptionStatus !== 'FUTURE'
		)
			return updateSub.mutate(objectIns);
		if (serviceIdIn) return insertSubFromIntrial.mutate(objectIns);
		if (serviceIdChange === 'true') return changePricingSub.mutate(objectIns);
		if (dataDetail.subscriptionStatus === 'IN_TRIAL') {
			return updateTrial.mutate(objectUpdateTrial);
		}
		if (dataDetail.subscriptionStatus === 'FUTURE') {
			return updateFuture.mutate(objectUpdateFuture);
		}
		return '';
	}

	return (
		<div>
			<NewSubscription
				isOrderService={isOrderService}
				countCal={countCal}
				loading={
					changePricingSub.isLoading ||
					updateTrial.isLoading ||
					updateFuture.isLoading ||
					insertSub.isLoading ||
					updateSub.isLoading ||
					insertSubFromIntrial.isLoading
				}
				breadcrumbs={breadcrumbs}
				modRegister={modRegister}
				form={form}
				onFinish={onFinish}
				changeInfoSub={changeInfoSub}
				setPeriodIdPricing={setPeriodIdPricing}
				typePortal={typePortal}
				serviceId={serviceId || id || serviceIdIn || serviceIdChange}
				formValue={formValue}
				isTrial={isTrial || dataDetail.subscriptionStatus === 'IN_TRIAL'}
				pricingInfo={pricingInfo}
				changeInfoPricing={changeInfoPricing}
				changeInfoPricingByCode={changeInfoPricingByCode}
				totalAmountPreTax={totalAmountPreTax}
				addonsList={addonsList}
				changeInfoCaculate={changeInfoCaculate}
				handleDeleteCouponPricing={handleDeleteCouponPricing}
				changeInfoPrice={changeInfoPrice}
				changeAddonList={changeAddonList}
				changeInfoAddon={changeInfoAddon}
				handleDeleteCouponAddon={handleDeleteCouponAddon}
				handleDeleteAddon={handleDeleteAddon}
				periodIdPricing={periodIdPricing}
				extraFee={
					typeSupscrip === 'create'
						? extraFee
						: (extraFeeDetail?.length > 0 && extraFeeDetail) || pricingInfo.onceTimeFee
				}
				handleDeleteExtraFee={handleDeleteExtraFee}
				coupons={
					typeSupscrip === 'create'
						? coupons
						: (couponsDetail?.length > 0 && couponsDetail) || pricingInfo.summary?.couponList
				}
				handleDeleteCoupon={handleDeleteCoupon}
				changeCoupon={changeCoupon}
				totalAmountPreTaxFinal={totalAmountPreTaxFinal}
				addExtraFee={addExtraFee}
				totalAmountAfterTaxFinal={totalAmountAfterTaxFinal}
				typeSupscrip={typeSupscrip}
				isInit={isInit}
				dataDetail={dataDetail}
				disableSmeAccount={disableSmeAccount}
				typeChange={typeChange}
				typeGeneral={typeGeneral}
				couponList={coupons}
				costIncurred={subPrice}
				previewCost={pricingInfo.previewCost}
				checkAdmin={checkAdmin}
				isFetching={isFetching}
				listUnitAddon={listUnitAddon}
				setListAddonId={setListAddonId}
				setValueAddon={setValueAddon}
				couponSetCodeIdList={couponSetCodeIdList}
				handleSetCouponSetCode={handleSetCouponSetCode}
				smeInFor={smeInFor}
			/>
		</div>
	);
}

export default SubscriptionService;
