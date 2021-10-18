import { Button, Form, Input, message, Modal } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { SaveIcon } from 'app/icons';
import { DX, Users } from 'app/models';
import { validateCompareOldPassword, validatePassword, validateRequire, validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';
import React from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

export default function ChangePassword() {
	const [form] = Form.useForm();
	const history = useHistory();
	const { clearUser } = useUser();
	const { tMessage, tValidation, tField, tButton } = useLng();
	const mutation = useMutation(Users.changePassword, {
		onSuccess: () => {
			Modal.success({
				title: tMessage('successfullyChangedPass'),
				content: tMessage('plsBackToLoginPage'),
				onOk() {
					clearUser();
					history.push(DX.admin.createPath('/login'));
				},
			});
		},
		onError: (res) => {
			if (res?.errorCode === 'error.wrong.password')
				form.setFields([
					{
						name: 'oldPassword',
						errors: [tValidation('wrongOldPass')],
					},
				]);
			else message.error(tMessage('retryError'));
		},
	});

	const handleSubmit = (dataPassword) => {
		mutation.mutate(dataPassword);
	};

	return (
		<div className="max-w-3xl mt-12 mx-auto">
			<Form form={form} name="basic" onFinish={handleSubmit} labelCol={{ span: 6 }}>
				<Form.Item
					label={tField('oldPass')}
					name="oldPassword"
					normalize={trim}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'oldPass' }))]}
				>
					<Input type="password" maxLength={16} autoFocus />
				</Form.Item>

				<Form.Item
					dependencies={['oldPassword']}
					name="newPassword"
					label={tField('newPass')}
					normalize={trim}
					rules={[
						validateRequire(tValidation('opt_isRequired', { field: 'newPass' })),
						validatePassword(tValidation('registerPassNotValid', { field: 'newPass' })),
						({ getFieldValue }) => {
							const oldPass = getFieldValue('oldPassword');
							return validateCompareOldPassword(oldPass, tValidation('newPassCanNotSameAsOldPass'));
						},
					]}
				>
					<Input type="password" maxLength={16} />
				</Form.Item>

				<Form.Item
					label={tField('confirmationNewPass')}
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
					<Input type="password" maxLength={16} />
				</Form.Item>

				<div className="text-right">
					<Button
						type="primary"
						htmlType="submit"
						icon={<SaveIcon width="w-4" />}
						loading={mutation.isLoading}
					>
						{tButton('changeToNewPass')}
					</Button>
				</div>
			</Form>
		</div>
	);
}
