import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Form, Radio } from 'antd';

const { Item } = Form;

const BoxForm = styled(Form)`
	min-height: 40rem;
	.ant-radio-group {
		display: flex;
		width: 100%;
		gap: 2rem;
		.ant-radio-wrapper {
			display: flex;
			width: 33%;
			flex-direction: column;
			border: 1px solid #eaecf4;
			box-sizing: border-box;
			border-radius: 16px;
			&.ant-radio-wrapper-checked {
				background: none !important;
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
function PaymentForm({ PAYMENT_METHODS, className, form, setPaymentOnline }) {
	const onChangePayment = (changeValue) => {
		const { value } = changeValue.target;
		setPaymentOnline(value === 5 || value === '5');
	};
	return (
		<BoxForm hideRequiredMark layout="vertical" form={form}>
			<Item name="selectedPayment" className="mb-0">
				<Radio.Group onChange={onChangePayment}>
					{PAYMENT_METHODS.map((item) => (
						<Radio
							value={item.value}
							key={item.value}
							className={`${className} items-center m-0 px-6 pt-6`}
						>
							<div className="payment-item">
								<div className="payment-icon">{item.icon}</div>
								<div className="payment-text">{item.text}</div>
							</div>
						</Radio>
					))}
				</Radio.Group>
			</Item>
		</BoxForm>
	);
}
PaymentForm.propTypes = {
	PAYMENT_METHODS: PropTypes.arrayOf(PropTypes.object).isRequired,
	className: PropTypes.string,
	form: PropTypes.instanceOf(Object).isRequired,
};
PaymentForm.defaultProps = {
	className: '',
};
export default PaymentForm;
