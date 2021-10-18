import React, { useState } from 'react';
import { Form, Button, Input } from 'antd';
import { useParams } from 'react-router-dom';
import { Users, DX } from 'app/models';
import { useMutation } from 'react-query';
import { useLng } from 'app/hooks';
import { CheckError, validateRequireInput, validatePassword, validateRequire } from 'app/validator';
import { trim } from 'opLodash';
import ModalNotification from './components/ModalNotification';

export default function ResetPasswordForm({ setError }) {
	const { tField, tButton, tValidation } = useLng();
	setError('');
	const { id, resetToken } = useParams();
	const [form] = Form.useForm();
	const [visibleModal, setVisibleModal] = useState(false);
	const [infoModal, setInfoModal] = useState({});

	const successModal = {
		iconType: 'SUCCESS',
		title: 'successfullyChangedPass',
		subTile: 'useNewPass',
		textButton: 'goToLogin',
		redirectPage: `${DX.sme.createPath('/login')}`,
	};

	const errorModal = {
		iconType: 'ERROR',
		title: 'badlyChangePass',
		subTile: 'retryError',
		textButton: 'goToForgetPass',
		redirectPage: `${DX.sme.createPath('/forgot-password')}`,
	};

	const mutation = useMutation(Users.resetPassword, {
		onSuccess: () => {
			setVisibleModal(true);
			setInfoModal(successModal);
		},
		onError: (error) => {
			setVisibleModal(true);
			errorModal.subTile = CheckError(error);
			setInfoModal(errorModal);
		},
	});

	const handleSubmitReset = (dataReset) => {
		const newPassword = { newPassword: dataReset.newPassword };
		mutation.mutate({ id, resetToken, newPassword });
	};

	return (
		<Form form={form} onFinish={handleSubmitReset} layout="vertical">
			<Form.Item
				label={tField('newPass')}
				name="newPassword"
				normalize={trim}
				rules={[
					validateRequire(tValidation('opt_isRequired', { field: 'newPass' })),
					validatePassword(tValidation('registerPassNotValid', { field: 'newPass' })),
				]}
			>
				<Input
					type="password"
					maxLength={16}
					autoFocus
					placeholder={tField('opt_enter', { field: 'newPass' })}
				/>
			</Form.Item>

			<Form.Item
				label={tField('confirmationNewPass')}
				name="confirmPassword"
				normalize={trim}
				dependencies={['newPassword']}
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
			<Button type="primary" htmlType="submit" className="w-full uppercase mb-6" loading={mutation.isLoading}>
				{tButton('opt_confirm')}
			</Button>
			<ModalNotification visibleModal={visibleModal} setVisibleModal={setVisibleModal} infoModal={infoModal} />
		</Form>
	);
}
