import { Form } from 'antd';
import useLng from 'app/hooks/useLng';
import { DX, Users } from 'app/models';
import { isEmpty } from 'opLodash';
import React, { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useHistory } from 'react-router-dom';
import CompanyInfo from './components/CompanyInfo';
import ModalNotification from './components/ModalNotification';

const EXIST_ERROR = 'exists';
const NOT_FOUND_ERROR = 'error.object.not.found';
const CLIEND_ID = process.env.REACT_APP_CLIENT_ID_VNPT;
const SANDBOX = process.env.REACT_APP_SANDBOX_VNPT;
const REACT_APP_AUTH_SERVER = process.env.REACT_APP_AUTH_SERVER_DEV;
const REACT_APP_PRODUCT = process.env.REACT_APP_CONFIG_KEY;

// const defaultInfo = {
// 	address: '',
// 	districtId: '',
// 	provinceId: '',
// 	smeName: '',
// 	phoneNumber: '',
// };

const successModal = {
	iconType: 'EMAIL',
	title: 'successfullyRegistered',
	subTile: 'plsActiveMail',
	extraSubTitle: 'Đăng ký thành công',
	textButton: 'close',
	redirectPage: `${DX.sme.createPath('/login')}`,
};

const errorModal = {
	iconType: 'ERROR',
	title: 'badlyRegistered',
	subTile: 'retryError',
	textButton: 'close',
	redirectPage: `${DX.sme.createPath('/register')}`,
};

const errorTaxCode = {
	iconType: 'ERROR',
	title: 'taxCodeIsNotExisted',
	subTile: 'plsEnterTaxCode',
	textButton: 'close',
	redirectPage: `${DX.sme.createPath('/register')}`,
};

export default function RegisterForm({ setError }) {
	const { tValidation } = useLng();
	setError('');
	const [formCompanyInfo] = Form.useForm();
	const inputRef = useRef(null);

	const [visibleModal, setVisibleModal] = useState(false);
	const [infoModal, setInfoModal] = useState({});
	const currentUrl = window.location.href;
	const history = useHistory();
	const { pathname, dataVnpt } = useLocation();
	const isLoginVnpt = dataVnpt?.isLoginVnpt || false;

	// call api register
	const mutation = useMutation(isLoginVnpt ? Users.registerByVnpt : Users.registerSme, {
		onSuccess: () => {
			setVisibleModal(true);
			setInfoModal({
				...successModal,
				extraSubTitle: `Một email đã được gửi đến địa chỉ ${formCompanyInfo.getFieldValue(
					'email',
				)} của bạn. Vui lòng kiểm tra trong hộp thư để hoàn tất quá trình.`,
			});

			if (isLoginVnpt) {
				window.location.href = `${SANDBOX}/oauth2/authorize?response_type=code&client_id=${CLIEND_ID}&
				redirect_uri=${window.location.origin}${REACT_APP_AUTH_SERVER}/sso/callback&scope=openid`;
			}
		},

		onError: (res) => {
			if (res?.field === 'taxCode' && res?.errorCode === EXIST_ERROR) {
				formCompanyInfo.setFields([
					{
						name: 'taxCode',
						errors: [tValidation('opt_isDuplicated', { field: 'taxCode' })],
					},
				]);
			} else if (res?.field === 'name' && res?.errorCode === EXIST_ERROR) {
				formCompanyInfo.setFields([
					{
						name: 'smeName',
						errors: [tValidation('opt_isDuplicated', { field: 'enterprise' })],
					},
				]);
			} else if (res?.field === 'phoneNumber' && res?.errorCode === EXIST_ERROR) {
				formCompanyInfo.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else if (res?.field === 'email' && res.errorCode === EXIST_ERROR) {
				formCompanyInfo.setFields([
					{
						name: 'email',
						errors: [tValidation('opt_isDuplicated', { field: 'email' })],
					},
				]);
			} else if (res?.field === 'district' && res.errorCode === NOT_FOUND_ERROR) {
				formCompanyInfo.setFields([
					{
						name: 'districtId',
						errors: [tValidation('opt_isNotWorked', { field: 'district' })],
					},
				]);
			} else if (isLoginVnpt) {
				setVisibleModal(true);
				errorModal.redirectPage = '/sme-portal/login';
				errorModal.textButton = 'close';
				setInfoModal(errorModal);
			} else {
				setVisibleModal(true);
				setInfoModal(errorModal);
			}
		},
	});

	// function register
	const onRegister = () => {
		const province = formCompanyInfo.getFieldValue('provinceId').split('/');
		const registerInfo = {
			...formCompanyInfo.getFieldsValue(),
			// taxCode: formCompanyInfo.getFieldValue('taxCode').replace(/\s/g, ''),
			businessScale: 5,
			businessAreas: 999,
			countryId: 1,
			provinceId: parseInt(province[0], 10),
			provinceCode: province[1],
			birthdate: '01/01/1970',
			smeName: formCompanyInfo.getFieldValue('smeName').trim(),
			lastname: formCompanyInfo.getFieldValue('lastname').trim(),
			firstname: formCompanyInfo.getFieldValue('firstname').trim(),
			redirectUrl: currentUrl.replace(pathname, '/sme-portal/login'),
		};

		if (!isLoginVnpt) {
			mutation.mutate({ ...registerInfo });
		} else {
			mutation.mutate({ ...registerInfo, createType: 'EXTERNAL' });
		}
	};

	// call api from taxCode
	const mutationTaxCode = useMutation(Users.getTaxCodeInfo, {
		onSuccess: (res) => {
			if (isEmpty(res) && !!REACT_APP_PRODUCT) {
				// formCompanyInfo.setFieldsValue({ ...defaultInfo });
				setVisibleModal(true);
				setInfoModal(errorTaxCode);
				if (!visibleModal) {
					inputRef.current.focus({
						cursor: 'end',
					});
				}
			} else {
				onRegister();
			}
		},
		onError: () => {
			setVisibleModal(true);
			setInfoModal(errorModal);
		},
	});

	const checkTaxCode = () => {
		const taxCode = formCompanyInfo.getFieldValue('taxCode');
		const errArray = formCompanyInfo.getFieldError('taxCode');
		const removeSpace = taxCode?.replace(/\s/g, '');
		const provinceValue = formCompanyInfo.getFieldValue('provinceId');

		if (taxCode === undefined || taxCode === '') {
			formCompanyInfo.setFields([
				{
					name: 'taxCode',
					errors: [tValidation('opt_isRequired', { field: 'taxCode' })],
				},
			]);
		} else if (!provinceValue) {
			formCompanyInfo.setFields([
				{
					name: 'provinceId',
					errors: [tValidation('opt_isRequired', { field: 'city' })],
				},
			]);
		} else if (taxCode && errArray.length === 0) {
			const arr = provinceValue.split('/');
			const provinceId = parseInt(arr[0], 10);
			if (removeSpace.length === 10) mutationTaxCode.mutate({ taxCode: removeSpace, provinceId });
			else if (removeSpace.length === 13) mutationTaxCode.mutate({ taxCode: removeSpace, provinceId });
		}
	};

	const handleSubmit = async () => {
		const validate = await formCompanyInfo.validateFields();
		// if (validate) checkTaxCode();
		if (validate) onRegister();
	};

	const redirectLogin = () => {
		history.push(DX.sme.createPath('/login'));
	};

	return (
		<div>
			<CompanyInfo
				goBackLogin={redirectLogin}
				formCompanyInfo={formCompanyInfo}
				isLoginVnpt={isLoginVnpt}
				data={dataVnpt?.body}
				loading={mutationTaxCode.isLoading || mutation.isLoading}
				goRegister={handleSubmit}
				forwardRef={inputRef}
			/>

			<ModalNotification visibleModal={visibleModal} setVisibleModal={setVisibleModal} infoModal={infoModal} />
		</div>
	);
}
