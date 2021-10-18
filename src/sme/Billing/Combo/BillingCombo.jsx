/* eslint-disable object-shorthand */
import React, { useState } from 'react';
import { Button, Form, Modal, Steps } from 'antd';
import { CurrencyIcon, InfoIcon, VnptIcon } from 'app/icons';
import { DX, SMESubscription } from 'app/models';
import { useMutation, useQuery } from 'react-query';
import styled from 'styled-components';
import SmeSubscription from 'app/models/SmeSubscription';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { useLng, useNavigation, useQueryUrl, useUser } from 'app/hooks';
// import Payment from 'app/models/Payment';
import { useSelector } from 'react-redux';
import WrapDetail from 'app/HOCs/WrapDetail';
import { isEmpty } from 'opLodash';
import { CloseCircleOutlined } from '@ant-design/icons';
import { checkAlertPopupSubCombo } from 'app/validator/isInt';
import {
	AcceptPaymentForm,
	BackNavigation,
	CustomerForm,
	ErrorPopupExists,
	InvoiceDetailForm,
	PaymentForm,
	PopupModal,
} from '../components';
import { billingSelects } from '../redux/billingReducer';
import ComboPaymentForm from './ComboPaymentForm';

const BoxForm = styled.div`
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;
`;

const { Step } = Steps;

function BillingCombo({ setHaveError }) {
	const [current, setCurrent] = useState(0);
	const [formCustomer] = Form.useForm();
	const [formPayment] = Form.useForm();
	const [formAcceptPayment] = Form.useForm();
	const [formMaxPersonYearly] = Form.useForm();
	const [dataAcceptPayment, setDataAcceptPayment] = useState({});
	const [statusAcceptSuccess, setStatusAcceptSuccess] = useState(false);
	const [visibleModal, setVisibleModal] = useState(false);
	const params = useParams();
	const { user } = useUser();
	const history = useHistory();
	const { path } = useRouteMatch();
	const { tOthers, tMenu, tButton } = useLng();
	const query = useQueryUrl();
	const preOrderId = query.get('orderId');
	const billingInfo = useSelector(billingSelects.selectBillingInfo);
	const { goBack } = useNavigation();
	const [serviceId, planId] = [parseInt(params.serviceId, 10), parseInt(params.planId, 10)];
	const [dataInvoice, setDataInvoice] = useState(false);
	const [numError, setNumError] = useState(1);
	const [dataCheckExist, setDataCheckExist] = useState({});
	const [showPopupNotExist, setShowPopupNotExist] = useState(false);
	const [isLoadingCheckExist, setIsLoadingCheckExist] = useState(false);
	const [subscriptionData, setSubscriptionData] = useState({});
	const [paymentOnline, setPaymentOnline] = useState(false);
	const [visiblePopupError, setVisiblePopupError] = useState(false);
	const [messageDuplicate, setMessageDuplicate] = useState(false);

	// Tính toán giá
	const addMutation = useMutation(SmeSubscription.addSubscription, {
		onSuccess: ({ redirectURL, subCode }) => {
			if (redirectURL) {
				window.location.href = redirectURL;
			} else {
				history.push(
					DX.sme.createPath(
						`/payment-success?isCombo=YES&serviceOwner=${billingInfo.comboOwner}&subCode=${subCode}&serviceName=${dataInvoice?.comboName}`,
					),
				);
			}
			return null;
		},
		onError: (e) => {
			if (e.errorCode === 'error.duplicate.pricing') {
				return setMessageDuplicate(checkAlertPopupSubCombo(e, billingInfo.comboPricings, 'id', 'pricingName'));
			}
			return history.push(
				DX.sme.createPath(`/payment-error?serviceId=${serviceId}&planId=${planId}&isCombo=YES`),
			);
		},
	});

	// Processing function when switching to step 2
	const handleNextPage = async (data) => {
		try {
			setIsLoadingCheckExist(true);
			setSubscriptionData(data);
			const couponIds = [];
			const addonIds = [];
			const pricingIds = [];

			billingInfo.couponList.filter((item) => {
				if (item.checked) {
					couponIds.push(item.couponId);
				}
				return [];
			});

			billingInfo.addonList.filter((item) => {
				if (item.checked) {
					addonIds.push(item.id);
					item.couponList.filter((coupon) => {
						if (coupon.checked) {
							couponIds.push(coupon.couponId);
						}
						return [];
					});
				}
				return [];
			});

			billingInfo.comboPricings?.map((item) => pricingIds.push(item.id));

			const { addons, coupons, pricings, comboPlans } = await SmeSubscription.checkExistSubscription({
				couponIds,
				addonIds,
				comboPlanIds: [billingInfo.id] || [],
				pricingIds,
			});
			await setIsLoadingCheckExist(false);

			const noAddon = addons?.some((item) => item.isExisted === 'NO');
			const noCoupon = coupons?.some((item) => item.isExisted === 'NO');
			const noPricingCombo = pricings?.some((item) => item.isExisted === 'NO');
			// const havePricing = pricings[0]?.isExisted === 'YES';
			const haveComboPlans = comboPlans[0]?.isExisted === 'YES';
			// data show popup
			setDataCheckExist({
				noAddon,
				noCoupon,
				noPricingCombo,
				// noPricing: !havePricing,
				noComboPlan: !haveComboPlans,
				addons,
				coupons,
				pricingsInCombo: pricings,
				comboPlans,
			});

			if (haveComboPlans) {
				if (noAddon || noCoupon || noPricingCombo) {
					setShowPopupNotExist(true);
					setVisibleModal(false);
				} else if (!noAddon && !noCoupon && !noPricingCombo && isEmpty(data)) {
					// go to step 2
					setCurrent(1);
				} else {
					// make payments
					addMutation.mutate(data);
				}
			} else {
				setShowPopupNotExist(true);
				setVisibleModal(false);
			}
			return null;
		} catch (error) {
			setIsLoadingCheckExist(false);
			return null;
		}
	};

	const onClickSuccess = async () => {
		const typeChecked = !billingInfo.isCheckBox && billingInfo.couponChecked?.type;
		const couponIds = [{ id: billingInfo.couponChecked?.couponId }];
		const couponPricings =
			typeChecked === 'in-pricing'
				? couponIds
				: []
						.concat(billingInfo.couponList)
						.filter((e) => e.checked === true)
						.map((el) => {
							if (el.promotionType === 'PRODUCT') {
								return { id: el.couponId, pricingId: el.pricingId };
							}
							return { id: el.couponId };
						});

		const couponTotal =
			typeChecked === 'in-total'
				? couponIds
				: []
						.concat(billingInfo.coupons)
						.filter((e) => e.checked === true)
						.map((el) => {
							if (el.promotionType === 'PRODUCT') {
								return { id: el.couponId, pricingId: el.pricingId };
							}
							return { id: el.couponId };
						});

		const addonsList = [];
		[].concat(billingInfo.addonList).forEach((addon) => {
			if (addon.checked) {
				const coupons = [];
				if (typeChecked === 'in-addon' && billingInfo.couponChecked?.addonId === addon.id) {
					coupons.push(couponIds[0]);
				} else {
					[].concat(addon.couponList).forEach((coupon) => {
						if (coupon.checked && coupon.promotionType === 'PRODUCT')
							coupons.push({ id: coupon.couponId, pricingId: coupon.pricingId });
						else if (coupon.checked) coupons.push({ id: coupon.couponId });
					});
				}
				addonsList.push({
					id: addon.id,
					quantity: addon.quantity,
					couponList: [...coupons],
				});
			}
		});

		let paymentMethod = 'VNPTPAY';
		if (dataAcceptPayment.selectedPayment === 5) {
			paymentMethod = 'VNPTPAY';
		} else if (dataAcceptPayment.selectedPayment === 1) {
			paymentMethod = 'BY_CASH';
		} else {
			paymentMethod = 'P2P';
		}
		const totalAmount = Math.round(billingInfo.totalAmountAfterTaxFinal);
		const customer = formCustomer.getFieldValue();
		const contact = {
			fullName: customer.contactPerson,
			phoneNo: customer.contactPhone,
			address: customer.setupAddress,
			employeeCode: customer.employeeCode,
		};
		handleNextPage({
			paymentMethod: paymentMethod,
			comboId: planId,
			quantity: billingInfo.quantity,
			couponList: couponTotal,
			couponPricings: couponPricings,
			addonsList: addonsList,
			merchantOrderId: preOrderId,
			totalAmount: totalAmount,
			contact: contact,
			preOrderId: customer.preOrder?.preOrderId,
		});
	};

	const next = async () => {
		if (current === 0) {
			handleNextPage(true);
		}
		if (current === 1) {
			const validate1 = await formCustomer.validateFields();
			const validate4 = await formMaxPersonYearly.validateFields();
			if (validate1 && validate4) {
				setCurrent(2);
			}
		}
		// if (current === 2) {
		// 	const validate2 = await formPayment.validateFields();
		// 	if (validate2) {
		// 		setCurrent(3);
		// 		const formValue = formCustomer.getFieldValue();
		// 		const formPaymentValue = formPayment.getFieldValue();
		// 		setDataAcceptPayment({
		// 			...formValue,
		// 			...formPaymentValue,
		// 		});
		// 	}
		// }

		if (current === 2) {
			const formPaymentValue = formPayment.getFieldValue();
			if (isEmpty(formPaymentValue)) {
				setVisiblePopupError(true);
			} else {
				setCurrent(3);
				const formValue = formCustomer.getFieldValue();
				setVisiblePopupError(false);
				setDataAcceptPayment({
					...formValue,
					...formPaymentValue,
				});
			}
		}

		if (current === 3) {
			const validate3 = await formAcceptPayment.validateFields();
			if (validate3) {
				setVisibleModal(true);
			}
		}
	};

	const prev = () => {
		if (current >= 1) setCurrent(current - 1);
	};

	const PAYMENT_METHODS = [
		{
			value: 1,
			text: tOthers('cashPayment'),
			icon: <CurrencyIcon width="w-8" />,
			isOffline: true,
		},
		// {
		// 	value: 2,
		// 	text: tOthers('bankTransfer'),
		// 	icon: <BankIcon width="w-16" />,
		// 	isOffline: true,
		// },
		{
			value: 5,
			text: tOthers('Payment via VNPT Pay'),
			icon: <VnptIcon width="w-32" />,
			isOffline: false,
		},
	];

	const STEPS = [
		{
			title: tMenu('servicePackageInfo'),
			content: '',
		},
		{
			title: tMenu('customerInfo'),
			content: '',
		},
		{
			title: tMenu('paymentMethod'),
			content: '',
		},
		{
			title: tMenu('confirmationInfo'),
			content: '',
		},
	];

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
					contactName: `${user.lastname} ${user.firstname}`,
					contactPhone: res.contactPhone,
				});
				return res;
			} catch (error) {
				return null;
			}
		},
		{ initialData: [] },
	);
	const getPaymentMethod = () => {
		if (billingInfo?.comboOwner === 'OTHER' || billingInfo?.comboOwner === 'NONE') {
			return PAYMENT_METHODS.filter((x) => x.isOffline);
		}
		return PAYMENT_METHODS.filter((x) => !x.isOffline);
		// TODO: fix tạm golive
		// if (billingInfo?.offlinePaymentConfig !== 'YES') {

		// }
		// return PAYMENT_METHODS;
	};
	return (
		<>
			<div className="">
				<BackNavigation
					text={current !== 0 ? tMenu('servicePayment') : tMenu('registrationInfo')}
					handleBack={() => goBack(DX.sme.createPath(`/combo/${serviceId}`))}
					className="text-primary font-bold text-3xl"
				/>
				<div className="mt-10">
					{path.indexOf('change-pack') === -1 && (
						<div className="mb-10 max-w-3xl mx-auto">
							{current < 4 && (
								<Steps current={current}>
									{STEPS.map((item) => (
										<Step key={item.title} />
									))}
								</Steps>
							)}
						</div>
					)}
					<ComboPaymentForm
						className={current === 0 ? 'block' : 'hidden'}
						next={next}
						planId={planId}
						setHaveError={setHaveError}
						numError={numError}
						isLoading={isLoadingCheckExist}
						serviceId={serviceId}
					/>

					<div className="flex gap-8 flex-wrap">
						<BoxForm className="tablet:w-full w-7/12  tablet:pr-0 tablet:order-last order-none">
							<CustomerForm className={current === 1 ? 'block' : 'hidden'} form={formCustomer} />

							<div className={`rounded-xl h-full p-8  bg-white ${current === 2 ? 'block' : 'hidden'}`}>
								<p className="text-xl font-semibold">{tMenu('paymentMethod')}</p>
								<PaymentForm
									PAYMENT_METHODS={getPaymentMethod()}
									form={formPayment}
									setPaymentOnline={setPaymentOnline}
								/>
							</div>

							<AcceptPaymentForm
								data={dataAcceptPayment}
								PAYMENT_METHODS={PAYMENT_METHODS}
								form={formAcceptPayment}
								className={current === 3 || current === 4 ? 'block' : 'hidden'}
							/>
						</BoxForm>
						<BoxForm className="tablet:w-full flex-1 pl-4 tablet:pl-0 tablet:mb-8 mb-0">
							<InvoiceDetailForm
								serviceId={serviceId}
								planId={planId}
								currentPage={current}
								formCustomer={formCustomer}
								inCombo
								className={current !== 0 ? 'block' : 'hidden'}
								setHaveError={setHaveError}
								paymentOnline={paymentOnline}
								setDataInvoice={setDataInvoice}
							/>
						</BoxForm>
					</div>
					<div className={`mt-10 flex justify-end ${statusAcceptSuccess || current === 0 ? 'hidden' : ''}`}>
						<div className="action flex justify-center">
							{current >= 1 && current <= 3 && (
								<Button className="flex items-center justify-center" onClick={() => prev()}>
									<div className="min-w-12">{tButton('opt_back')}</div>
								</Button>
							)}

							{current <= 3 && (
								<Button
									type="primary"
									style={{
										minWidth: 155,
									}}
									className="flex items-center justify-center ml-5"
									onClick={() => next()}
								>
									<div className="min-w-12">
										{current === 3 ? tButton('paymentConfirmation') : tButton('next')}
									</div>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
			<div>
				<PopupModal
					setVisibleModal={setVisibleModal}
					visibleModal={visibleModal}
					onClickSuccess={onClickSuccess}
					isLoading={addMutation.isLoading}
				/>
				<ErrorPopupExists
					billingInfo={billingInfo}
					setShowPopupNotExist={setShowPopupNotExist}
					setCurrent={setCurrent}
					setNumError={setNumError}
					numError={numError}
					serviceId={serviceId}
					dataCheckExist={dataCheckExist}
					visible={showPopupNotExist}
					subscriptionData={subscriptionData}
				/>
			</div>

			<Modal visible={visiblePopupError} closable={false} maskClosable={false} footer={null} width={480}>
				<div>
					<div className="flex flex-col justify-center items-center">
						<span className="mb-3 ">
							<InfoIcon width="w-10" className="block text-yellow-450" />
						</span>
						<div className="font-semibold text-xl mb-4">Không thể tiếp tục</div>
					</div>
					<div className="flex items-center justify-center">
						Vui lòng chọn phương thức thanh toán để tiếp tục
					</div>
					<div className="mt-6 flex flex-row-reverse">
						<Button
							className="mx-auto"
							type="primary"
							onClick={() => {
								setVisiblePopupError(false);
							}}
						>
							Tôi Đã Hiểu
						</Button>
					</div>
				</div>
			</Modal>
			<Modal visible={!!messageDuplicate} closable={false} maskClosable={false} footer={null} width={480}>
				<div>
					<div className="flex flex-col justify-center items-center">
						<span className="mb-3 ">
							<CloseCircleOutlined className="mx-auto" style={{ color: '#ff4d4f', fontSize: '2rem' }} />
						</span>
					</div>
					<div className="flex items-center justify-center">{messageDuplicate}</div>
					<div className="mt-6 flex flex-row-reverse">
						<Button className="mx-auto" type="primary" onClick={() => setMessageDuplicate(false)}>
							Đồng ý
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default WrapDetail(BillingCombo);
