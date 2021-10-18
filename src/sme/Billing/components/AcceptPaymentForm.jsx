import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Form, Modal } from 'antd';
import { useLng } from 'app/hooks';
import { validateRequireCheckbox } from 'app/validator';

function AcceptPaymentForm({ form, className, data, PAYMENT_METHODS }) {
	const [showPolicy, setShowPolicy] = useState();
	const { tField, tMenu, tValidation } = useLng();
	const renderSelectedPayment = () => {
		const paymentMethod = PAYMENT_METHODS.find((x) => x.value === data.selectedPayment);
		return (
			<div className="ml-2.5 flex justify-start items-center whitespace-normal ">
				<div className="mr-2">{paymentMethod?.icon}</div>
				<div>{paymentMethod?.text}</div>
			</div>
		);
	};
	return (
		<>
			<div className={`rounded-xl h-full p-8 bg-white ${className}`}>
				<p className="text-xl font-semibold">{tMenu('customerInfo')}</p>
				<table className="w-full">
					<tbody>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('enterpriseName')}</td>
							<td className="pb-2 pt-2 w-1/2 font-bold">{data.name}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('taxCode')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.taxCode}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('address')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.address}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('country')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.countryName}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('city')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.provinceName}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('district')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.districtName}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('phoneNum')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.phoneNumber}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('email')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.email}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('contactPerson')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.contactName}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('supPhoneNum')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.contactPhone}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">{tField('installationAddress')}</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.setupAddress}&nbsp;</td>
						</tr>
						<tr className="">
							<td className="w-min pb-2 pt-2">Mã nhân viên giới thiệu</td>
							<td className="w-auto pb-2 pt-2 font-bold">{data.employeeCode}&nbsp;</td>
						</tr>
					</tbody>
				</table>

				<p className="text-xl font-semibold mt-8 mb-2.5">{tMenu('paymentMethod')}</p>
				{renderSelectedPayment()}
				<br />
				<Form form={form}>
					<Form.Item
						name="rules"
						valuePropName="checked"
						rules={[validateRequireCheckbox(tValidation('plsAgreeWithOurPolicy'))]}
						className="mb-0-i"
					>
						<Checkbox>
							<span className="font-normal text-black">Đồng ý với </span>

							<span
								type="text"
								className="text-primary ml-0 pl-0 font-semibold hover:underline"
								onClickCapture={(e) => {
									e.preventDefault();
									setShowPolicy(true);
								}}
							>
								{tField('termsOfServiceRegistration')}
							</span>
						</Checkbox>
					</Form.Item>
				</Form>
				<Modal
					visible={showPolicy}
					footer={<Button onClick={() => setShowPolicy()}>Đóng</Button>}
					onCancel={() => setShowPolicy()}
					title={tField('termsOfServiceRegistration')}
					width="90%"
					style={{ maxWidth: '1120px' }}
					bodyStyle={{ height: '70vh' }}
				>
					<iframe
						src="/pdf/dieu_khoan_dang_ky_dich_vu.pdf"
						title={tField('termsOfServiceRegistration')}
						height="100%"
						width="100%"
					/>
				</Modal>
			</div>
		</>
	);
}

AcceptPaymentForm.propTypes = {
	className: PropTypes.string,
	data: PropTypes.objectOf(PropTypes.object),
	PAYMENT_METHODS: PropTypes.arrayOf(PropTypes.object),
};
AcceptPaymentForm.defaultProps = {
	className: '',
	data: {},
	PAYMENT_METHODS: [],
};
export default AcceptPaymentForm;
