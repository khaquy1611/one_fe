/* eslint-disable object-shorthand */
import { CloseCircleOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Button, Form, message, Steps } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { BankIcon, CurrencyIcon, InfoIcon, VnptIcon } from 'app/icons';
import { DX, SMESubscription } from 'app/models';
import SmeSubscription from 'app/models/SmeSubscription';
import { useNavigation, useUser, useQueryUrl, useLng } from 'app/hooks';
import { useSelector } from 'react-redux';
import WrapDetail from 'app/HOCs/WrapDetail';
import { isEmpty } from 'opLodash';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
	AcceptPaymentForm,
	BackNavigation,
	CustomerForm,
	ErrorPopupExists,
	InvoiceDetailForm,
	PaymentForm,
	PopupModal,
	ServicePackForm,
} from './components';
import { billingSelects } from './redux/billingReducer';

const BoxForm = styled.div`
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;
`;

const { Step } = Steps;

function Billing({ setHaveError }) {
	const [current, setCurrent] = useState(0);
	const [formCustomer] = Form.useForm();
	const [formPayment] = Form.useForm();
	const [formAcceptPayment] = Form.useForm();
	const [formMaxPersonYearly] = Form.useForm();
	const [dataAcceptPayment, setDataAcceptPayment] = useState({});
	const [visibleModal, setVisibleModal] = useState(false);
	const { goBack } = useNavigation();
	const params = useParams();
	const { user } = useUser();
	const history = useHistory();
	const { tOthers, tMenu, tButton } = useLng();
	const query = useQueryUrl();
	const preOrderId = query.get('orderId');
	const idPricingMultiPlanId = parseInt(query.get('pricingMultiPlanId'), 10);
	const billingInfo = useSelector(billingSelects.selectBillingInfo);
	const [dataInvoice, setDataInvoice] = useState(false);
	const [serviceId, planId] = [parseInt(params.serviceId, 10), parseInt(params.planId, 10)];

	const [numError, setNumError] = useState(1);
	const [dataCheckExist, setDataCheckExist] = useState({});
	const [showPopupNotExist, setShowPopupNotExist] = useState(false);
	const [isLoadingCheckExist, setIsLoadingCheckExist] = useState(false);
	const [subscriptionData, setSubscriptionData] = useState({});
	const [paymentOnline, setPaymentOnline] = useState(false);
	const [visiblePopupError, setVisiblePopupError] = useState(false);
	const [preOrder, setPreOrder] = useState({ loading: true });
	const [messageDuplicate, setMessageDuplicate] = useState(false);
	// Đăng ký subscription
	const addMutation = useMutation(SmeSubscription.addSubscription, {
		onSuccess: ({ redirectURL, subCode }) => {
			if (redirectURL) {
				window.location.href = redirectURL;
			} else {
				history.push(
					DX.sme.createPath(
						`/payment-success?serviceOwner=${billingInfo.serviceOwner}&subCode=${subCode}&serviceName=${dataInvoice?.serviceName}`,
					),
				);
			}
			return null;
		},
		onError: (e) => {
			if (e?.errorCode === 'error.object.serviceCode.invalid') {
				return message.error('Mã dịch vụ không phù hợp. Vui lòng kiểm tra lại thông tin dịch vụ');
			}
			if (e?.errorCode === 'error.object.pricingCode.invalid') {
				return message.error('Mã gói dịch vụ không phù hợp. Vui lòng kiểm tra lại thông tin dịch vụ');
			}
			if (e.errorCode === 'error.subscription.conflict') {
				setVisibleModal(false);
				return setMessageDuplicate(e?.message);
			}
			if (e.errorCode === 'error.addon.in.used' && e.field === 'addon') {
				setVisibleModal(false);
				const text = e?.message.replace(/.?(Addons still used in other pricing:)/g, '');
				return setMessageDuplicate(
					`Dịch vụ bổ sung ${text} đã được doanh nghiệp đăng ký sử dụng, bạn vui lòng không chọn dịch vụ bổ sung này`,
				);
			}
			return history.push(DX.sme.createPath(`/payment-error?serviceId=${serviceId}&planId=${planId}`));
		},
	});

	// Processing function when switching to step 2
	const handleNextPage = async (data) => {
		try {
			setIsLoadingCheckExist(true);
			setSubscriptionData(data);
			const couponIds = [];
			const addonIds = [];

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

			const { addons, coupons, pricings } = await SmeSubscription.checkExistSubscription({
				couponIds,
				addonIds,
				pricingIds: [billingInfo.pricingId] || [],
			});
			await setIsLoadingCheckExist(false);

			const noAddon = addons?.some((item) => item.isExisted === 'NO');
			const noCoupon = coupons?.some((item) => item.isExisted === 'NO');
			const havePricing = pricings[0]?.isExisted === 'YES';

			// data show popup
			setDataCheckExist({
				noAddon,
				noCoupon,
				noPricing: !havePricing,
				addons,
				coupons,
				pricings,
			});

			if (havePricing) {
				if (noAddon || noCoupon) {
					setShowPopupNotExist(true);
					setVisibleModal(false);
				} else if (!noAddon && !noCoupon && isEmpty(data)) {
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
		const setCouponItemId = billingInfo.couponUserTypedList.map((el) => el.couponId);
		const couponList =
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
					addonMultiPlanId: addon.addonMultiPlanId || null,
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
		const haveTrial = billingInfo.versionSubscription === 'TRIAL';
		handleNextPage({
			paymentMethod: paymentMethod,
			pricingId: planId,
			quantity: billingInfo.quantity,
			couponList: couponList,
			couponPricings: couponPricings,
			addonsList: addonsList,
			merchantOrderId: preOrderId,
			totalAmount: totalAmount,
			contact: contact,
			preOrderId: preOrder?.preOrderId,
			subscriptionId: haveTrial && billingInfo.subscriptionId,
			pricingMultiPlanId: idPricingMultiPlanId || null,
			setCouponItemId: setCouponItemId,
		});
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
		if (current === 2) {
			// const validate2 = await formPayment.validateFields();
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
		if (billingInfo?.serviceOwner === 'OTHER' || billingInfo?.serviceOwner === 'NONE') {
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
					handleBack={() => goBack(DX.sme.createPath(`/service/${serviceId}`))}
					className="text-primary font-bold text-xl"
				/>
				<div className="mt-10 ">
					<div className="mb-10 max-w-3xl mx-auto">
						{current < 4 && (
							<Steps current={current}>
								{STEPS.map((item) => (
									<Step key={item.title} />
								))}
							</Steps>
						)}
					</div>
					<ServicePackForm
						className={current === 0 ? 'block' : 'hidden'}
						next={next}
						planId={planId}
						setHaveError={setHaveError}
						numError={numError}
						isLoading={isLoadingCheckExist}
						preOrder={preOrder}
						setPreOrder={setPreOrder}
						serviceId={serviceId}
					/>

					<div className="flex gap-8 flex-wrap">
						<BoxForm className="tablet:w-full w-7/12 tablet:order-last order-none">
							<CustomerForm className={current === 1 ? 'block' : 'hidden'} form={formCustomer} />

							<div className={`rounded-xl h-full p-8 bg-white ${current === 2 ? 'block' : 'hidden'}`}>
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
						<BoxForm className="tablet:w-full flex-1 tablet:mb-8 mb-0">
							<InvoiceDetailForm
								serviceId={serviceId}
								planId={planId}
								currentPage={current}
								setPreOrder={setPreOrder}
								className={current !== 0 ? 'block' : 'hidden'}
								setHaveError={setHaveError}
								setDataInvoice={setDataInvoice}
								paymentOnline={paymentOnline}
							/>
						</BoxForm>
					</div>
					<div className={`mt-10 flex justify-end ${current === 0 && 'hidden'}`}>
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
										{current === 3 ? tButton('opt_confirm', { field: 'payment' }) : tButton('next')}
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

				{/* Pop-up when Addon, Coupon does not exist */}
				{showPopupNotExist && (
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
				)}

				{/* <PopupError visible={visiblePopupError} setVisible={setVisiblePopupError} /> */}

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
								<CloseCircleOutlined
									className="mx-auto"
									style={{ color: '#ff4d4f', fontSize: '2.5rem' }}
								/>
							</span>
						</div>
						<div className="flex items-center justify-center text-center">{messageDuplicate}</div>
						<div className="mt-6 flex flex-row-reverse">
							<Button className="mx-auto" type="primary" onClick={() => setMessageDuplicate(false)}>
								Đồng ý
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</>
	);
}
export default WrapDetail(Billing);
