import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Modal, Input, Select, Steps, Row, Col, DatePicker } from 'antd';
import moment from 'moment';
import scrollIntoView from 'scroll-into-view-if-needed';
import { useLng } from 'app/hooks';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { DX, Users } from 'app/models';
import { useMutation } from 'react-query';
import {
	validateRequireInput,
	validatePhoneNumber,
	validateRequire,
	validateEmail,
	validatePassword,
	validateMaxLengthStr,
} from 'app/validator';
import useSelectLocation from 'app/hooks/useSelectLocation';
import { noop, trim } from 'opLodash';

const { Step } = Steps;

export default function RegisterForm({ setError }) {
	const { tOthers, tButton, tMessage, tValidation, tField, tFilterField } = useLng();
	const [formEnterprise] = Form.useForm();
	const [formPersonal] = Form.useForm();
	const history = useHistory();

	const [currentStep, setCurrentStep] = useState(0);
	const [disableButton, setDisableButton] = useState(true);

	const currentUrl = window.location.href;
	const { pathname } = useLocation();

	const disableDate = (current) => current && current >= moment().startOf('day');

	const {
		setCountryId,
		setCountryCode,
		setProvinceId,
		setDistrictId,
		countryList,
		provinceList,
		districtList,
	} = useSelectLocation();

	const lastNameRef = useRef(null);
	const devNameRef = useRef(null);
	const next = () => {
		if (currentStep === 0) {
			setCurrentStep(currentStep + 1);
		}
	};

	useEffect(() => {
		setError('');
	}, []);

	useEffect(() => {
		if (currentStep === 1) {
			lastNameRef.current.focus();
		} else {
			devNameRef.current.focus();
		}
	}, [currentStep]);

	const prev = () => {
		if (currentStep === 1) setCurrentStep(currentStep - 1);
	};

	const modalSuccess = (title, content, redirect) => {
		Modal.success({
			title: tMessage(title),
			content: tMessage(content),
			onOk() {
				return redirect;
			},
		});
	};

	const mutation = useMutation(Users.registerDev, {
		onSuccess: () => {
			modalSuccess('opt_successfullyRegistered', 'plsActiveMail', history.push('/dev-portal/login'));
		},
		onError: (res) => {
			if (res?.field === 'email' && res?.errorCode === 'exists') {
				formPersonal.setFields([
					{
						name: 'email',
						errors: [tValidation('opt_isDuplicated', { field: 'email' })],
					},
				]);
			} else if (res?.field === 'phoneNumber' && res?.errorCode === 'exists') {
				prev();
				formEnterprise.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else if (res?.field === 'name' && res?.errorCode === 'exists') {
				prev();
				formEnterprise.setFields([
					{
						name: 'developerName',
						errors: [tValidation('opt_isDuplicated', { field: 'devName' })],
					},
				]);
			} else {
				setError(tMessage('retryError'));
			}
		},
	});

	const handleSubmitRegistry = (data) => {
		const formEnterpriseData = formEnterprise.getFieldsValue();
		const arr = formEnterpriseData.provinceId.split('/');
		mutation.mutate({
			...formEnterpriseData,
			...data,
			provinceId: parseInt(arr[0], 10),
			provinceCode: arr.length > 1 ? arr[1] : '',
			birthdate: DX.formatDate(data.birthdate),
			developerName: formEnterprise.getFieldValue('developerName').trim(),
			lastname: formPersonal.getFieldValue('lastname').trim(),
			firstname: formPersonal.getFieldValue('firstname').trim(),
			redirectUrl: currentUrl.replace(pathname, '/dev-portal/login'),
		});
	};

	function setNewNationValue() {
		setCountryId(formEnterprise.getFieldValue('countryId'));
		formEnterprise.setFieldsValue({
			districtId: null,
			provinceId: null,
		});
		setDistrictId(-1);
		setProvinceId(-1);
	}

	function setNewProvinceValue() {
		const provinceValue = formEnterprise.getFieldValue('provinceId');
		const arr = provinceValue.split('/');
		const idValue = parseInt(arr[0], 10);
		const code = arr.length > 1 ? arr[1] : '';
		setProvinceId(idValue);
		setCountryCode(code);
		formEnterprise.setFieldsValue({
			districtId: null,
		});
	}
	function setNewDistrictValue() {
		setDistrictId(formEnterprise.getFieldValue('districtId'));
	}

	const steps = [
		{
			title: tOthers('enterprise'),
			content: 'First-content',
		},
		{
			title: tOthers('personalInfo'),
			content: 'Second-content',
		},
	];

	const handleCheckBox = (e) => {
		setDisableButton(e.target.checked);
	};

	return (
		<>
			<Steps current={currentStep} className="mb-3.5">
				{steps.map((item) => (
					<Step key={item.title} title={item.title} />
				))}
			</Steps>

			{/* Step 1: Form Thông Tin Doanh Nghiệp  */}
			<Form
				form={formEnterprise}
				layout="vertical"
				className={currentStep === 0 ? '' : 'hidden'}
				scrollToFirstError
				autoComplete="off"
			>
				<Form.Item
					label={tField('devName')}
					name="developerName"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'devName' }))]}
				>
					<Input placeholder={tField('opt_enter', { field: 'devName' })} ref={devNameRef} maxLength={500} />
				</Form.Item>

				<Form.Item
					label={tField('phoneNum')}
					name="phoneNumber"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
						validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
					]}
				>
					<Input maxLength={14} placeholder={tField('opt_enter', { field: 'phoneNum' })} />
				</Form.Item>

				<Form.Item
					label={tField('country')}
					name="countryId"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'country' }))]}
				>
					<Select
						placeholder={tField('opt_select', { field: 'country' })}
						onChange={setNewNationValue}
						options={countryList}
					/>
				</Form.Item>

				<Form.Item
					label={tField('city')}
					name="provinceId"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'city' }))]}
				>
					<Select
						placeholder={tField('opt_select', { field: 'city' })}
						onChange={setNewProvinceValue}
						options={provinceList}
					/>
				</Form.Item>

				<Form.Item
					label={tField('district')}
					name="districtId"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'district' }))]}
				>
					<Select
						placeholder={tField('opt_select', { field: 'district' })}
						onChange={setNewDistrictValue}
						options={districtList}
					/>
				</Form.Item>

				<Form.Item
					label={tField('address')}
					name="address"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'address' }))]}
				>
					<Input placeholder={tField('opt_enter', { field: 'address' })} maxLength={500} />
				</Form.Item>

				<Form.Item wrapperCol={{ span: 36 }}>
					<Button
						type="primary"
						htmlType="button"
						className="w-full mt-4"
						onClick={async () => {
							const status = await formEnterprise.validateFields();
							if (status) {
								next();
								scrollIntoView(document.getElementById('lastname'), {
									behavior: 'smooth',
								});
							}
						}}
						loading={mutation.isLoading}
					>
						{tButton('next')}
					</Button>
				</Form.Item>

				<p>
					{tOthers('alreadyHaveAcc')}
					<Link to="/dev-portal/login"> {tButton('login')}</Link>
				</p>
			</Form>

			{/* Step 2: Form Thông Tin Cá Nhân  */}
			<Form
				form={formPersonal}
				onFinish={handleSubmitRegistry}
				layout="vertical"
				className={currentStep === 1 ? '' : 'hidden'}
				scrollToFirstError
				autoComplete="off"
			>
				<Row gutter={8} className="flex justify-between">
					<Col span={12}>
						<Form.Item
							label={tField('lastName')}
							name="lastname"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' }))]}
						>
							<Input
								placeholder={tField('opt_enter', { field: 'lastName' })}
								ref={lastNameRef}
								maxLength={20}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('firstName')}
							name="firstname"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' }))]}
						>
							<Input placeholder={tField('opt_enter', { field: 'firstName' })} maxLength={20} />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label={tField('email')}
					name="email"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
						validateMaxLengthStr(100, tValidation('maxLength', { maxLength: '100' })),
					]}
				>
					<Input placeholder={tField('opt_enter', { field: 'email' })} maxLength={100} />
				</Form.Item>

				<Form.Item
					label={tField('pass')}
					name="password"
					normalize={trim}
					rules={[
						validateRequire(tValidation('opt_isRequired', { field: 'pass' })),
						validatePassword(tValidation('registerPassNotValid', { field: 'pass' })),
					]}
				>
					<Input type="password" placeholder={tField('opt_enter', { field: 'pass' })} maxLength={16} />
				</Form.Item>

				<Form.Item
					label={tField('confirmationPass')}
					name="confirmPassword"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'confirmationPass' })),
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('password') === value) {
									return Promise.resolve();
								}
								return Promise.reject(tValidation('confirmationPassUnlikePass'));
							},
						}),
					]}
				>
					<Input
						type="password"
						placeholder={tField('opt_enter', { field: 'confirmationPassAgain' })}
						maxLength={16}
					/>
				</Form.Item>

				<Form.Item label={tField('dob')} name="birthdate">
					<DatePicker
						format="DD/MM/YYYY"
						placeholder={tField('opt_enter', { field: 'fullDob' })}
						disabledDate={disableDate}
						className="w-full"
					/>
				</Form.Item>

				<Form.Item label={tField('gender')} name="gender">
					<Select
						placeholder={tField('opt_enter', { field: 'gender' })}
						options={[
							{ value: 'MALE', label: `${tFilterField('genderOptions', 'male')}` },
							{ value: 'FEMALE', label: `${tFilterField('genderOptions', 'female')}` },
							{ value: 'OTHER', label: `${tFilterField('genderOptions', 'other')}` },
						]}
					/>
				</Form.Item>

				{/* <Form.Item
					name="rules"
					valuePropName="checked"
					className="mb-0-i"
				>
					<Checkbox onChange={handleCheckBox}>
						Đồng ý với
						<Link
							// to="/term-of-use"
							to
							className="text-blue-400 ml-2"
						>
							Điều khoản sử dụng
						</Link>
					</Checkbox>
				</Form.Item> */}

				<Form.Item wrapperCol={{ span: 36 }}>
					<Row gutter={8} className="flex justify-between">
						<Col span={12}>
							<Button
								type="default"
								htmlType="button"
								className="w-full mr-3 mt-4"
								onClick={() => prev()}
							>
								{tButton('opt_back')}
							</Button>
						</Col>
						<Col span={12}>
							<Button
								type="primary"
								htmlType="submit"
								className="w-full mt-4"
								loading={mutation.isLoading}
								disabled={!disableButton}
							>
								{tButton('register')}
							</Button>
						</Col>
					</Row>
				</Form.Item>

				<p>
					{tOthers('alreadyHaveAcc')}
					<Link to="/dev-portal/login"> {tButton('login')}</Link>
				</p>
			</Form>
		</>
	);
}
RegisterForm.propTypes = {
	setError: PropTypes.func,
};
RegisterForm.defaultProps = {
	setError: noop,
};
