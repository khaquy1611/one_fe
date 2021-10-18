import React from 'react';
import { DX, SubcriptionPlanDev } from 'app/models';
import { Button, Checkbox } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { isEmpty, isNil } from 'opLodash';
import { billingActions } from 'sme/Billing/redux/billingReducer';
import { useDispatch } from 'react-redux';
import { TableNoContent } from 'sme/components';
import { useLng, useQueryUrl } from 'app/hooks';
import { useRouteMatch } from 'react-router-dom';
import clsx from 'clsx';
import RenderCouponList from '../RenderCouponList';
import UserInputCoupon from './UserInputCoupon';

const YES = 'YES';
const PLAN = {
	FLAT_RATE: 'FLAT_RATE',
	UNIT: 'UNIT',
};
const NONE = 'NONE';
const ONCE = 'ONCE';

const AmountColumns = ({ amount, className }) => (
	<div className={clsx('text-right px-4 text-primary my-auto break-words', className)}>{amount}</div>
);

function AddonInfo({
	InputAmount,
	showModalCalculation,
	billingInfo,
	haveTax,
	CheckComponent,
	allowEdit,
	showModalDes,
}) {
	const dispatch = useDispatch();
	const { tLowerField, tField, tOthers, tButton } = useLng();
	const { addonList } = billingInfo;
	const { path } = useRouteMatch();

	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');

	const handleCheckAddon = (index) => {
		dispatch(billingActions.handleCheckAddon({ index }));
	};
	const handleCheckCouponOnAddon = (index, indexCoupon, coupon) => {
		dispatch(billingActions.handleCheckCouponOnAddon({ index, indexCoupon, coupon }));
	};
	const handleChangeAmountAddon = (index, amount) => {
		dispatch(billingActions.changeAmountAddon({ index, amount }));
	};

	const renderTax = (taxList) =>
		!isEmpty(taxList) &&
		taxList.map((item) => (
			<p className="mb-1 text-sm text-gray-40" key={`tax-${item.taxName}`}>
				{/* {item.hasTax === YES
					? `${tOthers('included')} ${item?.percent}% ${tLowerField('tax')} ${item.taxName}`
					: `${tOthers('notIncluded')} ${item?.percent}% ${item.taxName}`} */}
				{tOthers('notIncluded')} {item?.percent}% {item.taxName}
			</p>
		));

	const renderQuantity = (element, index) => {
		if (element.pricingPlan === PLAN.FLAT_RATE) return <div className="flex-1 px-4" />;
		if (getTab === '3') return <div className="flex-1 px-4 text-black font-medium my-auto">{element.quantity}</div>;
		return (
			<div className="flex-1 px-4 text-primary font-semibold my-auto break-words">
				<InputAmount
					defaultValue={element.quantity}
					preValue={element.preQuantity}
					handleChangeAmount={(amount) => handleChangeAmountAddon(index, amount)}
					haveAddonAfter={element.unitName}
					disabled={allowEdit || element.noActionQuantity}
				/>
			</div>
		);
	};

	// const couponTotal = billingInfo?.addonList?.invoiceCoupon?.map((item, index) => {
	// 	const couponCheck = billingInfo.coupons.find((element) => element.couponId === item.id);
	// 	if (couponCheck) {
	// 		return { ...couponCheck, price: item.price };
	// 	}
	// 	return {};
	// });

	return (
		<>
			<TableNoContent currencyName={billingInfo.currencyName} haveTax={haveTax} />
			<div className="wrap-addon beauty-scroll pr-0.5">
				{addonList.map((element, index) =>
					element.checked ? (
						<div
							key={`addon-${element.id}`}
							className="border-0 border-b border-solid border-gray-100 py-4 un-border-last"
						>
							<div className="mt-2 w-full flex ">
								<div className="flex-1 px-4">
									<Checkbox
										onChange={() => handleCheckAddon(index)}
										defaultChecked={element.isRequired === YES || element.checked}
										disabled={allowEdit || element.isRequired === YES || element.noAction}
										className="checkbox-custom"
									>
										<div className="flex flex-col">
											<p className="mb-1 font-bold text-black">{element.name}</p>

											{element.bonusType === ONCE ? (
												<p className="text-gray-40 text-sm mb-1">
													{tField('payment')} một {tLowerField('times')}
												</p>
											) : (
												<p className="text-gray-40 text-sm mb-1">
													{tField('paymentCycle')} {element.bonusValue}{' '}
													{tLowerField(SubcriptionPlanDev.getTimeFormCode[element.type])}
												</p>
											)}

											{element.pricingPlan === PLAN.UNIT && element.freeQuantity > 0 && (
												<p className="text-gray-40 text-sm mb-1">
													Số lượng miễn phí: {element.freeQuantity}
												</p>
											)}
											{element.price !== 0 &&
												(renderTax(element.tax) || renderTax(element.taxList))}
											<div>
												{!!element.description && (
													<Button
														type="text"
														className="p-0 text-primary"
														onClick={() => showModalDes(element)}
													>
														Xem mô tả
													</Button>
												)}
											</div>
										</div>
									</Checkbox>
								</div>

								{/* cột - input */}
								{renderQuantity(element, index)}
								{/* {element.pricingPlan === PLAN.FLAT_RATE ? (
									<div className="flex-1 px-4" />
								) : (
									<div className="flex-1 px-4 text-primary font-semibold my-auto break-words">
										<InputAmount
											defaultValue={element.quantity}
											preValue={element.preQuantity}
											handleChangeAmount={(amount) => handleChangeAmountAddon(index, amount)}
											haveAddonAfter={element.unitName}
											disabled={allowEdit || element.noAction}
										/>
									</div>
								)} */}

								{/* cột - giá */}
								<AmountColumns
									amount={
										element.pricingPlan === PLAN.FLAT_RATE || element.pricingPlan === PLAN.UNIT
											? DX.formatNumberCurrency(element.price)
											: '--'
									}
									className="flex-1"
								/>

								{/* cột - số tiền or trước thuế */}
								<AmountColumns
									amount={element.preAmountTax && DX.formatNumberCurrency(element.preAmountTax)}
									className="flex-1"
								/>

								{/* cột - sau thuế */}
								{haveTax && <div className="flex-1 px-4" />}
							</div>

							{element.pricingPlan !== PLAN.FLAT_RATE && element.pricingPlan !== PLAN.UNIT && (
								<div className="py-2 ml-2">
									<Button
										type="link"
										className="font-semibold text-gray-500 cursor-pointer"
										icon={<ExclamationCircleOutlined />}
										onClick={() =>
											showModalCalculation(element.id, element.pricingPlan, {
												typeSub: 'ADDON',
												amountAddon: element.quantity,
												unitLimitedList: element.unitLimitedList,
											})
										}
									>
										{tButton('howToCalculate')}
									</Button>
								</div>
							)}

							{!isEmpty(element.couponList) && (
								<div
									className={clsx(
										'beauty-scroll py-4',
										element.couponList.length > 3 && 'h-72 overflow-y-auto',
									)}
								>
									{/* Mã khuyến mãi - couponList */}
									<hr
										className="ml-10 mr-4"
										style={{ border: 'none', borderBottom: '1px solid #E6E6E6' }}
									/>
									{element.couponList.map((item, indexCoupon) => (
										<div key={`${item.couponId}${indexCoupon + 1}`}>
											<div className="w-full flex justify-between py-2">
												<div className="w-3/5 pr-4 pl-12">
													<CheckComponent
														onChange={() =>
															handleCheckCouponOnAddon(index, indexCoupon, item)
														}
														className="checkbox-custom"
														coupon={item}
														type="in-addon"
														disabled={allowEdit || item.disabled || element.noActionCoupon}
													>
														<RenderCouponList
															className="flex flex-col"
															item={item}
															currency={billingInfo.currencyName}
														/>
													</CheckComponent>
												</div>

												{/* cột - số tiền or trước thuế */}
												{/* không hiển thị số tiền KM trong tab chi tiết */}
												{(path.indexOf('detail') === -1 || getTab === '3') && (
													<>
														<AmountColumns
															amount={
																!isNil(item.pricingInfo?.price)
																	? DX.formatNumberCurrency(item.pricingInfo?.price)
																	: ''
															}
															className="flex-1"
														/>

														{/* cột - sau thuế */}
														{haveTax && <div className="flex-1 px-4" />}
													</>
												)}
											</div>

											<hr
												className="ml-10 mr-4"
												style={{ border: 'none', borderBottom: '1px solid #E6E6E6' }}
											/>
										</div>
									))}
								</div>
							)}

							{/* Mã khuyến mãi tổng hóa đơn - couponList */}
							<div className="beauty-scroll wrap-pricing" style={{ maxHeight: '18rem' }}>
								{!isEmpty(element.invoiceCoupon) &&
									element.invoiceCoupon.map((item, idx) => (
										<div
											className="align-element w-full flex border-0 border-b border-solid border-gray-100 border-opacity-40 py-4"
											key={`${item.couponId}${idx + 1}`}
										>
											<div className="w-2/5 px-4">
												<RenderCouponList
													className="flex flex-col"
													item={item}
													currency={billingInfo.currencyName}
												/>
											</div>
											<div className="flex-1 px-4" />

											<AmountColumns
												amount={
													!haveTax || isNil(item.price)
														? ''
														: DX.formatNumberCurrency(item.price)
												}
												className="flex-1 font-bold"
											/>

											<AmountColumns
												amount={
													!haveTax && !isNil(item.price)
														? DX.formatNumberCurrency(item.price)
														: ''
												}
												className="flex-1 font-bold"
											/>
										</div>
									))}
							</div>

							{/* Input For User */}
							<UserInputCoupon couponType={`in-addon-${index}`} />

							{/* Thành tiền */}
							{(path.indexOf('detail') === -1 || getTab === '3') && (
								<>
									{/* {element.bonusType === ONCE && ( */}
									<div className="py-5 w-full flex justify-between">
										<div className="flex-1 px-4">
											<span className="text-gray-80 font-medium">{tField('totalMoney')}</span>
										</div>
										<div className="flex-1 px-4" />
										{haveTax && <div className="flex-1 px-4" />}
										<AmountColumns
											amount={DX.formatNumberCurrency(element.finalAmountPreTax)}
											className="flex-1 font-bold"
										/>
										{haveTax && (
											<AmountColumns
												amount={
													!isEmpty(element.tax || element.taxList)
														? DX.formatNumberCurrency(element.finalAmountAfterTax)
														: DX.formatNumberCurrency(element.finalAmountPreTax)
												}
												className="flex-1 font-bold"
											/>
										)}
									</div>
									{/* )} */}

									{/* Theo chu kỳ thanh toán của addon */}
									{/* {element.bonusType !== ONCE && element.type !== billingInfo.cycleType && (
										<div className="py-5 w-full flex justify-between">
											<div className="flex-1 px-4">
												<span className="font-bold">{tField('totalMoney')}</span> (Theo{' '}
												{element.bonusValue}{' '}
												{tLowerField(SubcriptionPlanDev.getTimeFormCode[element.type])})
											</div>
											<div className="flex-1 px-4" />
											<div className="flex-1 px-4" />
											<AmountColumns
												amount={DX.formatNumberCurrency(element.intoAmountPreTax)}
												className="flex-1 font-bold"
											/>
											{haveTax && <div className="flex-1 px-4" />}
										</div>
									)} */}

									{/* Theo chu kỳ thanh toán của pricing */}
									{/* {element.bonusType !== ONCE && (
										<div className="py-5 w-full flex justify-between">
											<div className="flex-1 px-4">
												<span className="font-bold">{tField('totalMoney')}</span> (
												{tOthers('follow')} {billingInfo.paymentCycle}{' '}
												{tLowerField(SubcriptionPlanDev.getTimeFormCode[billingInfo.cycleType])}
												)
											</div>
											<div className="flex-1 px-4" />
											{haveTax && <div className="flex-1 px-4" />}
											<AmountColumns
												amount={
													element.intoAmountPreTaxPricingCycle &&
													DX.formatNumberCurrency(element.intoAmountPreTaxPricingCycle)
												}
												className="flex-1 font-bold"
											/>
											{isEmpty(element.tax || element.taxList) ? (
												<div className="flex-1 px-4" />
											) : (
												<AmountColumns
													amount={DX.formatNumberCurrency(
														element.intoAmountAfterTaxPricingCycle,
													)}
													className="flex-1 font-bold"
												/>
											)}
										</div>
									)} */}
								</>
							)}
							{/* Phí thiết lập - Chỉ hiển thị khi có phí thiết lập > 0 */}
							{element.setupFee?.price > 0 && (
								<div className="py-5 w-full flex justify-between">
									<div className="flex-1 px-4">
										<span className="text-gray-80 font-medium">{tField('capitalExpenditure')}</span>
										{!isEmpty(element.tax) &&
											element.tax?.map((item) => (
												<p className="mb-1 text-gray-40 text-sm" key={`tax-${item.taxName}`}>
													{/* hiển thị chưa bao gồm nếu có thuế */}
													{/* {item.hasTax === 'YES'
																? `${tOthers('included')} ${
																		item?.percent
																  }% ${tLowerField('tax')}`
																: `${tOthers('notIncluded')} ${item?.percent}%`} */}
													{tOthers('notIncluded')} ${item?.percent}%
												</p>
											))}
									</div>
									<div className="flex-1 px-4" />
									{haveTax && <div className="flex-1 px-4" />}
									<AmountColumns
										amount={DX.formatNumberCurrency(element.setupFee.finalAmountPreTax)}
										className="flex-1 font-semibold"
									/>
									{haveTax && (
										<AmountColumns
											amount={
												!isEmpty(element?.setupFee.taxes)
													? DX.formatNumberCurrency(element?.setupFee.finalAmountAfterTax)
													: ''
											}
											className="flex-1 font-semibold"
										/>
									)}
								</div>
							)}
						</div>
					) : (
						<div
							key={`addon-${element.id}`}
							className="border-0 border-b border-solid border-gray-100 py-4"
						>
							<div className="flex-1 px-4">
								<Checkbox
									onChange={() => handleCheckAddon(index, element, !element.checked)}
									defaultChecked={element.isRequired === YES}
									disabled={allowEdit || element.isRequired === YES}
									className="checkbox-custom"
								>
									<div className="flex flex-col">
										<p className="mb-0 font-bold text-black">{element.name}</p>
									</div>
								</Checkbox>
							</div>
						</div>
					),
				)}
			</div>
		</>
	);
}

export default AddonInfo;
