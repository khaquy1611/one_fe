import { DX } from 'app/models';
import { useLng } from 'app/hooks';
import React from 'react';

const PRODUCT = 'PRODUCT';
const PERCENT = 'PERCENT';

const timesUseType = {
	ONCE: 'một lần',
	LIMITED: 'LIMITED',
	UNLIMITED: 'vĩnh viễn',
};

const timesProduct = {
	DAILY: 'ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
	TIMES: 'lần',
};

function Apply({ useType, limitedQuantity, timeType }) {
	const { tOthers } = useLng();

	if (useType === timesUseType.LIMITED)
		return (
			<p className="text-gray-40 text-sm mb-0">
				{tOthers('apply')} {limitedQuantity} {timesProduct[timeType]}
			</p>
		);

	return (
		<p className="text-gray-40 text-sm mb-0">
			{tOthers('apply')} {timesUseType[useType]}
		</p>
	);
}

function RenderCouponList({ item, currency, className }) {
	const { tOthers } = useLng();

	if (item.promotionType === PRODUCT) {
		return (
			<div className={className}>
				<p className="mb-1 text-gray-80 font-medium">
					{tOthers('prom')} {item.serviceName} - {item.pricingName}
				</p>
				<Apply
					useType={item.timesUsedType}
					limitedQuantity={item.limitedQuantity}
					timeType={item.timeType || item.type}
				/>
			</div>
		);
	}
	if (item.discountType === PERCENT) {
		return (
			<div className={className}>
				<p className="mb-1 text-gray-80 font-medium">
					{tOthers('promIsDiscounted')} {item.discountValue || item.couponValue}%
					{/* {item.code && (
						<span>
							: <span className="text-primary font-semibold">{item.code}</span>
						</span>
					)} */}
				</p>
				<Apply
					useType={item.timesUsedType}
					limitedQuantity={item.limitedQuantity}
					timeType={item.timeType || item.type}
				/>
			</div>
		);
	}
	return (
		<div className={className}>
			<p className="mb-1 text-gray-80 font-medium">
				{tOthers('promIsDiscounted')} {DX.formatNumberCurrency(item.discountValue || item.couponValue)}{' '}
				{currency}
				{/* {item.code && (
					<span>
						: <span className="text-primary font-semibold">{item.code}</span>
					</span>
				)} */}
			</p>
			<Apply
				useType={item.timesUsedType}
				limitedQuantity={item.limitedQuantity}
				timeType={item.timeType || item.type}
			/>
		</div>
	);
}

export default RenderCouponList;
