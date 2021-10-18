/* eslint-disable no-unused-expressions */
import React from 'react';
import { Avatar } from 'antd';
import { ComboSME, DX, SmeService, SubcriptionPlanDev } from 'app/models';
import { isEmpty } from 'opLodash';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import SmeSubscription from 'app/models/SmeSubscription';
import { useLng } from 'app/hooks';
import { billingSelects } from '../redux/billingReducer';

function InvoiceDetailForm({
	className,
	serviceId,
	planId,
	pricingTrial,
	inCombo,
	setHaveError,
	setDataInvoice,
	setPreOrder,
}) {
	const billingInfo = useSelector(billingSelects.selectBillingInfo);
	const haveTax = useSelector(billingSelects.haveTax);

	const { tOthers, tMenu, tField } = useLng();
	const { data: dataDetail } = useQuery(
		['getDetailService'],
		() => (inCombo ? ComboSME.getOneById(serviceId) : SmeService.getOneById(serviceId)),
		{
			initialData: {},
			onSuccess(res) {
				setPreOrder && setPreOrder({ urlPreOrder: res.urlPreOrder });
			},
			onError(e) {
				e.options = { name: e.message };
				setHaveError &&
					setHaveError({
						...e,
						callbackUrl: DX.sme.createPath(''),
						dynamicCallbackUrl: e.errorCode === 'error.combo.invisible' ? DX.sme.createPath('') : null,
					});
			},
		},
	);

	const { data: dataInfoSubscription } = useQuery(
		['getInfoSubscription'],
		async () => {
			const res = await SmeSubscription.getDataInfoSubscription({
				serviceId,
				pricingId: planId,
			});
			setDataInvoice(res);
			return res;
		},
		{
			initialData: {},
			enabled: !!planId && !inCombo,
		},
	);

	const { data: dataInfoCombo } = useQuery(
		['getInfoCombo'],
		async () => {
			const res = await ComboSME.getDataInfoComBo({
				serviceId,
				pricingId: planId,
			});
			setDataInvoice(res);
			return res;
		},
		{
			initialData: {},
			enabled: !!planId && !!inCombo,
		},
	);

	return (
		<div className={`rounded-xl p-8 bg-white h-full flex flex-col ${className}`}>
			<p className="text-xl font-semibold">{tMenu('serviceInfo')}</p>
			<div className="rounded-xl p-2.5 bg-white border border-gray-50 flex mt-5 w-full">
				<div className="tablet:w-24 tablet:h-24 w-28 h-28 flex-none relative ">
					<Avatar
						className="rounded-lg cursor-pointer w-full h-full absolute"
						shape="square"
						src={dataDetail.icon || dataDetail.embedIconUrl || dataDetail.externalLinkIcon}
					/>
				</div>

				<div className="flex-auto">
					<div className="flex flex-col flex-grow ml-4">
						<div className="font-bold text-gray-700 cursor-pointer mb-2 break-all">{dataDetail.name}</div>
						<p className="text-sm font-bold text-primary cursor-pointer mb-2 break-all">
							{dataDetail.developerName}
						</p>
					</div>
				</div>
			</div>
			{pricingTrial ? (
				<div className="mt-8 text-gray-500">
					Thời gian dùng thử: {pricingTrial.numberOfTrial}{' '}
					{SmeSubscription.convertTimeDay[pricingTrial.trialType]}
				</div>
			) : (
				<div className="ml-5 mr-1">
					<div className="flex justify-between mt-5 mb-4 text-gray-80">
						<p>{billingInfo.pricingName || billingInfo.comboName}</p>
						<p className="font-bold">
							{DX.formatNumberCurrency(
								haveTax
									? billingInfo.pricing?.finalAmountAfterTax
									: billingInfo.pricing?.finalAmountPreTax,
							)}{' '}
							{billingInfo.currencyName || 'VND'}
						</p>
					</div>
					{billingInfo.pricing?.setupFee?.price > 0 && (
						<div className="flex justify-between mt-5 mb-4 text-gray-80">
							<p>Phí thiết lập </p>
							<p className="font-bold">
								{isEmpty(billingInfo.pricing.setupFee.taxes)
									? DX.formatNumberCurrency(billingInfo.pricing.setupFee.price)
									: DX.formatNumberCurrency(billingInfo.pricing.setupFee.finalAmountAfterTax)}{' '}
								{billingInfo.currencyName || 'VND'}
							</p>
						</div>
					)}

					{billingInfo.addonList?.map((item) => {
						if (isEmpty(item) || !item.checked) {
							return null;
						}
						return (
							<>
								<div key={item.id}>
									<hr style={{ border: 'none', borderBottom: '1px solid #E6E6E6' }} />
									<div className="flex justify-between items-center my-6 text-gray-80">
										<p>{item.name}</p>
										<p className="font-bold mb-0">
											{DX.formatNumberCurrency(
												isEmpty(item.tax) ? item?.finalAmountPreTax : item?.finalAmountAfterTax,
											)}{' '}
											{billingInfo.currencyName || 'VND'}
										</p>
									</div>
								</div>
								{item.setupFee?.price > 0 && (
									<div className="flex justify-between mt-5 mb-4 text-gray-80">
										<p>Phí thiết lập</p>
										<p className="font-bold">
											{isEmpty(item.setupFee.taxes)
												? DX.formatNumberCurrency(item.setupFee.price)
												: DX.formatNumberCurrency(item.setupFee.finalAmountAfterTax)}{' '}
											{billingInfo.currencyName || 'VND'}
										</p>
									</div>
								)}
							</>
						);
					})}

					<hr style={{ border: 'none', borderBottom: '1px solid #E6E6E6' }} />
					<div className="flex justify-between mt-4 text-gray-80">
						<p>{tField('totalMoney')}</p>
						<p className="font-bold flex">
							<span>
								{DX.formatNumberCurrency(
									!haveTax
										? billingInfo.totalAmountPreTaxFinal
										: billingInfo.totalAmountAfterTaxFinal,
								)}{' '}
								{billingInfo.currencyName || 'VND'}
							</span>
						</p>
					</div>
					<div className="flex justify-between mt-4 text-gray-80">
						<p>{tField('paymentCycle')}</p>
						<p className="font-bold flex">
							{billingInfo.paymentCycle}{' '}
							{tOthers(SubcriptionPlanDev.getTimeFormCode[billingInfo.cycleType])}
						</p>
					</div>
					<div className="flex justify-between mt-4 text-gray-80">
						<p>{tField('startDate')}</p>
						{(billingInfo.pricingType === 'PREPAY' || billingInfo.comboPlanType === 'PREPAY') && (
							<p className="font-bold flex">
								{inCombo ? dataInfoCombo?.subscriptionDate : dataInfoSubscription?.subscriptionDate}
							</p>
						)}
						{(billingInfo.pricingType === 'POSTPAID' || billingInfo.comboPlanType === 'POSTPAID') && (
							<p className="font-bold flex">
								{inCombo ? dataInfoCombo?.subscriptionDate : dataInfoSubscription?.subscriptionDate}
							</p>
						)}
					</div>
					<div className="flex justify-between mt-4 text-gray-80">
						<p>{tField('timeForPayment')}</p>
						<p className="font-bold flex">
							{inCombo ? dataInfoCombo?.requirePaymentDate : dataInfoSubscription?.requirePaymentDate}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default InvoiceDetailForm;
