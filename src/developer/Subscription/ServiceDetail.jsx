/* eslint-disable react-hooks/rules-of-hooks */
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row } from 'antd';
import CaculatorPopup from 'app/components/Templates/Subscription/CaculatorPopup';
import ChoosePromotion from 'app/components/Templates/Subscription/ChoosePromotion';
import InputAmountSubscription from 'app/components/Templates/Subscription/InputAmountSubscription';
import { useLng, useQueryUrl, useUser } from 'app/hooks';
import { CouponSetItem, DX, SMESubscription, SubscriptionDev } from 'app/models';
import { convertToNumber, formatNormalizeCurrency } from 'app/validator';
import { isEmpty, isNil, isNaN } from 'opLodash';
import React, { useEffect, useRef, useState } from 'react';
import ListPromotion from 'app/components/Templates/Subscription/ListPromotion';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { subSelects } from './redux/subscriptionReducer';
import CanNotAccessRoute from '../../app/permissions/CanNotAccessRoute';
import { ExportCouponHeader, getDataTransform } from '../../app/models/ExportCouponSetDTO';
import { parseObjToQueryString, parseQueryStringToObjectStc } from '../../app/helpers';

const addTotal = (dataInit) => {
	const total = (type) =>
		dataInit?.map((item) => item[type])?.reduce((accumulator, currentValue) => accumulator + currentValue || 0);
	return [
		...dataInit,
		{
			quantity: total('quantity'),
			unitFrom: 'Tổng',
			unitPrice: null,
			unitTo: '',
			key: 'total',
			amountBeforeTax: total('amountBeforeTax'),
		},
	];
};

const CYCLE_TYPE = {
	DAILY: 'ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};

function GetCyclesPay(numberOfCycles, cycleType, taxList, hasTax, bonusType = 'PERIODIC', typeModal, numberOf) {
	if ((numberOfCycles && cycleType) || bonusType === 'ONCE') {
		return `${
			bonusType === 'ONCE' || (typeModal === 'PRICING' && numberOf === 1)
				? `Thanh toán một lần`
				: `Chu kỳ TT ${numberOfCycles} ${CYCLE_TYPE[cycleType]}`
		} ${
			taxList?.length > 0
				? `(chưa bao gồm  ${taxList
						.map((item) => `${item.percent || item.value}% ${item.taxName || item.name}`)
						.join(', ')})`
				: ''
		}`;
	}
	if (numberOfCycles === null && bonusType === 'PERIODIC') {
		return '';
	}
}
function getTaxSetupFee(taxList) {
	if (taxList?.length > 0)
		return `(chưa bao gồm  ${taxList
			.map((item) => `${item.percent || item.value}% ${item.taxName || item.name}`)
			.join(', ')})`;
	return '';
}
function GetPriceCoupon(item) {
	const priceType = {
		PERCENT: '%',
		PRICE: ' VND',
	};

	if (item.promotionType === 'DISCOUNT' && item.discountType === 'PRICE') {
		return item.discountValue || item.couponValue
			? formatNormalizeCurrency(item.discountValue || item.couponValue) + priceType.PRICE
			: item.promotionValue;
	}

	if (item.promotionType === 'DISCOUNT' && item.discountType === 'PERCENT') {
		return item.discountValue || item.couponValue
			? (item.discountValue || item.couponValue) + priceType.PERCENT
			: item.promotionValue;
	}
	if (item.promotionValue) {
		return item.promotionValue;
	}
}

const priceValueConvert = (value) => {
	const listItem = [];
	value?.map((item) => {
		if (!isEmpty(item.quantity) || item.quantity > 0) {
			listItem.push(convertToNumber(item.unitPrice));
		}
		return listItem;
	});
	return Math.max(...listItem);
};

function ServiceDetail({
	changeCouponList,
	pricingDetail,
	typeModal,
	changeInfoInput,
	fnCall,
	isTrial,
	changeInFoCaculate,
	handleDelete,
	handleDeleteCoupon,
	setDataCalculator,
	allowDelete,
	setPriceValue,
	typeSupscrip,
	dataDetail = {},
	indexAddon,
	typeChange,
	pricingInfo = {},
	typePortal,
	addonsList,
	coupons,
	indexAddonDis,
	typeGeneral,
	checkAdmin,
	setErrorQuanlity,
	handleDeleteCouponTotal,
	isOrderService,
	listUnitAddon,
	totalAmountPreTax,
	totalCoupon,
	couponSetCodeIdList,
	setCouponSetCodeList,
	changeInfoPricingByCode,
	totalAmount,
	quanlity,
	periodIdPricing,
}) {
	const { tButton, tField, tOthers, tMessage } = useLng();
	const { Item } = Form;
	const [dataCalTier, setDataCalTier] = useState([]);
	const [showCalculation, setCalculation] = useState(false);
	const [disablePromotionPricing, setDisablePromotionPricing] = useState(false);
	const [disablePromotionAddon, setDisablePromotionAddon] = useState(false);
	const couponsPricing = [pricingInfo.invoiceCouponPercents, pricingInfo.invoiceCouponPrices].flat(2);
	const couponsAddon = [pricingDetail.invoiceCouponPercents, pricingDetail.invoiceCouponPrices].flat(2);
	const history = useHistory();
	const isService = history.location.pathname.indexOf('service') !== -1;
	const [checkChangeInput, setCheckChangeInput] = useState(false);
	const checkHasChangeQuanAdd =
		pricingDetail.hasChangeQuantity !== 'NONE' && pricingDetail.hasChangeQuantity !== null;
	const couponsPri = [];
	const couponAdd = [];
	const listAddon = [];
	const { id } = useParams();
	const haveTax = useSelector(subSelects.haveTax);
	const isEditForPlan =
		pricingDetail.pricingPlan === 'VOLUME' ||
		pricingDetail.pricingPlan === 'TIER' ||
		pricingDetail.pricingPlan === 'STAIR_STEP';
	const indexCouponPri = [];
	const indexCouponAddon = [];
	const indexCouponDel = [];
	const couponSetCodePri = useRef(null);
	const couponSetCodeAddon = useRef(null);

	function handleCheckCode(pricingId, addonId, code, type, price, portalType) {
		const companyId = pricingDetail.smeId;
		if (pricingId !== null) {
			CouponSetItem.check({ pricingId, code, type, companyId, price, quanlity, portalType })
				.then((data) => {
					if (data === null) {
						message.error('err_check_coupon_code');
					}
					if (couponSetCodeIdList.includes(data.id)) {
						message.error(tMessage('err_check_coupon_code_is_use'));
					}
					setCouponSetCodeList(data.id, data.couponId);
					data.couponCodeId = data.id;
					data.id = data.couponId;
					const couponList = [];
					couponList.push(data);
					const lst = { couponList };
					changeInfoPricingByCode(lst, 1);
				})
				.catch((err) => {
					console.error(err);
					message.error(tMessage('occurredErr'));
				});
		} else if (addonId !== null) {
			CouponSetItem.check({ addonId, code, type, companyId, price, quanlity, portalType })
				.then((data) => {
					if (data === null) {
						message.error('err_check_coupon_code');
					}
					if (couponSetCodeIdList.includes(data.id)) {
						message.error(tMessage('err_check_coupon_code_is_use'));
					}
					setCouponSetCodeList(data.id, data.couponId);
					data.couponCodeId = data.id;
					data.id = data.couponId;
					const couponList = [];
					couponList.push(data);
					const index = indexAddon;
					const update = { couponList };
					const lst = { update, index };
					changeInfoPricingByCode(lst, 2);
				})
				.catch((err) => {
					console.error(err);
					message.error(tMessage('occurredErr'));
				});
		}
	}

	const handleOnClick = (type) => {
		let code = '';
		switch (type) {
			case 1:
				code = couponSetCodePri.current?.input?.defaultValue;
				handleCheckCode(pricingDetail.id, null, code, type, totalAmount, 'DEV');
				break;
			case 2:
				code = couponSetCodeAddon.current?.input?.defaultValue;
				handleCheckCode(null, pricingDetail.id, code, type, totalAmount, 'DEV');
				break;
			default:
		}
	};
	useEffect(() => {
		if (typeModal === 'PRICING' && isService) {
			pricingInfo.couponList
				?.filter((el) => !el.canNotDelete)
				?.forEach((coupon, index) => {
					if (totalAmountPreTax < coupon.minimumAmount || addonsList.length + 1 < coupon.minimum) {
						indexCouponPri.push(index);
					}
				});
			indexCouponPri.reverse().map((item) => handleDeleteCoupon(item, null));
		}

		if (typeModal === 'ADDON' && isService) {
			pricingDetail.couponList
				?.filter((el) => !el.canNotDelete)
				?.forEach((coupon, index) => {
					if (totalAmountPreTax < coupon.minimumAmount || addonsList.length + 1 < coupon.minimum)
						indexCouponAddon.push(index);
				});
			indexCouponAddon.reverse().map((item) => handleDeleteCoupon(item, null));
		}
		if (isService) {
			coupons
				?.filter((el) => !el.canNotDelete)
				?.forEach((coupon, indexCoupon) => {
					if (totalAmountPreTax < coupon.minimumAmount || addonsList + 1 < coupon.minimum) {
						indexCouponDel.push(indexCoupon);
					}
				});
			indexCouponDel.reverse().map((item) => handleDeleteCouponTotal(item));
		}
	}, [totalAmountPreTax]);
	function checkData() {
		if (checkChangeInput) return dataCalTier;
		return pricingDetail.unit || pricingDetail.unitLimitedList || pricingDetail.listUnitLimited;
	}

	const { data: dataPopupByType } = useQuery(
		[
			'getListPopupByType',
			pricingDetail.quantity,
			dataCalTier,
			pricingDetail.pricingId || pricingDetail.id,
			listUnitAddon,
		],
		async () => {
			const res = await SubscriptionDev.getListPopupByType(
				SMESubscription.formatPricingPlan[pricingDetail.pricingPlan],
				{
					planId: pricingDetail.pricingId || pricingDetail.id,
					quantity: pricingDetail.quantity,
					typeSub: typeModal,
					body: {
						unitLimitedNews: pricingDetail.pricingPlan === 'TIER' ? checkData() : pricingDetail.unit,
					},
					subscriptionId: typeSupscrip !== 'create' ? id : undefined,
					pricingMultiPlanId:
						pricingDetail.pricingPlan !== 'TIER'
							? periodIdPricing ||
							  pricingDetail.pricingMultiPlanId ||
							  pricingDetail.addonMultiPlanId ||
							  pricingDetail.periodId ||
							  null
							: undefined,
				},

				{
					enabled: pricingInfo.quantity > 0,
				},
			);
			// const dataUpdate = res.filter((column) => column.amountBeforeTax !== 0);
			setDataCalculator(
				res.map((item) => ({
					unitFrom: item.unitFrom,
					unitTo: item.unitTo,
					price: item.unitPrice,
				})),
				false,
			);

			setPriceValue(priceValueConvert(res), true);
			return addTotal(res);
		},
		{
			initialData: [],
			enabled:
				!isEmpty(pricingDetail) &&
				pricingDetail.quantity > 0 &&
				['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === pricingDetail.pricingPlan),
			keepPreviousData: true,
		},
	);
	useEffect(() => {
		setDataCalTier([]);
	}, [pricingDetail.pricingId || pricingDetail.id]);
	coupons.map((coupon) =>
		couponsPricing.map(
			(pri) =>
				pri?.id === (coupon?.id || coupon?.couponId) &&
				couponsPri.push({
					id: coupon.id,
					couponName: coupon.couponName || coupon.name,
					promotionValue: coupon.promotionValue || GetPriceCoupon(coupon),
					price: pri?.price,
					minimumAmount: coupons.minimumAmount || 0,
					minimum: coupons.minimum || 0,
				}),
		),
	);
	coupons.map((coupon) =>
		couponsAddon.map(
			(pri) =>
				pri?.id === (coupon?.id || coupon?.couponId) &&
				couponAdd.push({
					id: coupon.id,
					couponName: coupon.couponName || coupon.name,
					promotionValue: coupon.promotionValue || GetPriceCoupon(coupon),
					price: pri?.price,
					minimumAmount: coupons.minimumAmount || 0,
					minimum: coupons.minimum || 0,
				}),
		),
	);

	addonsList?.map((addon) =>
		addon.couponList?.map((addons) =>
			listAddon.push({
				...addons,
			}),
		),
	);
	useEffect(() => {
		if (pricingInfo.couponList?.length > 0 || coupons.length > 0) {
			setDisablePromotionAddon(true);
		} else {
			setDisablePromotionAddon(false);
		}
	}, [pricingInfo.couponList, coupons]);

	const checkPromotion =
		typeModal === 'ADDON' && (disablePromotionAddon || (listAddon.length > 0 && indexAddonDis !== indexAddon));
	useEffect(() => {
		if (listAddon.length > 0 || coupons.length > 0) {
			setDisablePromotionPricing(true);
		} else {
			setDisablePromotionPricing(false);
		}
	}, [listAddon, coupons]);

	const isDisplayPrice =
		dataDetail.smeId && dataDetail.hasChangePrice === 'YES' && dataDetail.subscriptionStatus === 'ACTIVE';
	const isSetupFee = dataDetail.smeId && dataDetail.subscriptionStatus === 'ACTIVE' && typeGeneral !== 'GENERATE';

	const displayPriceText =
		pricingDetail.pricingPlan !== 'VOLUME' &&
		pricingDetail.pricingPlan !== 'TIER' &&
		pricingDetail.pricingPlan !== 'STAIR_STEP';
	const changeQuan = {
		typeQuan: 'changeQuanlity',
		typeError: pricingDetail.hasChangeQuantity,
		dataDetail: dataDetail.smeId,
		status: dataDetail.subscriptionStatus,
		quantity: pricingDetail.quantity,
	};
	const checkDisPlayQuanlity =
		dataDetail.subscriptionStatus !== 'CANCELED' &&
		dataDetail.subscriptionStatus !== 'NON_RENEWING' &&
		typeGeneral === 'GENERATE';
	const checkDisplayPrice =
		((!dataDetail.smeId && pricingDetail.hasChangePrice !== 'NO' && typeGeneral === 'GENERATE') ||
			(dataDetail.subscriptionStatus === 'FUTURE' && dataDetail.hasChangePrice !== 'NO') ||
			(isDisplayPrice &&
				dataDetail.subscriptionStatus !== 'CANCELED' &&
				dataDetail.subscriptionStatus !== 'NON_RENEWING' &&
				typeGeneral === 'GENERATE')) &&
		!isOrderService;
	const checkDisplayQuanlityInput =
		(pricingDetail.pricingPlan !== 'FLAT_RATE' &&
			dataDetail.smeId &&
			checkHasChangeQuanAdd &&
			dataDetail.subscriptionStatus === 'ACTIVE' &&
			checkDisPlayQuanlity &&
			typeModal === 'ADDON') ||
		(typeSupscrip === 'create' && pricingDetail.pricingPlan !== 'FLAT_RATE') ||
		(pricingDetail.pricingPlan !== 'FLAT_RATE' && dataDetail.subscriptionStatus === 'FUTURE') ||
		(pricingDetail.pricingPlan !== 'FLAT_RATE' &&
			checkHasChangeQuanAdd &&
			checkDisPlayQuanlity &&
			!isOrderService) ||
		(!pricingDetail.isOrigin && typeModal === 'ADDON' && pricingDetail.pricingPlan !== 'FLAT_RATE');

	const checkDisplayPriceSetupFee =
		!isSetupFee &&
		pricingDetail.hasChangePrice === 'YES' &&
		dataDetail.subscriptionStatus !== 'CANCELED' &&
		dataDetail.subscriptionStatus !== 'NON_RENEWING' &&
		!isOrderService &&
		(typeSupscrip === 'create' || (typeSupscrip !== 'create' && typeModal !== 'PRICING'));

	const { user } = useUser();

	let CAN_UPDATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/update-subscription', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/update-subscription', user.permissions));
	const CAN_CREATE_TRIAL =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-trial-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-trial-subscription-combo', user.permissions));

	const CAN_CREATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));

	if (typeSupscrip === 'create') {
		CAN_UPDATE = true;
	}
	useEffect(() => {
		setCheckChangeInput(false);
	}, [showCalculation]);

	if (isTrial || pricingInfo.regType === 'TRIAL') {
		return (
			<div className="bg-white py-5 pl-5">
				<div className="font-semibold color text-primary">{pricingDetail.serviceName}</div>
				<div className="text-gray-400 text-sm">{pricingDetail.pricingName}</div>
			</div>
		);
	}

	return (
		<div className="bg-white">
			<Row gutter={[8, 16]} className="text-base py-3 pl-5">
				<Col span={7}>
					<div className="font-semibold color text-primary">
						{pricingDetail.objectName || pricingDetail.serviceName || pricingDetail.name}
					</div>
					<div className="text-gray-400 text-sm">
						{pricingDetail.pricingName || pricingDetail.addonName || pricingDetail.name}
					</div>
					<div className="text-gray-400 text-sm">
						{GetCyclesPay(
							pricingDetail.paymentCycle || pricingDetail.bonusValue,
							pricingDetail.cycleType || pricingDetail.type,
							pricingDetail.taxList,
							pricingDetail.hasTax ||
								(pricingDetail?.taxList?.length > 0 ? pricingDetail?.taxList[0]?.hasTax : undefined),
							pricingDetail.bonusType,
							typeModal,
							pricingDetail.numberOfCycles,
						)}
					</div>
					{isEditForPlan && (
						<Button
							type="link"
							onClick={() => setCalculation(true)}
							className="mb-0 mt-3 pl-0 font-semibold text-gray-500 cursor-pointer"
						>
							Cách tính <ExclamationCircleOutlined />
						</Button>
					)}
				</Col>

				<Col span={4}>
					<div className="text-right pl-6 w-full">
						{checkDisplayPrice && !isEditForPlan ? (
							<InputAmountSubscription
								defaultValue={pricingDetail.price}
								handleChangeAmount={(price) => {
									changeInfoInput({ price });
								}}
								skipError="YES"
								formatCurrency="YES"
								//	preValue={pricingDetail.preQuantity}
								canEdit={!CAN_UPDATE || !checkAdmin}
							/>
						) : (
							<div className="py-2.5">
								{pricingDetail?.price !== null && displayPriceText
									? DX.formatNumberCurrency(pricingDetail.price)
									: '--'}
							</div>
						)}
					</div>
				</Col>
				<Col span={4}>
					<div className="text-right pl-6 w-full">
						{checkDisplayQuanlityInput ? (
							<InputAmountSubscription
								defaultValue={pricingDetail.quantity}
								handleChangeAmount={(quantity) => {
									changeInfoInput({ quantity });
								}}
								changeQuan={changeQuan}
								skipError="YES"
								typeMes="Vui lòng không để trống mục này"
								isQuantity
								preValue={pricingDetail.preQuantity}
								canEdit={!CAN_UPDATE || !checkAdmin}
								dataOrigin={pricingDetail.originQuantity}
								setErrorQuanlity={setErrorQuanlity}
							/>
						) : (
							<div className="py-2.5">
								{dataDetail.smeId && pricingDetail.pricingPlan !== 'FLAT_RATE' ? (
									dataDetail?.addonsList[indexAddon]?.quantity || dataDetail?.quantity
								) : (
									<div>--</div>
								)}
							</div>
						)}
					</div>
				</Col>
				<Col span={haveTax ? 4 : 8} className="text-right text-base py-2.5">
					<div style={{ marginRight: '5px' }}>
						{pricingDetail.preAmountTax && DX.formatNumberCurrency(pricingDetail.preAmountTax)}
					</div>
				</Col>
				{haveTax && <Col span={4} className="text-right" />}
				<Col span={1} className="text-center py-2.5">
					{((dataDetail.subscriptionStatus !== 'CANCELED' &&
						dataDetail.subscriptionStatus !== 'NON_RENEWING') ||
						!pricingDetail.isOrigin) &&
						checkAdmin &&
						!isOrderService && (
							<DeleteOutlined
								hidden={
									pricingDetail.canNotDelete ||
									allowDelete === 'YES' ||
									pricingDetail.subscriptionStatus === 'FUTURE' ||
									typeGeneral !== 'GENERATE'
								}
								onClick={() => {
									handleDelete(indexAddon);
								}}
							/>
						)}
				</Col>
			</Row>
			<hr className="my-0" style={{ borderTop: '1px solid #d9d9d9' }} />
			<div className="py-3 pl-5">
				{!isEmpty(pricingDetail?.couponList) && (
					<div
						className="beauty-scroll p-2 mr-0.5 overflow-y-auto"
						style={{ height: pricingDetail.couponList.length > 3 ? '12rem' : '100%' }}
					>
						{pricingDetail.couponList
							?.filter(
								(el) =>
									totalAmountPreTax >= el.minimumAmount && addonsList.length + 1 >= (el.minimum || 0),
							)
							?.map((item, index) => (
								<Row gutter={[8, 16]} className="py-2 items-center text-base">
									<Col span={7}>
										<ListPromotion item={item} typeSupscrip={typeSupscrip} />
									</Col>
									<Col span={4} />
									<Col span={4} className="text-right" />
									<Col span={haveTax ? 4 : 8} className="text-right">
										{(typeSupscrip === 'create' || dataDetail.subscriptionStatus === 'FUTURE') && (
											<>
												{!isNil(item?.price)
													? DX.formatNumberCurrency(item?.price)
													: `${
															item?.listProduct?.length > 0 || item?.pricing?.length > 0
																? ''
																: '0'
													  }`}
											</>
										)}
									</Col>
									{haveTax && <Col span={4} className="text-right" />}
									<Col span={1} className="text-center">
										{((!isSetupFee &&
											dataDetail?.subscriptionStatus !== 'CANCELED' &&
											dataDetail?.subscriptionStatus !== 'NON_RENEWING') ||
											dataDetail?.subscriptionStatus === 'FUTURE') &&
											checkAdmin &&
											!isOrderService && (
												<DeleteOutlined
													hidden={typeGeneral !== 'GENERATE' || item?.canNotDelete}
													onClick={() =>
														handleDeleteCoupon(index, item.id, item.couponCodeId)
													}
												/>
											)}
									</Col>
								</Row>
							))}
					</div>
				)}
				{CAN_UPDATE && typeGeneral === 'GENERATE' && !isOrderService && (
					<Row className="items-center mt-5 mb-3 pl-5">
						<ChoosePromotion
							pricingValue={pricingDetail}
							type={typeModal}
							priceValue={pricingDetail.price}
							onChange={changeCouponList}
							value={pricingDetail?.couponList}
							fnCall={fnCall}
							dataDetail={dataDetail}
							typeChange={typeChange}
							disabled={
								(checkPromotion &&
									((pricingInfo.couponList?.length > 0 &&
										pricingInfo.couponList[0].systemParamCoupon === 'ONCE') ||
										(coupons?.length > 0 && coupons[0].systemParamCoupon === 'ONCE')) &&
									totalCoupon?.length < 2) ||
								(typeModal === 'PRICING' &&
									disablePromotionPricing &&
									((listAddon?.length > 0 && listAddon[0].systemParamCoupon === 'ONCE') ||
										(coupons?.length > 0 && coupons[0].systemParamCoupon === 'ONCE')) &&
									totalCoupon.length < 2)
							}
							CAN_UPDATE={CAN_UPDATE}
							checkAdmin={checkAdmin}
							totalCoupon={totalCoupon}
						/>
						{typeModal !== 'ADDON' ? (
							<Row gutter={[8, 16]} className="items-center py-3">
								<Col span={4} />
								<Col span={16} className="font-semibold text-base">
									<div className="mr-2">
										<Input
											className="text-right"
											placeholder={tField('input_couponSet_code')}
											ref={couponSetCodePri}
											defaultValue=""
										/>
									</div>
								</Col>
								<Col span={2}>
									<Button
										className="items-center primary"
										onClick={() => handleOnClick(1)}
										disabled={
											(checkPromotion && pricingInfo.systemParam === 'ONCE') ||
											(typeModal === 'PRICING' &&
												disablePromotionPricing &&
												pricingInfo.systemParam === 'ONCE')
										}
										type="primary"
									>
										{tOthers('apply')}
									</Button>
								</Col>
							</Row>
						) : (
							<Row gutter={[8, 16]} className="items-center py-3">
								<Col span={4} />
								<Col span={16} className="font-semibold text-base">
									<div className="mr-2">
										<Input
											className="text-right"
											placeholder={tField('input_couponSet_code')}
											ref={couponSetCodeAddon}
											defaultValue=""
										/>
									</div>
								</Col>
								<Col span={2}>
									<Button
										className="items-center primary"
										onClick={() => handleOnClick(2)}
										disabled={
											(checkPromotion && pricingInfo.systemParam === 'ONCE') ||
											(typeModal === 'PRICING' &&
												disablePromotionPricing &&
												pricingInfo.systemParam === 'ONCE')
										}
										type="primary"
									>
										{tOthers('apply')}
									</Button>
								</Col>
							</Row>
						)}
					</Row>
				)}
				<div className="items-center beauty-scroll p-2 max-h-48 overflow-y-auto">
					{(typeModal !== 'ADDON' ? couponsPri : couponAdd)
						?.filter(
							(el) => totalAmountPreTax >= el.minimumAmount && addonsList.length + 1 >= (el.minimum || 0),
						)
						?.map((item, index) => (
							<Row gutter={[8, 16]} className="py-2" key={`${index + 1}`}>
								<Col span={7} className="pl-5">
									{item?.listPricing?.length > 0 || item?.pricing?.length > 0 ? (
										(item?.listProduct?.length > 0 ? item.listProduct : item?.pricing)?.map(
											(itemValue) => (
												<>
													<div className="font-semibold">
														Khuyến mại {itemValue.serviceName} -{' '}
														{itemValue.pricingName || itemValue.productName}
													</div>
												</>
											),
										)
									) : (
										<div className="font-semibold">Khuyến mại giảm {GetPriceCoupon(item)}</div>
									)}
								</Col>
								<Col span={4} />
								<Col span={4} className="text-right" />
								<Col span={haveTax ? 4 : 8} className="text-right mr-1">
									{(typeSupscrip === 'create' || dataDetail.subscriptionStatus === 'FUTURE') && (
										<>
											{!isNil(item.price)
												? DX.formatNumberCurrency(item.price)
												: `${
														item?.listProduct?.length > 0 || item?.pricing?.length > 0
															? ''
															: '0'
												  }`}
										</>
									)}
								</Col>
								{haveTax && <Col span={4} className="text-right" />}
								<Col span={1} />
							</Row>
						))}
				</div>
				{(typeSupscrip === 'create' || dataDetail.subscriptionStatus === 'FUTURE') && (
					<Row gutter={[8, 16]} className="items-center py-3">
						<Col span={7} className="font-semibold text-base">
							Thành tiền
						</Col>
						<Col span={4} />
						<Col span={4} />
						<Col span={haveTax ? 4 : 8} className="text-right" style={{ color: '#135EA8' }}>
							<div className="mr-2">{DX.formatNumberCurrency(pricingDetail.finalAmountPreTax)}</div>
						</Col>
						{haveTax && (
							<Col span={4} className="text-right" style={{ color: '#135EA8' }}>
								<div className="mr-2">{DX.formatNumberCurrency(pricingDetail.finalAmountAfterTax)}</div>
							</Col>
						)}
						<Col span={1} />
					</Row>
				)}
				<Row gutter={[8, 16]} className="items-center">
					<Col span={7}>
						<div className="font-semibold text-base">Phí thiết lập</div>
						<div className="text-gray-400 text-sm">
							{getTaxSetupFee(
								pricingDetail.setupFeeTax?.taxList ||
									pricingDetail.taxListSetupFee ||
									pricingDetail.setupFeeTaxList,
							)}
						</div>
					</Col>
					<Col span={4} className="text-right">
						{checkDisplayPriceSetupFee ? (
							<div className="pl-6 w-full">
								<InputAmountSubscription
									defaultValue={pricingDetail.setupFee?.price ?? pricingDetail.setupFee}
									handleChangeAmount={(setupFee) => changeInfoInput({ setupFee })}
									skipError="YES"
									formatCurrency="YES"
									canEdit={!CAN_UPDATE || !checkAdmin}
								/>
							</div>
						) : (
							<div style={{ color: '#135EA8' }}>
								{DX.formatNumberCurrency(pricingDetail.setupFee?.price ?? pricingDetail.setupFee)}
							</div>
						)}
					</Col>
					<Col span={4} />
					{!haveTax && <Col span={4} />}
					{haveTax && (
						<Col span={4} className="text-right text-base" style={{ color: '#135EA8' }}>
							{pricingDetail.setupFee?.price > 0
								? DX.formatNumberCurrency(pricingDetail.setupFee?.finalAmountPreTax)
								: '0'}
						</Col>
					)}

					<Col span={4} className="text-right text-base " style={{ color: '#135EA8' }}>
						{pricingDetail.setupFee?.price > 0 ? (
							<div className="mr-2">
								{DX.formatNumberCurrency(pricingDetail.setupFee?.finalAmountAfterTax)}
							</div>
						) : (
							<div className="mr-2">0</div>
						)}
					</Col>

					<Col span={4} />
					<Col span={1} />
				</Row>
			</div>

			{showCalculation && (
				<CaculatorPopup
					showCalculation={showCalculation}
					setCheckChangeInput={setCheckChangeInput}
					setCalculation={setCalculation}
					popupInfo={pricingDetail}
					typeModal={typeModal}
					setDataCalculator={(unit) => changeInFoCaculate({ unit })}
					// setPriceValue={(price) => changeInfoInput({ price })}
					setDataCalTier={setDataCalTier}
					dataPopupByType={dataPopupByType}
					setPriceValue={(priceValue) => changeInfoInput({ priceValue })}
					checkDisplayPrice={checkDisplayPrice}
				/>
			)}
		</div>
	);
}
export default ServiceDetail;
