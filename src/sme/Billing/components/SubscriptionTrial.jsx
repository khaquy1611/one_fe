import { Button, Form, Modal } from 'antd';
import WrapDetail from 'app/HOCs/WrapDetail';
import { useLng, useNavigation } from 'app/hooks';
import { ErrorIcon, VnptTickCheckSuccess } from 'app/icons';
import { DX, SMESubscription } from 'app/models';
import SmeSubscription from 'app/models/SmeSubscription';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import BackNavigation from './BackNavigation';
import CustomerForm from './CustomerForm';
import InvoiceDetailForm from './InvoiceDetailForm';

function SubscriptionTrial({ setHaveError }) {
	const { tMenu, tButton } = useLng();
	const [formCustomer] = Form.useForm();
	const params = useParams();
	const [serviceId, planId] = [parseInt(params.serviceId, 10), parseInt(params.planId, 10)];
	const [pricingTrial, setPricingTrial] = useState({});
	const [visibleModal, setVisibleModal] = useState(false);
	const [errorSubmit, setErrorSubmit] = useState(false);
	const history = useHistory();
	const { goBack } = useNavigation();

	const registerSubscriptionTrial = useMutation(SmeSubscription.reqRegisterSubscriptionTrial, {
		onSuccess: () => {
			setVisibleModal(true);
			setErrorSubmit(false);
		},
		onError: () => {
			setVisibleModal(true);
			setErrorSubmit(true);
		},
	});
	useQuery(['getListDetailService', planId], async () => {
		const res = await SMESubscription.getDetailService({ planId });
		const { numberOfTrial, trialType } = res;
		setPricingTrial({ numberOfTrial, trialType });
		// setHaveError({
		// 	callbackUrl: DX.sme.path,
		// 	status: 401,
		// 	errorCode: 'servicePackRegistered',
		// });
	});

	const handleSubscriptionTrial = () => {
		registerSubscriptionTrial.mutate({ pricingId: planId });
	};

	const onClickSuccess = () => {
		history.push(DX.sme.createPath('/my-service'));
	};

	const onClickError = () => {
		history.push(DX.sme.createPath(`/service/${serviceId}?tab=3`));
	};

	useQuery(
		['getServicePay'],
		async () => {
			try {
				const res = await SMESubscription.getCustomerInfo();
				formCustomer.setFieldsValue({
					name: res.smeName,
					taxCode: res.taxNo ? DX.callFormatTaxCode(res.taxNo) : '',
					phoneNumber: res.phoneNo,
					email: res.email,
					address: res.address,
					countryName: res.countryName,
					provinceName: res.provinceName,
					districtName: res.districtName,
					selectedPayment: 1,
					contactPhone: res.contactPhone,
					contactName: res.contactName,
				});
				return res;
			} catch (error) {
				return null;
			}
		},
		{ initialData: [] },
	);

	return (
		<div>
			<BackNavigation
				text={tMenu('registrationInfo')}
				handleBack={() => goBack(DX.sme.createPath(`/service/${serviceId}`))}
				className="text-primary font-bold text-xl"
			/>

			<InvoiceDetailForm
				serviceId={serviceId}
				formCustomer={formCustomer}
				className="block mt-10"
				setHaveError={setHaveError}
				pricingTrial={pricingTrial}
			/>

			<CustomerForm className="block" form={formCustomer} onFinish={handleSubscriptionTrial} />

			<div className="text-right mt-8">
				<Button
					type="primary"
					className="px-8 bg-primary text-white hover:bg-primaryHover hover:text-white"
					onClick={() => formCustomer.submit()}
					loading={registerSubscriptionTrial.isLoading}
				>
					{tButton('register')}
				</Button>
			</div>

			<Modal
				visible={visibleModal}
				onCancel={() => setVisibleModal(false)}
				footer={null}
				closable={false}
				maskClosable={false}
				bodyStyle={{ padding: '2rem' }}
			>
				<div className="justify-center flex mb-4">
					{errorSubmit ? (
						<ErrorIcon width="w-12" />
					) : (
						<VnptTickCheckSuccess width="w-12" className="text-green-400" />
					)}
				</div>
				<h4 className="text-center text-base font-semibold">
					{errorSubmit ? 'Đăng ký thất bại' : 'Bạn đã đăng ký dùng thử thành công'}
				</h4>

				<div className="text-center mt-8">
					<Button
						className="uppercase text-sm px-8"
						onClick={errorSubmit ? onClickError : onClickSuccess}
						type="primary"
					>
						{tButton('serviceDetail')}
					</Button>
				</div>
			</Modal>
		</div>
	);
}
export default WrapDetail(SubscriptionTrial);
