import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Form, Button, Input } from 'antd';
import { DX, Users } from 'app/models';
import { useMutation } from 'react-query';
import { trim } from 'opLodash';
import { useLng } from 'app/hooks';
import { CheckError, validateRequireInput, validateEmail } from 'app/validator';
import ModalNotification from './components/ModalNotification';

export default function ForgotPasswordForm({ setError }) {
	const { tButton, tField, tValidation } = useLng();
	setError('');
	const history = useHistory();
	const [form] = Form.useForm();
	const location = useLocation();
	const currentUrl = window.location.href;

	const [visibleModal, setVisibleModal] = useState(false);
	const [infoModal, setInfoModal] = useState({});

	const successModal = {
		iconType: 'EMAIL',
		title: 'successfullyEmail',
		subTile: 'plsCheckEmail',
		textButton: 'agreement',
		redirectPage: `${DX.sme.createPath('/login')}`,
	};

	const errorModal = {
		iconType: 'ERROR',
		title: 'emailTokenErr',
		subTile: 'retryError',
		textButton: 'close',
		redirectPage: `${DX.sme.createPath('/forgot-password')}`,
	};

	const getRedirectUrl = () => {
		const url = currentUrl.replace(location.pathname, '/sme-portal/reset-password/');
		return url;
	};

	const mutation = useMutation(Users.forgotPassword, {
		onSuccess: () => {
			setVisibleModal(true);
			setInfoModal(successModal);
		},
		onError: (error) => {
			if (error?.field === 'email' && error.errorCode === 'error.object.not.found') {
				form.setFields([
					{
						name: 'email',
						errors: [tValidation('opt_isNotWorked', { field: 'email' })],
					},
				]);
			} else if (!error.dontCatchError) {
				setVisibleModal(true);
				setInfoModal({ ...errorModal, subTile: CheckError(error, tValidation) });
			}
		},
	});

	const handleSubmit = (event) => {
		const value = { ...event, portal: 'SME' };
		mutation.mutate(value);
	};

	const redirectLogin = () => {
		history.push('/sme-portal/login');
	};

	return (
		<Form form={form} onFinish={handleSubmit} layout="vertical">
			<Form.Item
				label={tField('email')}
				name="email"
				normalize={trim}
				rules={[
					validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
					validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
				]}
			>
				<Input autoFocus maxLength={100} placeholder={tField('opt_enter', { field: 'email' })} />
			</Form.Item>

			<Button type="primary" htmlType="submit" className="w-full text-base" loading={mutation.isLoading}>
				{tButton('resetPass')}
			</Button>
			<Button type="default" className="w-full mt-4 text-base" onClick={redirectLogin}>
				{tButton('opt_back', { field: 'login' })}
			</Button>
			<ModalNotification visibleModal={visibleModal} setVisibleModal={setVisibleModal} infoModal={infoModal} />
		</Form>
	);
}
