import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { DX, Users } from 'app/models';
import { clearToken } from 'app/models/Base';
import { validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';
import PropTypes from 'prop-types';
import React from 'react';
import { useMutation } from 'react-query';
import { Link } from 'react-router-dom';

export default function LoginForm({ setError }) {
	const [form] = Form.useForm();
	const { changeStatus, updateUser } = useUser();
	const { tButton, tMessage, tValidation } = useLng();

	const handleLoginSuccess = async () => {
		try {
			const newUser = await Users.getMyProfile();
			if (DX.admin.canAccessPortal(newUser)) {
				updateUser(newUser);
				// history.push(DX.admin.createPath(`/`));
			} else {
				changeStatus(Users.ACC_STATUS.DENIED_FROM_LOGIN);
				clearToken();
			}
		} catch (e) {
			setError(tMessage('emailOrPassNotTrue'));
		}
	};
	const mutation = useMutation(Users.getTokenByUsernamePassword, {
		onSuccess: handleLoginSuccess,
		onError: (e) => {
			if (!e.dontCatchError) {
				setError(tMessage('emailOrPassNotTrue'));
			}
		},
	});

	return (
		<Form form={form} onFinish={mutation.mutate}>
			<Form.Item
				name="username"
				normalize={trim}
				rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'email' }))]}
				prefix={<UserOutlined className="site-form-item-icon" />}
			>
				<Input placeholder="Email" autoFocus maxLength={100} />
			</Form.Item>
			<Form.Item
				prefix={<LockOutlined className="site-form-item-icon" />}
				name="password"
				normalize={trim}
				rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'pass' }))]}
			>
				<Input type="password" placeholder="Mật khẩu" />
			</Form.Item>

			<Form.Item className="">
				<Link to="/admin-portal/forgot-password">{tButton('forgotPass')}</Link>
			</Form.Item>
			<Form.Item wrapperCol={{ span: 36 }}>
				<Button type="primary" htmlType="submit" block loading={mutation.isLoading}>
					{tButton('login')}
				</Button>
			</Form.Item>
		</Form>
	);
}

LoginForm.propTypes = {
	setError: PropTypes.func.isRequired,
};
