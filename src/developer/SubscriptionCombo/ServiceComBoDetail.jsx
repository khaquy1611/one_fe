/* eslint-disable react-hooks/rules-of-hooks */
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';
import CaculatorPopup from 'app/components/Templates/Subscription/CaculatorPopup';
import ChoosePromotion from 'app/components/Templates/ComboSubscription/ChoosePromotion';
import ChooseCoupon from 'app/components/Templates/ComboSubscription/ChooseCoupon';
import InputAmountSubscription from 'app/components/Templates/Subscription/InputAmountSubscription';
import { useLng, useQueryUrl, useUser } from 'app/hooks';
import { DX, SMESubscription, SubscriptionDev } from 'app/models';
import { convertToNumber, formatNormalizeCurrency } from 'app/validator';
import { isEmpty, isNil, isNaN } from 'opLodash';
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import ListPromotion from 'app/components/Templates/Subscription/ListPromotion';
import { subSelects } from './redux/subscriptionReducer';
import CanNotAccessRoute from '../../app/permissions/CanNotAccessRoute';

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

// gói combo dịch vụ chính
const SUPSCRIPTION_PRICING = 'PRICING';
// gói combo dịch vụ bổ sung
const SUPSCRIPTION_ADDON = 'ADDON';

function GetCyclesPay(numberOfCycles, cycleType, taxList, hasTax, bonusType = 'PERIODIC') {
	if ((numberOfCycles && cycleType) || bonusType === 'ONCE') {
		return `${
			bonusType === 'ONCE' ? `Thanh toán một lần` : `Chu kỳ TT ${numberOfCycles} ${CYCLE_TYPE[cycleType]}`
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

function GetPriceCoupon(item) {
	const priceType = {
		PERCENT: '%',
		PRICE: ' VND',
	};

	if (item.promotionType === 'DISCOUNT' && item.discountType === 'PRICE') {
		return item.couponValue || item.discountValue
			? formatNormalizeCurrency(item.couponValue || item.discountValue) + priceType.PRICE
			: item.promotionValue;
	}

	if (item.promotionType === 'DISCOUNT' && item.discountType === 'PERCENT') {
		return item.couponValue || item.discountValue
			? (item.couponValue || item.discountValue) + priceType.PERCENT
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

function ServiceComboDetail({
	changeCouponList,
	pricingDetail = {},
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
	pricingInfo = {},
	typePortal,
	typeGeneral,
	coupons,
	checkAdmin,
	addonsList,
	indexAddonDis,
	handleDeleteCouponTotal,
	isOrderService,
	listUnitAddon,
	totalAmountPreTax,
	totalCoupon,
	handelAddCoupon,
	smeInfo,
	totalAmount,
}) {
	const couponsPricing = [
		typeModal !== 'ADDON' ? pricingDetail.invoiceCouponPercents : [],
		typeModal !== 'ADDON' ? pricingDetail.invoiceCouponPrices : [],
	].flat(2);
	const couponsAddon = [
		typeModal === 'ADDON' ? pricingDetail.invoiceCouponPercents : [],
		typeModal === 'ADDON' ? pricingDetail.invoiceCouponPrices : [],
	].flat(2);
	const couponsPri = [];
	const couponAdd = [];

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
	const [dataCalTier, setDataCalTier] = useState([]);
	const [unitFrom, setUniForm] = useState();
	const [priceValueFee, setPrice] = useState();
	const [checkChangeInput, setCheckChangeInput] = useState(false);
	const [showCalculation, setCalculation] = useState(false);
	const [disablePromotionPricing, setDisablePromotionPricing] = useState(false);
	const [disablePromotionAddon, setDisablePromotionAddon] = useState(false);
	const history = useHistory();
	const isCombo = history.location.pathname.indexOf('combo') !== -1;
	const listAddon = [];
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
	const isDisplayPrice =
		dataDetail.id &&
		(dataDetail.hasChangePrice === 'NO' ||
			dataDetail.allowPriceChange === 0 ||
			dataDetail.allowPriceChange === null);

	const changeQuan = {
		typeQuan: 'changeQuanlity',
		typeError: pricingDetail.hasChangeQuantity || pricingDetail.allowChangeQuantity,
		dataDetail: dataDetail.id,
	};
	const { id } = useParams();
	function checkDeleteAddon() {
		if (
			dataDetail.id &&
			dataDetail.status === 'ACTIVE' &&
			pricingDetail.isRequired === false &&
			pricingDetail.bonusType === 'PERIODIC' &&
			typeModal === 'ADDON'
		)
			return false;
		return true;
	}
	const isSetupFee = dataDetail && dataDetail.status === 'ACTIVE';
	const checkAddAddon =
		!dataDetail.status &&
		dataDetail.pricingPlan !== 'FLAT_RATE' &&
		pricingDetail.pricingPlan !== 'FLAT_RATE' &&
		typeGeneral === 'GENERATE' &&
		!isOrderService;
	const checkDisplayPrice =
		!dataDetail.id &&
		(pricingDetail.hasChangePrice === 'YES' || pricingDetail.allowPriceChange === 1) &&
		typeGeneral === 'GENERATE';

	const isEditForPlan =
		pricingDetail.pricingPlan === 'VOLUME' ||
		pricingDetail.pricingPlan === 'TIER' ||
		pricingDetail.pricingPlan === 'STAIR_STEP';
	const displayPriceText =
		pricingDetail.pricingPlan !== 'VOLUME' &&
		pricingDetail.pricingPlan !== 'TIER' &&
		pricingDetail.pricingPlan !== 'STAIR_STEP';
	const disPlayPrice =
		checkDisplayPrice ||
		(dataDetail.id &&
			!isDisplayPrice &&
			dataDetail.status !== 'CANCELED' &&
			(pricingDetail.hasChangePrice === 'YES' || pricingDetail.allowPriceChange === 1) &&
			typeGeneral === 'GENERATE' &&
			!isOrderService);

	const displayTxtSetupfee =
		((pricingDetail.hasChangePrice === 'YES' || pricingDetail.allowPriceChange === 1) &&
			pricingDetail.status !== 'NON_RENEWING' &&
			pricingDetail.status !== 'CANCELED' &&
			typeGeneral === 'GENERATE' &&
			typeModal !== 'PRICING' &&
			!isOrderService &&
			!pricingDetail.isOrigin) ||
		(typeSupscrip === 'create' && (pricingDetail.hasChangePrice === 'YES' || pricingDetail.allowPriceChange === 1));
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
	const indexCouponPri = [];
	const indexCouponAddon = [];
	const indexCouponDel = [];
	useEffect(() => {
		if (typeModal === 'PRICING' && isCombo) {
			pricingInfo.couponList
				?.filter((el) => !el.canNotDelete)
				?.forEach((coupon, index) => {
					if (totalAmountPreTax < coupon.minimumAmount || addonsList + 1 < (coupon.minimum || 0)) {
						indexCouponPri.push(index);
					}
				});
		}
		indexCouponPri.reverse().map((item) => handleDeleteCoupon(item));
		if (typeModal === 'ADDON' && isCombo) {
			pricingDetail.couponList
				?.filter((el) => !el.canNotDelete)
				?.forEach((coupon, index) => {
					if (totalAmountPreTax < coupon.minimumAmount || addonsList + 1 < (coupon.minimum || 0)) {
						indexCouponAddon.push(index);
					}
				});
		}
		indexCouponAddon.reverse().map((item) => handleDeleteCoupon(item));
		if (isCombo) {
			coupons
				?.filter((el) => !el.canNotDelete)
				?.forEach((coupon, indexCoupon) => {
					if (totalAmountPreTax < coupon.minimumAmount || addonsList + 1 < coupon.minimum) {
						indexCouponDel.push(indexCoupon);
					}
				});
		}
		indexCouponDel.reverse().map((item) => handleDeleteCouponTotal(item));
	}, [totalAmountPreTax]);

	function checkChangeQuanlity() {
		if (
			pricingDetail.pricingPlan !== 'FLAT_RATE' &&
			(pricingDetail.hasChangeQuantity
				? pricingDetail.hasChangeQuantity !== 'NONE'
				: pricingDetail.allowChangeQuantity?.length > 0 && pricingDetail.allowChangeQuantity[0] !== null)
		)
			return true;
		return false;
	}

	const haveTax = useSelector(subSelects.haveTax);
	function checkData() {
		if (checkChangeInput) return dataCalTier;
		return (
			pricingDetail.unit ||
			pricingDetail.unitLimitedList ||
			pricingDetail.listUnitLimited ||
			pricingDetail.addonUnitLimiteds
		);
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
						unitLimitedNews:
							pricingDetail.pricingPlan === 'TIER'
								? checkData().map((item) => ({
										unitFrom: item.unitFrom,
										unitTo: item.unitTo,
										price: item.unitPrice ?? item.price,
										quantity: item.quantity,
								  }))
								: pricingDetail.unit,
					},
					subscriptionId: typeSupscrip !== 'create' ? id : undefined,
				},
			);
			//	const dataUpdate = res?.filter((column) => column.amountBeforeTax !== 0);
			setDataCalculator(
				res?.map((item) => ({
					unitFrom: item.unitFrom,
					unitTo: item.unitTo,
					price: item.unitPrice,
				})),
				true,
			);
			setPriceValue(priceValueConvert(res, true));
			return addTotal(res);
		},
		{
			initialData: [],
			enabled:
				!isEmpty(pricingDetail) &&
				['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === pricingDetail.pricingPlan) &&
				pricingDetail.quantity > 0,
			keepPreviousData: true,
		},
	);

	if (isTrial || dataDetail.regType === 'TRIAL') {
		return (
			<div className="bg-white py-5 pl-5">
				<Row gutter={[8, 16]} className="">
					<Col span={7}>
						<div className="font-semibold color text-primary">{pricingDetail.comboName}</div>
						<div className="text-gray-400 text-sm">{pricingDetail.comboPlanName}</div>
					</Col>
				</Row>
				<Row gutter={[8, 16]}>
					<Col span={7} />
					<Col span={12}>
						{pricingDetail?.listPricing?.map((pricing) => (
							<div className="flex items-center mb-5">
								<Col span={12} className="text-right">
									<div className="text-sm">{pricing.serviceName}</div>
								</Col>
								<Col span={12} className="text-right">
									<div className="font-semibold">
										{pricing.quantity} {pricing.unitName}
									</div>
								</Col>
							</div>
						))}
					</Col>
				</Row>
			</div>
		);
	}

	return (
		<div className="bg-white">
			<div className="py-3 pl-5">
				<Row gutter={[8, 16]} className="text-base">
					<Col span={7}>
						<div className="font-semibold color text-primary">
							{pricingDetail.serviceName || pricingDetail.comboName || pricingDetail.objectName}
						</div>
						<div className="text-gray-400 text-sm">
							{pricingDetail.comboPlanName || pricingDetail.addonName || pricingDetail.name}
						</div>
						<div className="text-gray-400 text-sm">
							{GetCyclesPay(
								pricingDetail.paymentCycle || pricingDetail.bonusValue,
								pricingDetail.cycleType || pricingDetail.type,
								pricingDetail.taxList,
								pricingDetail.hasTax,
								pricingDetail.bonusType,
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
					<Col span={4} className="text-right text-base">
						{typeModal === 'ADDON' && (
							<div className="text-right pl-6 w-full">
								{disPlayPrice && !isEditForPlan ? (
									<InputAmountSubscription
										defaultValue={pricingDetail.price}
										handleChangeAmount={(price) => changeInfoInput({ price })}
										skipError="YES"
										//	disabled={isDisplayPrice}
										formatCurrency="YES"
										canEdit={!CAN_UPDATE || !checkAdmin}
									/>
								) : (
									<div className="py-2.5">
										{pricingDetail?.price && displayPriceText
											? DX.formatNumberCurrency(pricingDetail.price)
											: '--'}
									</div>
								)}
							</div>
						)}
					</Col>

					<Col span={4}>
						{typeModal === 'ADDON' && (
							<>
								{(checkChangeQuanlity() &&
									dataDetail.id &&
									dataDetail.status !== 'CANCELED' &&
									dataDetail.status === 'ACTIVE' &&
									dataDetail.status !== 'NON_RENEWING' &&
									typeGeneral === 'GENERATE' &&
									dataDetail.pricingPlan !== 'FLAT_RATE' &&
									typeModal === 'ADDON' &&
									!isOrderService) ||
								checkAddAddon ? (
									<InputAmountSubscription
										defaultValue={pricingDetail.quantity}
										handleChangeAmount={(quantity) => changeInfoInput({ quantity })}
										changeQuan={changeQuan}
										skipError="YES"
										typeMes="Vui lòng không để trống mục này"
										isQuantity
										dataOrigin={pricingDetail.originQuantity}
										className="text-right"
										preValue={pricingDetail.preQuantity}
										canEdit={!CAN_UPDATE || !checkAdmin}
									/>
								) : (
									<div className={`${!haveTax && 'text-center mr-7'} py-2.5 text-right`}>
										{dataDetail.id && pricingDetail.pricingPlan !== 'FLAT_RATE'
											? dataDetail?.addonsList[indexAddon]?.quantity
											: '--'}
									</div>
								)}
							</>
						)}
					</Col>

					{!haveTax && <Col span={4} />}
					<Col span={4} className="text-right text-base">
						{!isEditForPlan &&
						(pricingDetail.hasChangePrice === 'YES' || pricingDetail.allowPriceChange === 1) &&
						pricingDetail.status !== 'CANCELED' &&
						pricingDetail.status !== 'NON_RENEWING' &&
						pricingDetail.status !== 'ACTIVE' &&
						typeModal !== 'ADDON' &&
						typeGeneral === 'GENERATE' &&
						!isOrderService ? (
							<InputAmountSubscription
								defaultValue={pricingDetail.preAmountTax}
								handleChangeAmount={(price) => changeInfoInput({ price })}
								skipError="YES"
								//	disabled={isDisplayPrice}
								formatCurrency="YES"
								className="text-right"
								canEdit={!CAN_UPDATE || !checkAdmin}
							/>
						) : (
							<div className="py-2.5">{DX.formatNumberCurrency(pricingDetail.preAmountTax)}</div>
						)}
					</Col>
					{haveTax && <Col span={4} />}
					<Col span={1} className="text-center py-2.5">
						{checkDeleteAddon && checkAdmin && !isOrderService && (
							<DeleteOutlined
								hidden={pricingDetail.canNotDelete || allowDelete === 'YES' || !CAN_UPDATE}
								onClick={handleDelete}
							/>
						)}
					</Col>
				</Row>

				{!isEmpty(pricingDetail?.listPricing) &&
					pricingDetail.listPricing?.map((pricing) => (
						<Row className="flex items-center mb-3 mt-2">
							<Col span={7} className="text-left font-semibold pl-5">
								{pricing.serviceName || pricing.pricingName}
							</Col>
							<Col span={4} className="text-right px-1">
								{pricing.freeQuantity}
							</Col>
							<Col span={4} className="text-right px-1">
								{pricing.quantity} {pricing.unitName}
							</Col>
						</Row>
					))}
			</div>
			<hr className="my-0" style={{ borderTop: '1px solid #d9d9d9' }} />
			<div className="py-3">
				{!isEmpty(pricingDetail?.couponList) && (
					<div
						className="beauty-scroll p-2 mr-0.5 overflow-y-auto"
						style={{ height: pricingDetail.couponList.length > 3 ? '12rem' : '100%' }}
					>
						{pricingDetail.couponList
							?.filter(
								(el) =>
									totalAmountPreTax >= (el.minimumAmount || 0) &&
									addonsList.length + 1 >= (el.minimum || 0),
							)
							?.map((item, index) => (
								<Row gutter={[8, 16]} className="py-2 items-center text-base">
									<Col span={7}>
										<ListPromotion item={item} typeSupscrip={typeSupscrip} />
									</Col>
									<Col span={4} />
									<Col span={4} className="text-right" />
									<Col span={haveTax ? 4 : 8} className="text-right">
										{(typeSupscrip === 'create' || dataDetail.status === 'FUTURE') && (
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
									<Col span={1} className="text-center">
										{dataDetail?.status !== 'CANCELED' && checkAdmin && !isOrderService && (
											<DeleteOutlined
												onClick={() => handleDeleteCoupon(index, item.id)}
												hidden={!CAN_UPDATE || item.canNotDelete}
											/>
										)}
									</Col>
								</Row>
							))}
					</div>
				)}
				{typeGeneral === 'GENERATE' && (
					<Row className="items-center my-5 pl-10">
						<Col className="mr-2">
							<ChoosePromotion
								totalCoupon={totalCoupon}
								pricingValue={pricingDetail}
								type={typeModal}
								priceValue={pricingDetail.price}
								onChange={changeCouponList}
								value={pricingDetail?.couponList}
								fnCall={fnCall}
								typePortal={typePortal}
								dataDetail={dataDetail}
								CAN_UPDATE={CAN_UPDATE}
								checkAdmin={checkAdmin}
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
								isOrderService={isOrderService}
							/>
						</Col>

						<Col>
							<ChooseCoupon
								pricingDetail={pricingDetail}
								smeInfo={smeInfo}
								price={totalAmount}
								quanlity={addonsList.length + 1}
								couponType={typeModal === SUPSCRIPTION_PRICING ? '3' : '2'}
								changeCouponList={changeCouponList}
								handelAddCoupon={handelAddCoupon}
							></ChooseCoupon>
						</Col>
					</Row>
				)}
				<hr className="m-0" style={{ borderTop: '1px solid #d9d9d9' }} />
				<div className="items-center beauty-scroll p-2 pl-5 max-h-48 overflow-y-auto">
					{(typeModal !== 'ADDON' ? couponsPri : couponAdd)
						?.filter(
							(el) => totalAmountPreTax >= el.minimumAmount && addonsList.length + 1 >= (el.minimum || 0),
						)
						?.map((item, index) => (
							<Row gutter={[8, 16]} className="" key={`${index + 1}`}>
								<Col span={7} className="pl-5">
									{item?.listProduct?.length > 0 || item?.pricing?.length > 0 ? (
										item[`${typeSupscrip === 'detail' ? 'pricing' : 'listProduct'}`]?.map(
											(itemValue) => (
												<>
													<div className="font-semibold">{itemValue.pricingName}</div>
													<div className="text-gray-400 text-sm">(Khuyến mại)</div>
												</>
											),
										)
									) : (
										<div className="font-semibold">Khuyến mại giảm {GetPriceCoupon(item)}</div>
									)}
								</Col>
								<Col span={4} />
								<Col span={4} className="text-right" />
								<Col span={haveTax ? 4 : 8} className="text-right">
									{(typeSupscrip === 'create' || dataDetail.status === 'FUTURE') && (
										<>
											{!isNil(item.price)
												? DX.formatNumberCurrency(item.price)
												: `${
														item?.listProduct?.length > 0 || item?.pricing?.length > 0
															? ''
															: '0'
												  }`}{' '}
										</>
									)}
								</Col>
								{haveTax && <Col span={4} className="text-right" />}
								<Col span={1} />
							</Row>
						))}
				</div>
				{(typeSupscrip === 'create' || dataDetail.status === 'FUTURE') && (
					<div className="py-3 pl-5">
						<Row gutter={[8, 16]} className="items-center">
							<Col span={7} className="font-semibold text-base">
								Thành tiền
							</Col>
							<Col span={4} />
							<Col span={4} />
							<Col
								span={haveTax ? 4 : 8}
								className={`text-right ${!haveTax && 'mr-2'}`}
								style={{ color: '#135EA8' }}
							>
								{DX.formatNumberCurrency(pricingDetail.finalAmountPreTax)}
							</Col>
							{haveTax && (
								<Col
									span={4}
									className={`text-right ${!haveTax && 'mr-2'}`}
									style={{ color: '#135EA8' }}
								>
									{DX.formatNumberCurrency(pricingDetail.finalAmountAfterTax)}
								</Col>
							)}
							<Col span={1} />
						</Row>
					</div>
				)}
				<div className="pl-5 pb-3 text-base">
					<Row gutter={[8, 16]} className="items-center">
						<Col span={7} className="font-semibold">
							Phí thiết lập
						</Col>
						<Col span={4} className={`text-right ${!haveTax && 'mr-2'}`} />
						<Col span={4} />
						{!haveTax && <Col span={4} />}
						<Col span={4}>
							{displayTxtSetupfee ? (
								<InputAmountSubscription
									defaultValue={pricingDetail.setupFee?.price ?? pricingDetail.setupFee}
									handleChangeAmount={(setupFee) => changeInfoInput({ setupFee })}
									skipError="YES"
									//	disabled={isDisplayPrice}
									formatCurrency="YES"
									className="text-right"
									canEdit={!CAN_UPDATE || !checkAdmin}
								/>
							) : (
								<div className="text-right" style={{ color: '#135EA8' }}>
									{DX.formatNumberCurrency(pricingDetail.setupFee?.finalAmountPreTax)}
								</div>
							)}
						</Col>
						{haveTax && (
							<Col span={4} className="text-right" style={{ color: '#135EA8' }}>
								{DX.formatNumberCurrency(pricingDetail.setupFee?.finalAmountAfterTax)}
							</Col>
						)}
						<Col span={1} />
					</Row>
				</div>
			</div>
			{showCalculation && (
				<CaculatorPopup
					showCalculation={showCalculation}
					setCalculation={setCalculation}
					popupInfo={pricingDetail}
					typeModal={typeModal}
					setDataCalculator={(unit) => changeInFoCaculate({ unit })}
					setPriceValue={(price) => changeInfoInput({ price })}
					dataPopupByType={dataPopupByType}
					setUniForm={setUniForm}
					setPrice={setPrice}
					setCheckChangeInput={setCheckChangeInput}
					setDataCalTier={setDataCalTier}
					checkDisplayPrice={disPlayPrice}
				/>
			)}
		</div>
	);
}
export default ServiceComboDetail;
