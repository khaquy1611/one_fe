/* eslint-disable react-hooks/rules-of-hooks */
import { Col, Dropdown, Form, Input, Menu, message, Modal, Row, Spin, Tabs, Tag, Alert } from 'antd';
import Radio, { Button } from 'antd/lib/radio';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useLng, useNavigation, useQueryUrl, useUser } from 'app/hooks';
import { DX, SMESubscription, SubscriptionDev, ComboSME } from 'app/models';
import { formatNormalizeNumberOtherZero } from 'app/validator';
import { dropRight, toLower } from 'opLodash';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ChooseCombo from 'app/components/Templates/ComboSubscription/ChooseCombo';
import HistorySubscription from 'developer/Subscription/SubscriptionDetail/HistorySubscription';
import { subActions, subSelects } from '../redux/subscriptionReducer';
import SubscriptionComboService from '../SubscriptionComboService';
import ComboOrderServiceProcess from './ComboOrderServiceProcess';
import ListEmp from './ListEmp';
import ListInvoice from './ListInvoice';
import PaymentMethod from './PaymentMethod';
import MemoSubscription from './MemoSubscription';

const { TabPane } = Tabs;
const timeMod = {
	NOW: 'NOW',
	CHOOSE: 'CHOOSE',
};

const CYCLE_TYPE = {
	DAILY: 'ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
const CYCLE_TYPE_TEXT = {
	DAILY: 'DAILY',
	WEEKLY: 'WEEKLY',
	MONTHLY: 'MONTHLY',
	YEARLY: 'YEARLY',
};
function SubscriptionDetail({ typePortal, renewType: renewTypeSup }) {
	const { pricingInfo, addonsList, countCal, formValue, extraFee, coupons } = useSelector(subSelects.selectSubInfo);
	const { id } = useParams();
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const [formCancelSub] = Form.useForm();
	const history = useHistory();
	const [displayEnd, setDisplayEnd] = useState(true);
	const query = useQueryUrl();
	const changeSubscription = query.get('change-subscription');

	const comPlanId = query.get('comPlanId');
	const isCombo = history.location.pathname.indexOf('combo') !== -1;
	const { tButton, tOthers, tMessage } = useLng();
	const [paymenType, setPaymentType] = useState('NOW');
	function updateFunction(values) {
		setPaymentType(values.paymentType);
	}
	const [confirmModal, setConFirmModal] = useState(false);

	const { user } = useUser();
	const CAN_CANCEL =
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/cancel-subscription', user.permissions)) ||
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/cancel-subscription', user.permissions));
	const CAN_CHANGE_PACKAGE =
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/change-combo-pack', user.permissions)) ||
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/change-combo-pack', user.permissions));
	const CAN_ACTIVE =
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/active-subscription', user.permissions)) ||
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/active-subscription', user.permissions));
	const CAN_EXTENSION =
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/extension-subscription', user.permissions)) ||
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/extension-subscription', user.permissions));
	const CAN_ECONTRACT =
		typePortal === 'ADMIN' &&
		DX.canAccessFuture2('admin/request-econtract', user.permissions) &&
		user.departmentId &&
		user.department?.provinceId;

	function getNextDate(startDate, number) {
		if (pricingInfo?.cycleType === CYCLE_TYPE_TEXT.DAILY) {
			return startDate.add(number, 'days');
		}
		if (pricingInfo?.cycleType === CYCLE_TYPE_TEXT.WEEKLY) {
			return startDate.add(number * 7, 'days');
		}
		if (pricingInfo?.cycleType === CYCLE_TYPE_TEXT.MONTHLY) {
			return startDate.add(number, 'months');
		}
		return startDate.add(number, 'years');
	}
	const endDate = moment(getNextDate(moment(formValue.startAt), pricingInfo.paymentCycle));
	const endDateClone = endDate.clone();
	const defaultDate = moment(getNextDate(endDateClone, pricingInfo.paymentCycle)).format('DD/MM/YYYY');

	const [valueEndDate, setValueEndDate] = useState();
	function checkValueChange(value) {
		if (value.numberOfCycles === '') {
			setDisplayEnd(false);
		}
		if (value.numberOfCycles !== '') {
			setDisplayEnd(true);
		}
		setValueEndDate(
			moment(getNextDate(endDate, value.numberOfCycles * pricingInfo.paymentCycle)).format('DD/MM/YYYY'),
		);
	}
	const checkAdmin = function () {
		if (!user.department?.provinceId && typePortal === 'ADMIN') {
			if (pricingInfo.provinceCreatedBy !== null && pricingInfo.roleCreatedBy === 'ADMIN') return false;
			return true;
		}
		if (user.department?.provinceId && typePortal === 'ADMIN') {
			if (
				(pricingInfo.provinceCreatedBy === null ||
					user.department?.provinceId !== pricingInfo.provinceCreatedBy) &&
				pricingInfo.roleCreatedBy === 'ADMIN'
			)
				return false;
			return true;
		}
		return true;
	};
	const [openFormChoosePricing, setOpenForm] = useState(false);

	const { data: generateInfo } = useQuery(
		['getGenerateInfo', id],
		async () => {
			const dataGeneral = await ComboSubscriptionDev.generalScreen(id);
			dispatch(subActions.handleUpdatePricing({ dataGeneral, noNeedCalculate: true }));
			return dataGeneral;
		},
		{
			enabled:
				(pricingInfo.status === 'ACTIVE' || pricingInfo.status === ' CANCELLED') &&
				isCombo &&
				!changeSubscription,
		},
	);
	const { data: generateInfoTrial } = useQuery(
		['getGenerateInfo', id],
		async () => {
			const dataGeneral = await ComboSubscriptionDev.generalScreenTrial(id);
			dispatch(subActions.handleUpdatePricing({ dataGeneral, noNeedCalculate: true }));
			return dataGeneral;
		},
		{
			enabled: pricingInfo.status === 'IN_TRIAL' && isCombo && !changeSubscription,
		},
	);
	let numberCount = 2;
	const { refetch, isFetching, data } = useQuery(
		['getPricingInfo', id],
		async () => {
			const dataReal = await ComboSubscriptionDev.descriptionCombo(id);
			dataReal.addonsList = dataReal.comboPlan.addonsList.map((addons) => {
				addons.couponList = addons.addonCoupons;
				addons.serviceName = addons.addonService.serviceName;
				addons.taxList = addons.addonTaxes;
				addons.unitLimitedList = addons.addonUnitLimiteds?.map((unit) => ({
					unitFrom: unit.unitFrom,
					unitTo: unit.unitTo,
					price: unit.unitPrice ?? unit.price,
				}));
				addons.isOrigin = true;
				return addons;
			});
			if (dataReal.changeCombo === 'END_CYCLE') dataReal.changeCombo = 'END_OF_PERIOD';
			if (dataReal.changeSubscription === 'END_CYCLE') dataReal.changeSubscription = 'END_OF_PERIOD';
			dataReal.comboId = dataReal.comboPlan.combo.comboId;
			dataReal.comboName = dataReal.comboPlan.combo.comboName;
			dataReal.comboPlanId = dataReal.comboPlan.comboPlanId;
			dataReal.comboPlanName = dataReal.comboPlan.comboPlanName;
			dataReal.currencyId = dataReal.comboPlan.currency.id;
			dataReal.currencyName = dataReal.comboPlan.currency.currencyName;
			dataReal.cycleType = dataReal.status !== 'IN_TRIAL' ? dataReal.comboPlan.cycleType : dataReal.cycleType;
			dataReal.hasChangePrice = dataReal.comboPlan.hasChangePrice;
			dataReal.hasTax = dataReal.comboPlan.hasTax;
			dataReal.listPricing = dataReal.comboPlan.listPricing.map((pricing) => {
				pricing.id = pricing?.pricing?.id;
				pricing.pricingName = pricing?.pricing?.pricingName;
				pricing.serviceName = pricing?.pricing?.serviceName;
				pricing.unitId = pricing?.pricing?.unit?.unitId;
				pricing.unitName = pricing?.pricing?.unit?.unitName;
				return pricing;
			});
			// dataReal.numberOfCycles = dataReal.comboPlan.numberOfCycles;
			dataReal.numberOfTrial = dataReal.comboPlan.trialDay;
			dataReal.paymentCycle = dataReal.comboPlan.paymentCycle;
			dataReal.price = dataReal.comboPlan.price;
			dataReal.setupFee = dataReal.comboPlan.setupFee;
			dataReal.taxList = dataReal.comboPlan.taxList;
			dataReal.trialType = dataReal.comboPlan.trialType;
			dataReal.unitId = dataReal.comboPlan.unitId;
			dataReal.unitName = dataReal.comboPlan.unitName;
			dataReal.smeId = dataReal.smeInfo.smeId;
			dataReal.smeName = dataReal.smeInfo.smeName;
			dataReal.couponList = dataReal.couponCombo;

			dataReal.addonsList.forEach((addon) => {
				if (
					addon.pricingPlan === 'STAIR_STEP' ||
					addon.pricingPlan === 'TIER' ||
					addon.pricingPlan === 'VOLUMN'
				)
					numberCount += 1;
			});
			dataReal.numberCount = numberCount;
			if (dataReal.comboOwner === 'OTHER' || dataReal.comboOwner === 'NONE') {
				dataReal.status = dataReal.currentStatus;
			}
			const defaultValue = {
				startChargeAtMod: dataReal.pricingType === 'PREPAY' ? timeMod.NOW : timeMod.CHOOSE,
				startedAt: dataReal.startDate || dataReal.startedAt || dataReal.startAt || moment(),
				startChargeAt: dataReal?.startChargedAt ? moment(dataReal?.startChargedAt, 'DD/MM/YYYY') : moment(),
				startedAtMod: timeMod.CHOOSE,
				paymentCycleText: `${dataReal.paymentCycle} ${CYCLE_TYPE[dataReal.cycleType]}`,
				trialType: dataReal.trialType,
				numberOfTrial: dataReal.numberOfTrial > 0 ? dataReal.numberOfTrial : '',
				smeInfo: [
					{
						companyName: dataReal.smeName,
						id: dataReal.smeId,
					},
				],
			};
			dispatch(
				subActions.initPricingInfo({
					...dataReal,
					formValue: {
						...formValue,
						...defaultValue,
					},
					coupons: dataReal.subCoupons,
					isInit: true,
				}),
			);
			form.setFieldsValue({
				...defaultValue,
			});
			return dataReal;
		},
		{
			enabled: isCombo && !changeSubscription,
		},
	);
	const isOrderService = data?.comboOwner === 'OTHER' || data?.comboOwner === 'NONE';
	const displaySwap =
		pricingInfo.dataGeneral?.isSwapComboPlan === 'YES' &&
		CAN_CHANGE_PACKAGE &&
		checkAdmin() &&
		!isOrderService &&
		pricingInfo.canChange === 'YES';

	const displayCanCelSup = CAN_CANCEL && checkAdmin() && !isOrderService;
	const { data: eContractInfo } = useQuery(
		['getEContractInfo', id],
		async () => {
			if (pricingInfo.status === 'ACTIVE') {
				const res = await SMESubscription.getDetailEContract(id);
				return res;
			}
			return null;
		},
		{
			initialData: {},
			onError: (e) => {
				e.callbackUrl = DX.sme.createPath('');
			},
		},
	);

	const { data: orderServiceProcess, refetch: refetchOrderService } = useQuery(
		['get_orderServiceProcess', id, data],
		async () => {
			if (data && (data?.comboOwner === 'OTHER' || data?.comboOwner === 'NONE')) {
				const res = await ComboSME.getOrderServiceProcess(id);
				return res;
			}
			return null;
		},
	);
	const { goBack } = useNavigation();
	const destroySub = useMutation(ComboSubscriptionDev.destroySubscriptionCombo, {
		onSuccess: () => {
			goBack(DX.dev.createPath('/service/list'));
			if (paymenType === 'NOW') message.success('Hủy thuê bao thành công');
			else message.success('Thuê bao sẽ được hủy khi kết thúc chu kỳ');
		},
		onError: (err) => {
			message.error('Hủy thuê bao thất bại.');
		},
	});
	function onFinishCancelSub() {
		destroySub.mutate({ id, paymenType });
	}
	// const destroySubActive = useMutation(ComboSubscriptionDev.destroySubscriptionCombo, {
	// 	onSuccess: () => {
	// 		goBack(DX.dev.createPath('/service/list'));
	// 		message.success('Đã hủy thuê bao thành công.');
	// 	},
	// 	onError: (err) => {
	// 		message.error('Hủy thuê bao thất bại.');
	// 	},
	// });
	const [openExtend, setOnpenExtend] = useState(false);
	function handleClose() {
		setOnpenExtend(false);
	}
	const { pathname } = useLocation();
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab') || '1';
	const pathToList = dropRight(pathname.split('/')).join('/');
	let tagStatus = SubscriptionDev.tagStatus[pricingInfo.status];
	if (isOrderService) tagStatus = SubscriptionDev.tagStatusNew[pricingInfo.currentStatus];
	const renewSub = useMutation(SubscriptionDev.putRenewSubscriptionDev, {
		onSuccess: () => {
			message.success('Thuê bao đã được gia hạn thành công');
			handleClose();
			history.push(pathToList);
		},
		onError: (err) => {
			handleClose();
			message.error('Thuê bao đã được gia hạn thất bại');
		},
	});
	function onFinishOpenExtend() {
		renewSub.mutate({
			id,
			cycleQuantity: form.getFieldValue('numberOfCycles') || '',
			typePortal,
			renewType: renewTypeSup,
		});
	}

	const breadcrumbs = [
		{
			name: 'opt_manage/subscriber',
			url: '',
		},
		{
			name: 'subscriberListDev',
			url: pathToList,
		},
		{
			isName: true,
			name: pricingInfo.comboName,
			url: '',
		},
		{
			name: 'comboSubscriberDetail',
			url: '',
		},
	];
	const mutationCreateEContract = useMutation(() => SMESubscription.postCreateEContract(id), {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreateEcontract', { field: 'service' }));
			refetch();
		},
		onError: (e) => {
			message.error(tMessage('opt_badlyCreateEcontract', { field: 'service' }));
		},
	});
	const onCreateEContract = () => {
		Modal.confirm({
			title: tOthers('econtractComfirmMess'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				mutationCreateEContract.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: mutationCreateEContract.isLoading,
		});
	};
	const DropdownMenu = (
		<Menu className="top-1 w-36">
			{/* // Co the xuat econtract */}
			{data?.isContract === 'YES' && CAN_ECONTRACT && checkAdmin() && !isOrderService && (
				<Menu.Item key="1" onClick={() => onCreateEContract()}>
					{tButton('opt_create', { field: 'econtract' })}
				</Menu.Item>
			)}
			{CAN_CANCEL && checkAdmin() && !isOrderService && (
				<Menu.Item
					key="1"
					onClick={() => {
						setConFirmModal(true);
					}}
				>
					Hủy
				</Menu.Item>
			)}
		</Menu>
	);
	const isActionSupcription = useMutation(ComboSubscriptionDev.activeComboSub, {
		onSuccess: () => {
			goBack(DX.dev.createPath('/service'));
			message.success('Thuê bao đã được kích hoạt lại thành công.');
		},
		onError: (err) => {
			message.error('Kích hoạt lại thất bại');
		},
	});

	const DropdownMenuActive = (
		<Menu className="top-1 w-40">
			{data?.isContract === 'YES' && CAN_ECONTRACT && !isOrderService && (
				<Menu.Item key="1" onClick={() => onCreateEContract()}>
					{tButton('opt_create', { field: 'econtract' })}
				</Menu.Item>
			)}
			{displaySwap && (
				<Menu.Item
					key="1"
					onClick={() => {
						setOpenForm(true);
					}}
				>
					Đổi gói Combo dịch vụ
				</Menu.Item>
			)}
			{displayCanCelSup && (
				<Menu.Item
					key="2"
					onClick={() => {
						//	destroySub.mutate(id);
						setConFirmModal(true);
					}}
				>
					Hủy
				</Menu.Item>
			)}
		</Menu>
	);

	const renderTab = () => {
		if (isOrderService)
			return (
				<TabPane tab="Tiến trình" key="2">
					<ComboOrderServiceProcess
						subId={id}
						typePortal={typePortal}
						refetch={refetchOrderService}
						orderServiceProcess={orderServiceProcess || {}}
					/>
				</TabPane>
			);
		return null;
	};

	return (
		<Spin spinning={isFetching}>
			{!changeSubscription ? (
				<>
					<div className="flex justify-between" id="headerId">
						<UrlBreadcrumb breadcrumbs={breadcrumbs} />
						<div>
							{pricingInfo.status === 'IN_TRIAL' && checkAdmin() && (
								<>
									<Button
										style={{ backgroundColor: '#135EA8', color: '#FFFFFF' }}
										onClick={() =>
											history.push(
												DX[toLower(typePortal)].createPath(
													`/subscription/combo/register?serviceIdIn=${pricingInfo.comboPlanId}&subscriptionId=${id}`,
												),
											)
										}
									>
										Đăng ký
									</Button>

									{moment(pricingInfo.startAt, 'DD/MM/YYYY').isAfter(moment()) &&
										(CAN_CANCEL || CAN_CHANGE_PACKAGE) &&
										checkAdmin() && (
											<Dropdown
												overlay={DropdownMenu}
												trigger={['click']}
												getPopupContainer={() => document.getElementById('headerId')}
												className="cursor-pointer"
												placement="bottomRight"
											>
												<Button className="ml-3">...</Button>
											</Dropdown>
										)}
								</>
							)}

							{pricingInfo.dataGeneral?.isRenewal === 'YES' &&
								CAN_EXTENSION &&
								checkAdmin() &&
								!isOrderService && (
									<Button
										type="primary"
										onClick={() => {
											setOnpenExtend(true);
										}}
									>
										Gia hạn
									</Button>
								)}
							{pricingInfo.status === 'ACTIVE' &&
								checkAdmin() &&
								!isOrderService &&
								(displayCanCelSup || displaySwap) && (
									<Dropdown
										overlay={DropdownMenuActive}
										trigger={['click']}
										getPopupContainer={() => document.getElementById('headerId')}
										className="cursor-pointer"
										placement="bottomRight"
									>
										<Button className="ml-3">...</Button>
									</Dropdown>
								)}
							{pricingInfo.dataGeneral?.isActivate === 'YES' && CAN_ACTIVE && checkAdmin() && (
								<Button
									type="primary"
									onClick={() => {
										isActionSupcription.mutate(id, typePortal);
									}}
								>
									Kích hoạt
								</Button>
							)}
						</div>
					</div>
					<Row>
						<Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
							<div className="font-semibold mt-5 mb-7 flex justify-between">
								<div>
									<span className="text-xl font-semibold">Chi tiết thuê bao Combo</span>
									<span className="font-medium ml-3">
										<Tag color={tagStatus?.color}>{tagStatus?.text}</Tag>
									</span>
									<div className="mb-1 mt-1">
										{tOthers('transactionCode')}:
										{isOrderService ? orderServiceProcess?.transactionCode : data?.dhsxkdSubCode}
									</div>
									{pricingInfo.status === 'ACTIVE' &&
										data?.isContract !== 'YES' &&
										!eContractInfo?.data?.contractExist && (
											<Alert
												message={tOthers('econtractWaittingNotificationAdmin')}
												type="warning"
												className="mt-4"
												showIcon
											/>
										)}
								</div>
							</div>

							<Tabs
								activeKey={getTab}
								onChange={(activeTab) => {
									history.replace(`${pathname}?tab=${activeTab}`);
								}}
							>
								<TabPane tab="Thông tin chung" key="1">
									<SubscriptionComboService
										typePortal={typePortal}
										typeSupscrip="detail"
										extraFee={extraFee}
										coupons={coupons}
										dataDetail={pricingInfo}
										typeGeneral="GENERATE"
										checkAdmin={checkAdmin()}
										isOrderService={isOrderService}
									/>
								</TabPane>

								{/* <TabPane tab="Chi phí kỳ tới" key="2" forceRender>
									<PeriodCost
										typePortal={typePortal}
										typeSupscrip="detail"
										extraFee={extraFee}
										coupons={coupons}
										dataDetail={pricingInfo}
										//	addonListChange={addonListChange}
										typeGeneral="PERIOD"
									/>
								</TabPane> */}
								{!isOrderService && (
									<TabPane tab="Danh sách nhân viên" key="3">
										<ListEmp dataDetail={pricingInfo} subscriptionId={id} typePortal={typePortal} />
									</TabPane>
								)}
								{renderTab()}
								{pricingInfo.subscriptionStatus !== 'IN_TRIAL' && pricingInfo.regType !== 'TRIAL' && (
									<>
										<TabPane tab="Hóa đơn" key="4">
											<ListInvoice
												typePortal={typePortal}
												dataDetail={pricingInfo}
												subscriptionId={id}
											/>
										</TabPane>
										<TabPane tab="Ghi nhớ" key="5">
											<MemoSubscription dataDetail={pricingInfo} typePortal={typePortal} />
										</TabPane>
										<TabPane tab="Phương thức thanh toán" key="6">
											<PaymentMethod
												isOrderService={isOrderService}
												dataDetail={pricingInfo}
												subscriptionId={id}
											/>
										</TabPane>
										<TabPane tab="Lịch sử" key="7">
											<HistorySubscription
												subscriptionStatus={pricingInfo.status}
												typePortal={typePortal}
											/>
										</TabPane>
									</>
								)}
							</Tabs>
						</Col>
					</Row>
					<Modal
						visible={openExtend}
						closable={false}
						maskClosable={false}
						width={700}
						okText="Lưu"
						title="Gia hạn thuê bao Combo"
						onOk={() => {
							handleClose();
							onFinishOpenExtend();
							form.resetFields();
						}}
						onCancel={() => {
							handleClose();
							form.resetFields();
						}}
					>
						<Form
							form={form}
							labelCol={{ span: 8 }}
							wrapperCol={{ span: 16 }}
							onValuesChange={(valueChange) => checkValueChange(valueChange)}
						>
							<Form.Item name="paymentCycleText" label="Chu kỳ thanh toán">
								<Input disabled defaultValue={formValue.paymentCycleText} />
							</Form.Item>

							<Form.Item
								name="numberOfCycles"
								label="Số chu kỳ gia hạn"
								normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
							>
								<Input placeholder="Không giới hạn" defaultValue="1" maxLength={3} />
							</Form.Item>
							<Form.Item name="startDate" label="Ngày bắt đầu sử dụng">
								<div className="mt-1">{endDate.format('DD/MM/YYYY')}</div>
							</Form.Item>
							{displayEnd && (
								<Form.Item
									name="endDate"
									label="Ngày kết thúc sử dụng"
									normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
								>
									<div className="mt-1">{valueEndDate || defaultDate}</div>
								</Form.Item>
							)}
						</Form>
					</Modal>
					<Modal
						title="Xác nhận hủy thuê bao"
						visible={confirmModal}
						onCancel={() => setConFirmModal(false)}
						maskClosable={false}
						onOk={() => {
							onFinishCancelSub();
							setConFirmModal(false);
							formCancelSub.resetFields();
						}}
					>
						<p>Thời điểm áp dụng hủy thuê bao</p>
						<Form
							form={formCancelSub}
							onFinish={onFinishCancelSub}
							onValuesChange={(update) => {
								updateFunction(update);
							}}
							initialValues={{ paymentType: pricingInfo.cancelDate }}
						>
							<Form.Item label=" " name="paymentType" colon={false}>
								<Radio.Group>
									<Radio value="NOW" className="w-full mb-2">
										Ngay lập tức
									</Radio>
									<Radio value="END_OF_PERIOD">Kết thúc chu kỳ</Radio>
								</Radio.Group>
							</Form.Item>
						</Form>
					</Modal>
				</>
			) : (
				<SubscriptionComboService
					typePortal={typePortal}
					typeSupscrip="create"
					//	dataDetail={data}
					typeChange="changeSubscription"
				/>
			)}
			{openFormChoosePricing && (
				<Form
					onValuesChange={(update) => {
						history.push(
							DX[toLower(typePortal)].createPath(
								`/subscription/combo/${update.pricingValue[0].id}?change-subscription=true&smeName=${formValue.smeInfo[0].companyName}
								&smeId=${formValue.smeInfo[0].id}&subscriptionId=${id}&changeCombo=${pricingInfo.changeCombo}`,
							),
						);
					}}
				>
					<Form.Item name="pricingValue">
						<ChooseCombo
							typePortal={typePortal}
							formValue={formValue?.smeInfo}
							typeChangeSub="YES"
							openModal={openFormChoosePricing}
							setOpenForm={setOpenForm}
							type="CHANGE_SUB"
							comboPlanId={pricingInfo.comboPlanId}
						/>
					</Form.Item>
				</Form>
			)}
		</Spin>
	);
}

export default SubscriptionDetail;
