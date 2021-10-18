import React from 'react';
import { useSelector } from 'react-redux';
import { DX } from 'app/models';
import { comboPricingSelects } from 'app/redux/comboPricingReducer';

export default function TotalPrice() {
	const totalPricePricing = useSelector(comboPricingSelects.selectTotalPrice);
	return <p className="font-bold pr-6">{DX.formatNumberCurrency(totalPricePricing)} VND</p>;
}
