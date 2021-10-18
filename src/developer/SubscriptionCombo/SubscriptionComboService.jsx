import { isArray } from '@antv/util';
import { Form, message, Modal } from 'antd';
import { useLng, useQueryUrl } from 'app/hooks';
import { DX, SubscriptionDev } from 'app/models';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import { checkAlertPopup, checkAlertPopupSubCombo } from 'app/validator/isInt';
import moment from 'moment';
import { dropRight, uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import NewSubscriptionCombo from './NewSubscriptionCombo';
import { subActions, subSelects } from './redux/subscriptionReducer';

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
function couponListNotExist(dataCheckExist) {
	const uniqCouponNotExists = _uniqBy(dataCheckExist.flat(2), 'id');
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
const CYCLE_TYPE = {
	DAILY: 'ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
const CYCLE_TYPE_TEXT = {
	DAILY: 'DAILY',
	WEEKLY: 'WEEKLY',
	MONTHLY: 'MONTHLY',
	YEARLY: 'YEARLY',
};

function SubscriptionComboService({
	typePortal = 'DEV',
	typeSupscrip = 'create',
	dataDetail = [],
	extraFee: extraFeeDetail,
	coupons: couponsDetail,
	typeGeneral,
	typeChange = '',
	checkAdmin,
	isOrderService,
}) {
	const [form] = Form.useForm();
	const { pathname } = useLocation();
	const pathToList = dropRight(pathname.split('/')).join('/');
	const query = useQueryUrl();
	const [isTrial, setTrial] = useState();
	const modRegister = query.get('isTrial');
	const subIdChange = query.get('subscriptionId');
	const { tLowerField, tMenu } = useLng();
	const [periodIdCombo, setPeriodIdCombo] = useState();

	const changeSubscription = query.get('change-subscription');
	const [listAddonsId, setListAddonId] = useState([]);
	const [valueAddon, setValueAddon] = useState([]);
	useEffect(() => {
		if (modRegister === 'true') {
			setTrial(true);
		} else {
			setTrial(false);
		}
	}, [modRegister]);
	function setBreadcrumb() {
		if (modRegister !== null) {
			return 'Tạo thuê bao Combo dùng thử';
		}
		if (modRegister === null && typeChange !== 'changeSubscription') {
			return 'Tạo thuê bao Combo';
		}
		if (typeChange === 'changeSubscription') {
			return 'Đổi gói Combo dịch vụ';
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
			// name: ` ${tMenu('opt_create', { field: 'comboSubscription' })} ${
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
		couponListId,
	} = useSelector(subSelects.selectSubInfo);
	const checkChangeSub = changeSubscription === 'true';
	const smeName = query.get('smeName');
	const smeId = query.get('smeId');
	const serviceId = formValue.pricingValue && formValue.pricingValue[0]?.id;
	const { id } = useParams();
	const dispatch = useDispatch();
	const serviceIdIn = query.get('serviceIdIn');
	const subscriptionId = query.get('subscriptionId');
	const serviceIdChange = query.get('change-subscription');
	const listAddon = [];
	// const comPlanId = query.get('comPlanId');
	// console.log(serviceIdIn);
	const history = useHistory();
	const isCombo = history.location.pathname.indexOf('combo') !== -1;
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
	useEffect(() => () => dispatch(subActions.reset()), []);
	const { refetch } = useQuery(
		['getComboInfo', serviceId, serviceIdIn, id],
		async () => {
			const res = await ComboSubscriptionDev.getDetailComboBefore(serviceId || serviceIdIn || id);
			let paymentCycleText = '';

			if (res.paymentCycle < 0) {
				paymentCycleText = 'Không giới hạn';
			} else {
				paymentCycleText = `${res.paymentCycle} ${CYCLE_TYPE[res.cycleType]}`;
			}

			const defaultValue = {
				// startChargeAtMod: timeMod.NOW,
				//	startedAt: pricingInfo.startedAt,
				startChargeAt:
					res.comboPlanType === 'POSTPAID'
						? getNextDate(res.cycleType, res.paymentCycle).format('DD/MM/YYYY')
						: moment().format('DD/MM/YYYY'),
				//	startedAtMod: timeMod.NOW,
				paymentCycleText,
				trialType: res.trialType,
				numberOfTrial: 1,
				numberOfCycles: res.numberOfCycles > 0 ? res.numberOfCycles : '',
			};
			if (typeSupscrip === 'create') {
				defaultValue.startedAt = moment();
			}
			if (id === undefined || checkChangeSub) {
				dispatch(
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
						startAt: pricingInfo.startAt,
						numberOfCycles: pricingInfo.numberOfCycles,
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
				((!!serviceId || !!serviceIdIn) && isCombo) || (isCombo && typeChange === 'changeSubscription' && !!id),
		},
	);
	const { data: smeInFor } = useQuery(
		['getSmeInfo', serviceIdIn],
		async () => {
			const data = await ComboSubscriptionDev.descriptionCombo(subscriptionId);

			return data.smeInFo;
		},
		{
			enabled: !!serviceIdIn,
		},
	);
	const giveUnit = pricingInfo.pricingPlan !== 'FLAT_RATE' && pricingInfo.pricingPlan !== 'UNIT';
	const disableSmeAccount = !!serviceIdIn || !!serviceIdChange;
	const isDisplayCyclePayment = pricingInfo.pricingType === 'POSTPAID';
	const calculating = React.useRef(null);
	const subPrice = {
		subscriptionId: parseInt(id, 10),
		calculateType: 'COMBO',

		addons: addonsList?.map((addon) => ({
			id: addon.id,
			price: addon.price ?? (addon.listUnitLimited && addon?.listUnitLimited[0]?.price),
			quantity: addon.quantity,
			setupFee: addon.setupFee?.price ?? addon.setupFee,
			unitLimitedList:
				addon.unit ||
				(addon.unitLimitedList || addon.addonUnitLimiteds)?.map((unit) => ({
					unitFrom: unit.unitFrom,
					unitTo: unit.unitTo,
					price: unit.unitPrice ?? unit.price,
				})) ||
				[],
			addonMultiPlanId: addon.periodId || addon.addonMultiPlanId || null,
			couponList: (addon.couponList || [])?.map((el) => el.id || el.couponId),
		})),
		couponList: coupons?.map((el) => el.id || el.couponId),
		otherFeeList: extraFee,
		comboPlan: {
			id: pricingInfo.comboPlanId,
			setupFee: pricingInfo.setupFee?.price ?? pricingInfo.setupFee,
			price: pricingInfo.price ?? (pricingInfo.listUnitLimited && pricingInfo?.listUnitLimited[0]?.price),
			couponList: (pricingInfo.couponPricings || pricingInfo.couponList || [])?.map((el) => el.id || el.couponId),
			//	unitLimitedList: pricingInfo.unit || [],
			unitLimitedList:
				pricingInfo.pricingPlan !== 'FLAT_RATE' && pricingInfo.pricingPlan !== 'UNIT'
					? pricingInfo.unit ||
					  pricingInfo.unitLimitedList?.map((item) => ({
							unitFrom: item.unitFrom,
							unitTo: item.unitTo,
							price: item.price || item.unitPrice,
					  })) ||
					  []
					: undefined,
		},
	};

	useQuery(
		['getCalculate', countCal],
		async () => {
			calculating.current = countCal;
			if (calculating.current > countCal) {
				return;
			}
			addonsList.map((addon) => {
				addon.quantity < 1 && listAddon.push(addon);
				return listAddon;
			});
			if (
				((dataDetail.pricingValue && dataDetail.pricingValue?.length > 0) || !dataDetail.pricingValue) &&
				listAddon.length === 0
			) {
				const res = await ComboSubscriptionDev.getDataCalRealCombo(subPrice);
				if (calculating.current > countCal) {
					return;
				}
				res.object.coupons = [res.object.couponPercent, res.object.couponPrices].flat(2);
				res.addons.map((addon) => {
					addon.coupons = [addon.couponPercent, addon.couponPrices].flat(2);
					return addon;
				});
				dispatch(subActions.applyCalculate(res));
			}
		},
		{
			enabled: countCal > 0 && isCombo && dataDetail.status !== 'IN_TRIAL',
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
			if (listAddon.length === 0) {
				const res = await ComboSubscriptionDev.postPreviewCost({
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
			enabled: !!pricingInfo.currentCycle && pricingInfo.status === 'ACTIVE',
		},
	);
	const changeInfoPricing = (update) => {
		dispatch(subActions.handleUpdatePricing(update));
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
	const handleAddCouponTotal = (coupon) => {
		dispatch(subActions.handleAddCouponTotal(coupon));
	};
	const changeAddonList = (fee) => {
		dispatch(subActions.handleChangeAddonList(fee));
	};
	const handleDeleteCouponPricing = (indexCoupon, couponId) => {
		dispatch(subActions.handleDeleteCouponPricing({ indexCoupon, couponId }));
	};
	const handelAddCouponPricing = (coupon) => {
		dispatch(subActions.handleAddCouponPricing(coupon));
	};
	const handleDeleteCouponAddon = (indexAddon, indexCoupon, couponId) => {
		dispatch(subActions.handleDeleteCouponAddon({ indexAddon, indexCoupon, couponId }));
	};
	const handleDeleteAddon = (indexAddon) => {
		dispatch(subActions.handleDeleteAddon({ indexAddon }));
	};
	const handleDeleteExtraFee = (indexExtra) => {
		dispatch(subActions.handleDeleteExtraFee({ indexExtra }));
	};
	const handleDeleteCoupon = (indexCoupon, couponId) => {
		dispatch(subActions.handleDeleteCoupon({ indexCoupon, couponId }));
	};
	const handleAddCouponAddon = (indexAddon, coupon) => {
		dispatch(subActions.handleAddCouponAddon({ indexAddon, coupon }));
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
						if (
							ol.id === addon.id &&
							addon.pricingPlan !== 'UNIT' &&
							addon.pricingPlan !== 'FLAT_RATE' &&
							ol.unitLimitedNews?.length > 0
						) {
							addon.unitLimitedList = ol.unitLimitedNews || [];
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
	function checkNumberOfCycle(value) {
		if (value.numberOfCycles || value.numberOfCycles === '') {
			return value.numberOfCycles;
		}
		return pricingInfo.numberOfCycles;
	}
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
	const insertSub = useMutation(isTrial ? ComboSubscriptionDev.insertComboTrial : ComboSubscriptionDev.insertCombo, {
		onSuccess: () => {
			if (isTrial) message.success('Thuê bao combo dùng thử đã được tạo thành công');
			else message.success('Thuê bao combo được tạo thành công ');
			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.object.not.found' && e.field === 'combo_plan') {
				message.error(`Gói combo dịch vụ ${pricingInfo.comboPlanName} hiện không khả dụng.`);
			} else if (e.errorCode === 'error.user.not.found' || e.errorCode === 'error.wrong.user') {
				message.error(`Khách hàng ${formValue.smeInfo[0].companyName} không hoạt động.`);
			} else if (e.errorCode === 'error.you.used.pricing.try' && e.object === 'combo_plan') {
				message.error(`Gói combo ${pricingInfo.comboPlanName} đang được khách hàng dùng thử.`);
			} else if (e.errorCode === 'error.combo.plan.not.found' && e.object === 'combo_plan') {
				message.error(` Gói combo dịch vụ ${pricingInfo.comboPlanName} đang không hoạt động.`);
			} else if (e.errorCode === 'error.combo.not.found' && e.object === 'combo') {
				message.error(` Combo dịch vụ ${pricingInfo.comboName} đang không hoạt động.`);
			} else if (e.errorCode === 'error.you.used.pricing' && e.object === 'combo_plan') {
				message.error(` Gói combo dịch vụ ${pricingInfo.comboPlanName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.pricing.not.found' && e.object === 'pricing') {
				message.error(checkAlertPopup(e, pricingInfo.listPricing, 'pricingId', 'pricingName'));
			} else if (e.errorCode === 'error.duplicate.pricing.try' && e.object === 'pricing') {
				message.error({
					content: checkAlertPopupSubCombo(e, pricingInfo.listPricing, 'pricingId', 'serviceName'),
					duration: 7,
					className: 'msg-coupon',
				});
			} else if (e.errorCode === 'error.duplicate.pricing' && e.object === 'pricing') {
				message.error({
					content: checkAlertPopupSubCombo(e, pricingInfo.listPricing, 'pricingId', 'serviceName'),
					duration: 7,
					className: 'msg-coupon',
				});
			} else if (e.errorCode === 'error.coupon.invalid') {
				Modal.error({
					title: 'Đã có lỗi xảy ra',
					content: `Khuyến mại ${couponListNotExist(getListError(e, totalCoupon, 'id'))} không hoạt động.`,
					onOk: () => deleteCouponError(getListError(e, totalCoupon, 'id')),
					okText: 'Đồng ý',
				});
			} else if (e.errorCode === 'error.subscription.user') {
				message.error(`Combo dịch vụ ${pricingInfo.comboName} đang được khách hàng sử dụng.`);
			} else if (e.errorCode === 'error.duplicate.combo') {
				message.error(`Combo dịch vụ ${pricingInfo.comboName} đang được khách hàng dùng thử.`);
			} else if (e.errorCode === 'error.pricing.not.tried') {
				message.error(`Gói combo dịch vụ ${pricingInfo.comboPlanName} không thể đăng ký dùng thử.`);
			} else message.error('Thêm mới thất bại');
		},
	});

	const changePricingSub = useMutation(ComboSubscriptionDev.changeComboPlan, {
		onSuccess: (res, vari) => {
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
			} else if (e.errorCode === 'error.object.serviceType.invalid') {
				message.error(`Loại dịch vụ không hợp lệ`);
			} else message.error('Đổi gói Combo thất bại');
		},
	});
	const updateSubtrial = useMutation(ComboSubscriptionDev.updateComboTrial, {
		onSuccess: () => {
			message.success('Thuê bao dùng thử đã được update thành công');

			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {},
	});
	const updateSub = useMutation(
		pricingInfo.status === 'FUTURE'
			? ComboSubscriptionDev.updateComboFuture
			: ComboSubscriptionDev.updateComboActive,
		{
			onSuccess: () => {
				if (pricingInfo.status === 'FUTURE')
					message.success('Thuê bao combo dùng thử đã được cập nhật thành công.');
				message.success('Thuê bao combo đã được cập nhật thành công.');
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
				} else message.error('Cập nhật thất bại');
			},
		},
	);

	const insertSubFromIntrial = useMutation(ComboSubscriptionDev.insertIntrialtoActive, {
		onSuccess: () => {
			if (isTrial) message.success('Thuê bao dùng thử đã được tạo thành công');
			message.success('Thuê bao đã được tạo thành công ');
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
	function onFinish(value) {
		let objectIns = null;
		// trialType: 'MONTHLY',
		const objectUpdateTrial = {
			subscriptionId: id || subscriptionId,
			comboPlanId: pricingInfo.comboPlanId,
			trialDay: parseInt(formValue.numberOfTrial, 10),
			cycleType: formValue.trialType,
			startedAt: formValue.startedAt,
		};

		const objectUpdate = {
			subscriptionId: id || subscriptionId,
			comboPlan: {
				id: pricingInfo.comboPlanId,
				price: pricingInfo.price,
				setupFee: pricingInfo.setupFee?.price ?? pricingInfo.setupFee,
				couponIds: pricingInfo.couponList?.map((el) => ({
					id: el.id,
				})),
			},
			addons: addonsList?.map((addon) => ({
				...addon,
				numberOfCycles: addon.bonusValue,
				cycleType: addon.type,
				couponIds: addon.couponList?.map((el) => ({
					id: el.id,
				})),
				unitLimitedList:
					addon.pricingPlan !== 'FLAT_RATE' && addon.pricingPlan !== 'UNIT'
						? addon.addonUnitLimiteds
						: undefined,
				setupFee: addon.setupFee?.price ?? addon.setupFee,
				addonMultiPlanId: addon.periodId || addon.addonMultiPlanId || null,
			})),

			couponList: coupons?.map((el) => ({
				id: el.id,
			})),
			otherFeeList: extraFee,
			cycleType: pricingInfo.cycleType,
			//	numberOfCycles: value.numberOfCycles || pricingInfo.numberOfCycles,
			numberOfCycles: checkNumberOfCycle(value),
			startedAt: value.startAt,
			paymentRequestDate: value.startChargeAt,
		};

		if (isTrial) {
			objectIns = {
				companyId: formValue.smeInfo[0].id,
				trialType: formValue.trialType,
				trialValue: parseInt(formValue.numberOfTrial, 10),
				startedAt: moment(value.startedAt).format('DD/MM/YYYY'),
				comboPlanId: pricingInfo.comboPlanId,
			};
		} else {
			objectIns = {
				startAt: value.paymentType || query.get('changeCombo'),
				subscriptionId: !checkChangeSub ? id || subscriptionId : subIdChange,
				companyId: checkChangeSub && smeId ? smeId : formValue?.smeInfo[0]?.id,
				quantity: pricingInfo.quantity,
				setupFee: pricingInfo.setupFee?.price ?? pricingInfo.setupFee,
				couponComboPlans: pricingInfo?.couponList?.map((coupon) => ({
					id: coupon.id || coupon.couponId,
				})),
				comboPlanId: pricingInfo.comboPlanId,
				addonsList: addonsList?.map((addon) => ({
					...addon,
					unitLimitedList:
						addon.pricingPlan !== 'FLAT_RATE' && addon.pricingPlan !== 'UNIT'
							? addon.unit || addon.unitLimitedList || []
							: undefined,
					numberOfCycles: addon.bonusValue,
					cycleType: addon.type,

					couponIds: addon.couponList?.map((el) => ({
						id: el.id || el.couponId,
					})),
					setupFee: addon.setupFee?.price ?? addon.setupFee,
					addonMultiPlanId: addon.periodId || addon.addonMultiPlanId || null,
				})),
				price: pricingInfo.price,
				otherFeeList: extraFee,
				couponIds: coupons?.map((el) => ({
					id: el.id || el.couponId,
				})),
				//	numberOfCycles: value.numberOfCycles || pricingInfo.numberOfCycles,
				numberOfCycles: checkNumberOfCycle(value),

				trialType: pricingInfo.trialType,
				trialValue: formValue.numberOfCycles,
				unitLimitedList: pricingInfo.unit || pricingInfo.unitLimitedList || [],
				startedAt: moment(value.startedAt).format('DD/MM/YYYY'),
				startChargeAt: value.startChargeAt,
				setCouponItemId: couponListId,
			};
		}

		if (typeSupscrip === 'create' && serviceIdIn === null && changeSubscription !== 'true')
			return insertSub.mutate(objectIns);
		if (
			typeSupscrip === 'detail' &&
			serviceIdIn === null &&
			changeSubscription !== 'true' &&
			pricingInfo.status !== 'IN_TRIAL'
		)
			return updateSub.mutate(objectUpdate);
		if (
			typeSupscrip === 'detail' &&
			serviceIdIn === null &&
			changeSubscription !== 'true' &&
			pricingInfo.status === 'IN_TRIAL'
		)
			return updateSubtrial.mutate(objectUpdateTrial);
		if (changeSubscription === 'true') return changePricingSub.mutate(objectIns);
		if (serviceIdIn) return insertSubFromIntrial.mutate(objectIns);

		return '';
	}

	return (
		<div>
			<NewSubscriptionCombo
				isOrderService={isOrderService}
				loading={
					insertSub.isLoading ||
					changePricingSub.isLoading ||
					updateSubtrial.isLoading ||
					updateSub.isLoading ||
					insertSubFromIntrial.isLoading
				}
				breadcrumbs={breadcrumbs}
				modRegister={modRegister}
				form={form}
				onFinish={onFinish}
				changeInfoSub={changeInfoSub}
				typePortal={typePortal}
				serviceId={serviceId || id || serviceIdIn}
				formValue={formValue}
				isTrial={isTrial || dataDetail.status === 'IN_TRIAL'}
				pricingInfo={pricingInfo}
				changeInfoPricing={changeInfoPricing}
				totalAmountPreTax={totalAmountPreTax}
				addonsList={addonsList}
				changeInfoCaculate={changeInfoCaculate}
				handleDeleteCouponPricing={handleDeleteCouponPricing}
				changeInfoPrice={changeInfoPrice}
				changeAddonList={changeAddonList}
				changeInfoAddon={changeInfoAddon}
				handleDeleteCouponAddon={handleDeleteCouponAddon}
				handleDeleteAddon={handleDeleteAddon}
				periodIdCombo={periodIdCombo}
				setPeriodIdCombo={setPeriodIdCombo}
				handelAddCouponPricing={handelAddCouponPricing}
				handleAddCouponAddon={handleAddCouponAddon}
				handleAddCouponTotal={handleAddCouponTotal}
				extraFee={
					extraFee
					// typeSupscrip === 'create'
					// 	? extraFee
					// 	: (extraFeeDetail?.length > 0 && extraFeeDetail) || pricingInfo.onceTimeFee
				}
				handleDeleteExtraFee={handleDeleteExtraFee}
				coupons={
					typeSupscrip === 'create'
						? coupons
						: (couponsDetail?.length > 0 && couponsDetail) || pricingInfo.subCoupons
				}
				handleDeleteCoupon={handleDeleteCoupon}
				changeCoupon={changeCoupon}
				totalAmountPreTaxFinal={totalAmountPreTaxFinal}
				addExtraFee={addExtraFee}
				totalAmountAfterTaxFinal={totalAmountAfterTaxFinal}
				typeSupscrip={typeSupscrip}
				displayTxt={isDisplayCyclePayment}
				isInit={isInit}
				dataDetail={dataDetail}
				disableSmeAccount={disableSmeAccount}
				typeGeneral={typeGeneral}
				typeChange={typeChange}
				countCal={countCal}
				couponsDetail={coupons}
				costIncurred={subPrice}
				previewCost={pricingInfo.previewCost}
				checkAdmin={checkAdmin}
				isFetching={isFetching}
				listUnitAddon={listUnitAddon}
				setListAddonId={setListAddonId}
				setValueAddon={setValueAddon}
				smeInFor={smeInFor}
			/>
		</div>
	);
}

export default SubscriptionComboService;
