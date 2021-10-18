import { Button, Form, Input, message, Modal } from 'antd';
import { useLng, useUser } from 'app/hooks';
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
	const { tMessage, tButton, tField, tValidation } = useLng();
	const mutation = useMutation(Users.changePassword, {
		onSuccess: () => {
			Modal.success({
				title: tMessage('successfullyChangedPass'),
				content: tMessage('plsBackToLoginPage'),
				onOk() {
					clearUser();
					history.push(DX.sme.createPath('/login'));
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
			else if (res?.errorCode === 'the.new.password.must.be.different.from.the.old.one')
				form.setFields([
					{
						name: 'newPassword',
						errors: [tValidation('newPassCanNotSameAsOldPass')],
					},
				]);
			else message.error(tMessage('retryError'));
		},
	});

	const handleSubmit = (dataPassword) => {
		mutation.mutate(dataPassword);
	};

	const clearForm = () => {
		form.resetFields();
	};

	return (
		<div className="box-sme">
			<Form
				layout="vertical"
				form={form}
				onFinish={handleSubmit}
				className="my-6 max-w-3xl mx-auto"
				autoComplete="off"
			>
				<Form.Item
					label={tField('oldPass')}
					name="oldPassword"
					normalize={trim}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'oldPass' }))]}
				>
					<Input type="password" maxLength={16} placeholder={tField('opt_enter', { field: 'oldPass' })} />
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
					<Input type="password" maxLength={16} placeholder={tField('opt_enter', { field: 'newPass' })} />
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
					<Input
						type="password"
						maxLength={16}
						placeholder={tField('opt_enter', { field: 'confirmationPass' })}
					/>
				</Form.Item>

				<div className="text-right">
					<Button type="default" onClick={clearForm} disabled={mutation.isLoading}>
						{tButton('opt_back')}
					</Button>

					<Button type="primary" className="ml-4" loading={mutation.isLoading} htmlType="submit">
						{tButton('opt_confirm')}
					</Button>
				</div>
			</Form>
		</div>
	);
}
