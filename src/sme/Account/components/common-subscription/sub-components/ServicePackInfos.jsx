import React, { useRef, useEffect } from 'react';
import { InputAmount } from 'sme/components';
import { DX, SubcriptionPlanDev } from 'app/models';
import { isEmpty as _isEmpty } from 'opLodash';
import { useLng, useQueryUrl } from 'app/hooks';
import { ServicePackInfo } from 'sme/Billing/components/step1';
import { useRouteMatch } from 'react-router-dom';

const FLAT_RATE = 'FLAT_RATE';
const UNIT = 'UNIT';
const NONE = 'NONE';

const formatCurrency = (value) => <span className="font-semibold text-primary">{DX.formatNumberCurrency(value)}</span>;

function ServicePackInfos({ data, haveTax, showModalCalculation, CheckComponent, handleChangeAmount, allowEdit }) {
	const inputRef = useRef(null);
	const { path } = useRouteMatch();
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const { tOthers, tField, tLowerField } = useLng();

	const renderQuantity = () => {
		if (data.pricingPlan === FLAT_RATE) return <span />;
		if (getTab === '3') return <span className="text-black font-medium">{data.quantity}</span>;
		return (
			<InputAmount
				defaultValue={data.quantity}
				autoFocus
				forwardRef={inputRef}
				disabled={allowEdit || data.hasChangeQuantity === NONE}
				handleChangeAmount={(amount) => handleChangeAmount(amount)}
				preValue={data.preQuantity}
			/>
		);
	};

	const pricingColumns = [
		{
			title: tField('category'),
			key: 'id',
			dataIndex: 'id',
			render: () => (
				<>
					<p className="font-bold text-black mb-0">{data.pricingName}</p>
					<div className="flex flex-col mt-2">
						{data.price !== 0 &&
							!_isEmpty(data.taxList) &&
							data.taxList.map((item) => (
								<p className="mb-1 text-sm text-gray-40" key={`tax-${item.taxName}`}>
									{/* {item.hasTax === 'YES' || item.hasTax === 1
										? `${tOthers('included')} ${item?.percent}% ${tLowerField('tax')} ${
												item.taxName
										  }`
										: `${tOthers('notIncluded')} ${item?.percent}% ${item.taxName}`} */}
									{tOthers('notIncluded')} {item?.percent}% {item.taxName}
								</p>
							))}

						{data.price !== 0 && (
							<p className="mb-1 text-sm text-gray-40">
								{tOthers('paymentCycle')}{' '}
								<span className="text-primary">
									{data.paymentCycle} {tOthers(SubcriptionPlanDev.getTimeFormCode[data.cycleType])}
								</span>
							</p>
						)}

						{/* {!!data.numberOfTrial && (
							<p className="mb-1 text-sm text-gray-40">
								{tOthers('trial')} {data.numberOfTrial}{' '}
								{tOthers(SubcriptionPlanDev.getTimeFormCode[data.trialType])}
							</p>
						)} */}
						{data.pricingPlan === 'UNIT' && data.freeQuantity > 0 && (
							<p className="mb-0 text-sm text-gray-40">
								{tField('freeQuantity')}: {data.freeQuantity} {data.unitName}
							</p>
						)}
					</div>
				</>
			),
		},
		{
			title: tField('quantity'),
			key: 'quantity',
			render: () => renderQuantity(),
		},
		{
			align: 'right',
			title: (
				<span>
					{tField('unitPrice')} ({data.currencyName || 'VND'})
				</span>
			),
			key: 'unitPrice',
			render: () =>
				data.price !== null && (data.pricingPlan === UNIT || data.pricingPlan === FLAT_RATE)
					? formatCurrency(data.price)
					: '--',
		},
		{
			align: 'right',
			title: !haveTax ? (
				<span>
					{tField('amountOfMoney')} ({data.currencyName || 'VND'})
				</span>
			) : (
				<span>
					{tField('amountOfMoneyBeforeTax')} ({data.currencyName || 'VND'})
				</span>
			),
			key: 'preAmountTax',
			render: () => !_isEmpty(data) && formatCurrency(data.pricing?.preAmountTax),
			fixed: !haveTax ? 'right' : '',
		},
		{
			align: 'right',
			title: (
				<span>
					{tField('amountOfMoneyAfterTax')} ({data.currencyName || 'VND'})
				</span>
			),
			key: 'afterAmountTax',
			fixed: 'right',
			render: () => <span className="font-semibold text-primary" />,
			hide: !haveTax,
		},
	];

	const comboColumns = [
		{
			title: tField('category'),
			key: 'id',
			dataIndex: 'id',
			render: () => (
				<>
					<p className="font-bold text-black mb-0">{data.comboPlanName}</p>
					<div className="flex flex-col text-gray-500 mt-2">
						{data.price !== 0 &&
							!_isEmpty(data.taxList) &&
							data.taxList.map((item) => (
								<p className="mb-0 text-sm text-gray-40" key={`tax-${item.taxName}`}>
									{/* {item.hasTax === 'YES' || item.hasTax === 1
										? `${tOthers('included')} ${item?.percent}% ${tLowerField('tax')} ${
												item.taxName
										  }`
										: `${tOthers('notIncluded')} ${item?.percent}% ${item.taxName}`} */}
									{tOthers('notIncluded')} {item?.percent}% {item.taxName}
								</p>
							))}

						{data.price !== 0 && (
							<p className="mb-1 text-sm text-gray-40">
								{tOthers('paymentCycle')}{' '}
								<span className="text-primary">
									{data.paymentCycle} {tOthers(SubcriptionPlanDev.getTimeFormCode[data.cycleType])}
								</span>
							</p>
						)}

						{/* {!!data.numberOfTrial && (
							<p className="mb-1 text-sm text-gray-40">
								{tOthers('trial')} {data.numberOfTrial}{' '}
								{tOthers(SubcriptionPlanDev.getTimeFormCode[data.trialType])}
							</p>
						)} */}
						{!!data.freeQuantity && (
							<p className="mb-0 text-sm">
								{tField('freeQuantity')}: {data.freeQuantity} {data.unitName}
							</p>
						)}
					</div>
				</>
			),
		},
		{
			title: (
				<span>
					Hiện trạng
					<br /> sử dụng
				</span>
			),
			dataIndex: 'currentUsed',
			width: '10%',
		},
		{
			title: (
				<span>
					Số lượng <br /> miễn phí
				</span>
			),
			dataIndex: 'freeQuantity',
			width: '10%',
		},
		{
			align: 'right',
			title: 'Số lượng',
			dataIndex: 'quantity',
			width: '10%',
		},
		{
			align: 'right',
			title: !haveTax ? (
				<span>Số tiền ({data.currencyName || 'VND'})</span>
			) : (
				<span>
					Số tiền trước thuế <br /> ({data.currencyName || 'VND'})
				</span>
			),
			key: 'preAmountTax',
			render: () => (
				<span className="text-primary font-medium">{DX.formatNumberCurrency(data.pricing?.preAmountTax)}</span>
			),
			fixed: !haveTax ? 'right' : '',
			width: '20%',
		},
		{
			align: 'right',
			title: (
				<span>
					Số tiền sau thuế <br /> ({data.currencyName || 'VND'} )
				</span>
			),
			key: 'afterAmountTax',
			fixed: 'right',
			render: () => <span className="text-primary" />,
			width: '20%',
			hide: !haveTax,
		},
	];

	useEffect(() => {
		if (allowEdit && inputRef?.current)
			inputRef.current.focus({
				cursor: 'end',
			});
	}, [allowEdit]);

	return (
		<ServicePackInfo
			columns={path.indexOf('combo') !== -1 ? comboColumns : pricingColumns}
			data={data}
			showModalCalculation={showModalCalculation}
			haveTax={haveTax}
			CheckComponent={CheckComponent}
			allowEdit={allowEdit}
			typeSubscription={path.indexOf('combo') !== -1}
		/>
	);
}

export default ServicePackInfos;
