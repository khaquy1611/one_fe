import React, { useState } from 'react';
import { useUser, useLng } from 'app/hooks';
import { Form, Button, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom';
import { getTokenByUsernamePassword, clearToken } from 'app/models/Base';
import { DX, RoleAdmin, Users } from 'app/models';
import { useMutation } from 'react-query';
import { trim } from 'opLodash';
import { validateRequireInput, validateEmail } from 'app/validator';
import ConvertRoleForm from 'app/permissions/ConvertRoleForm';

export default function LoginPage({ setError }) {
	const { tOthers, tButton, tMessage, tField, tValidation } = useLng();
	const [form] = Form.useForm();
	const { changeStatus, updateUser } = useUser();
	const [visible, setVisible] = useState(false);
	const [newUserConvert, setNewUserConvert] = useState({});
	const history = useHistory();

	const handleLoginSuccess = async () => {
		try {
			const newUser = await Users.getMyProfile();
			if (DX.dev.canAccessPortal(newUser)) {
				updateUser(newUser);
				history.push(DX.dev.createPath(`/`));
			} else if (newUser.parentId === -1 && newUser.roles.some((el) => el === DX.sme.role)) {
				setVisible(true);
				setNewUserConvert(newUser);
			} else {
				changeStatus(Users.ACC_STATUS.DENIED_FROM_LOGIN);
				clearToken();
			}
		} catch (e) {
			setError(tMessage('emailOrPassNotTrue'));
		}
	};

	const mutation = useMutation(getTokenByUsernamePassword, {
		onSuccess: () => handleLoginSuccess(),
		onError: (e) => {
			if (!e.dontCatchError) {
				setError(tMessage('emailOrPassNotTrue'));
			}
		},
	});

	const handleSubmitLogin = async (data) => {
		mutation.mutate(data);
	};

	return (
		<>
			<Form form={form} layout="vertical" onFinish={handleSubmitLogin} autoComplete="off">
				<Form.Item
					label={tField('email')}
					name="username"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
					]}
					prefix={<MailOutlined className="site-form-item-icon" />}
					autoFocus
				>
					<Input placeholder={tField('opt_enter', { field: 'email' })} maxLength={100} autoFocus />
				</Form.Item>
				<Form.Item
					label={tField('pass')}
					prefix={<LockOutlined className="site-form-item-icon" />}
					name="password"
					normalize={trim}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'pass' }))]}
				>
					<Input type="password" placeholder={tField('opt_enter', { field: 'pass' })} />
				</Form.Item>

				<Form.Item className="text-left">
					<Link to="/dev-portal/forgot-password">{tButton('forgotPass')}</Link>
				</Form.Item>
				<Form.Item wrapperCol={{ span: 36 }}>
					<Button type="primary" htmlType="submit" className="w-full" loading={mutation.isLoading}>
						{tButton('login')}
					</Button>
				</Form.Item>
				<div className="text-left">
					{tOthers('notHaveAccYet')} <Link to="/dev-portal/register">{tButton('register')}</Link>
				</div>
			</Form>
			<ConvertRoleForm visible={visible} setVisible={setVisible} newUserConvert={newUserConvert} />
		</>
	);
}
