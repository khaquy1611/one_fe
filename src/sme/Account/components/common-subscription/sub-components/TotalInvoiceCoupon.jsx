import React from 'react';
import { Checkbox } from 'antd';
import RenderCouponList from 'sme/Billing/components/RenderCouponList';

function TotalInvoiceCoupon({ invoiceCoupon, currencyName }) {
	return (
		<>
			{invoiceCoupon.map((el, index) => (
				<div
					key={`coupon-${index + 1}`}
					className="border-0 border-b border-solid border-gray-100 py-4 un-border-last"
				>
					<Checkbox className="checkbox-custom" defaultChecked disabled>
						<RenderCouponList className="flex flex-col" item={el} currency={currencyName} />
					</Checkbox>
				</div>
			))}
		</>
	);
}

export default TotalInvoiceCoupon;
