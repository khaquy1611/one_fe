import { DX } from 'app/models';
import { formatNormalizeCurrency } from 'app/validator';
import React from 'react';

const CYCLE_TYPE = {
	DAILY: 'ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
function GetPriceCouponDetail(item) {
	const priceType = {
		PERCENT: '%',
		PRICE: ' VND',
	};

	if (item.promotionType === 'DISCOUNT' && item.discountType === 'PRICE') {
		return item.discountValue ? formatNormalizeCurrency(item.discountValue) + priceType.PRICE : item.promotionValue;
	}

	if (item.promotionType === 'DISCOUNT' && item.discountType === 'PERCENT') {
		return item.discountValue ? item.discountValue + priceType.PERCENT : item.promotionValue;
	}
	if (item.promotionValue) {
		return item.promotionValue;
	}
}

function checkCoupon(item) {
	if (item?.promotionType === 'DISCOUNT' && item?.timesUsedType === 'ONCE') return 'Áp dụng một lần';
	if (item?.timesUsedType === 'UNLIMITED') return 'Áp dụng vĩnh viễn';
	if (item?.promotionType === 'DISCOUNT' && item?.timesUsedType === 'LIMITED')
		return `Áp dụng ${item.type || item.limitedQuantity} lần`;
	return `Áp dụng ${item?.type || item.limitedQuantity} ${CYCLE_TYPE[item?.timeType]}`;
}
function ListPromotion({ item, typeSupscrip, type = '' }) {
	return (
		<div className={`${type !== 'TOTAL' && 'pl-5'}`}>
			{item?.listProduct?.length > 0 || item?.pricing?.length > 0 ? (
				(item?.listProduct?.length > 0 ? item.listProduct : item?.pricing)?.map((itemValue) => (
					<>
						<div className="font-semibold">
							Khuyến mại {itemValue.serviceName} - {itemValue.pricingName || itemValue.productName}
							{itemValue.promotionCode && (
								<span>
									: <span className="text-primary font-semibold">{item.promotionCode}</span>
								</span>
							)}
						</div>
						<p className="text-gray-400 text-sm mb-1">{checkCoupon(item)}</p>
						{item.minumumAmount > 0 && (
							<p className="text-gray-400 text-sm	mb-1">
								Số tiền tối thiểu: {DX.formatNumberCurrency(item.minumumAmount)} VND
							</p>
						)}
						{item.discountAmount > 0 && (
							<p className="text-gray-400 text-sm mb-1">
								Số tiền tối đa: {DX.formatNumberCurrency(item.discountAmount || item.maxUsed)} VND
							</p>
						)}
					</>
				))
			) : (
				<>
					<div className="font-semibold">
						Khuyến mại giảm{' '}
						{typeSupscrip === 'detail' ? (
							<>
								{GetPriceCouponDetail(item)}
								{item.promotionCode && (
									<span>
										: <span className="text-primary font-semibold">{item.promotionCode}</span>
									</span>
								)}
							</>
						) : (
							<>
								{item?.promotionValue}
								{item.promotionCode && (
									<span>
										: <span className="text-primary font-semibold">{item.promotionCode}</span>
									</span>
								)}
							</>
						)}
					</div>
					<p className="text-gray-400 text-sm mb-1">{checkCoupon(item)}</p>
					{item.minumumAmount > 0 && (
						<p className="text-gray-400 text-sm	mb-1">
							Số tiền tối thiểu: {DX.formatNumberCurrency(item.minumumAmount)} VND
						</p>
					)}
				</>
			)}
		</div>
	);
}

export default ListPromotion;
