/* eslint-disable arrow-body-style */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, message, Modal, Radio, Spin } from 'antd';
import { isEmpty, union } from 'opLodash';
import { DX, SMESubscription, SubcriptionPlanDev } from 'app/models';
import { useMutation, useQuery } from 'react-query';
import { InputAmount, ModalConfirm } from 'sme/components';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { useQueryUrl, useLng } from 'app/hooks';
import { LoadingOutlined } from '@ant-design/icons';
import { AddonInfo, ServicePackInfo, TotalCostInfo } from './step1';
import { billingActions, billingSelects } from '../redux/billingReducer';
import CalculationDetail from './CalculationDetail';
import BackNavigation from './BackNavigation';
import PreOrderItem from './PreOrderItem';

const PROMOTION_TYPE = {
	PRODUCT: 'PRODUCT',
};

function getDataToCalculate(state, idPricingMultiPlanId) {
	const { isCheckBox, addonList } = state;
	const getCouponIds = (coupons, type) => {
		if (!isCheckBox) {
			if (state.couponChecked.type === type) {
				return [state.couponChecked.couponId];
			}
			return [];
		}
		return union(coupons.filter((el) => el.checked).map((el) => el.couponId)).concat(
			state.couponUserTypedList.filter((el) => el.type === type).map((el) => el.couponId),
		);
	};
	return {
		object: {
			id: state.pricingId,
			quantity: state.quantity,
			couponIds: getCouponIds(state.couponList, 'in-pricing'),
			multiPlanId: idPricingMultiPlanId || null,
		},
		addons: addonList
			.filter((el) => el.checked)
			.map((addon, index) => ({
				id: addon.id,
				quantity: addon.quantity,
				couponIds: getCouponIds(addon.couponList, `in-addon-${index}`),
				addonMultiPlanId: addon.addonMultiPlanId || null,
			})),
		coupons: getCouponIds(state.coupons, 'in-total'),
	};
}

function spreadCoupon(coupons, addonId) {
	const rs = [];
	for (let i = 0; i < coupons.length; i++) {
		const coupon = coupons[i];
		if (addonId) {
			coupon.addonId = addonId;
		}
		if (coupon.promotionType !== PROMOTION_TYPE.PRODUCT) {
			rs.push(coupon);
		} else {
			rs.push(
				...coupon.pricing.map((el) => ({
					...coupon,
					pricingId: el.pricingId,
					pricingName: el.pricingName,
					serviceName: el.serviceName,
				})),
			);
		}
	}
	return rs;
}

function ServicePackForm({
	className,
	next,
	planId,
	setHaveError,
	numError,
	isLoading,
	preOrder = {},
	setPreOrder,
	serviceId,
}) {
	const dispatch = useDispatch();
	const billingInfo = useSelector(billingSelects.selectBillingInfo);
	const { tFilterField, tField, tMessage, tMenu, tButton, tOthers, tLowerField } = useLng();
	const [showModal, setShowModal] = useState(false);

	const { path } = useRouteMatch();
	const params = useParams();
	const getPlanId = parseInt(params.planId, 10);

	const queryUrl = useQueryUrl();
	const getSubscriptionId = queryUrl.get('subscriptionId');
	const idPricingMultiPlanId = parseInt(queryUrl.get('pricingMultiPlanId'), 10);
	const history = useHistory();

	const haveTax = useSelector(billingSelects.haveTax);
	const haveTaxAddon = useSelector(billingSelects.haveTaxAddon);
	const [showCalculation, setCalculation] = useState(false);
	const [openDes, setOpenDes] = useState(false);

	const showModalCalculation = (id, type, { typeSub, amountAddon, unitLimitedList }) => {
		setCalculation({
			planId: id,
			pricingPlan: type,
			typeSub,
			amountAddon,
			unitLimitedList,
		});
	};

	const showModalDes = (element) => {
		setOpenDes({
			addonName: element?.name,
			content: element?.description,
		});
	};

	const goBack = () => history.push(DX.sme.createPath(`/account/subscription/${getSubscriptionId}/detail?tab=2`));

	useEffect(() => {
		return () => {
			dispatch(billingActions.reset());
		};
	}, []);
	const closeModalCalculation = () => {
		setCalculation(false);
	};
	const CheckComponent = ({ type, coupon, ...props }) => {
		function isChecked() {
			if (!type || billingInfo.isCheckBox) {
				return coupon.checked;
			}
			if (billingInfo.couponChecked?.type) {
				if (
					billingInfo.couponChecked.type === 'in-addon' &&
					billingInfo.couponChecked.addonId !== coupon.addonId
				) {
					return false;
				}
				if (billingInfo.couponChecked.pricingId) {
					return (
						billingInfo.couponChecked.type === type &&
						billingInfo.couponChecked.couponId === coupon.couponId &&
						billingInfo.couponChecked.pricingId === coupon.pricingId
					);
				}
				return (
					billingInfo.couponChecked.type === type && billingInfo.couponChecked.couponId === coupon.couponId
				);
			}
			return false;
		}
		const Component = billingInfo.isCheckBox ? Checkbox : Radio;
		return <Component {...props} checked={isChecked()} />;
	};

	const { isFetching: isFetchingDetailPricing } = useQuery(
		['getListDetailService', planId, numError || getPlanId, getSubscriptionId],
		async () => {
			const res = await SMESubscription.getDetailService({
				planId: planId || getPlanId,
				getSubscriptionId,
				idPricingMultiPlanId,
			});
			if (res.allowSubscript === 'NO' && path.indexOf('pay') !== -1) {
				setHaveError({
					callbackUrl: DX.sme.path,
					status: 401,
					errorCode: 'servicePackRegistered',
				});
				return {};
			}
			res.isCheckBox = res.couponConfig !== 'ONCE';
			let amountChecked = 1;
			res.addonList.forEach((e, i) => {
				e.checked = false;
				e.index = i;
				e.quantity = 1;
				e.couponList = spreadCoupon(e.couponList, e.id);
				if (e.isRequired === 'YES') {
					e.checked = true;
					amountChecked++;
				}
				if (!isEmpty(e.tax)) res.addonHaveTax = true;
			});

			// Lấy danh sách CTKM khi loại khuyến mãi là product
			res.coupons = spreadCoupon(res.coupons);
			res.quantity = 1;
			// Lấy danh sách CTKM khi loại khuyến mãi là product
			res.couponList = spreadCoupon(res.couponList);
			res.amountChecked = amountChecked;
			dispatch(billingActions.initBilling(res));
			return res;
		},
		{
			keepPreviousData: true,
			enabled: !!planId || !!getPlanId,
			onError: (e) => {
				e.callbackUrl = DX.sme.createPath('');
				setHaveError && setHaveError(e);
			},
		},
	);

	const { isFetching } = useQuery(
		['getDataCalculate', billingInfo.countCal],
		async () => {
			// console.log(getDataToCalculate(billingInfo));
			const res = await SMESubscription.getDataCalculate({
				planId: planId || getPlanId,
				subcriptionInfo: getDataToCalculate(billingInfo, idPricingMultiPlanId),
			});
			await dispatch(billingActions.applyCalculate(res));
		},
		{
			enabled: !!billingInfo.pricingId && isEmpty(billingInfo.checkAmountZero),
		},
	);

	// Lấy danh sách popup
	const { data: dataPopupByType } = useQuery(
		['getListPopupByType', showCalculation],
		async () => {
			const res = await SMESubscription.getListPopupByType(
				SMESubscription.formatPricingPlan[showCalculation.pricingPlan],
				{
					planId: showCalculation.planId,
					quantity: showCalculation.amountAddon || billingInfo.quantity,
					typeSub: showCalculation.typeSub,
					unitLimitedList:
						showCalculation.typeSub === 'ADDON'
							? showCalculation?.unitLimitedList
							: billingInfo?.unitLimitedList,
				},
			);

			return res;
		},
		{
			initialData: {},
			enabled:
				!isEmpty(showCalculation) &&
				['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === showCalculation.pricingPlan),
		},
	);

	const handleChangeAmountPricing = (amount) => {
		dispatch(billingActions.changeAmountPricing({ amount }));
	};
	const columns = [
		{
			title: tField('category'),
			key: 'id',
			dataIndex: 'id',
			render: () => (
				<>
					<p className="font-bold text-black mb-0">{billingInfo.pricingName}</p>
					<div className="flex flex-col mt-2">
						{!isEmpty(billingInfo.taxList) && billingInfo.price !== 0 && (
							<>
								{billingInfo.taxList.map((item) => (
									<p className="mb-1 text-sm text-gray-40" key={`tax-${item.taxName}`}>
										{/* {item.hasTax === 'YES'
											? `${tOthers('included')} ${item?.percent}% ${tLowerField('tax')} ${
													item.taxName
											  }`
											: `${tOthers('notIncluded')} ${item?.percent}% ${item.taxName}`} */}
										{tOthers('notIncluded')} {item?.percent}% {item.taxName}
									</p>
								))}
							</>
						)}

						{billingInfo.price !== 0 && (
							<p className="mb-1 text-sm text-gray-40">
								{tOthers('paymentCycle')}{' '}
								<span className="text-primary">{`${billingInfo.paymentCycle} ${tFilterField(
									'timeOptions',
									SubcriptionPlanDev.getTimeFormCode[billingInfo.cycleType],
								)}`}</span>
							</p>
						)}

						{/* {!!billingInfo.numberOfTrial && (
							<p className="mb-1 text-sm text-gray-40">
								{tOthers('trial')} {billingInfo.numberOfTrial}{' '}
								{SubcriptionPlanDev.getTimeFormCode[billingInfo.trialType]}
							</p>
						)} */}
						{!!billingInfo.freeQuantity && billingInfo.pricingPlan === 'UNIT' && (
							<p className="mb-0 text-sm">
								{tOthers('free')}: {billingInfo.freeQuantity}
								{/* {billingInfo.unitName} */}
							</p>
						)}
					</div>
				</>
			),
		},
		{
			title: tField('quantity'),
			key: 'quantity',
			render: () =>
				billingInfo.pricingPlan === 'FLAT_RATE' ? (
					<span />
				) : (
					<InputAmount
						handleChangeAmount={handleChangeAmountPricing}
						preValue={billingInfo.preQuantity}
						haveAddonAfter={billingInfo.unitName}
					/>
				),
		},
		{
			align: 'right',
			title: (
				<span>
					{tField('unitPrice')} ({billingInfo.currencyName})
				</span>
			),
			key: 'unitPrice',
			render: () => (
				<span className=" text-primary">
					{billingInfo.price !== null &&
					(billingInfo.pricingPlan === 'UNIT' || billingInfo.pricingPlan === 'FLAT_RATE')
						? DX.formatNumberCurrency(billingInfo.price)
						: '--'}
				</span>
			),
		},
		{
			align: 'right',
			title: !haveTax ? (
				<span>
					{tField('amountOfMoney')} ({billingInfo.currencyName})
				</span>
			) : (
				<span>
					{tField('amountOfMoneyBeforeTax')} ({billingInfo.currencyName})
				</span>
			),
			key: 'preAmountTax',
			render: () => (
				<span className="text-primary">{DX.formatNumberCurrency(billingInfo.pricing.preAmountTax)}</span>
			),
			fixed: !haveTax ? 'right' : '',
			// width: '20%',
		},
		{
			align: 'right',
			title: (
				<span>
					{tField('amountOfMoneyAfterTax')} ({billingInfo.currencyName})
				</span>
			),
			key: 'afterAmountTax',
			fixed: 'right',
			render: () => <span className="text-primary" />,
			// width: '20%',
			hide: !haveTax,
		},
	];

	// confirm change package of service
	function getDataToConfirm() {
		const changeData = {
			pricingId: billingInfo.pricingId,
			quantity: billingInfo.quantity,
			pricingMultiPlanId: idPricingMultiPlanId,
			couponPricings: [],
			addonsList: [],
			couponList: [],
		};

		// ------coupon of pricing-----
		changeData.couponPricings = []
			.concat(billingInfo.couponList)
			.filter((e) => e.checked === true)
			.map((el) => {
				if (el.promotionType === 'PRODUCT') {
					return { id: el.couponId, pricingId: el.pricingId };
				}
				return { id: el.couponId };
			});

		// ------coupon of subscription------
		changeData.couponList = []
			.concat(billingInfo.coupons)
			.filter((e) => e.checked === true)
			.map((el) => {
				if (el.promotionType === 'PRODUCT') {
					return { id: el.couponId, pricingId: el.pricingId };
				}
				return { id: el.couponId };
			});

		[].concat(billingInfo.addonList).forEach((addon) => {
			if (addon.checked) {
				const couponOfAddon = [];
				[].concat(addon.couponList).forEach((coupon) => {
					if (coupon.checked && coupon.promotionType === 'PRODUCT')
						couponOfAddon.push({ id: coupon.couponId, pricingId: coupon.pricingId });
					else if (coupon.checked) couponOfAddon.push({ id: coupon.couponId });
				});
				changeData.addonsList.push({ id: addon.id, quantity: addon.quantity, couponList: [...couponOfAddon] });
			}
		});

		return changeData;
	}

	const mutationChangePack = useMutation(
		() => SMESubscription.putChangePackOfService(getSubscriptionId, getDataToConfirm()),
		{
			onSuccess: () => {
				message.success(tMessage('opt_successfullyChanged', { field: 'servicePackage' }));
				history.replace(DX.sme.createPath(`/account/subscription/${getSubscriptionId}/detail?tab=2`));
			},
		},
	);

	if (billingInfo.inLoading || preOrder?.loading) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	const isNoQuantity = billingInfo.addonList.some((item) => item.quantity < 1 && item.checked && !item.quantity);
	if (isFetchingDetailPricing) {
		return <Spin />;
	}

	return (
		<Spin spinning={isFetching}>
			<div className={`h-full ${className}`}>
				{path.indexOf('change-pack') !== -1 && (
					<BackNavigation
						text={tMenu('registrationInfo')}
						handleBack={goBack}
						className="text-primary font-bold text-xl mb-6"
					/>
				)}
				{/* Thông tin gói dịch vụ */}
				<div className="rounded-xl p-4 bg-white shadow-card">
					<p className="text-base font-bold text-primary">{tMenu('servicePackageInfo')}</p>
					<ServicePackInfo
						columns={columns}
						data={billingInfo}
						showModalCalculation={showModalCalculation}
						haveTax={haveTax}
						CheckComponent={CheckComponent}
						preOrder={preOrder}
						setPreOrder={setPreOrder}
						serviceId={serviceId}
					/>
				</div>

				{/* Thông tin Addon */}
				{billingInfo.addonList.length > 0 && (
					<div className="rounded-xl p-4 bg-white shadow-card mt-7">
						<p className="text-base font-bold text-primary">{tMenu('addonInfo')}</p>
						<AddonInfo
							InputAmount={InputAmount}
							showModalCalculation={showModalCalculation}
							billingInfo={billingInfo}
							haveTax={haveTax}
							CheckComponent={CheckComponent}
							haveTaxAddon={haveTaxAddon}
							showModalDes={showModalDes}
						/>
					</div>
				)}

				{/* Thông tin tổng chi phí */}
				<div className="rounded-xl p-4 shadow-card bg-white mt-7">
					<TotalCostInfo billingInfo={billingInfo} isNoTax={!haveTax} CheckComponent={CheckComponent} />
				</div>

				<div className="text-right mt-8">
					{preOrder.urlPreOrder && (
						<PreOrderItem onChange={setPreOrder} value={preOrder} serviceId={serviceId} />
					)}
					<Button
						icon={isLoading ? <LoadingOutlined /> : <span />}
						type="primary"
						className="uppercase font-semibold ml-4"
						onClick={() => (path.indexOf('change-pack') !== -1 ? setShowModal(true) : next())}
						disabled={billingInfo.quantity < 1 || isNoQuantity}
					>
						{path.indexOf('change-pack') !== -1 ? tButton('opt_confirm') : tButton('next')}
					</Button>
				</div>

				<CalculationDetail
					showCalculation={showCalculation}
					closeModalCalculation={closeModalCalculation}
					dataPopupByType={dataPopupByType}
					pricingPlan={showCalculation.pricingPlan}
					currencyName={billingInfo.currencyName}
				/>
				{!!openDes.content && (
					<Modal visible={openDes} closable={false} footer={null} width={1000}>
						<div className="w-full">
							<p className="mb-3 mt-1 font-bold text-xl">{openDes.addonName}</p>
							<div className="w-full min-h-24 beauty-scroll overflow-y-auto max-h-96">
								{openDes.content}
							</div>
							<div className="flex">
								<Button type="primary" onClick={() => setOpenDes(false)} className="mt-8 mx-auto px-16">
									{tButton('close')}
								</Button>
							</div>
						</div>
					</Modal>
				)}
			</div>
			<ModalConfirm
				mutation={mutationChangePack.mutateAsync}
				showModal={showModal}
				setShowModal={setShowModal}
				mainTitle={tMessage('opt_change', { field: 'servicePackage' })}
				subTitle={tMessage('opt_wantToChange', { field: 'servicePackageInfo' })}
				isLoading={mutationChangePack.isLoading}
			/>
		</Spin>
	);
}
ServicePackForm.propTypes = {
	className: PropTypes.string,
};
ServicePackForm.defaultProps = {
	className: '',
};
export default ServicePackForm;
