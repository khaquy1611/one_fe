import { Button } from 'antd';
import { useQueryUrl } from 'app/hooks';
import { TickCheck } from 'app/icons';
import { DX } from 'app/models';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const BoxForm = styled.div`
	max-width: 35.625rem;
	padding: 0rem;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;
`;

export default function PaymentSuccessPage() {
	const query = useQueryUrl();
	const history = useHistory();
	const isCombo = query.get('isCombo');
	const serviceOwner = query.get('serviceOwner');
	const subCode = query.get('subCode');
	const serviceName = query.get('serviceName');

	const paymentFrom = query.get('paymentFrom');
	const message = paymentFrom !== 'BILLING' ? 'Quý khách đã đăng ký thành công dịch vụ!' : 'Thanh toán thành công';
	const msg = isCombo === 'YES' ? 'Chi tiết dịch vụ' : 'Chi tiết đơn hàng';
	const primaryLabel = paymentFrom !== 'BILLING' ? msg : 'Xem chi tiết hóa đơn';
	const actionType = query.get('actionType');
	const subscriptionId = query.get('subscriptionId');

	const onPrimaryClick = () => {
		if (paymentFrom !== 'BILLING') {
			if (actionType === 'UPDATE_SUBSCRIPTION')
				return history.replace(
					DX.sme.createPath(
						`/account/${isCombo === 'YES' ? 'combo' : 'subscription'}/${subscriptionId}/detail?tab=2`,
					),
				);

			if (serviceOwner === 'OTHER' || serviceOwner === 'NONE') {
				return history.replace(DX.sme.createPath('/my-service?tab=orderService'));
			}

			return history.replace(DX.sme.createPath('/my-service'));
		}

		return history.replace(DX.sme.createPath('/account/invoice'));
	};

	return (
		<div className="flex justify-center mt-40">
			<BoxForm className="tablet:w-full w-5/12 text-center bg-white">
				{(serviceOwner === 'null' || serviceOwner === 'OTHER' || serviceOwner === 'NONE') &&
				actionType !== 'UPDATE_SUBSCRIPTION' ? (
					<div className="flex flex-col items-center my-8 px-8 gap-6">
						<TickCheck width="w-12" />

						<div className="font-semibold">{message}</div>
						<div className="flex flex-col">
							{!!serviceName && (
								<div>
									Tên dịch vụ: <span className="text-primary">{serviceName}</span>
								</div>
							)}

							{!!subCode && <div>Mã đơn hàng: {subCode}</div>}
						</div>
						<div className="pt-4" style={{ border: 'none', borderTop: '1px solid #E6E6E6' }}>
							Chúng tôi sẽ liên hệ theo số điện thoại Quý khách đã đăng ký, để hoàn thiện triển khai đơn
							hàng. Cảm ơn Quý khách đã sử dụng dịch vụ của VNPT.
						</div>
						<div className="font-semibold">Để được hỗ trợ, vui lòng liên hệ 18001260 (miễn phí)</div>
						<Button type="primary" onClick={onPrimaryClick}>
							{primaryLabel}
						</Button>
					</div>
				) : (
					<div className="flex flex-col items-center my-8 px-8 gap-6">
						<TickCheck width="w-12" />
						<div>
							{actionType === 'UPDATE_SUBSCRIPTION' ? 'Quý khách đã thanh toán thành công' : message}
						</div>
						<Button type="primary" onClick={onPrimaryClick}>
							{actionType === 'UPDATE_SUBSCRIPTION' ? 'Chi tiết thuê bao' : primaryLabel}
						</Button>
					</div>
				)}
			</BoxForm>
		</div>
	);
}
