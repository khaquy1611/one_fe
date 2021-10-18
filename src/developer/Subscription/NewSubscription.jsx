/* eslint-disable react-hooks/rules-of-hooks */
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Select, Tooltip } from 'antd';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import {
	ChooseAccountSme,
	ChooseAddon,
	ChoosePricing,
	ChoosePromotion,
	ExtraFree,
} from 'app/components/Templates/Subscription';
import ConfirmModal from 'app/components/Templates/Subscription/ConFirmModal';
import FormInput from 'app/components/Templates/Subscription/FormInput';
import ListPromotion from 'app/components/Templates/Subscription/ListPromotion';
import { useLng, useNavigation, useQueryUrl, useUser } from 'app/hooks';
import { CouponSetItem, DX, SubscriptionDev } from 'app/models';
import CanNotAccessRoute from 'app/permissions/CanNotAccessRoute';
import { validateRequireInput } from 'app/validator';
import moment from 'moment';
import { toLower, isEmpty, uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { PreOrderItem } from 'sme/Billing/components';
import { subSelects } from './redux/subscriptionReducer';
import ServiceDetail from './ServiceDetail';
import CostIncurredBox from './SubscriptionDetail/CostIncurredBox';

const CYCLE_TYPE_TEXT = {
	DAILY: 'DAILY',
	WEEKLY: 'WEEKLY',
	MONTHLY: 'MONTHLY',
	YEARLY: 'YEARLY',
};

const SUPSCRIPTION_PRICING = 'PRICING';
const SUPSCRIPTION_ADDON = 'ADDON';

const total = (type, dataInit = []) =>
	dataInit?.map((item) => item[type])?.reduce((accumulator, currentValue) => accumulator + (currentValue || 0));

function NewSubscription({
	loading,
	typeSupscrip,
	breadcrumbs,
	modRegister,
	form,
	onFinish,
	changeInfoSub,
	typePortal,
	serviceId,
	formValue,
	isTrial,
	pricingInfo,
	changeInfoPricing,
	changeInfoPricingByCode,
	totalAmountPreTax,
	addonsList,
	changeInfoCaculate,
	handleDeleteCouponPricing,
	changeInfoPrice,
	changeAddonList,
	changeInfoAddon,
	handleDeleteCouponAddon,
	handleDeleteAddon,
	extraFee,
	handleDeleteExtraFee,
	coupons = [],
	handleDeleteCoupon,
	changeCoupon,
	totalAmountPreTaxFinal,
	addExtraFee,
	totalAmountAfterTaxFinal,
	countCal,
	dataDetail,
	disableSmeAccount,
	typeChange,
	setPeriodIdPricing,
	periodIdPricing,
	typeGeneral = 'GENERATE',
	couponList: couponDetail,
	listUnitAddon,
	setListAddonId,
	previewCost,
	isFetching,
	checkAdmin = true,
	isOrderService,
	setValueAddon,
	smeInFor,
	couponSetCodeIdList,
	handleSetCouponSetCode,
}) {
	const { tButton, tField, tOthers, tMessage } = useLng();
	const [isDirty, setDirty] = useState(false);
	const query = useQueryUrl();
	const { user } = useUser();
	let CAN_UPDATE =
		((typePortal === 'DEV' && DX.canAccessFuture2('dev/update-subscription', user.permissions)) ||
			(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/update-subscription', user.permissions))) &&
		!isOrderService;
	const CAN_CREATE_TRIAL =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-trial-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-trial-subscription-combo', user.permissions));

	const CAN_CREATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));
	if (typeSupscrip === 'create') {
		CAN_UPDATE = true;
	}
	const CAN_CHANGE_PACAGE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/change-combo-pack', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/change-combo-pack', user.permissions));
	const [dataPopupCost, setDataPopupCost] = useState();
	useEffect(() => {
		setDataPopupCost(previewCost);
	}, [previewCost]);
	const checkLengthAddon = addonsList.length !== dataDetail?.addonsList?.length;
	const serviceIdIn = query.get('serviceIdIn');
	const subscriptionId = query.get('subscriptionId');
	const { goBack } = useNavigation();
	const haveTax = useSelector(subSelects.haveTax);
	const [disablePromotionTotal, setDisablePromotionTotal] = useState(false);
	const [isDisplayTime, setIsDisplayTime] = useState(true);
	const checkVisible = serviceIdIn !== null && subscriptionId !== null;
	const [indexAddonDis, setIndexAddonDis] = useState(false);
	const [showPreviewCost, setShowPreviewCost] = useState(false);
	const changeSubscription = query.get('change-subscription');
	const checkChangeSub = changeSubscription === 'true';

	const [paymentType, setPaymentType] = useState(
		checkChangeSub ? pricingInfo.changePricing : pricingInfo.changeSubscription,
	);
	useEffect(() => {
		setPaymentType(checkChangeSub ? pricingInfo.changePricing : pricingInfo.changeSubscription);
	}, [pricingInfo]);
	const [changeNumberOfCycle, setChangeNumber] = useState(false);
	const [preOrder, setPreOrder] = useState({
		loading: true,
	});
	let numberNotExist = 0;
	function handleUpdateUnitAddon(value) {
		const addonNew = [];
		value.forEach((addons) => {
			if (addonsList.length > 0) {
				addonsList.forEach((addonExist) => {
					if (addons.id !== (addonExist.id || -1) && addons.pricingPlan === 'TIER') {
						numberNotExist += 1;
					}
				});
			}
			if (addonsList.length === 0 && addons.pricingPlan === 'TIER') {
				addonNew.push(addons.id);
			}
			if (numberNotExist === addonsList?.length && addonsList.length > 0) {
				addonNew.push(addons.id);
				numberNotExist = 0;
			} else numberNotExist = 0;
		});
		setValueAddon(value);
		setListAddonId(_uniqBy(addonNew));
		if (addonNew.length === 0) changeAddonList(value);
	}

	const disableStartAt =
		dataDetail?.subscriptionStatus === 'CANCELLED' ||
		(!isDisplayTime && typeChange !== 'changeSubscription' && !dataDetail);
	const checkPromotion = dataPopupCost?.costIncurred?.costIncurred?.length === 0;
	const checkNumberCycle =
		(pricingInfo.numberOfCycles !== null && pricingInfo.numberOfCycles > 0 ? pricingInfo.numberOfCycles : '') !==
			form.getFieldValue('numberOfCycles') || changeNumberOfCycle;
	const [errorQuanlity, setErrorQuanlity] = useState(false);
	const [confirmModal, setConFirmModal] = useState(false);
	const checkDisplayProAndExtre = CAN_UPDATE && typeGeneral === 'GENERATE' && checkAdmin;
	const numberOfCycles = pricingInfo.numberOfCycles > 0 ? pricingInfo.numberOfCycles : '';
	const changePricing = query.get('changePricing');
	const toTalCostInfo =
		isTrial ||
		!serviceId ||
		pricingInfo.regType === 'TRIAL' ||
		((dataDetail.subscriptionStatus === 'CANCELLED' ||
			dataDetail.subscriptionStatus === 'NON_RENEWING' ||
			(dataDetail.subscriptionStatus === 'ACTIVE' && !checkDisplayProAndExtre)) &&
			coupons.length === 0 &&
			extraFee.length === 0);
	const listAddon = [];
	addonsList?.map((addon) =>
		addon.couponList?.map((addons) =>
			listAddon.push({
				...addons,
			}),
		),
	);
	const disableTimeTrial =
		(isDisplayTime && dataDetail.subscriptionStatus === 'IN_TRIAL') ||
		(dataDetail?.regType === 'TRIAL' && dataDetail.subscriptionStatus !== 'IN_TRIAL') ||
		!checkAdmin ||
		isOrderService;

	const { Option } = Select;
	const selectAfter = (
		<Form.Item name="trialType" className="mb-0">
			<Select
				defaultValue={typeSupscrip !== 'create' ? pricingInfo.cycleType : 'DAILY'}
				disabled={disableTimeTrial}
				className="select-after"
			>
				<Option value="DAILY">Ngày</Option>
				<Option value="WEEKLY">Tuần</Option>
				<Option value="MONTHLY">Tháng</Option>
				<Option value="YEARLY">Năm</Option>
			</Select>
		</Form.Item>
	);
	const totalChange =
		dataPopupCost?.costIncurred?.costIncurred?.length > 0 &&
		total('finalAmountPreTax', dataPopupCost?.costIncurred?.costIncurred);

	const displayChange =
		!checkChangeSub &&
		paymentType === 'NOW' &&
		(!checkPromotion ||
			(checkPromotion && (checkNumberCycle || (checkLengthAddon && (!totalChange || totalChange === 0)))));

	useEffect(() => {
		if (listAddon.length > 0 || pricingInfo.couponList?.length > 0) {
			setDisablePromotionTotal(true);
		} else {
			setDisablePromotionTotal(false);
		}
	}, [listAddon, pricingInfo.couponList]);

	useEffect(() => {
		addonsList.map((addons, index) => addons.couponList?.length > 0 && setIndexAddonDis(index));
	}, [addonsList]);
	useEffect(() => {
		if (countCal > (pricingInfo.numberCount || 0)) {
			setDirty(true);
		} else setDirty(false);
	}, [countCal]);

	function checkPricePro(value) {
		const dataPrice = DX.formatNumberCurrency(value);
		const arr = dataPrice && dataPrice?.replace(/\|/g, ',').replaceAll('.', '');
		return Number.parseInt(arr, 10);
	}

	const listAddonCoupon = [];
	addonsList?.map((addon) =>
		addon.couponList?.map((addons) =>
			listAddonCoupon.push({
				...addons,
			}),
		),
	);
	const totalCoupon = [listAddonCoupon, coupons, pricingInfo.couponList || pricingInfo.coupons].flat();

	useEffect(() => {
		if (pricingInfo.isInit) {
			form.setFieldsValue({
				smeInfo: formValue.smeInfo,
				paymentCycleText: formValue.paymentCycleText,
				startChargeAt: moment.isMoment(formValue.startChargeAt)
					? formValue.startChargeAt.format('DD/MM/YYYY')
					: formValue.startChargeAt,
				startChargeAtIn: moment().format('DD/MM/YYYY'),
				startedAtModInput: moment.isMoment(formValue.startedAt)
					? moment(formValue.startedAt).format('DD/MM/YYYY')
					: formValue.startedAt,
				numberOfTrial: numberOfCycles,
				numberOfCycles,
				startedAt: formValue.startedAt && moment(formValue.startedAt, 'DD/MM/YYYY'),
				tin: formValue.smeInfo[0]?.tin,
				address: formValue.smeInfo[0]?.address,
				customer: formValue.smeInfo[0]?.customer,
			});
			setIsDisplayTime(
				(formValue.startedAt ? moment(formValue.startedAt, 'DD/MM/YYYY').isBefore(moment()) : true) ||
					dataDetail?.subscriptionStatus === 'FUTURE',
			);
		}
	}, [pricingInfo.isInit]);
	useEffect(() => {
		if (serviceIdIn && smeInFor) {
			form.setFieldsValue({
				smeInfo: [{ id: smeInFor.smeId, companyName: smeInFor.smeName }],
				tin: smeInFor.smeTaxCode,
				address: smeInFor.smeProvince,
				customer: smeInFor.smeFullName,
			});
		}
	}, [serviceIdIn, smeInFor]);

	useEffect(() => {
		if (!isEmpty(pricingInfo.urlPreOrder)) setPreOrder({ urlPreOrder: pricingInfo.urlPreOrder[0].url });
	}, [pricingInfo.urlPreOrder]);

	function getNextDate(_startedAt) {
		const startedAt = moment(_startedAt);
		if (pricingInfo?.cycleType === CYCLE_TYPE_TEXT.DAILY) {
			return startedAt.add(pricingInfo.paymentCycle, 'days');
		}
		if (pricingInfo?.cycleType === CYCLE_TYPE_TEXT.WEEKLY) {
			return startedAt.add(pricingInfo.paymentCycle * 7, 'days');
		}
		if (pricingInfo?.cycleType === CYCLE_TYPE_TEXT.MONTHLY) {
			return startedAt.add(pricingInfo.paymentCycle, 'months');
		}
		return startedAt.add(pricingInfo.paymentCycle, 'years');
	}

	const checkValueChange = (valueChange) => {
		if (valueChange?.startedAt) {
			form.setFieldsValue({
				startChargeAt:
					pricingInfo.pricingType === 'POSTPAID'
						? getNextDate(valueChange?.startedAt).format('DD/MM/YYYY')
						: moment(valueChange?.startedAt).format('DD/MM/YYYY'),
			});
		}
		if (valueChange?.paymentType) {
			setPaymentType(valueChange?.paymentType);
		}
		if (valueChange?.numberOfCycles) {
			setChangeNumber(true);
		}
		if (valueChange.smeInfo) {
			form.setFieldsValue({
				tin: valueChange?.smeInfo[0]?.tin,
				address: valueChange?.smeInfo[0]?.provinceName,
				customer: valueChange?.smeInfo[0]?.adminName,
			});
		}

		if (valueChange.pricingValue) {
			setPeriodIdPricing(valueChange.pricingValue[0].periodId);
		}
	};
	if (
		checkChangeSub &&
		!CAN_CHANGE_PACAGE &&
		!checkChangeSub &&
		typeSupscrip === 'create' &&
		((isTrial && !CAN_CREATE_TRIAL) || (!isTrial && !CAN_CREATE))
	) {
		return <CanNotAccessRoute />;
	}
	const couponSetCodeTotal = useRef(null);
	function handleCheckCode(pricingId, addonIds, code, type, price, portalType) {
		const companyId = formValue.smeInfo[0].id;
		const quanlity = addonsList.length + 1;
		CouponSetItem.check({ pricingId, addonIds, code, type, companyId, price, quanlity, portalType })
			.then((data) => {
				if (data === null) {
					message.error('err_check_coupon_code');
				}
				if (couponSetCodeIdList.includes(data.id)) {
					message.error(tMessage('err_check_coupon_code_is_use'));
				}
				handleSetCouponSetCode(data.id, data.couponId);
				data.couponCodeId = data.id;
				data.id = data.couponId;
				changeInfoPricingByCode([data], 3);
			})
			.catch((err) => {
				console.error(err);
				message.error(tMessage('occurredErr'));
			});
	}
	const handleOnClick = () => {
		const code = couponSetCodeTotal.current?.input?.defaultValue;
		const addId = [];
		for (let i = 0; i < addonsList.length; i++) {
			addId.push(addonsList[i].id);
		}
		handleCheckCode(pricingInfo.id, addId.join(), code, 4, checkPricePro(totalAmountPreTax), 'DEV');
	};
	return (
		<div className="pb-8">
			<div>
				{typeSupscrip === 'create' && (
					<>
						<UrlBreadcrumb breadcrumbs={breadcrumbs} />
						<h1 className="font-semibold text-xl mt-2">
							{typeChange === '' &&
								serviceIdIn === null &&
								subscriptionId === null &&
								`Tạo thuê bao ${modRegister !== null ? 'dùng thử' : ''}`}
							{typeChange === 'changeSubscription' && `Đổi gói dịch vụ`}
							{serviceIdIn !== null && subscriptionId !== null && `Đăng ký thuê bao chính thức`}
						</h1>
					</>
				)}
			</div>

			<Form
				form={form}
				autoComplete="off"
				onFinish={onFinish}
				onValuesChange={(update) => {
					checkValueChange(update);
					changeInfoSub(update);
					!isDirty && setDirty(true);
				}}
				layout="vertical"
			>
				{typeGeneral === 'GENERATE' && (
					<>
						<Row className="mt-5 mb-5" gutter={[16, 16]}>
							<Col span={16}>
								<div className="font-semibold text-xl">Thông tin khách hàng</div>
							</Col>
						</Row>
						<Row className="mt-8 mb-5" gutter={[16, 16]}>
							<Col span={6}>
								<Form.Item
									name="smeInfo"
									label="Tên doanh nghiệp:"
									rules={[validateRequireInput()]}
									className="ml-5"
								>
									<ChooseAccountSme
										dataDetail={dataDetail}
										disableSmeAccount={disableSmeAccount}
										typePortal={typePortal}
									/>
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item name="tin" label="Mã số thuế">
									<Input readOnly />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item name="address" label="Tỉnh thành">
									<Input readOnly />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item name="customer" label="Người đại diện">
									<Input readOnly />
								</Form.Item>
							</Col>
						</Row>

						<Row className="mt-11" gutter={[8, 16]}>
							<Col span={16} className="font-semibold text-xl">
								Thông tin gói dịch vụ
							</Col>
						</Row>
					</>
				)}
				<div className="my-8 px-6 text-base" style={{ backgroundColor: '#FAFAFA' }}>
					<div className="flex items-center py-6">
						<div className="font-semibold mr-4">
							<span className="text-red-500">*</span> Gói dịch vụ chính
						</div>
						{((isDisplayTime && dataDetail.subscriptionStatus !== 'IN_TRIAL') ||
							typeChange === 'changeSubscription' ||
							(!isDisplayTime && dataDetail.subscriptionStatus === 'IN_TRIAL') ||
							!!serviceIdIn) && (
							<Form.Item name="pricingValue" noStyle>
								<ChoosePricing
									typePortal={typePortal}
									isHaveService={serviceId}
									formValue={formValue?.smeInfo}
									dataDetail={dataDetail}
									typeChange={typeChange}
									CAN_UPDATE={CAN_UPDATE}
									checkChangeSub={checkChangeSub}
									checkAdmin={checkAdmin}
									isOrderService={isOrderService}
									type={serviceIdIn !== null ? 'CHANGE_SUB' : ''}
									pricingInfo={pricingInfo}
								/>
							</Form.Item>
						)}
					</div>
					{serviceId && (
						<>
							<Row
								className="font-semibold py-5 pl-5 text-base"
								style={{ backgroundColor: '#F0F0F0' }}
								gutter={[8, 16]}
							>
								<Col span={7}>Danh mục</Col>
								{!isTrial && dataDetail.regType !== 'TRIAL' && (
									<>
										<Col span={4} className="text-right">
											{/* Đơn giá({pricingInfo.currencyName}) */}
											Đơn giá (VND)
										</Col>
										<Col span={4} className="text-right">
											Số lượng
										</Col>
										<Col hidden={!haveTax} span={4} className="text-right">
											{/* Số tiền trước thuế({pricingInfo.currencyName}) */}
											Số tiền trước thuế (VND)
										</Col>
										<Col hidden={!haveTax} span={4} className="text-right">
											{/* Số tiền sau thuế({pricingInfo.currencyName}) */}
											Số tiền sau thuế (VND)
										</Col>
										<Col hidden={haveTax} span={8} className="text-right">
											{/* Thành tiền({pricingInfo.currencyName}) */}
											Thành tiền (VND)
										</Col>
										<Col span={1} />
									</>
								)}
							</Row>
						</>
					)}

					{!!serviceId && (
						<ServiceDetail
							totalCoupon={totalCoupon}
							isOrderService={isOrderService}
							pricingDetail={pricingInfo}
							typeModal={SUPSCRIPTION_PRICING}
							typeSupscrip={typeSupscrip}
							changeInfoInput={changeInfoPricing}
							changeInfoPricingByCode={changeInfoPricingByCode}
							changeCouponList={(couponList) => changeInfoPricing({ couponList })}
							couponList={pricingInfo.couponList}
							totalAmount={checkPricePro(totalAmountPreTax)}
							quanlity={addonsList.length + 1}
							fnCall={(params) =>
								SubscriptionDev.getPromotionpopup(
									toLower(SUPSCRIPTION_PRICING),
									formValue.smeInfo[0].id,
									pricingInfo.pricingId,
									// typeSupscrip !== 'create' && dataDetail.subscriptionStatus === 'ACTIVE'
									// 	? pricingInfo.couponList
									// 			?.filter((el) => el.canNotDelete)
									// 			?.map((el) => el.couponId || el.id) || []
									// 	: [],
									typePortal,
									checkPricePro(totalAmountPreTax),
									addonsList.length + 1,
									params,
								)
							}
							isTrial={isTrial}
							totalAmountPreTax={totalAmountPreTax}
							addonsList={addonsList}
							changeInFoCaculate={changeInfoCaculate}
							handleDeleteCoupon={handleDeleteCouponPricing}
							setDataCalculator={(unit, noNeedCalculate) => changeInfoCaculate({ unit, noNeedCalculate })}
							allowDelete="YES"
							changeInfoPrice={changeInfoPrice}
							setPriceValue={(priceValue, noNeedCalculate) =>
								changeInfoPrice({ priceValue, noNeedCalculate })
							}
							dataDetail={dataDetail}
							typeChange={typeChange}
							typePortal={typePortal}
							coupons={coupons}
							indexAddonDis={indexAddonDis}
							typeGeneral={typeGeneral}
							pricingInfo={pricingInfo}
							checkAdmin={checkAdmin}
							setErrorQuanlity={setErrorQuanlity}
							totalAmountAfterTaxFinal={totalAmountAfterTaxFinal}
							handleDeleteCouponTotal={handleDeleteCoupon}
							listUnitAddon={listUnitAddon}
							couponSetCodeIdList={couponSetCodeIdList}
							setCouponSetCodeList={handleSetCouponSetCode}
							periodIdPricing={periodIdPricing}
						/>
					)}
					{!isTrial && serviceId && dataDetail.regType !== 'TRIAL' && (
						<div className="pb-3 text-base">
							<Row gutter={[8, 16]}>
								<Col span={12} className="flex items-center my-6">
									<div className="font-semibold items-center">Gói dịch vụ bổ sung</div>
									{typeGeneral === 'GENERATE' && (
										<ChooseAddon
											typePortal={typePortal}
											addonsList={addonsList}
											onChange={(value) => {
												handleUpdateUnitAddon(value);
											}}
											dataDetail={dataDetail}
											pricingInfo={pricingInfo}
											CAN_UPDATE={CAN_UPDATE}
											checkAdmin={checkAdmin}
											typeSupscrip={typeSupscrip}
											value={addonsList}
											isOrderService={isOrderService}
											periodIdPricing={periodIdPricing}
										/>
									)}
								</Col>
							</Row>

							<div
								className="overflow-y-auto overflow-x-hidden beauty-scroll"
								style={{
									maxHeight: addonsList?.length > 3 ? 800 : '100%',
								}}
							>
								{addonsList?.map((item, index) => (
									<Form.Item name="addon" key={`${index + 1}-addon`}>
										<ServiceDetail
											totalCoupon={totalCoupon}
											isOrderService={isOrderService}
											className="bg-white"
											periodIdPricing={periodIdPricing}
											pricingDetail={item}
											indexAddon={index}
											changeInfoInput={(update) => changeInfoAddon(update, index)}
											changeCouponList={(couponList) => changeInfoAddon({ couponList }, index)}
											couponList={pricingInfo.couponList}
											typeModal={SUPSCRIPTION_ADDON}
											companyId={formValue.smeInfo[0].id}
											totalAmount={checkPricePro(totalAmountPreTax)}
											quanlity={addonsList.length + 1}
											fnCall={(params) =>
												SubscriptionDev.getPromotionpopup(
													toLower(SUPSCRIPTION_ADDON),
													formValue.smeInfo[0].id,
													item.id,
													// typeSupscrip !== 'create' &&
													// 	dataDetail.subscriptionStatus === 'ACTIVE'
													// 	? item.couponList
													// 			?.filter((el) => el.canNotDelete)
													// 			?.map((el) => el.couponId || el.id) || []
													// 	: [],
													typePortal,
													checkPricePro(totalAmountPreTax),
													addonsList.length + 1,
													params,
												)
											}
											handleDeleteCoupon={(indexCoupon, couponId, couponItemId) =>
												handleDeleteCouponAddon(index, indexCoupon, couponId, couponItemId)
											}
											changeInfoPrice={changeInfoPrice}
											handleDelete={() => handleDeleteAddon(index)}
											changeInFoCaculate={(update) => changeInfoAddon(update, index)}
											setDataCalculator={(unit, noNeedCalculate) =>
												changeInfoAddon({ unit }, index, noNeedCalculate)
											}
											setPriceValue={(priceValue, noNeedCalculate) =>
												changeInfoAddon({ priceValue }, index, noNeedCalculate)
											}
											allowDelete="NO"
											dataDetail={dataDetail}
											typeSupscrip={typeSupscrip}
											typeChange={typeChange}
											pricingInfo={pricingInfo}
											typePortal={typePortal}
											coupons={coupons}
											addonsList={addonsList}
											indexAddonDis={indexAddonDis}
											typeGeneral={typeGeneral}
											checkAdmin={checkAdmin}
											setErrorQuanlity={setErrorQuanlity}
											totalAmountPreTax={totalAmountPreTax}
											handleDeleteCouponTotal={handleDeleteCoupon}
											listUnitAddon={listUnitAddon}
											couponSetCodeIdList={couponSetCodeIdList}
											setCouponSetCodeList={handleSetCouponSetCode}
											changeInfoPricingByCode={changeInfoPricingByCode}
										/>
									</Form.Item>
								))}
							</div>
						</div>
					)}
					<div className={isTrial && serviceId ? 'pb-3' : ''} />
				</div>
				{typeGeneral === 'GENERATE' && (
					<>
						<div hidden={toTalCostInfo}>
							<Row className="mt-11" gutter={[8, 16]}>
								<Col span={16}>
									<div className="font-semibold text-xl">Thông tin tổng chi phí</div>
								</Col>
							</Row>

							<div className="mt-11 p-6 text-base" style={{ backgroundColor: '#FAFAFA' }}>
								<div className="bg-white pl-4 text-base">
									{extraFee?.map((extra, index) => (
										<Row className="items-center py-2" key={`${index + 1}-exFee`}>
											<Col span={15}>
												<span className="mr-2">{extra.name}</span>
												{extra.description && (
													<Tooltip title={extra.description}>
														<InfoCircleOutlined />
													</Tooltip>
												)}
											</Col>
											<Col span={haveTax ? 4 : 8} className="text-right">
												<div style={{ marginRight: '5px', color: '#135EA8' }}>
													{DX.formatNumberCurrency(extra.feeAmount || extra.price)}
												</div>
											</Col>

											{haveTax && (
												<Col span={4} className="text-right">
													<div style={{ marginRight: '5px', color: '#135EA8' }}>
														{DX.formatNumberCurrency(extra.feeAmount || extra.price)}
													</div>
												</Col>
											)}
											<Col span={1}>
												<div className="text-center">
													{((extra?.canNotDelete !== true &&
														dataDetail.subscriptionStatus !== 'CANCELLED') ||
														dataDetail.subscriptionStatus === 'FUTURE') &&
														CAN_UPDATE &&
														!isOrderService &&
														checkAdmin &&
														!isOrderService && (
															<DeleteOutlined
																hidden={
																	typeGeneral !== 'GENERATE' || extra.canNotDelete
																}
																onClick={() => handleDeleteExtraFee(index)}
															/>
														)}
												</div>
											</Col>
										</Row>
									))}
									{coupons
										?.filter(
											(el) =>
												totalAmountPreTax >= el.minimumAmount &&
												addonsList.length + 1 >= (el.minimum || 0),
										)
										?.map((coupon, index) => (
											<Row
												className="items-center beauty-scroll py-2 overflow-y-auto overflow-x-hidden max-h-48"
												key={`${index + 1}-coupon`}
											>
												<Col span={15}>
													<ListPromotion
														item={coupon}
														typeSupscrip={typeSupscrip}
														type="TOTAL"
													/>
												</Col>
												<Col span={haveTax ? 4 : 8} />

												{haveTax && <Col span={4} />}
												<Col span={1}>
													<div className="text-center">
														{((coupon?.canNotDelete !== true &&
															dataDetail.subscriptionStatus !== 'CANCELLED') ||
															dataDetail.subscriptionStatus === 'FUTURE') &&
															CAN_UPDATE &&
															!isOrderService &&
															checkAdmin && (
																<DeleteOutlined
																	hidden={
																		typeGeneral !== 'GENERATE' ||
																		coupon.canNotDelete
																	}
																	onClick={() =>
																		handleDeleteCoupon(
																			index,
																			coupon.id,
																			coupon.couponCodeId,
																		)
																	}
																/>
															)}
													</div>
												</Col>
											</Row>
										))}

									<div className="flex pt-2 pb-4">
										{CAN_UPDATE && typeGeneral === 'GENERATE' && checkAdmin && (
											<>
												<ChoosePromotion
													typeChange={typeChange}
													typePortal={typePortal}
													type="pricing"
													//	pricingValue={formValue}
													typePromotion="TOTAL"
													fnCall={(params) =>
														SubscriptionDev.getPromotionTotal(
															formValue.smeInfo[0].id,
															pricingInfo.pricingId,
															addonsList?.map((a) => a.id),
															// typeSupscrip !== 'create' &&
															// 	dataDetail.subscriptionStatus === 'ACTIVE'
															// 	? couponDetail
															// 			?.filter((el) => el.canNotDelete)
															// 			?.map((el) => el.couponId || el.id) || []
															// 	: [],
															typePortal,
															checkPricePro(totalAmountPreTax),
															addonsList.length + 1,
															params,
														)
													}
													totalAmountPreTax={totalAmountPreTax}
													addonsList={addonsList}
													value={coupons}
													dataDetail={dataDetail}
													onChange={changeCoupon}
													disabled={
														disablePromotionTotal &&
														((pricingInfo?.couponList?.length > 0 &&
															pricingInfo.couponList[0]?.systemParamCoupon === 'ONCE') ||
															(listAddon?.length > 0 &&
																listAddon[0]?.systemParamCoupon === 'ONCE')) &&
														totalCoupon?.length < 2
													}
													CAN_UPDATE={CAN_UPDATE}
													checkAdmin={checkAdmin}
													isOrderService={isOrderService}
													totalCoupon={totalCoupon}
												/>
												<ExtraFree
													dataDetail={dataDetail}
													onChange={([fee]) => addExtraFee(fee)}
												/>
												<Col span={2} />
												<Col span={7} className="font-semibold text-base">
													<div className="mr-2">
														<Input
															className="text-right"
															placeholder={tField('input_couponSet_code')}
															ref={couponSetCodeTotal}
															defaultValue=""
														/>
													</div>
												</Col>
												<Col span={2}>
													<Button
														className="items-center primary"
														type="primary"
														onClick={() => handleOnClick()}
													>
														{tOthers('apply')}
													</Button>
												</Col>
											</>
										)}
									</div>

									{(typeSupscrip === 'create' || dataDetail.subscriptionStatus === 'FUTURE') && (
										<Row className="pt-4 pb-2">
											<Col span={15} className="flex items-center">
												Tổng tiền thanh toán
											</Col>
											<Col span={haveTax ? 4 : 8} className="text-right">
												<div style={{ marginRight: '5px', color: '#135EA8' }}>
													{DX.formatNumberCurrency(totalAmountPreTaxFinal || 0)}
												</div>
											</Col>
											{haveTax && (
												<Col span={4} className="text-right">
													<div style={{ marginRight: '5px', color: '#135EA8' }}>
														{DX.formatNumberCurrency(totalAmountAfterTaxFinal || 0)}
													</div>
												</Col>
											)}
											<Col span={4} className="text-right" />
											<Col span={1} />
										</Row>
									)}
								</div>
							</div>
						</div>

						<FormInput
							isTrial={isTrial}
							serviceId={serviceId}
							dataDetail={dataDetail}
							typeSupscrip={typeSupscrip}
							setShowPreviewCost={setShowPreviewCost}
							formValue={formValue}
							disableTimeTrial={disableTimeTrial}
							selectAfter={selectAfter}
							pricingInfo={pricingInfo}
							CAN_UPDATE={CAN_UPDATE}
							checkAdmin={checkAdmin}
							isDisplayTime={isDisplayTime}
							typeChange={typeChange}
							disableStartAt={disableStartAt}
							checkVisible={checkVisible}
							checkChangeSub={checkChangeSub}
							serviceIdIn={serviceIdIn}
							isOrderService={isOrderService}
						/>
						<div className="flex justify-end gap-4">
							{!isEmpty(pricingInfo.urlPreOrder) && pricingInfo.subscriptionStatus === 'ACTIVE' && (
								<PreOrderItem onChange={setPreOrder} value={preOrder} serviceId={serviceId} />
							)}

							<Button
								type="default"
								htmlType="button"
								onClick={() => goBack(DX.dev.createPath('/service/list'))}
							>
								Hủy
							</Button>
							{((!isDisplayTime && pricingInfo.subscriptionStatus === 'IN_TRIAL') ||
								pricingInfo.subscriptionStatus === 'ACTIVE' ||
								pricingInfo.subscriptionStatus === 'FUTURE' ||
								checkChangeSub ||
								!dataDetail.smeId) &&
								CAN_UPDATE &&
								!isOrderService &&
								checkAdmin && (
									<Button
										//	|| (checkChangeSub && !isDirty)
										disabled={
											!serviceId || (!checkChangeSub && !isDirty && typeSupscrip !== 'create')
										}
										onClick={() => {
											if (
												(checkChangeSub || typeSupscrip === 'detail') &&
												dataDetail.subscriptionStatus !== 'IN_TRIAL'
											) {
												!errorQuanlity && setConFirmModal(true);
											} else form.submit();
										}}
										className="block"
										type="primary"
										loading={checkChangeSub || typeSupscrip === 'detail' ? undefined : loading}
									>
										{pricingInfo.subscriptionStatus || checkChangeSub ? 'Lưu' : 'Tạo'}
									</Button>
								)}
						</div>
						<ConfirmModal
							confirmModal={confirmModal}
							setConFirmModal={setConFirmModal}
							form={form}
							loading={loading}
							checkPromotion={checkPromotion}
							checkNumberCycle={checkNumberCycle}
							checkLengthAddon={checkLengthAddon}
							displayChange={displayChange}
							totalChange={totalChange}
							previewCost={dataPopupCost}
							paymentType={paymentType}
							checkChangeSub={checkChangeSub}
							defaultValueRadio={checkChangeSub ? changePricing : pricingInfo.changeSubscription}
						/>
					</>
				)}
			</Form>

			<Modal
				title={<span className="font-bold">Chi tiết chi phí phát sinh</span>}
				visible={showPreviewCost}
				okText="Đóng"
				onOk={() => setShowPreviewCost(false)}
				onCancel={() => setShowPreviewCost(false)}
				cancelText={false}
				maskClosable={false}
				width="90%"
				cancelButtonProps={{ hidden: true }}
				className="cost-modal"
				bodyStyle={{
					maxHeight: 'calc(100vh - 13rem)',
					overflow: 'auto',
				}}
			>
				<CostIncurredBox previewCost={dataPopupCost} isFetching={isFetching} />
			</Modal>
		</div>
	);
}
export default NewSubscription;
