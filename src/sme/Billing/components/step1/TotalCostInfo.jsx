import { Input } from 'antd';
import { DX, SubcriptionPlanDev } from 'app/models';
import { isEmpty, isNil } from 'opLodash';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { billingActions } from 'sme/Billing/redux/billingReducer';
import { TableNoContent } from 'sme/components';
import { useLng } from 'app/hooks';
import RenderCouponList from '../RenderCouponList';
import UserInputCoupon from './UserInputCoupon';
import { IN_TOTAL } from '../../constant';

const AmountColumns = ({ amount, className }) => (
	<div className={`${className} text-right px-4 text-primary my-auto break-words`}>{amount}</div>
);

function TotalCostInfo({ isNoTax, billingInfo, CheckComponent }) {
	const { tMenu, tOthers, tField, tLowerField } = useLng();
	const dispatch = useDispatch();
	const handleCheckCouponOnTotal = (index, coupon) => {
		dispatch(billingActions.handleCheckCouponOnTotal({ index, coupon }));
	};
	const { path } = useRouteMatch();

	return (
		<>
			<p className="text-base font-bold text-primary">{tMenu('totalCostInformation')}</p>
			<div className="py-4 align-element">
				{/* Table */}
				<TableNoContent currencyName={billingInfo.currencyName} haveTax={!isNoTax} />

				{/* Thành tiền */}
				{/* <div className="mt-4 w-full flex">
					<div className="flex-1">{tOthers('totalAmount1')}:</div>
					<div className="flex-1 px-4" />

					<AmountColumns
						amount={isNoTax ? '' : DX.formatNumberCurrency(billingInfo.totalAmountPreTax)}
						className="w-1/5"
					/>

					<AmountColumns
						amount={isNoTax ? DX.formatNumberCurrency(billingInfo.totalAmountPreTax) : ''}
						className="w-1/5"
					/>
				</div> */}

				<div className="mt-4">
					<div className="beauty-scroll wrap-pricing" style={{ maxHeight: '18rem' }}>
						{!isEmpty(billingInfo.coupons) &&
							billingInfo.coupons.map((item, index) => (
								<div className="align-element mt-4 w-full flex bg-gray-300 py-4" key={item.couponId}>
									<div className="w-2/5 px-4">
										<CheckComponent
											onChange={() => handleCheckCouponOnTotal(index, item)}
											className="checkbox-custom"
											coupon={item}
											type="in-total"
											disabled={item.disabled}
										>
											<RenderCouponList
												className="flex flex-col"
												item={item}
												currency={billingInfo.currencyName}
											/>
										</CheckComponent>
									</div>
									<div className="flex-1 px-4" />

									{/* cột - trước thuế */}
									<AmountColumns
										amount={
											isNoTax || isNil(item.pricingInfo?.price)
												? ''
												: DX.formatNumberCurrency(item.pricingInfo?.price)
										}
										className="flex-1"
									/>

									{/* cột - số tiền */}
									<AmountColumns
										amount={
											isNoTax && !isNil(item.pricingInfo?.price)
												? DX.formatNumberCurrency(item.pricingInfo?.price)
												: ''
										}
										className="flex-1"
									/>
								</div>
							))}
					</div>
				</div>

				{/* input user nhap couponcode */}

				<UserInputCoupon couponType={IN_TOTAL} />

				{/* Tổng số tiền thanh toán */}
				<div className="mt-2 w-full flex">
					<div className="flex-1">
						<span className="font-semibold">{tOthers('totalPaymentAmount')}</span>
					</div>
					<AmountColumns className="flex-1" />
					{/* cột - trước thuế */}
					<AmountColumns
						amount={isNoTax ? '' : DX.formatNumberCurrency(billingInfo.totalAmountPreTaxFinal)}
						className="w-1/5 font-semibold"
					/>
					{/* cột - số tiền */}
					<AmountColumns
						amount={
							isNoTax
								? DX.formatNumberCurrency(billingInfo.totalAmountPreTaxFinal)
								: DX.formatNumberCurrency(billingInfo.totalAmountAfterTaxFinal)
						}
						className="w-1/5 font-semibold"
					/>
				</div>
				{/* Số chu kỳ thanh toán */}
				<div className="flex gap-8 justify-between w-full mt-5">
					{billingInfo.price !== 0 && (
						<>
							<div className="flex-1">
								<p className="mb-1">{tField('billingCycleAmount')}</p>
								<Input
									defaultValue={
										billingInfo.numberOfCycles === -1
											? `${tOthers('unlimited')}`
											: billingInfo.numberOfCycles
									}
									disabled
								/>
							</div>
							<div className="flex-1">
								<p className="mb-1">{tField('paymentCycle')}</p>

								<Input
									defaultValue={
										billingInfo.numberOfCycles === 1
											? `Thanh toán một lần`
											: `${billingInfo.paymentCycle} ${tLowerField(
													SubcriptionPlanDev.getTimeFormCode[billingInfo.cycleType],
											  )}`
									}
									disabled
								/>
							</div>
						</>
					)}

					{path.indexOf('change-pack') !== -1 && (
						<>
							<div className="flex-1 items-center">
								<p className="mb-1">{tOthers('timeToChangePackage')}</p>
								<Input defaultValue={DX.formatDate(billingInfo.changeDate)} disabled />
							</div>
							<div className="flex-1 items-center">
								<p className="mb-1">{tOthers('timeToStartUsing')}</p>
								<Input defaultValue={DX.formatDate(billingInfo.startDateSubscription)} disabled />
							</div>
							{billingInfo.endDateSubscription !== null && (
								<div className="flex-1">
									<p className="mb-1">{tOthers('timeToEndUsing')}</p>

									<Input defaultValue={DX.formatDate(billingInfo.endDateSubscription)} disabled />
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
}

export default TotalCostInfo;
