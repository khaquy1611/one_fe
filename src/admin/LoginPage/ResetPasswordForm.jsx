import React from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { Users, DX } from 'app/models';
import { useHistory, useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import { CheckError, validateRequireInput, validatePassword, validateRequire } from 'app/validator';
import { trim } from 'opLodash';
import { useLng } from 'app/hooks';

export default function ResetPasswordForm({ setError }) {
	const { tField, tMessage, tValidation } = useLng();
	setError('');
	const [form] = Form.useForm();
	const history = useHistory();
	const { id, resetToken } = useParams();

	const modalSuccess = (title, content) => {
		Modal.success({
			title,
			content,
			onOk: () => history.push('/admin-portal/login'),
			okText: 'Đăng nhập',
		});
	};

	const modalError = (title, content) => {
		Modal.error({
			title,
			content,
			onOk: () => history.push('/admin-portal/forgot-password'),
		});
	};

	const mutation = useMutation(Users.resetPassword, {
		onSuccess: () => {
			modalSuccess(tMessage('successfullyChangedPass'), tMessage('useNewPass'));
		},
		onError: (error) => {
			const temp = CheckError(error);
			modalError(tMessage('badlyChangePass'), temp);
		},
	});

	const handleSubmitReset = (dataReset) => {
		const newPassword = { newPassword: dataReset.newPassword };
		mutation.mutate({ id, resetToken, newPassword });
	};

	const resendEmail = () => {
		history.push('/admin-portal/forgot-password');
	};

	return (
		<Form form={form} onFinish={handleSubmitReset}>
			<Form.Item
				name="newPassword"
				normalize={trim}
				rules={[
					validateRequire(tValidation('opt_isRequired', { field: 'newPass' })),
					validatePassword(tValidation('registerPassNotValid', { field: 'newPass' })),
				]}
			>
				<Input type="password" placeholder={tField('newPass')} maxLength={16} autoFocus />
			</Form.Item>
			<Form.Item
				name="confirmPassword"
				dependencies={['newPassword']}
				normalize={trim}
				rules={[
					validateRequireInput(tValidation('opt_isRequired', { field: 'confirmationNewPass' })),
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || getFieldValue('newPassword') === value) {
								return Promise.resolve();
							}
							return Promise.reject(tValidation('confirmationNewPassUnlikeNewPass'));
						},
					}),
				]}
			>
				<Input type="password" placeholder={tField('confirmationNewPass')} maxLength={16} />
			</Form.Item>
			<Form.Item wrapperCol={{ span: 36 }}>
				<Button type="primary" htmlType="submit" className="w-full" loading={mutation.isLoading}>
					Đặt mật khẩu mới
				</Button>
			</Form.Item>
			{/* <div className="text-center">
				{t("app.loginScreen.receiveEmail")}{" "}
				<Link onClick={resendEmail} to>
					{t("app.loginScreen.resend")}
				</Link>
			</div> */}
		</Form>
	);
}
