import React from 'react';
import PropTypes from 'prop-types';
import { Button, Divider } from 'antd';
import { isEmpty, noop } from 'opLodash';
import { DX } from 'app/models';
import { useSelector } from 'react-redux';
import { useLng } from 'app/hooks';
import { billingSelects } from '../redux/billingReducer';

function InformationDetail({ className, next, dataSetupFee, amount }) {
	const { tButton, tOthers } = useLng();
	const billingInfo = useSelector(billingSelects.selectBillingInfo);

	return (
		<>
			<div className={`rounded-xl p-8 bg-white h-auto flex flex-col ${className}`}>
				<p className="text-xl font-semibold uppercase">{tOthers('chargeInfo')}</p>
				<div className="flex justify-between">
					<p className="mb-0 text-gray-400">{tOthers('servicePackage')}</p>
					<p className="mb-0 font-semibold">{`${DX.formatNumberCurrency(billingInfo.price)} ${
						billingInfo.currencyName
					}`}</p>
				</div>
				<Divider className="my-4" />
				<div className="flex justify-between">
					<p className="mb-0 text-gray-400">{tOthers('setupCost')}</p>
					<p className="mb-0 font-semibold">{`${DX.formatNumberCurrency(dataSetupFee.afterAmountTax)} ${
						billingInfo.currencyName
					}`}</p>
				</div>
				<Divider className="my-4" />
				<div className="flex justify-between">
					<p className="mb-0 text-gray-400">{tOthers('totalCostOfPayment')}</p>
					<p className="mb-0 font-semibold  text-lg text-primary">
						{`${DX.formatNumberCurrency(billingInfo.totalAmount)} ${billingInfo.currencyName}`}
					</p>
				</div>
				<div className="mt-2 mb-4">
					{/* <Button className="font-semibold w-auto p-0" type="link">
						Hóa đơn chi tiết
					</Button> */}
				</div>
				<Button
					type="primary"
					className="uppercase font-semibold"
					onClick={() => next()}
					disabled={amount < 1 && isEmpty(amount)}
				>
					{tButton('next')}
				</Button>
			</div>
		</>
	);
}
InformationDetail.propTypes = {
	next: PropTypes.func,
	className: PropTypes.string,
};
InformationDetail.defaultProps = {
	next: noop,
	className: '',
};

export default InformationDetail;
