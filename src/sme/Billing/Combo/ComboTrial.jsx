import React, { useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { ComboSME, DX, SMESubscription } from 'app/models';
import { useHistory, useParams } from 'react-router-dom';
import { useLng, useNavigation, useUser } from 'app/hooks';
import WrapDetail from 'app/HOCs/WrapDetail';
import { ErrorIcon, VnptTickCheckSuccess } from 'app/icons';
import BackNavigation from 'sme/Billing/components/BackNavigation';
import CustomerForm from 'sme/Billing/components/CustomerForm';
import InvoiceDetailForm from 'sme/Billing/components/InvoiceDetailForm';

function SubscriptionTrial({ setHaveError }) {
	const { tMenu, tButton } = useLng();
	const [formCustomer] = Form.useForm();
	const { user } = useUser();
	const params = useParams();
	const [comboId, comboPlanId] = [parseInt(params.comboId, 10), parseInt(params.comboPlanId, 10)];
	const [comboTrial, setComboTrial] = useState({});
	const [visibleModal, setVisibleModal] = useState(false);
	const [errorSubmit, setErrorSubmit] = useState(false);
	const history = useHistory();
	const { goBack } = useNavigation();

	const registerComboTrial = useMutation(ComboSME.reqRegisterComboTrial, {
		onSuccess: () => {
			setVisibleModal(true);
			setErrorSubmit(false);
		},
		onError: () => {
			setVisibleModal(true);
			setErrorSubmit(true);
		},
	});

	useQuery(
		['getDetailComboTrial', comboId],
		async () => {
			const { data } = await ComboSME.getServicePackCombo(comboId);
			const dataComboTrial = data.filter((item) => item.id === comboPlanId);
			const { numberOfTrial, trialType } = dataComboTrial[0];
			setComboTrial({ numberOfTrial, trialType });
			return dataComboTrial;
		},
		{
			initialData: {},
			enabled: !!comboId,
		},
	);
	const handleSubscriptionTrial = () => {
		registerComboTrial.mutate({ comboPlanId });
	};

	const onClickSuccess = () => {
		// history.push(DX.sme.createPath('/account/subscription?tab=combo'));
		history.push(DX.sme.createPath('/my-service'));
	};

	const onClickError = () => {
		history.push(DX.sme.createPath(`/combo/${comboId}?tab=3`));
	};

	useQuery(
		['getComboUserPay'],
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
				handleBack={() => goBack(DX.sme.createPath(`/combo/${comboId}`))}
				className="text-primary font-bold text-3xl"
			/>
			<InvoiceDetailForm
				serviceId={comboId}
				formCustomer={formCustomer}
				className="block"
				setHaveError={setHaveError}
				pricingTrial={comboTrial}
				inCombo
			/>
			<CustomerForm className="block" form={formCustomer} onFinish={handleSubscriptionTrial} />
			<div className="flex justify-end">
				<Button
					type="primary"
					className="px-8 bg-primary text-white hover:bg-primaryHover hover:text-white"
					onClick={() => formCustomer.submit()}
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
				bodyStyle={{ padding: '2rem 4.375rem' }}
			>
				<div className="justify-center flex mb-4">
					{errorSubmit ? (
						<ErrorIcon width="w-12" />
					) : (
						<VnptTickCheckSuccess width="w-12" className="text-green-400" />
					)}
				</div>
				<h4 className=" text-center text-base font-semibold mb-2.5">
					{errorSubmit ? 'Đăng ký thất bại' : 'Bạn đã đăng ký thành công'}
				</h4>

				<div className="flex items-center justify-center w-full mt-14">
					<Button
						className="uppercase flex justify-center items-center text-sm w-2/4"
						onClick={errorSubmit ? onClickError : onClickSuccess}
						block
						type="primary"
						loading={registerComboTrial.isLoading}
					>
						{tButton('serviceDetail')}
					</Button>
				</div>
			</Modal>
		</div>
	);
}
export default WrapDetail(SubscriptionTrial);
