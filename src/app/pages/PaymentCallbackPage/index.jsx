import { Spin } from 'antd';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useQueryUrl } from 'app/hooks';
import Payment from 'app/models/Payment';
import { useHistory } from 'react-router-dom';
import { DX } from 'app/models';

const ProcessForm = styled.div`
	position: fixed;
	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;
	background-color: white;
	z-index: 999;
	text-align: center;
	padding-top: 20%;
`;
export default function PaymentCallbackPage() {
	const query = useQueryUrl();
	const orderId = query.get('data');
	const responseCode = query.get('vnptpayResponseCode');
	const secureCode = query.get('secureCode');

	const history = useHistory();

	const activeMutation = useMutation(Payment.verifyPayment, {
		onSuccess: (data) => {
			if (responseCode !== '00') {
				history.push(
					DX.sme.createPath(
						`/payment-error?serviceId=${data?.TYPE === 'COMBO' ? data.COMBO_ID : data.SERVICE_ID}&planId=${
							data?.TYPE === 'COMBO' ? data.COMBO_PLAN_ID : data.PLAN_ID
						}&orderId=${data.MERCHANT_ORDER_ID}&paymentFrom=${data.SCREEN_TYPE}&isCombo=${
							data?.TYPE === 'COMBO' ? 'YES' : 'NO'
						}&actionType=${data.ACTION_TYPE}&subscriptionId=${data.SUBSCRIPTION_ID}`,
					),
				);
			} else {
				history.push(
					DX.sme.createPath(
						`/payment-success?serviceId=${
							data?.TYPE === 'COMBO' ? data.COMBO_ID : data.SERVICE_ID
						}&planId=${data?.TYPE === 'COMBO' ? data.COMBO_PLAN_ID : data.PLAN_ID}&orderId=${
							data.MERCHANT_ORDER_ID
						}&paymentFrom=${data.SCREEN_TYPE}&isCombo=${data?.TYPE === 'COMBO' ? 'YES' : 'NO'}&actionType=${
							data.ACTION_TYPE
						}&subscriptionId=${data.SUBSCRIPTION_ID}`,
					),
				);
			}
		},
		onError: (error) => {
			history.push(DX.sme.createPath(`/payment-error`));
		},
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		const validateData = async () => {
			activeMutation.mutate({ orderId, responseCode, secureCode });
		};
		if (orderId) {
			validateData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderId]);

	useEffect(
		() => () => {
			document.body.style.overflow = 'auto';
		},
		[],
	);

	return (
		<ProcessForm>
			<>
				<Spin />
				<p>Hệ thống đang xử lý vui lòng chờ ....</p>
			</>
		</ProcessForm>
	);
}
