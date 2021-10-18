import React from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { Users } from 'app/models';
import { useHistory, useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import { trim } from 'opLodash';
import { CheckError, validatePassword, validateRequire } from 'app/validator';
import { useLng } from 'app/hooks';

export default function ResetPasswordForm() {
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
			onOk: () => history.push('/dev-portal/forgot-password'),
		});
	};

	const mutation = useMutation(Users.resetPassword, {
		onSuccess: () => {
			modalSuccess('successfullyChangedPass', 'useNewPass');
		},
		onError: (error) => {
			const temp = CheckError(error);
			modalError('badlyChangePass', temp);
		},
	});

	const { id, resetToken } = useParams();

	const handleSubmitReset = ({ password: newPassword }) => {
		mutation.mutate({ id, resetToken, newPassword: { newPassword } });
	};

	return (
		<Form form={form} onFinish={handleSubmitReset} layout="vertical" autoComplete="off">
			<Form.Item
				label={tField('newPass')}
				name="password"
				normalize={trim}
				rules={[
					validateRequire(tValidation('opt_isRequired', { field: 'newPass' })),
					validatePassword(tValidation('registerPassNotValid', { field: 'newPass' })),
				]}
			>
				<Input type="password" placeholder={tField('newPass')} maxLength={16} autoFocus />
			</Form.Item>

			<Form.Item
				label={tField('confirmationNewPass')}
				name="confirmPassword"
				normalize={trim}
				rules={[
					{
						required: true,
						message: tValidation('opt_isRequired', { field: 'confirmationNewPass' }),
					},
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || getFieldValue('password') === value) {
								return Promise.resolve();
							}
							return Promise.reject(tValidation('confirmationNewPassUnlikeNewPass'));
						},
					}),
				]}
			>
				<Input
					type="password"
					placeholder={tField('opt_enter', { field: 'confirmationNewPassAgain' })}
					maxLength={16}
				/>
			</Form.Item>
			<Form.Item wrapperCol={{ span: 36 }}>
				<Button type="primary" htmlType="submit" className="w-full" loading={mutation.isLoading}>
					{tButton('completed')}
				</Button>
			</Form.Item>
		</Form>
	);
}
