import { Button, Checkbox, message, Modal, Radio, Spin } from 'antd';
import CostIncurred from 'app/components/Templates/Subscription/CostIncurred';
import { useLng, useUser } from 'app/hooks';
import { ComboSME, DX, SMESubscription } from 'app/models';
import { cloneDeep, isEmpty, union } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { CalculationDetail, PreOrderItem, PreOrderItemCombo } from 'sme/Billing/components';
import { AddonInfo } from 'sme/Billing/components/step1';
import { billingActions, billingSelects } from 'sme/Billing/redux/billingReducer';
import { InputAmount, ModalConfirm } from 'sme/components';
import { ModalCostIncurredConfirm, OnetimeFee, ServicePackInfos, TotalInvoiceCoupon } from './sub-components';

const AmountColumns = ({ amount, className }) => (
	<div className={`${className} text-right px-4 text-primary my-auto break-words`}>{amount}</div>
);

const modal = {
	SAVE: {
		mainTitle: 'Thay đổi thông tin đăng ký',
		subTitle: 'Bạn chắc chắn muốn lưu thông tin thay đổi?',
	},
	CANCEL: {
		mainTitle: 'Hủy thay đổi thông tin đăng ký',
		subTitle: 'Bạn chắc chắn muốn hủy thông tin thay đổi?',
	},
};

const alertFinalCycle = 'Nội dung thay đổi sẽ được áp dụng vào kỳ tới. Bạn chắc chắn muốn lưu thông tin thay đổi?';
// 'Nội dung thay đổi sẽ được áp dụng vào kỳ tới. Xem trong tab Thanh toán kỳ tới. Bạn chắc chắn muốn lưu thông tin thay đổi?';

const PRODUCT = 'PRODUCT';
const BTN = {
	SAVE: 'SAVE',
	CANCEL: 'CANCEL',
};
const CHANGE = {
	END_CYCLE: 'END_CYCLE',
	NOW: 'NOW',
};
const TYPE = {
	COMBO: 'COMBO',
	PRICING: 'PRICING',
};
const ACTIVE = 'ACTIVE';

const Title = ({ title, className }) => <div className={`${className} text-primary font-bold`}>{title}</div>;

function getDataToCalculate(state, typeSubscription) {
	const { isCheckBox, addonList } = state;
	const getCouponIds = (coupons, type) => {
		if (!isCheckBox) {
			if (state.couponChecked.type === type) {
				return [state.couponChecked.id];
			}
			return [];
		}
		return union(coupons.filter((el) => el.checked).map((el) => el.couponId));
	};

	const calculate = {
		object: {
			id: state.pricingId,
			quantity: state.quantity || 1,
			couponIds: getCouponIds(state.couponList, 'in-pricing'),
			multiPlanId: state.pricingMultiPlanId,
		},
		addons: addonList
			.filter((el) => el.checked)
			.map((addon) => ({
				id: addon.id,
				quantity: addon.quantity || 1,
				couponIds: getCouponIds(addon.couponList, 'in-addon'),
				addonMultiPlanId: addon.addonMultiPlanId,
			})),
		coupons: getCouponIds(state.coupons, 'in-total'),
	};

	const calculateCombo = {
		object: {
			id: state.pricingId,
			quantity: state.quantity || 1,
			couponIds: getCouponIds(state.couponList, 'in-pricing'),
		},
		addons: addonList
			.filter((el) => el.checked)
			.map((addon) => ({
				id: addon.id,
				quantity: addon.quantity || 1,
				couponIds: getCouponIds(addon.couponList, 'in-addon'),
				addonMultiPlanId: addon.addonMultiPlanId,
			})),
		couponCombos: getCouponIds(state.coupons, 'in-total'),
	};

	return typeSubscription === TYPE.COMBO ? calculateCombo : calculate;
}

const spreadCoupon = (coupons) => {
	const rs = [];
	for (let i = 0; i < coupons.length; i++) {
		const coupon = coupons[i];
		if (coupon.promotionType !== PRODUCT) {
			rs.push(coupon);
		} else {
			rs.push(
				...coupon.pricing.map((el) => ({
					...coupon,
					planId: el.planId,
					pricingName: el.pricingName,
					serviceName: el.serviceName,
				})),
			);
		}
	}
	return rs;
};

function PackDetail({ planId, typeSubscription, status, activeTab, currentCycle, isOrderService }) {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('sme/update-subscription', user.permissions) && !isOrderService;
	const { id } = useParams();
	const history = useHistory();

	const dispatch = useDispatch();
	const billingInfo = useSelector(billingSelects.selectBillingInfo);
	const haveTax = useSelector(billingSelects.haveTax);
	const { tOthers, tMessage, tButton, tMenu } = useLng();
	const [showCalculation, setCalculation] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [typeModal, setTypeModal] = useState(BTN.SAVE);

	const [showPreviewCost, setShowPreviewCost] = useState(false);
	const [showPopupCostIncurred, setShowPopupCostIncurred] = useState(false);

	const [notAllowEdit, setNotAllowEdit] = useState(true);
	const [preOrder, setPreOrder] = useState({ loading: true });

	const {
		getServiceAfterSubscription,
		putServiceAfterSubscription,
		getComboPackDetailSubscription,
		putComboAfterSubscription,
		getDataCalculate,
		getListPopupByType,
		formatPricingPlan,
		postPreviewCost,
	} = SMESubscription;

	useEffect(() => () => dispatch(billingActions.reset()), []);

	const showModalCalculation = (_, type, { typeSub, amountAddon, unitLimitedList }) => {
		setCalculation({
			planId,
			pricingPlan: type,
			typeSub,
			amountAddon,
			unitLimitedList,
		});
	};

	// -------------------Lấy chi tiết subscription------------------
	const { refetch } = useQuery(
		['getDetailServiceOfSub', planId],
		async () => {
			const res = await getServiceAfterSubscription(id);
			if (!isEmpty(res.urlPreOrder)) setPreOrder({ urlPreOrder: res.urlPreOrder[0].url });

			res.isCheckBox = res.couponConfig !== 'ONE';
			let amountChecked = 1;
			res.addonsList.forEach((e, i) => {
				e.index = i;
				e.couponList = spreadCoupon(e.couponList);
				if (e.isRequired === 'YES' || e.checked) {
					amountChecked++;
				}
				if (e.quantity === 0) e.quantity = 1;
				if (!isEmpty(e.tax)) res.addonHaveTax = true;
				if (e.bonusType === 'ONCE' && e.checked === true) e.noAction = true;
				if (e.checked === true) e.noActionCoupon = true;
				if (e.checked === true && (e.hasChangeQuantity === 'NONE' || e.hasChangeQuantity === null))
					e.noActionQuantity = true;
			});
			res.addonList = res.addonsList;

			// Lấy danh sách CTKM của subscription
			res.couponAttachList = spreadCoupon(res.couponList);
			delete res.couponList;
			// Lấy danh sách CTKM khi của gói
			res.couponList = spreadCoupon(res.couponPricings);
			delete res.couponPricings;
			res.amountChecked = amountChecked;
			dispatch(billingActions.initBilling(res));
		},
		{
			keepPreviousData: true,
			enabled: !!planId && typeSubscription !== TYPE.COMBO,
		},
	);

	// -------------------Lấy chi tiết combo------------------
	const { refetch: refetchCombo } = useQuery(
		['getPackDetailSubscriptionCombo', planId],
		async () => {
			const res = await getComboPackDetailSubscription(id);
			if (!isEmpty(res.urlPreOrder)) setPreOrder({ urlPreOrder: cloneDeep(res.urlPreOrder) });

			res.isCheckBox = res.couponConfig !== 'ONE';
			let amountChecked = 1;
			res.pricingId = planId;
			res.addonsList.forEach((e, i) => {
				e.index = i;
				e.couponList = spreadCoupon(e.couponList);
				if (e.isRequired === 'YES' || e.checked) {
					amountChecked++;
				}
				if (e.quantity === 0) e.quantity = 1;
				if (!isEmpty(e.tax)) res.addonHaveTax = true;
				if (e.bonusType === 'ONCE' && e.checked === true) e.noAction = true;
				if (e.checked === true) e.noActionCoupon = true;
				if (e.checked === true && (e.hasChangeQuantity === 'NONE' || e.hasChangeQuantity === null))
					e.noActionQuantity = true;
			});
			res.addonList = res.addonsList;

			// Lấy danh sách CTKM của subscription
			res.couponAttachList = spreadCoupon(res.couponList);
			delete res.couponList;
			// Lấy danh sách CTKM khi của gói
			res.couponList = spreadCoupon(res.comboCouponList);
			delete res.comboCouponList;
			res.amountChecked = amountChecked;
			dispatch(billingActions.initBilling(res));
		},
		{
			keepPreviousData: true,
			enabled: !!planId && typeSubscription === TYPE.COMBO,
		},
	);

	const {
		currencyName,
		onceTimeFee,
		summary,
		changeSubscription,
		paymentMethod,
		serviceId,
		urlPreOrder,
	} = billingInfo;

	// ---------------------------Tính toán giá-------------------------------
	// pricing
	const { isFetching, refetch: refetchCalculatePricing } = useQuery(
		['getDataCalculate', billingInfo.countCalDetail],
		async () => {
			const res = await getDataCalculate({
				planId,
				subcriptionInfo: getDataToCalculate(billingInfo),
			});
			await dispatch(billingActions.applyCalculate(res));
		},
		{
			enabled: !!billingInfo.pricingId && typeSubscription !== TYPE.COMBO && isEmpty(billingInfo.checkAmountZero),
		},
	);

	// combo
	const { isFetching: isFetchingCombo, refetch: refetchCalculateCombo } = useQuery(
		['getDataCalculateCombo', billingInfo.countCalDetail],
		async () => {
			const res = await ComboSME.getDataCalculate(getDataToCalculate(billingInfo, TYPE.COMBO));
			await dispatch(billingActions.applyCalculate(res));
		},
		{
			enabled: !!billingInfo.pricingId && typeSubscription === TYPE.COMBO && isEmpty(billingInfo.checkAmountZero),
		},
	);

	// xem chi phí phát sinh
	const { data: previewCost, isFetching: isFetchingCost } = useQuery(
		['previewCost', id, billingInfo.countCalDetail],
		async () => {
			const res = await postPreviewCost({
				cycleNo: currentCycle,
				subscriptionInfo: {
					subscriptionId: parseInt(id, 10),
					...getDataToCalculate(billingInfo),
					calculateType: typeSubscription === TYPE.COMBO ? TYPE.COMBO : TYPE.PRICING,
				},
			});
			return res;
		},
		{
			initialData: {},
			enabled:
				status === ACTIVE &&
				!!currentCycle &&
				((!!billingInfo.pricingId && isEmpty(billingInfo.checkAmountZero)) || billingInfo.countCalDetail > 0),
		},
	);

	// ---------------------------Lấy danh sách popup cách tính----------------------------
	// pricing
	const { data: dataPopupByType } = useQuery(
		['getListPopupByTypeAfterSub', showCalculation],
		async () => {
			const res = await getListPopupByType(formatPricingPlan[showCalculation.pricingPlan], {
				planId: showCalculation.planId,
				quantity: showCalculation.amountAddon || billingInfo.quantity,
				typeSub: showCalculation.typeSub,
				unitLimitedList:
					showCalculation.typeSub === 'ADDON' ? showCalculation.unitLimitedList : billingInfo.listUnitLimited,
			});

			return res;
		},
		{
			initialData: {},
			enabled:
				!isEmpty(showCalculation) &&
				typeSubscription !== TYPE.COMBO &&
				['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === showCalculation.pricingPlan),
		},
	);

	// combo
	const { data: dataComboPopupByType } = useQuery(
		['getListPopupComboByTypeAfterSub', showCalculation],
		async () => {
			const res = await ComboSME.getListPopupByType(showCalculation.pricingPlan, {
				id: showCalculation.planId,
				quantity: showCalculation.amountAddon || billingInfo.quantity,
				unitLimitedList: showCalculation.unitLimitedList,
			});

			return res;
		},
		{
			initialData: {},
			enabled:
				!isEmpty(showCalculation) &&
				typeSubscription === TYPE.COMBO &&
				['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === showCalculation.pricingPlan),
		},
	);

	const closeModalCalculation = () => {
		setCalculation(false);
	};

	// --------------------Change amount--------------------------
	const handleChangeAmountPricing = (amount) => {
		dispatch(billingActions.changeAmountPricing({ amount }));
	};

	const CheckComponent = ({ type, coupon, ...props }) => {
		function isChecked() {
			if (!type || billingInfo.isCheckBox) {
				return coupon.checked;
			}
			if (billingInfo.couponChecked.type) {
				if (
					billingInfo.couponChecked.type === 'in-addon' &&
					billingInfo.couponChecked.addonId !== coupon.addonId
				) {
					return false;
				}
				return billingInfo.couponChecked.type === type && billingInfo.couponChecked.id === coupon.id;
			}
			return false;
		}
		const Component = billingInfo.isCheckBox ? Checkbox : Radio;
		return <Component {...props} checked={isChecked()} />;
	};

	// ------------------ get addon name ----------------
	const getAddonName = (value) => {
		const addOn = billingInfo.addonList.filter((el) => el.id === parseInt(value, 10));
		return addOn[0].name;
	};

	// --------------------------change pack register--------------------------
	function getDataToSubmit() {
		const changeData = {
			pricingId: billingInfo.pricingId,
			quantity: billingInfo.quantity || 1,
			couponPricings: [],
			addonsList: [],
			couponList: [],
		};

		// ------coupon of pricing-----
		changeData.couponPricings = []
			.concat(billingInfo.couponList)
			.filter((e) => e.checked === true)
			.map((el) => {
				if (el.promotionType === PRODUCT) {
					return typeSubscription === TYPE.COMBO
						? { id: el.couponId, comboPlanId: el.pricingId }
						: { id: el.couponId, pricingId: el.pricingId };
				}
				return { id: el.couponId };
			});

		// ------coupon of subscription------
		changeData.couponList = []
			.concat(billingInfo.couponAttachList)
			.filter((e) => e.checked === true)
			.map((el) => {
				if (el.promotionType === PRODUCT) {
					return { id: el.couponId, pricingId: el.pricingId };
				}
				return { id: el.couponId };
			});

		[].concat(billingInfo.addonList).forEach((addon) => {
			if (addon.checked) {
				const couponOfAddon = [];
				[].concat(addon.couponList).forEach((coupon) => {
					if (coupon.checked && coupon.promotionType === PRODUCT)
						couponOfAddon.push({
							id: coupon.couponId,
							pricingId: coupon.pricingId,
							pricingMultiPlanId: coupon.pricingMultiPlanId,
							type: coupon.type,
						});
					else if (coupon.checked) couponOfAddon.push({ id: coupon.couponId });
				});
				changeData.addonsList.push({
					id: addon.id,
					quantity: addon.quantity || 1,
					couponList: [...couponOfAddon],
				});
			}
		});

		changeData.couponComboPlans = changeData.couponPricings;

		return changeData;
	}

	const onChangePackInfo = (type) => {
		if (!isEmpty(previewCost.costIncurred) && !isEmpty(previewCost.costIncurred.costIncurred) && type === BTN.SAVE)
			setShowPopupCostIncurred(true);
		else {
			setShowModal(true);
			if (type === BTN.CANCEL) setTypeModal(BTN.CANCEL);
			else setTypeModal(BTN.SAVE);
		}
	};

	const mutationChangePack = useMutation(
		() =>
			typeSubscription === TYPE.COMBO
				? putComboAfterSubscription(id, getDataToSubmit())
				: putServiceAfterSubscription(id, getDataToSubmit()),
		{
			onSuccess: ({ redirectURL }) => {
				setShowModal(false);
				setShowPopupCostIncurred(false);
				setNotAllowEdit(true);

				if (redirectURL && paymentMethod === 'VNPTPAY' && changeSubscription === CHANGE.NOW)
					window.location.href = redirectURL;
				else {
					message.success('Lưu thành công');
					if (typeSubscription === TYPE.COMBO) {
						refetchCombo();
						refetchCalculateCombo();
					} else {
						refetch();
						refetchCalculatePricing();
					}
				}
			},
			onError: (e) => {
				setShowModal(false);
				setShowPopupCostIncurred(false);
				// if (paymentMethod === 'VNPTPAY' && changeSubscription === CHANGE.NOW)
				// 	history.push(DX.sme.createPath(`/payment-error?serviceId=${serviceId}&planId=${planId}`));

				if (e.field === 'quantity') {
					if (e.errorCode.indexOf('increase') !== -1)
						return message.error(tMessage('disallowQuantityIncrease'));
					if (e.errorCode.indexOf('decrease') !== -1)
						return message.error(tMessage('disallowQuantityDecrease'));
				}

				if (typeof parseInt(e.field, 10) === 'number' && !Number.isNaN(parseInt(e.field, 10))) {
					if (e.errorCode.indexOf('increase') !== -1)
						return message.error(
							`Không được phép tăng số lượng dịch vụ bổ sung ${getAddonName(
								e.field,
							)} trong quá trình sử dụng`,
						);
					if (e.errorCode.indexOf('decrease') !== -1)
						return message.error(
							`Không được phép giảm số lượng dịch vụ bổ sung ${getAddonName(
								e.field,
							)} trong quá trình sử dụng`,
						);
					return message.error(
						`Không được phép thay đổi số lượng dịch vụ bổ sung ${getAddonName(
							e.field,
						)} trong quá trình sử dụng`,
					);
				}

				if (e.field === 'hasChangeQuantity' && e.errorCode === 'error.invalid.data') {
					return message.error('Không được phép thay đổi số lượng trong quá trình sử dụng');
				}

				return message.error('Lưu không thành công!');
			},
		},
	);

	// ------------------dirty edit--------------------------
	useEffect(() => {
		if (billingInfo.countCalDetail > 0 && status === ACTIVE) setNotAllowEdit(false);
	}, [billingInfo.countCalDetail]);

	const onCancel = () => {
		setNotAllowEdit(true);
		setShowModal(false);
		if (typeSubscription === TYPE.COMBO) {
			refetchCombo();
			refetchCalculateCombo();
		} else {
			refetch();
			refetchCalculatePricing();
		}
	};

	// ----------------modal cost incurred-------------------------
	const onConfirmEditCost = () => mutationChangePack.mutate();

	const onCancelEditCost = () => {
		onCancel();
		setShowPopupCostIncurred(false);
	};

	if (billingInfo.inLoading) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	return (
		<>
			<div className="box-detail">
				<Title title={tMenu('servicePackageInfo')} className="mb-4" />
				<Spin spinning={isFetching || isFetchingCombo}>
					<ServicePackInfos
						handleChangeAmount={handleChangeAmountPricing}
						showModalCalculation={showModalCalculation}
						data={billingInfo}
						haveTax={haveTax}
						CheckComponent={CheckComponent}
						allowEdit={status !== ACTIVE || isOrderService}
					/>
				</Spin>
			</div>
			{billingInfo.addonList?.length > 0 && (
				<div className="box-detail">
					<Title title={tMenu('addonInfo')} className="mb-4" />
					<Spin spinning={isFetching || isFetchingCombo}>
						<AddonInfo
							InputAmount={InputAmount}
							showModalCalculation={showModalCalculation}
							billingInfo={billingInfo}
							haveTax={haveTax}
							CheckComponent={CheckComponent}
							allowEdit={status !== ACTIVE || isOrderService}
						/>
					</Spin>
				</div>
			)}
			{summary.couponList?.length > 0 && (
				<div className="box-detail">
					<Title title="Khuyến mại trên tổng hóa đơn" />
					<TotalInvoiceCoupon invoiceCoupon={summary.couponList} currencyName={currencyName} />
				</div>
			)}
			{onceTimeFee.length > 0 && (
				<div className="box-detail">
					<Title title={tOthers('oneTimeFee')} className="mb-4" />
					<OnetimeFee onceTimeFee={onceTimeFee} currencyName={currencyName} />
				</div>
			)}
			{activeTab === '3' && (
				<div className="box-detail py-5 w-full flex">
					<div className="flex-1 px-4 font-bold">Tổng chi phí thanh toán</div>
					<div className="flex-1 px-4" />
					<div className="flex-1 px-4" />
					<AmountColumns
						amount={haveTax ? DX.formatNumberCurrency(billingInfo.totalAmountPreTaxFinal) : ''}
						className="flex-1 font-bold"
					/>
					<AmountColumns
						amount={
							haveTax
								? DX.formatNumberCurrency(billingInfo.totalAmountAfterTaxFinal)
								: DX.formatNumberCurrency(billingInfo.totalAmountPreTaxFinal)
						}
						className="flex-1 font-bold"
					/>
				</div>
			)}

			{activeTab !== '3' && status === ACTIVE && (
				<div className="flex justify-between">
					{!isEmpty(urlPreOrder) ? (
						(typeSubscription !== TYPE.COMBO && (
							<PreOrderItem onChange={setPreOrder} value={preOrder} serviceId={serviceId} />
						)) ||
						(typeSubscription === TYPE.COMBO && (
							<PreOrderItemCombo onChange={setPreOrder} value={preOrder} />
						))
					) : (
						<div />
					)}

					{!isOrderService && (
						<div className="flex gap-4 justify-end">
							<Button className="block" onClick={() => setShowPreviewCost(true)}>
								Xem trước chi phí
							</Button>

							{CAN_UPDATE && (
								<>
									<Button
										className="block"
										onClick={() => onChangePackInfo(BTN.CANCEL)}
										disabled={notAllowEdit}
									>
										{tButton('opt_cancel')}
									</Button>

									<Button
										type="primary"
										className="block"
										onClick={() => onChangePackInfo(BTN.SAVE)}
										disabled={notAllowEdit}
									>
										{tButton('opt_save')}
									</Button>
								</>
							)}
						</div>
					)}
				</div>
			)}
			{/* cách tính */}
			<CalculationDetail
				showCalculation={showCalculation}
				closeModalCalculation={closeModalCalculation}
				dataPopupByType={typeSubscription !== TYPE.COMBO ? dataPopupByType : dataComboPopupByType}
				pricingPlan={showCalculation.pricingPlan}
				currencyName={billingInfo.currencyName}
			/>
			{/* nếu không có chi phí phát sinh thì show */}
			<ModalConfirm
				mutation={typeModal === BTN.SAVE ? mutationChangePack.mutateAsync : onCancel}
				showModal={showModal}
				setShowModal={setShowModal}
				mainTitle={modal[typeModal].mainTitle}
				subTitle={
					changeSubscription === CHANGE.END_CYCLE && typeModal === BTN.SAVE
						? alertFinalCycle
						: modal[typeModal].subTitle
				}
				isLoading={mutationChangePack.isLoading}
				onCancel={typeModal === BTN.SAVE && onCancel}
			/>
			{/* nếu có chi phí phát sinh thì show */}
			<ModalCostIncurredConfirm
				showPopupCostIncurred={showPopupCostIncurred}
				changeSubscription={changeSubscription}
				currencyName={currencyName}
				previewCost={previewCost}
				mutationChangePack={mutationChangePack}
				onCancelEditCost={onCancelEditCost}
				onConfirmEditCost={onConfirmEditCost}
			/>
			{/* modal xem trước chi phí */}
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
				<Spin spinning={isFetchingCost}>
					<CostIncurred dataPreviewCost={previewCost} />
				</Spin>
			</Modal>
		</>
	);
}

export default PackDetail;
