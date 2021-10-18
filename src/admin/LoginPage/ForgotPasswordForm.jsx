import React, { useState } from 'react';
import { useLocation, Link, useHistory } from 'react-router-dom';
import { MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal } from 'antd';
import { Users } from 'app/models';
import { CheckError, validateEmail, validateRequireInput } from 'app/validator';
import { useMutation } from 'react-query';
import { trim } from 'opLodash';
import { useLng } from 'app/hooks';

export default function ForgotPasswordForm({ setError }) {
	const { tButton, tMessage, tField, tValidation } = useLng();
	setError('');
	const location = useLocation();
	const currentUrl = window.location.href;
	const history = useHistory();

	const [form] = Form.useForm();
	const modalSuccess = (title, content) => {
		Modal.success({
			title: tMessage(title),
			content: tMessage(content),
			onOk: () => history.push('/admin-portal/login'),
			okText: 'Quay lại đăng nhập',
		});
	};

	const modalError = (title, content) => {
		Modal.error({
			title: tMessage(title),
			content: tMessage(content),
			onOk: () => history.push('/admin-portal/forgot-password'),
		});
	};

	const getRedirectUrl = () => {
		const url = currentUrl.replace(location.pathname, '/admin-portal/reset-password/');
		return url;
	};

	const mutation = useMutation(Users.forgotPassword, {
		onSuccess: () => modalSuccess('successfullyEmail', 'plsCheckEmail'),
		onError: (error) => {
			if (error?.field === 'email' && error.errorCode === 'error.object.not.found') {
				form.setFields([
					{
						name: 'email',
						errors: [tValidation('opt_isNotWorked', { field: 'email' })],
					},
				]);
			} else if (!error.dontCatchError) {
				const temp = CheckError(error);
				modalError('occurredErr', temp, '');
			}
		},
	});

	const handleSubmit = (event) => {
		const value = { ...event, portal: 'ADMIN' };
		mutation.mutate(value);
	};

	return (
		<Form form={form} onFinish={handleSubmit}>
			<Form.Item
				name="email"
				prefix={<MailOutlined className="site-form-item-icon" />}
				normalize={trim}
				rules={[
					validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
					validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
				]}
			>
				<Input placeholder="Email đăng ký" autoFocus maxLength={100} />
			</Form.Item>
			<Button type="primary" htmlType="submit" className="mb-4 w-full" loading={mutation.isLoading}>
				{tButton('resetPass')}
			</Button>
			<Form.Item className="text-center text-primary">
				<Link to="/admin-portal/login">{tButton('opt_back', { field: 'login' })}</Link>
			</Form.Item>
		</Form>
	);
}
