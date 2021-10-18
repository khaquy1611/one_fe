import React from 'react';
import { Button } from 'antd';
import Payment from 'app/models/Payment';

function PaymentButton({ name, amount, currency, description, clientIp }) {
	const doPayment = async () => {
		const res = await Payment.createOrder({
			amount: amount ?? 2000,
			currency: currency ?? 'VND',
			description: description ?? 'Test thanh toan',
			type: 1,
			clientIp: clientIp ?? '102.120.102.120',
		});
		if (res.isSuccess) {
			window.location.href = res.redirectUrl;
		} else {
			// eslint-disable-next-line no-alert
			alert(res.message);
		}
	};
	return (
		<Button nzType="primary" onClick={doPayment}>
			<i nz-icon nzType="dollar-circle" />
			{name ?? 'Thanh toán'}
		</Button>
	);
}

export default PaymentButton;
