import { Button } from 'antd';
import { useQueryUrl } from 'app/hooks';
import { ErrorIcon } from 'app/icons';
import { DX } from 'app/models';
import Payment from 'app/models/Payment';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const BoxForm = styled.div`
	max-width: 29.375rem;
	border-radius: 10px;
	padding: 0rem;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;
`;

export default function PaymentErrorPage() {
	const query = useQueryUrl();
	const history = useHistory();
	const orderId = query.get('orderId');
	const serviceId = query.get('serviceId');
	const planId = query.get('planId');
	const isCombo = query.get('isCombo');
	const actionType = query.get('actionType');
	const subscriptionId = query.get('subscriptionId');

	const paymentFrom = query.get('paymentFrom');
	const [state, setState] = useState({
		loading: false,
	});

	const message =
		paymentFrom === 'SUBSCRIPTION' ? (
			<>
				<div>Đăng ký thất bại!</div>
			</>
		) : (
			<>
				<div>
					Đăng ký thất bại! <br />
					Bạn có muốn thử lại không?
				</div>
			</>
		);

	const rePayMutation = useMutation(Payment.rePay, {
		onSuccess: ({ redirectURL }) => {
			if (redirectURL) {
				window.location.href = redirectURL;
			} else if (serviceId) {
				history.replace(
					DX.sme.createPath(
						`/${isCombo === 'YES' ? 'combo' : 'service'}/pay/${serviceId}/${planId}?orderId=${orderId}`,
					),
				);
			} else {
				history.replace(DX.sme.createPath('/'));
			}
			setState({
				loading: false,
			});
			return null;
		},
		onError: () => {
			if (serviceId) {
				history.replace(
					DX.sme.createPath(
						`/${isCombo === 'YES' ? 'combo' : 'service'}/pay/${serviceId}/${planId}?orderId=${orderId}`,
					),
				);
			} else {
				history.replace(DX.sme.createPath('/'));
			}
			setState({
				loading: false,
			});
		},
	});

	const onRetry = () => {
		if (orderId) {
			setState({
				loading: true,
			});
			rePayMutation.mutate({ orderId });
		} else if (serviceId) {
			history.replace(
				DX.sme.createPath(
					`/${isCombo === 'YES' ? 'combo' : 'service'}/pay/${serviceId}/${planId}?orderId=${orderId}`,
				),
			);
		} else {
			history.replace(DX.sme.createPath('/'));
		}
	};

	const onCancel = () => {
		if (paymentFrom === 'SUBSCRIPTION') {
			history.replace(DX.sme.createPath('/my-service'));
		} else {
			history.replace(DX.sme.createPath('/'));
		}
	};

	const goSubDetail = () =>
		history.replace(
			DX.sme.createPath(
				`/account/${isCombo === 'YES' ? 'combo' : 'subscription'}/${subscriptionId}/detail?tab=2`,
			),
		);

	return (
		<div className="flex justify-center mt-40">
			<BoxForm className="tablet:w-full w-5/12 text-center bg-white">
				<div className="flex flex-col justify-items-center items-center  px-8 gap-6 my-8">
					<ErrorIcon width="w-12" />
					{actionType === 'UPDATE_SUBSCRIPTION' ? 'Cập nhật thất bại' : message}
					<div className="flex justify-center gap-6">
						{actionType === 'UPDATE_SUBSCRIPTION' ? (
							<Button type="primary" onClick={goSubDetail}>
								Chi tiết thuê bao
							</Button>
						) : (
							<>
								<Button onClick={onCancel} className="w-40">
									Hủy
								</Button>
								<Button
									type="primary"
									onClick={onRetry}
									loading={state.loading}
									disabled={state.loading}
									className="w-40"
								>
									Thử lại
								</Button>
							</>
						)}
					</div>
				</div>
			</BoxForm>
		</div>
	);
}
