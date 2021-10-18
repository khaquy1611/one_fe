import React, { useState } from 'react';
import { Button, Form, message, Radio, Spin } from 'antd';
import { BankIcon, CurrencyIcon, VnptIcon } from 'app/icons';
import { ModalConfirm } from 'sme/components';
import { useMutation, useQuery } from 'react-query';
import { SMESubscription } from 'app/models';
import { useParams } from 'react-router-dom';
import { useLng } from 'app/hooks';
import styled from 'styled-components';

const { Item } = Form;

const STATUS = { CANCELLED: 'CANCELLED', NON_RENEWING: 'NON_RENEWING' };
const PAYMENT_ERROR = 'error.payment.can.not.change';

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

function PaymentMethods({ statusService, isOrderService }) {
	const { id } = useParams();
	const [formPayment] = Form.useForm();
	const [isDirty, setIsDirty] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const { tOthers, tMessage, tLowerField } = useLng();

	const { data: currentPaymentMethod, isFetching, refetch } = useQuery(
		['currentPaymentMethod', id],
		async () => {
			const res = await SMESubscription.getPaymentMethodSubscription(id);
			return res.paymentMethod;
		},
		{
			onSuccess: (res) => {
				formPayment.setFieldsValue({ optionPayment: res });
			},
			initialData: {
				loading: true,
			},
			enabled: !!id,
			cacheTime: 0,
		},
	);

	const PAYMENT_METHODS = [
		{
			value: 'BY_CASH',
			text: tOthers('cash'),
			icon: <CurrencyIcon className="mr-2 flex" width="w-6" />,
			getMethod: currentPaymentMethod,
		},
		// {
		// 	value: 'P2P',
		// 	text: tOthers('bankTransfer'),
		// 	icon: <BankIcon className="mr-2 flex" width="w-6" />,
		// },
		{
			value: 'VNPTPAY',
			text: 'VNPT Pay',
			icon: <VnptIcon className="mr-2 flex" width="w-20" />,
			getMethod: currentPaymentMethod,
		},
	];

	const checkMethod = (value) => PAYMENT_METHODS.filter((el) => el.value === value)[0].text;

	const mutationPutPayment = useMutation(
		() =>
			SMESubscription.putPaymentMethodSubscription({
				id,
				paymentMethod: formPayment.getFieldValue('optionPayment'),
			}),
		{
			onSuccess: () => {
				setShowModal(false);
				message.success(tMessage('opt_successfullyChanged', { field: 'paymentMethod' }));
			},
			onError: (e) => {
				if (e.errorCode === PAYMENT_ERROR && formPayment.getFieldValue('optionPayment') !== 'VNPTPAY')
					message.error(
						`${tMessage('err_payment_can_not_change')} ${tLowerField('from')} ${checkMethod(
							'VNPTPAY',
						)} ${tLowerField('toWithOtherMeaning')} ${checkMethod(
							formPayment.getFieldValue('optionPayment'),
						)}`,
					);
				refetch();
				setShowModal(false);
			},
		},
	);

	const onChangePayment = () => {
		setIsDirty(true);
	};

	const onSaveChangePayment = () => {
		setShowModal(true);
	};

	const onCancel = () => {
		formPayment.setFieldsValue({ optionPayment: currentPaymentMethod });
	};

	if (isFetching) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	return (
		<div className="w-1/2">
			<BoxForm hideRequiredMark form={formPayment} className="mb-8">
				<Item name="optionPayment">
					<Radio.Group onChange={onChangePayment}>
						{PAYMENT_METHODS.map(
							(item) =>
								item.value === item.getMethod && (
									<Radio
										value={item.value}
										key={item.value}
										className="items-center m-0 px-6 pt-6"
										disabled={
											statusService === STATUS.CANCELLED || statusService === STATUS.NON_RENEWING
										}
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

			{/* {statusService !== STATUS.CANCELLED && statusService !== STATUS.NON_RENEWING && (
					<div className="text-right">
						<Button type="primary" disabled={!isDirty} onClick={() => onSaveChangePayment()}>
							Lưu
						</Button>
					</div>
				)}
				<ModalConfirm
					mutation={mutationPutPayment.mutateAsync}
					showModal={showModal}
					setShowModal={setShowModal}
					mainTitle={tMessage('opt_change', { field: 'paymentMethod' })}
					subTitle={tMessage('opt_wantToChange', { field: 'paymentMethod' })}
					onCancel={onCancel}
				/> */}
		</div>
	);
}

export default PaymentMethods;
