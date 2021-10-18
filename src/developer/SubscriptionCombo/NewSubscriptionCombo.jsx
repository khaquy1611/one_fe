/* eslint-disable react-hooks/rules-of-hooks */
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Select, Tooltip } from 'antd';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { ChooseAddon, ChooseCombo, ChoosePromotion } from 'app/components/Templates/ComboSubscription';
import ChooseCoupon from 'app/components/Templates/ComboSubscription/ChooseCoupon';
import { ChooseAccountSme, ExtraFree } from 'app/components/Templates/Subscription';
import ConfirmModal from 'app/components/Templates/Subscription/ConFirmModal';
import ListPromotion from 'app/components/Templates/Subscription/ListPromotion';
import { useNavigation, useQueryUrl, useUser } from 'app/hooks';
import { DX, SubscriptionDev } from 'app/models';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import CanNotAccessRoute from 'app/permissions/CanNotAccessRoute';
import { formatNormalizeCurrency, validateRequireInput } from 'app/validator';
import FormInputCombo from 'developer/Subscription/SubscriptionDetail/FormInputCombo';
import moment from 'moment';
import { isEmpty, toLower, cloneDeep, uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PreOrderItemCombo } from 'sme/Billing/components';
import CostIncurredBox from '../Subscription/SubscriptionDetail/CostIncurredBox';
import { subSelects } from './redux/subscriptionReducer';
import ServiceComBoDetail from './ServiceComBoDetail';

const CYCLE_TYPE_TEXT = {
	DAILY: 'DAILY',
	WEEKLY: 'WEEKLY',
	MONTHLY: 'MONTHLY',
	YEARLY: 'YEARLY',
};
const SUPSCRIPTION_PRICING = 'PRICING';
const SUPSCRIPTION_ADDON = 'ADDON';

const timeMod = {
	NOW: 'NOW',
	CHOOSE: 'CHOOSE',
};
const total = (type, dataInit = []) =>
	dataInit?.map((item) => item[type])?.reduce((accumulator, currentValue) => accumulator + (currentValue || 0));

const { Option } = Select;

export default function NewSubscriptionCombo({
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
	totalAmountPreTax,
	addonsList,
	changeInfoCaculate,
	handleDeleteCouponPricing,
	changeInfoPrice,
	changeAddonList,
	changeInfoAddon,
	handleDeleteCouponAddon,
	handleDeleteAddon,
	handelAddCouponPricing,
	handleAddCouponAddon,
	handleAddCouponTotal,
	extraFee,
	handleDeleteExtraFee,
	coupons = [],
	handleDeleteCoupon,
	changeCoupon,
	totalAmountPreTaxFinal,
	addExtraFee,
	totalAmountAfterTaxFinal,
	dataDetail,
	typeGeneral = 'GENERATE',
	typeChange,
	disableSmeAccount,
	smeInFor,
	isFetching,
	countCal,
	checkAdmin = true,
	isOrderService,
	listUnitAddon,
	setListAddonId,
	setValueAddon,
	setPeriodIdCombo,
	periodIdCombo,
}) {
	const [isDisplayTime, setIsDisplayTime] = useState(true);
	const { goBack } = useNavigation();
	const haveTax = useSelector(subSelects.haveTax);
	const [showPreviewCost, setShowPreviewCost] = useState(false);
	const { user } = useUser();
	const query = useQueryUrl();
	const changeSubscription = query.get('change-subscription');
	const checkChangeSub = changeSubscription === 'true';
	const [paymentType, setPaymentType] = useState(
		checkChangeSub ? pricingInfo.changeCombo : pricingInfo.changeSubscription,
	);
	useEffect(() => {
		setPaymentType(checkChangeSub ? pricingInfo.changeCombo : pricingInfo.changeSubscription);
	}, [pricingInfo]);
	const serviceIdIn = query.get('serviceIdIn');
	const subscriptionId = query.get('subscriptionId');
	const [confirmModal, setConFirmModal] = useState(false);
	const [indexAddonDis, setIndexAddonDis] = useState(false);
	const [preOrder, setPreOrder] = useState({ loading: true });
	const numberOfCycles = pricingInfo.numberOfCycles > 0 ? pricingInfo.numberOfCycles : '';
	const changeCombo = query.get('changeCombo');
	const [changeNumberOfCycle, setChangeNumber] = useState(false);
	const [isDirty, setDirty] = useState(false);

	const disableTimeTrial =
		(isDisplayTime && dataDetail.status === 'IN_TRIAL') ||
		(dataDetail?.regType === 'TRIAL' && dataDetail.status !== 'IN_TRIAL') ||
		!checkAdmin ||
		isOrderService;

	const [disablePromotionTotal, setDisablePromotionTotal] = useState(false);
	const listAddon = [];
	addonsList?.map((addon) =>
		addon.couponList?.map((addons) =>
			listAddon.push({
				...addons,
			}),
		),
	);
	const [dataPopupCost, setDataPopupCost] = useState();
	useEffect(() => {
		setDataPopupCost(pricingInfo.previewCost);
	}, [pricingInfo.previewCost]);
	const totalCoupon = [listAddon, coupons, pricingInfo.couponList || pricingInfo.coupons].flat();

	useEffect(() => {
		addonsList.map((addons, index) => addons.couponList?.length > 0 && setIndexAddonDis(index));
	}, [addonsList]);
	const checkUpdateFormValue =
		typeSupscrip === 'detail' && (dataDetail.status === 'IN_TRIAL' || dataDetail.status === 'FUTURE');
	const checkNumberCycle =
		(pricingInfo.numberOfCycles !== null && pricingInfo.numberOfCycles > 0 ? pricingInfo.numberOfCycles : '') !==
			form.getFieldValue('numberOfCycles') || changeNumberOfCycle;

	const checkPromotion = dataPopupCost?.costIncurred?.costIncurred?.length === 0;
	const checkLengthAddon = addonsList.length !== dataDetail?.addonsList?.length;
	const totalChange =
		dataPopupCost?.costIncurred?.costIncurred?.length > 0 &&
		total('finalAmountPreTax', dataPopupCost?.costIncurred?.costIncurred);
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

	const displayChange =
		!checkChangeSub &&
		paymentType === 'NOW' &&
		(!checkPromotion ||
			(checkPromotion && (checkNumberCycle || (checkLengthAddon && (!totalChange || totalChange === 0)))));
	function checkPricePro(value) {
		const dataPrice = DX.formatNumberCurrency(value);
		const arr = dataPrice?.replace(/\|/g, ',').replaceAll('.', '');
		return Number.parseInt(arr, 10);
	}
	useEffect(() => {
		if (pricingInfo.isInit) {
			form.setFieldsValue({
				smeInfo: formValue.smeInfo,
				paymentCycleText: formValue.paymentCycleText,
				startedAtMod: timeMod.CHOOSE,
				startChargeAt: pricingInfo.startChargeAt,
				numberOfTrial: numberOfCycles,
				numberOfCycles,
				startedAtModInput: pricingInfo.startAt,
				startedAt: moment(pricingInfo.startAt, 'DD/MM/YYYY'),
				tin: pricingInfo.smeInfo?.tin,
				address: pricingInfo.smeInfo?.provinceName,
				customer: pricingInfo.smeInfo?.smeAdminName,
			});
			setIsDisplayTime(
				moment(pricingInfo.startAt, 'DD/MM/YYYY').isBefore(moment()) || dataDetail?.status === 'FUTURE',
			);
		}
	}, [pricingInfo.isInit]);
	useEffect(() => {
		if (serviceIdIn) {
			form.setFieldsValue({
				smeInfo: [{ id: smeInFor.smeId, companyName: smeInFor.smeName }],
				tin: smeInFor.tin,
				address: smeInFor.provinceName,
				customer: smeInFor.smeAdminName,
			});
		}
	}, [serviceIdIn]);

	let CAN_UPDATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/update-subscription', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/update-subscription', user.permissions));
	const CAN_CREATE_TRIAL =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-trial-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-trial-subscription-combo', user.permissions));

	const CAN_CREATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));

	const CAN_CHANGE_PACAGE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/change-combo-pack', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/change-combo-pack', user.permissions));

	if (typeSupscrip === 'create') {
		CAN_UPDATE = true;
	}
	const checkDisplayProAndExtre =
		CAN_UPDATE &&
		dataDetail.status !== 'NON_RENEWING' &&
		dataDetail.status !== 'CANCELED' &&
		checkAdmin &&
		!isOrderService;
	const checkDisplayTotalCost =
		isTrial ||
		!serviceId ||
		dataDetail?.regType === 'TRIAL' ||
		((dataDetail?.status === 'CANCELED' ||
			dataDetail?.status === 'NON_RENEWING' ||
			(dataDetail.subscriptionStatus === 'ACTIVE' && !checkDisplayProAndExtre)) &&
			coupons?.length === 0 &&
			extraFee?.length === 0);
	useEffect(() => {
		if (listAddon.length > 0 || pricingInfo.couponList?.length > 0) {
			setDisablePromotionTotal(true);
		} else {
			setDisablePromotionTotal(false);
		}
	}, [listAddon, pricingInfo.couponList]);
	useEffect(() => {
		if (!isEmpty(pricingInfo.urlPreOrder)) setPreOrder({ urlPreOrder: cloneDeep(pricingInfo.urlPreOrder) });
	}, [pricingInfo.urlPreOrder]);
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
	useEffect(() => {
		if (countCal > (pricingInfo.numberCount || 0)) {
			setDirty(true);
		} else setDirty(false);
	}, [countCal]);
	const checkValueChange = (valueChange) => {
		if (valueChange?.startedAt) {
			form.setFieldsValue({
				startChargeAt:
					pricingInfo.comboPlanType === 'POSTPAID'
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
			setPeriodIdCombo(valueChange.pricingValue[0].periodId);
		}
	};
	const checkDisplayStartAt =
		(((dataDetail.smeId || dataDetail.id) &&
			!isDisplayTime &&
			dataDetail?.status !== 'IN_TRIAL' &&
			dataDetail.status === 'NON_RENEWING' &&
			dataDetail.status === 'CANCELED') ||
			(dataDetail?.status === 'ACTIVE' && !isDisplayTime) ||
			dataDetail?.status === 'FUTURE' ||
			(!dataDetail.id && serviceId)) &&
		!checkChangeSub;

	const checkStatusDetail = dataDetail.status === 'CANCELED' || dataDetail.status === 'NON_RENEWING';
	if (
		checkChangeSub &&
		!CAN_CHANGE_PACAGE &&
		!checkChangeSub &&
		typeSupscrip === 'create' &&
		((isTrial && !CAN_CREATE_TRIAL) || (!isTrial && !CAN_CREATE))
	) {
		return <CanNotAccessRoute />;
	}

	function checkChangeFormValue(value) {
		const dataUpdate = { ...value, startAt: formValue.startAt };
		changeInfoSub(checkUpdateFormValue ? dataUpdate : value);
	}
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
								`Tạo thuê bao Combo ${modRegister !== null ? 'dùng thử' : ''}`}
							{typeChange === 'changeSubscription' && `Đổi gói Combo dịch vụ`}
							{serviceIdIn !== null && subscriptionId !== null && `Đăng ký thuê bao Combo chính thức`}
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
					//	changeInfoSub(update);
					checkChangeFormValue(update);
					!isDirty && setDirty(true);
				}}
				layout="vertical"
			>
				{typeGeneral === 'GENERATE' && (
					<>
						<Row className="mt-8 mb-5" gutter={[16, 16]}>
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
							<Col span={16}>
								<div className="font-semibold text-xl">Thông tin gói Combo dịch vụ</div>
							</Col>
						</Row>
					</>
				)}
				<div className="my-8 px-6 text-base" style={{ backgroundColor: '#FAFAFA' }}>
					<div className="flex items-center py-6">
						<div className="font-semibold mr-4 ">
							<span className="text-red-500">*</span> Gói Combo dịch vụ chính
						</div>
						{(isDisplayTime ||
							(!isDisplayTime && (dataDetail.status === 'IN_TRIAL' || checkStatusDetail))) && (
							<Form.Item name="pricingValue" noStyle>
								<ChooseCombo
									typePortal={typePortal}
									isHaveService={serviceId}
									formValue={formValue?.smeInfo}
									dataDetail={dataDetail}
									typeSupscription="COMBO"
									CAN_UPDATE={CAN_UPDATE}
									checkChangeSub={checkChangeSub}
									checkAdmin={checkAdmin}
									isOrderService={isOrderService}
									type={serviceIdIn !== null ? 'CHANGE_SUB' : ''}
									pricingId={pricingInfo.comboPlanId}
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
								{(isTrial || dataDetail.regType === 'TRIAL') && (
									<>
										<Col span={6} className="text-right">
											Tên dịch vụ
										</Col>
										<Col span={6} className="text-right">
											Số lượng
										</Col>
									</>
								)}
								{!isTrial && dataDetail.regType !== 'TRIAL' && (
									<>
										<Col span={4} className="text-right">
											Số lượng miễn phí
										</Col>
										<Col span={4} className="text-right">
											Số lượng
										</Col>
										<Col span={4} hidden={!haveTax} className="text-right">
											{/* Số tiền trước thuế({pricingInfo.currencyName}) */}
											Số tiền trước thuế (VND)
										</Col>
										<Col span={4} hidden={!haveTax} className="text-right">
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
							<hr className="mt-0 mb-0" style={{ borderTop: '1px solid #d9d9d9' }} />
						</>
					)}

					{!!serviceId && (
						<ServiceComBoDetail
							coupons={coupons}
							pricingDetail={pricingInfo}
							typeModal={SUPSCRIPTION_PRICING}
							typeSupscrip={typeSupscrip}
							changeInfoInput={changeInfoPricing}
							changeCouponList={(couponList) => changeInfoPricing({ couponList })}
							couponList={pricingInfo.couponList}
							fnCall={(params) =>
								ComboSubscriptionDev.getPromotionpopup(
									formValue.smeInfo[0].id,
									pricingInfo.comboPlanId,
									// typeSupscrip !== 'create' && dataDetail.status === 'ACTIVE'
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
							typePortal={typePortal}
							typeGeneral={typeGeneral}
							checkAdmin={checkAdmin}
							indexAddonDis={indexAddonDis}
							totalAmountAfterTaxFinal={totalAmountAfterTaxFinal}
							handleDeleteCouponTotal={handleDeleteCoupon}
							isOrderService={isOrderService}
							listUnitAddon={listUnitAddon}
							totalCoupon={totalCoupon}
							handelAddCoupon={handelAddCouponPricing}
							smeInfo={formValue.smeInfo}
							totalAmount={totalAmountPreTax ? checkPricePro(totalAmountPreTax) : null}
							quantity={addonsList.length + 1}
						/>
					)}
					{!isTrial && serviceId && dataDetail.regType !== 'TRIAL' && (
						<div className="pb-3 text-base">
							<div className="flex items-center my-6">
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
										periodIdCombo={periodIdCombo}
									/>
								)}
							</div>

							{addonsList.length > 0 && (
								<Row
									className="font-semibold py-5 pl-5 text-base"
									style={{ backgroundColor: '#F0F0F0' }}
									gutter={[8, 16]}
								>
									<Col span={7}>Danh mục</Col>
									<Col span={4} className="text-right">
										Đơn giá
									</Col>
									<Col span={4} className="text-right">
										Số lượng
									</Col>
									<Col span={4} hidden={!haveTax} className="text-right">
										{/* Số tiền trước thuế({pricingInfo.currencyName}) */}
										Số tiền trước thuế(VND)
									</Col>
									<Col span={4} hidden={!haveTax} className="text-right">
										{/* Số tiền sau thuế({pricingInfo.currencyName}) */}
										Số tiền sau thuế(VND)
									</Col>
									<Col hidden={haveTax} span={8} className="text-right">
										{/* Thành tiền({pricingInfo.currencyName}) */}
										Thành tiền(VND)
									</Col>
									<Col span={1} />
								</Row>
							)}

							<div
								className="overflow-y-auto overflow-x-hidden beauty-scroll"
								style={{
									maxHeight: addonsList?.length > 3 ? 800 : '100%',
								}}
							>
								{addonsList?.map((item, index) => (
									<Form.Item name="addon" key={`${index + 1}-addon`}>
										<ServiceComBoDetail
											totalCoupon={totalCoupon}
											coupons={coupons}
											className="bg-white"
											pricingDetail={item}
											indexAddon={index}
											changeInfoInput={(update) => changeInfoAddon(update, index)}
											changeCouponList={(couponList) => changeInfoAddon({ couponList }, index)}
											couponList={pricingInfo.couponList}
											typeModal={SUPSCRIPTION_ADDON}
											fnCall={(params) =>
												SubscriptionDev.getPromotionpopup(
													toLower(SUPSCRIPTION_ADDON),
													formValue.smeInfo[0].id,
													item.id,
													// typeSupscrip !== 'create' && dataDetail.status === 'ACTIVE'
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
											handleDeleteCoupon={(indexCoupon) =>
												handleDeleteCouponAddon(index, indexCoupon, item.id)
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
											pricingInfo={pricingInfo}
											typePortal={typePortal}
											typeGeneral={typeGeneral}
											checkAdmin={checkAdmin}
											addonsList={addonsList}
											indexAddonDis={indexAddonDis}
											totalAmountAfterTaxFinal={totalAmountAfterTaxFinal}
											handleDeleteCouponTotal={handleDeleteCoupon}
											isOrderService={isOrderService}
											listUnitAddon={listUnitAddon}
											totalAmountPreTax={totalAmountPreTax}
											handelAddCoupon={(coupon) => {
												handleAddCouponAddon(index, coupon);
											}}
											smeInfo={formValue.smeInfo}
											totalAmount={totalAmountPreTax ? checkPricePro(totalAmountPreTax) : null}
											quantity={addonsList.length + 1}
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
						<div hidden={checkDisplayTotalCost}>
							<Row className="mt-11" gutter={[8, 16]}>
								<Col span={16}>
									<div className="font-semibold text-xl">Thông tin tổng chi phí</div>
								</Col>
							</Row>

							<div className="mt-11 p-6 text-base" style={{ backgroundColor: '#FAFAFA' }}>
								<div className="bg-white pl-4 text-base">
									{(extraFee?.length > 0 ? extraFee : pricingInfo.customFee)?.map((extra, index) => (
										<Row className="items-center py-2" key={`${index + 1}-exFee`}>
											<Col span={15}>
												<span className="mr-2">{extra.name || extra.customFeeName}</span>
												{extra.description && (
													<Tooltip title={extra.description}>
														<InfoCircleOutlined />
													</Tooltip>
												)}
											</Col>
											<Col span={haveTax ? 4 : 8} className="text-right">
												<div style={{ marginRight: '5px', color: '#135EA8' }}>
													{DX.formatNumberCurrency(extra.feeAmount)}
												</div>
											</Col>
											{haveTax && (
												<Col span={4} className="text-right">
													<div style={{ marginRight: '5px', color: '#135EA8' }}>
														{DX.formatNumberCurrency(extra.feeAmount)}
													</div>
												</Col>
											)}
											<Col span={1}>
												<div className="text-center">
													{CAN_UPDATE && checkAdmin && !isOrderService && (
														<DeleteOutlined
															onClick={() => handleDeleteExtraFee(index)}
															hidden={!CAN_UPDATE || extra.canNotDelete}
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
												className="items-center beauty-scroll py-2 overflow-y-auto overflow-x-hidden max-h-40"
												key={`${index + 1}-coupons`}
											>
												<Col span={15}>
													<ListPromotion
														item={coupon}
														typeSupscrip={typeSupscrip}
														type="TOTAL"
													/>
												</Col>
												<Col span={haveTax ? 4 : 8} className="text-right" />

												{haveTax && <Col span={4} className="text-right" />}
												<Col span={1}>
													<div className="text-center">
														{coupon?.canNotDelete !== true &&
															CAN_UPDATE &&
															checkAdmin &&
															!isOrderService && (
																<DeleteOutlined
																	onClick={() => handleDeleteCoupon(index, coupon.id)}
																	hidden={!CAN_UPDATE || coupon.canNotDelete}
																/>
															)}
													</div>
												</Col>
											</Row>
										))}

									<div className="flex pt-2 pb-4">
										{checkDisplayProAndExtre && (
											<>
												<ChoosePromotion
													totalCoupon={totalCoupon}
													typePortal={typePortal}
													type="pricing"
													typePromotion="TOTAL"
													fnCall={(params) =>
														ComboSubscriptionDev.getPromotionTotal(
															formValue.smeInfo[0].id,
															pricingInfo.comboPlanId,
															addonsList?.map((a) => a.id),
															// typeSupscrip !== 'create' && dataDetail.status === 'ACTIVE'
															// 	? couponsDetail
															// 			?.filter((el) => el.canNotDelete)
															// 			?.map((el) => el.couponId || el.id) || []
															// 	: [],
															typePortal,
															checkPricePro(totalAmountPreTax),
															addonsList.length + 1,
															params,
														)
													}
													disabled={
														disablePromotionTotal &&
														((pricingInfo?.couponList?.length > 0 &&
															pricingInfo.couponList[0]?.systemParamCoupon === 'ONCE') ||
															(listAddon?.length > 0 &&
																listAddon[0]?.systemParamCoupon === 'ONCE')) &&
														totalCoupon?.length < 2
													}
													totalAmountPreTax={totalAmountPreTax}
													addonsList={addonsList}
													value={coupons}
													dataDetail={dataDetail}
													onChange={changeCoupon}
													CAN_UPDATE={CAN_UPDATE}
													checkAdmin={checkAdmin}
													isOrderService={isOrderService}
												/>

												<ExtraFree
													dataDetail={dataDetail}
													onChange={([fee]) => addExtraFee(fee)}
												/>
												<ChooseCoupon
													addonsList={addonsList}
													smeInfo={formValue?.smeInfo}
													pricingDetail={pricingInfo}
													price={totalAmountPreTax ? checkPricePro(totalAmountPreTax) : null}
													quantity={addonsList.length + 1}
													couponType="5"
													handelAddCoupon={handleAddCouponTotal}
												></ChooseCoupon>
											</>
										)}
									</div>

									{(typeSupscrip === 'create' || dataDetail.status === 'FUTURE') && (
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

						<FormInputCombo
							isTrial={isTrial}
							serviceId={serviceId}
							dataDetail={dataDetail}
							typeSupscrip={typeSupscrip}
							setShowPreviewCost={setShowPreviewCost}
							formValue={formValue}
							checkStatusDetail={checkStatusDetail}
							selectAfter={selectAfter}
							pricingInfo={pricingInfo}
							CAN_UPDATE={CAN_UPDATE}
							checkAdmin={checkAdmin}
							isDisplayTime={isDisplayTime}
							checkDisplayStartAt={checkDisplayStartAt}
							checkChangeSub={checkChangeSub}
							isOrderService={isOrderService}
						/>
						<div className="flex justify-end gap-4 mt-8">
							{!isEmpty(pricingInfo.urlPreOrder) && pricingInfo.status === 'ACTIVE' && (
								<PreOrderItemCombo onChange={setPreOrder} value={preOrder} />
							)}

							<Button
								type="default"
								htmlType="button"
								onClick={() => goBack(DX.dev.createPath('/service/list'))}
							>
								Hủy
							</Button>

							{((pricingInfo.status !== 'IN_TRIAL' &&
								dataDetail?.status !== 'CANCELED' &&
								dataDetail?.status !== 'NON_RENEWING') ||
								(pricingInfo.status === 'IN_TRIAL' &&
									moment(pricingInfo.startAt, 'DD/MM/YYYY').isAfter())) &&
								CAN_UPDATE &&
								checkAdmin &&
								!isOrderService && (
									<Button
										onClick={() => {
											if (
												(checkChangeSub || typeSupscrip === 'detail') &&
												dataDetail.status !== 'IN_TRIAL'
											) {
												setConFirmModal(true);
											} else form.submit();
										}}
										type="primary"
										loading={checkChangeSub || typeSupscrip === 'detail' ? undefined : loading}
										disabled={
											!serviceId || (!checkChangeSub && !isDirty && typeSupscrip !== 'create')
										}
									>
										{dataDetail.smeId || checkChangeSub ? 'Lưu' : 'Tạo'}
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
							defaultValueRadio={checkChangeSub ? changeCombo : pricingInfo.changeSubscription}
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
