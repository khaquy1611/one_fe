import { Button, Form, Input } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { DX, Users } from 'app/models';
import { clearToken, getTokenByUsernamePassword } from 'app/models/Base';
import ConvertRoleForm from 'app/permissions/ConvertRoleForm';
import { validateEmail, validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Link, useHistory } from 'react-router-dom';

export default function LoginForm({ setError }) {
	const [form] = Form.useForm();
	const history = useHistory();
	const { updateUser, changeStatus } = useUser();
	const [visible, setVisible] = useState(false);
	const [newUserConvert, setNewUserConvert] = useState({});
	const { tField, tButton, tValidation } = useLng();
	const handleLoginSuccess = async () => {
		try {
			const newUser = await Users.getMyProfile();
			if (DX.sme.canAccessPortal(newUser)) {
				updateUser(newUser);
				// history.push(DX.sme.createPath(`/`));
			} else if (newUser.parentId === -1 && DX.dev.canAccessPortal(newUser)) {
				setVisible(true);
				setNewUserConvert(newUser);
			} else {
				changeStatus(Users.ACC_STATUS.DENIED_FROM_LOGIN);
				clearToken();
			}
		} catch (e) {
			setError('emailOrPassNotTrue');
		}
	};

	const mutation = useMutation(getTokenByUsernamePassword, {
		onSuccess: () => handleLoginSuccess(),
		onError: (e) => {
			if (!e.dontCatchError) {
				setError('emailOrPassNotTrue');
			}
		},
	});

	const handleSubmitLogin = async (data) => {
		mutation.mutate(data);
	};

	const redirectRegister = () => {
		history.push(DX.sme.createPath('/register'));
	};
	return (
		<>
			<Form form={form} onFinish={handleSubmitLogin} layout="vertical">
				<Form.Item
					label="Email"
					name="username"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
					]}
				>
					<Input maxLength={100} autoFocus placeholder={tField('opt_enter', { field: 'email' })} />
				</Form.Item>
				<Form.Item
					label={tField('pass')}
					name="password"
					normalize={trim}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'pass' }))]}
				>
					<Input type="password" placeholder={tField('opt_enter', { field: 'pass' })} />
				</Form.Item>

				<Form.Item>
					<Link
						className="text-primary text-base tablet:text-lg font-medium"
						to="/sme-portal/forgot-password"
					>
						{tButton('forgotPass')}
					</Link>
				</Form.Item>
				<Button
					type="primary"
					htmlType="submit"
					className="w-full mb-4 text-base tablet:text-lg font-medium"
					loading={mutation.isLoading}
				>
					{tButton('login')}
				</Button>
				<Button
					type="default"
					className="w-full text-base tablet:text-lg font-medium"
					onClick={redirectRegister}
				>
					{tButton('register')}
				</Button>
			</Form>
			<ConvertRoleForm visible={visible} setVisible={setVisible} newUserConvert={newUserConvert} />
		</>
	);
}
