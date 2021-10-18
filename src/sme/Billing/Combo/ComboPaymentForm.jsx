/* eslint-disable arrow-body-style */
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Checkbox, message, Radio, Spin } from 'antd';
import WrapDetail from 'app/HOCs/WrapDetail';
import { useLng, useQueryUrl } from 'app/hooks';
import { ComboSME, DX, SMESubscription, SubcriptionPlanDev } from 'app/models';
import { cloneDeep, isEmpty, union } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { InputAmount, ModalConfirm } from 'sme/components';
import { BackNavigation, PreOrderItemCombo } from '../components';
import CalculationDetail from '../components/CalculationDetail';
import { AddonInfo, ServicePackInfo } from '../components/step1';
import { billingActions, billingSelects } from '../redux/billingReducer';
import TotalCostInfo from './TotalCostInfo';

const PROMOTION_TYPE = {
	PRODUCT: 'PRODUCT',
};

function getDataToCalculate(state) {
	const { isCheckBox, addonList } = state;
	const getCouponIds = (coupons, type) => {
		if (!isCheckBox) {
			if (state.couponChecked.type === type) {
				return [state.couponChecked.couponId];
			}
			return [];
		}
		return union(coupons.filter((el) => el.checked).map((el) => el.couponId));
	};
	return {
		object: {
			id: state.pricingId,
			quantity: state.quantity,
			couponIds: getCouponIds(state.couponList, 'in-pricing'),
		},
		addons: addonList
			.filter((el) => el.checked)
			.map((addon) => ({
				id: addon.id,
				quantity: addon.quantity,
				couponIds: getCouponIds(addon.couponList, 'in-addon'),
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

function ComboPaymentForm({ className, next, planId, setHaveError, numError, isLoading, serviceId }) {
	const dispatch = useDispatch();
	const billingInfo = useSelector(billingSelects.selectBillingInfo);
	const { tFilterField, tField, tOthers, tLowerField, tMessage, tMenu, tButton } = useLng();
	const [showModal, setShowModal] = useState(false);
	const [preOrder, setPreOrder] = useState({ loading: true });

	const { path } = useRouteMatch();
	const params = useParams();
	const getComboPlanId = parseInt(params.planId, 10);

	const queryUrl = useQueryUrl();
	const getSubscriptionId = queryUrl.get('subscriptionId');
	const history = useHistory();

	const haveTax = useSelector(billingSelects.haveTax);
	const [showCalculation, setCalculation] = useState(false);

	const goBack = () => history.push(DX.sme.createPath(`/account/combo/${getSubscriptionId}/detail?tab=2`));

	const showModalCalculation = (id, type, { typeSub, amountAddon, unitLimitedList }) => {
		setCalculation({
			planId: id,
			pricingPlan: type,
			typeSub,
			amountAddon,
			unitLimitedList,
		});
	};

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

	useQuery(
		['ComboSME.getPackageCombo', planId, numError || getComboPlanId, getSubscriptionId],
		async () => {
			const res = await ComboSME.getPackageCombo(planId || getComboPlanId);
			if (!isEmpty(res.urlPreOrder)) setPreOrder({ urlPreOrder: cloneDeep(res.urlPreOrder) });

			res.isCheckBox = res.couponConfig !== 'ONCE';
			let amountChecked = 1;
			res.pricingId = planId || getComboPlanId;
			res.addonsList.forEach((e, i) => {
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
			res.addonList = res.addonsList;
			delete res.addonsList;
			// Lấy danh sách CTKM khi loại khuyến mãi là product
			// res.coupons = spreadCoupon(res.comboPricings);
			res.quantity = 1;
			// Lấy danh sách CTKM khi loại khuyến mãi là product
			res.coupons = spreadCoupon(res.coupons);
			res.couponList = spreadCoupon(res.couponCombos);
			res.couponCombos = undefined;
			res.amountChecked = amountChecked;
			dispatch(billingActions.initBilling(res));
		},
		{
			keepPreviousData: true,
			enabled: !!planId || !!getComboPlanId,
			onError: (e) => {
				if (e.errorCode === 'error.subscription.user')
					setHaveError({
						callbackUrl: DX.sme.path,
						status: 401,
						errorCode: 'servicePackRegistered',
					});
				else {
					e.options = { name: e.message };
					e.callbackUrl = DX.sme.createPath('');
					setHaveError(e);
				}
			},
		},
	);

	const { isFetching } = useQuery(
		['getDataCalculate', billingInfo.countCal],
		async () => {
			// console.log(getDataToCalculate(billingInfo));
			const res = await ComboSME.getDataCalculate(getDataToCalculate(billingInfo));
			await dispatch(billingActions.applyCalculate(res));
		},
		{
			enabled: !!billingInfo.pricingId && isEmpty(billingInfo.checkAmountZero),
		},
	);

	// Lấy danh sách popup
	const { data: dataPopupByType } = useQuery(
		['ComboSME.getListPopupByType', showCalculation],
		async () => {
			const res = await ComboSME.getListPopupByType(showCalculation.pricingPlan, {
				id: showCalculation.planId,
				quantity: showCalculation.amountAddon || billingInfo.quantity,
				unitLimitedList:
					showCalculation.typeSub === 'ADDON'
						? showCalculation?.unitLimitedList
						: billingInfo?.unitLimitedList,
			});
			return res;
		},
		{
			initialData: {},
			enabled:
				!isEmpty(showCalculation) &&
				['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === showCalculation.pricingPlan),
		},
	);

	const columns = [
		{
			title: <div className="font-semibold text-gray-850">{tField('comboPackageName')}</div>,
			key: 'id',
			dataIndex: 'id',
			render: (_, _1, index) => ({
				children: (
					<div className="font-semibold">
						<p className="uppercase mb-0 text-gray-80">{billingInfo.comboName}</p>

						<div className="flex flex-col text-gray-500 mt-2">
							{!!billingInfo.paymentCycle && billingInfo.price > 0 && (
								<p className="mb-0 text-sm">
									{tField('paymentCycle')}{' '}
									<span className="text-primary">{`${billingInfo.paymentCycle} ${tFilterField(
										'timeOptions',
										SubcriptionPlanDev.getTimeFormCode[billingInfo.cycleType],
									)}`}</span>
								</p>
							)}

							{!isEmpty(billingInfo.taxList) && billingInfo.price > 0 && (
								<>
									{billingInfo.taxList.map((item) => (
										<p className="mb-0 text-sm" key={`tax-${item.taxName}`}>
											{item.hasTax === 'YES' || item.hasTax === 1
												? `${tOthers('included')} ${item?.percent}% ${tLowerField('tax')} ${
														item.taxName
												  }`
												: `${tOthers('notIncluded')} ${item?.percent}% ${item.taxName}`}
										</p>
									))}
								</>
							)}
							{/* {!!billingInfo.numberOfTrial && (
								<p className="mb-0 text-sm">
									{tOthers('trial ')} {billingInfo.numberOfTrial}{' '}
									{SubcriptionPlanDev.getTimeFormCode[billingInfo.trialType]}
								</p>
							)} */}
							{!!billingInfo.freeQuantity && (
								<p className="mb-0 text-sm">
									{tOthers('free')} {billingInfo.freeQuantity}
									{/* {billingInfo.unitName} */}
								</p>
							)}
						</div>
					</div>
				),
				props: {
					rowSpan: index === 0 ? billingInfo.comboPricings?.length || 0 : 0,
				},
			}),
		},
		{
			title: <div className="font-semibold text-gray-850">{tField('serviceName')}</div>,
			dataIndex: 'pricingName',
		},
		{
			align: 'right',
			title: <div className="font-semibold text-gray-850">{tField('freeQuantity')}</div>,
			dataIndex: 'freeQuantity',
		},
		{
			align: 'right',
			title: <div className="font-semibold text-gray-850">{tField('quantity')}</div>,
			dataIndex: 'quantity',
			width: '10%',
		},
		{
			align: 'right',
			title: !haveTax ? (
				<div className="font-semibold text-gray-850">
					{tField('amountOfMoney')}({billingInfo.currencyName || 'VND'})
				</div>
			) : (
				<div className="font-semibold text-gray-850">
					{tField('amountOfMoneyBeforeTax')} ({billingInfo.currencyName || 'VND'})
				</div>
			),
			key: 'preAmountTax',
			render: (_, _1, index) => ({
				children: (
					<span className="text-primary">{DX.formatNumberCurrency(billingInfo.pricing?.preAmountTax)}</span>
				),
				props: {
					rowSpan: index === 0 ? billingInfo.comboPricings?.length || 0 : 0,
				},
			}),
			fixed: !haveTax ? 'right' : '',
			width: '20%',
		},
		{
			align: 'right',
			title: (
				<div className="font-semibold text-gray-850">
					{tField('amountOfMoneyAfterTax')} ({billingInfo.currencyName || 'VND'})
				</div>
			),
			key: 'afterAmountTax',
			fixed: 'right',
			render: (_, _1, index) => ({
				children: <span className="text-primary" />,
				props: {
					rowSpan: index === 0 ? billingInfo.comboPricings?.length || 0 : 0,
				},
			}),
			width: '20%',
			hide: !haveTax,
		},
	];

	// -----------confirm change package of combo----------------
	function getDataToConfirm() {
		const changeComboData = {
			comboPlanId: billingInfo.pricingId,
			quantity: billingInfo.quantity,
			comboCouponList: [],
			addonsList: [],
			couponList: [],
		};

		// ------coupon of pricing-----
		changeComboData.comboCouponList = []
			.concat(billingInfo.couponList)
			.filter((e) => e.checked === true)
			.map((el) => {
				if (el.promotionType === PROMOTION_TYPE.PRODUCT) {
					return { id: el.couponId, pricingId: el.pricingId };
				}
				return { id: el.couponId };
			});

		// ------coupon of combo------
		changeComboData.couponList = []
			.concat(billingInfo.coupons)
			.filter((e) => e.checked === true)
			.map((el) => {
				if (el.promotionType === PROMOTION_TYPE.PRODUCT) {
					return { id: el.couponId, pricingId: el.pricingId };
				}
				return { id: el.couponId };
			});

		[].concat(billingInfo.addonList).forEach((addon) => {
			if (addon.checked) {
				const couponOfAddon = [];
				[].concat(addon.couponList).forEach((coupon) => {
					if (coupon.checked && coupon.promotionType === PROMOTION_TYPE.PRODUCT)
						couponOfAddon.push({ id: coupon.couponId, pricingId: coupon.pricingId });
					else if (coupon.checked) couponOfAddon.push({ id: coupon.couponId });
				});
				changeComboData.addonsList.push({
					id: addon.id,
					quantity: addon.quantity,
					couponList: [...couponOfAddon],
				});
			}
		});

		return changeComboData;
	}

	const mutationChangePack = useMutation(
		() => SMESubscription.putChangeComboPack(getSubscriptionId, getDataToConfirm()),
		{
			onSuccess: () => {
				message.success(tMessage('opt_successfullyChanged', { field: 'servicePackage' }));
				history.replace(DX.sme.createPath(`/account/combo/${getSubscriptionId}/detail?tab=2`));
			},
		},
	);

	if (billingInfo.inLoading) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
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
						dataSource={billingInfo.comboPricings}
						showModalCalculation={showModalCalculation}
						haveTax={haveTax}
						CheckComponent={CheckComponent}
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
						/>
					</div>
				)}

				{/* Thông tin tổng chi phí */}
				<div className="rounded-xl p-4 shadow-card bg-white mt-7">
					<TotalCostInfo billingInfo={billingInfo} isNoTax={!haveTax} CheckComponent={CheckComponent} />
				</div>
				<div className="text-right mt-8">
					{!isEmpty(preOrder.urlPreOrder) && (
						<PreOrderItemCombo onChange={setPreOrder} value={preOrder} serviceId={serviceId} />
					)}
					<Button
						type="primary"
						icon={isLoading ? <LoadingOutlined /> : <span />}
						className="uppercase font-semibold float-right ml-2"
						onClick={() => (path.indexOf('change-pack') !== -1 ? setShowModal(true) : next())}
						disabled={billingInfo.quantity < 1}
					>
						{path.indexOf('change-pack') !== -1 ? tButton('opt_confirm') : tButton('next')}
					</Button>
				</div>
				<CalculationDetail
					showCalculation={showCalculation}
					closeModalCalculation={closeModalCalculation}
					dataPopupByType={dataPopupByType}
					pricingPlan={showCalculation.pricingPlan}
					currencyName={billingInfo.currencyName || 'VND'}
				/>
			</div>

			<ModalConfirm
				mutation={mutationChangePack.mutateAsync}
				showModal={showModal}
				setShowModal={setShowModal}
				mainTitle={tMessage('opt_change', { field: 'comboPackage' })}
				subTitle={tMessage('opt_wantToChange', { field: 'comboPackageInfo' })}
				isLoading={mutationChangePack.isLoading}
			/>
		</Spin>
	);
}
ComboPaymentForm.propTypes = {
	className: PropTypes.string,
};
ComboPaymentForm.defaultProps = {
	className: '',
};
export default WrapDetail(ComboPaymentForm);
