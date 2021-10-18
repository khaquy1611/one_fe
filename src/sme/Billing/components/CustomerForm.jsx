import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Input } from 'antd';
import { useLng } from 'app/hooks';
import {
	formatNormalizeTaxCode,
	validateEmail,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
	validateStrLength,
} from 'app/validator';
import { trim } from 'opLodash';

function CustomerForm({ className, form, onFinish }) {
	const { tMenu, tField, tValidation } = useLng();
	return (
		<div className={`rounded-xl p-8 h-full bg-white ${className}`}>
			<p className="text-xl font-semibold">{tMenu('customerInfo')}</p>
			<Form form={form} className="mt-8" layout="vertical" onFinish={onFinish}>
				<Row gutter={[32, 16]} className="mb-3">
					<Col span={24}>
						<Form.Item
							label={tField('enterpriseName')}
							type="text"
							placeholder={tField('opt_enter', { field: 'enterpriseName' })}
							name="name"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'enterpriseName' }))]}
						>
							<Input disabled maxLength={500} autoFocus />
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={[32, 16]} className="mb-3">
					<Col span={8}>
						<Form.Item
							label={tField('taxCode')}
							normalize={(value) => formatNormalizeTaxCode(value)}
							type="text"
							placeholder={tField('opt_enter', { field: 'taxCode' })}
							name="taxCode"
						>
							<Input disabled maxLength={10} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label={tField('phoneNum')}
							type="text"
							placeholder="+84 xxx xxx xxx"
							name="phoneNumber"
							normalize={trim}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
								validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
							]}
						>
							<Input disabled maxLength={14} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label={tField('email')}
							type="text"
							placeholder="example@domain.com"
							name="email"
							normalize={trim}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
								validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
							]}
						>
							<Input disabled maxLength={100} />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={[32, 16]} className="mb-3">
					<Col span={16}>
						<Form.Item
							label={tField('address')}
							type="text"
							placeholder={tField('opt_enter', { field: 'address' })}
							name="address"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'address' }))]}
							className="mb-0"
						>
							<Input disabled maxLength={500} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label={tField('country')}
							type="text"
							placeholder={tField('opt_select', { field: 'country' })}
							name="countryName"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'country' }))]}
							className="mb-0"
						>
							<Input disabled maxLength={200} />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={[32, 16]} className="mb-3">
					<Col span={12}>
						<Form.Item
							name="provinceName"
							label={tField('city')}
							placeholder={tField('opt_select', { field: 'city' })}
							type="text"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'city' }))]}
							className="mb-0"
						>
							<Input disabled maxLength={200} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="districtName"
							label={tField('district')}
							placeholder={tField('opt_select', { field: 'district' })}
							type="text"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'district' }))]}
							className="mb-0"
						>
							<Input disabled maxLength={200} />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={[32, 16]} className="mb-3">
					<Col span={12}>
						<Form.Item
							label={tField('contactPerson')}
							type="text"
							placeholder={tField('opt_enter', { field: 'contactPersonName' })}
							name="contactName"
						>
							<Input maxLength={50} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('contactPersonPhone')}
							type="text"
							name="contactPhone"
							normalize={trim}
							rules={[validatePhoneNumber('office', 'Sai định dạng SĐT')]}
						>
							<Input maxLength={14} />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label={tField('installationAddress')}
					type="text"
					placeholder={tField('opt_enter', { field: 'installationAddress' })}
					name="setupAddress"
				>
					<Input maxLength={500} />
				</Form.Item>
				<Form.Item
					label="Mã nhân viên giới thiệu"
					type="text"
					// placeholder={tField('opt_enter', { field: 'installationAddress' })}
					name="employeeCode"
					// help=""
					// rules={[
					// 	{
					// 		pattern: /^[A-Za-z0-9]+$/g,
					// 		message: 'Sai định dạng mã nhân viên giới thiệu',
					// 	},
					// ]}
				>
					<Input maxLength={50} />
				</Form.Item>
			</Form>
		</div>
	);
}

CustomerForm.propTypes = {
	className: PropTypes.string,
	form: PropTypes.instanceOf(Object).isRequired,
};
CustomerForm.defaultProps = {
	className: 'hidden',
};
export default CustomerForm;
