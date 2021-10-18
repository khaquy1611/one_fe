import React from 'react';
import PropTypes from 'prop-types';
import { BankIcon, VnptIcon } from 'app/icons';
import { Button, Form, message, Radio, Spin } from 'antd';
import CurrencyIcon from 'app/icons/CurrencyIcon';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { SMESubscription, SubscriptionDev } from 'app/models';

const { Item } = Form;
const BoxForm = styled(Form)`
	.ant-radio-group {
		display: flex;
		width: 100%;
		gap: 2rem;
		.ant-radio-wrapper {
			display: flex;
			width: calc(100% / 3);
			flex-direction: column;
			border: 2px solid #eaecf4;
			box-sizing: border-box;
			border-radius: 16px;
			&.ant-radio-wrapper-checked {
				color: var(--ck-color-text);
				border: 2px solid var(--color-primary);
			}
			.payment-item {
				text-align: center;
				margin-top: 1rem;
				.payment-icon {
					width: 100%;
					margin-bottom: 1rem;
					.anticon {
						margin: auto;
						width: 100%;
						svg {
							height: 2rem;
							width: 100%;
						}
					}
				}
			}
		}
	}
`;

function PaymentMethod({ dataDetail, subscriptionId, isOrderService }) {
	const PAYMENT_METHODS = [
		{
			value: 'BY_CASH',
			text: 'Tiền mặt',
			icon: <CurrencyIcon className="mr-2 flex" width="w-6" />,
		},
		// {
		// 	value: 'P2P',
		// 	text: 'Chuyển khoản qua ngân hàng',
		// 	icon: <BankIcon className="mr-2 flex" width="w-6" />,
		// },
		{
			value: 'VNPTPAY',
			text: 'VNPT Pay',
			icon: <VnptIcon className="mr-2 flex" width="w-20" />,
			isHideOrderService: true,
		},
	];

	const [formPayment] = Form.useForm();
	// const [isDirty, setIsDirty] = useState(false);
	// const [showModal, setShowModal] = useState(false);

	const { data: currentPaymentMethod, isFetching } = useQuery(
		['currentPaymentMethodSub', subscriptionId, dataDetail.subscriptionStatus !== 'IN_TRIAL'],
		async () => {
			const res = await SubscriptionDev.getPayment(subscriptionId);
			return res.paymentMethod;
		},

		{
			onSuccess: (res) => {
				formPayment.setFieldsValue({ optionPayment: res });
			},
			initialData: {
				loading: true,
			},
			enabled: !!subscriptionId && dataDetail.subscriptionStatus !== 'IN_TRIAL',
			cacheTime: 0,
		},
	);
	const checkMethod = (value) => PAYMENT_METHODS.filter((el) => el.value === value)[0].text;
	return (
		<>
			{dataDetail.subscriptionStatus !== 'IN_TRIAL' ? (
				// <div className="flex items-center">
				// 	<div>Phương thức thanh toán hiện tại</div>
				// 	<div className="ml-5">
				// 		{' '}
				// 		<Radio checked className="modifyRadio flex items-center m-0 py-5 pl-8 pr-32">
				// 			<div className="ml-2.5 mr flex items-center whitespace-normal">
				// 				<BankIcon className="mr-2 flex" width="w-6" />
				// 				<div>***************123</div>
				// 			</div>
				// 		</Radio>
				// 	</div>
				// </div>
				<Spin spinning={isFetching}>
					<div className="w-1/2">
						<BoxForm hideRequiredMark form={formPayment} className="mb-6">
							<Item name="optionPayment">
								<Radio.Group>
									{PAYMENT_METHODS.map(
										(item) =>
											((!isOrderService && item.isHideOrderService) ||
												(isOrderService && !item.isHideOrderService)) && (
												<Radio
													value={item.value}
													key={item.value}
													className="items-center m-0 px-6 pt-6"
													disabled
												>
													<div className="payment-item">
														<div className="payment-icon">{item.icon}</div>
														<div className="payment-text">{item.text}</div>
													</div>
												</Radio>
											),
									)}
								</Radio.Group>
							</Item>
						</BoxForm>
					</div>
				</Spin>
			) : (
				<div>Chưa có thông tin phương thức thanh toán của thuê bao</div>
			)}
		</>
	);
}

export default PaymentMethod;
