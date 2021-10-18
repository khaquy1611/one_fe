import React from 'react';
import { useLocation, Link, useHistory } from 'react-router-dom';
import { Button, Form, Input, Modal } from 'antd';
import { Users } from 'app/models';
import { useMutation } from 'react-query';
import { trim } from 'opLodash';
import { CheckError, validateRequireInput, validateEmail, validateMaxLengthStr } from 'app/validator';
import { useLng } from 'app/hooks';

export default function ForgotPasswordForm({ setError }) {
	setError('');
	const location = useLocation();
	const currentUrl = window.location.href;
	const [form] = Form.useForm();
	const history = useHistory();
	const { tButton, tMessage, tField, tValidation } = useLng();

	const modalSuccess = (title, content) => {
		Modal.success({
			title: tMessage(title),
			content: tMessage(content),
			onOk: () => history.push('/dev-portal/login'),
			okText: tButton('login'),
		});
	};

	const modalError = (title, content) => {
		Modal.error({
			title: tMessage(title),
			content: tMessage(content),
			onOk: () => () => history.push('/dev-portal/forgot-password'),
		});
	};

	const getRedirectUrl = () => {
		const url = currentUrl.replace(location.pathname, '/dev-portal/reset-password/');
		return url;
	};

	const mutation = useMutation(Users.forgotPassword, {
		onSuccess: () => modalSuccess('successfullyEmail', 'plsCheckEmail'),
		onError: (error) => {
			if (error?.field === 'email' && error?.errorCode === 'error.object.not.found') {
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
		const value = { ...event, portal: 'DEV' };
		mutation.mutate(value);
	};

	return (
		<Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false} autoComplete="off">
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
				<Input placeholder={tField('opt_enter', { field: 'email' })} autoFocus maxLength={100} />
			</Form.Item>

			<Button type="primary" htmlType="submit" className="mb-4 w-full" loading={mutation.isLoading}>
				{tButton('resetPass')}
			</Button>
			<Form.Item className="text-primary">
				<Link to="/dev-portal/login">{tButton('opt_back', { field: 'login' })}</Link>
			</Form.Item>
		</Form>
	);
}
