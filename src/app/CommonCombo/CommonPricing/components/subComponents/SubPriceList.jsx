import { Tooltip } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { DX } from 'app/models';
import { comboPricingSelects } from 'app/redux/comboPricingReducer';

function SubPriceList({ index }) {
	const priceList = useSelector(comboPricingSelects.selectPriceList);

	return (
		<Tooltip key={`${index}-price`} placement="bottomRight" title={DX.formatNumberCurrency(priceList[index])}>
			<div key={`${index}-price`} className="truncate pt-2">
				<div className="text-right">{DX.formatNumberCurrency(priceList[index])}</div>
			</div>
		</Tooltip>
	);
}

export default SubPriceList;
