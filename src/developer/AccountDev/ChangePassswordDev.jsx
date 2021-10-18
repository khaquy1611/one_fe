import { Button, Form, Input, message, Modal } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { DX, Users } from 'app/models';
import { validateCompareOldPassword, validatePassword, validateRequire, validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';
import React from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 8 },
};

const tailLayout = {
	wrapperCol: { offset: 8, span: 8 },
};

export default function ChangePasswordDev() {
	const [form] = Form.useForm();
	const history = useHistory();
	const { clearUser } = useUser();
	const { tButton, tMessage, tValidation, tField, tMenu } = useLng();

	const mutation = useMutation(Users.changePassword, {
		onSuccess: () => {
			Modal.success({
				title: tMessage('successfullyChangedPass'),
				content: tMessage('plsBackToLoginPage'),
				onOk() {
					clearUser();
					history.push(DX.dev.createPath('/login'));
				},
			});
		},
		onError: (res) => {
			if (res?.errorCode === 'invalid.password' || res?.errorCode === 'error.wrong.password')
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
		<div>
			<UrlBreadcrumb type="changePass" />
			<h1 className="font-semibold text-xl mt-2">{tMenu('changePass')}</h1>
			<Form {...layout} className="mt-12" form={form} name="basic" onFinish={handleSubmit} autoComplete="off">
				<Form.Item
					label={tField('oldPass')}
					name="oldPassword"
					normalize={trim}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'oldPass' }))]}
				>
					<Input type="password" autoFocus maxLength={16} />
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

				<Form.Item {...tailLayout}>
					<Button
						type="primary"
						htmlType="submit"
						className="rounded-none float-right"
						loading={mutation.isLoading}
					>
						{tButton('changeToNewPass')}
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
