import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Col, Dropdown, Form, Input, Menu, message, Modal, Row, Select, Spin, Tabs, Tag } from 'antd';
import Radio, { Button } from 'antd/lib/radio';
import { UrlBreadcrumb } from 'app/components/Atoms';
import ChoosePricing from 'app/components/Templates/Subscription/ChoosePricing';
import { useLng, useNavigation, useQueryUrl } from 'app/hooks';
import useUser from 'app/hooks/useUser';
import { DX, SMESubscription, SubscriptionDev } from 'app/models';
import { formatNormalizeNumberOtherZero } from 'app/validator';
import moment from 'moment';
import { dropRight, toLower } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { subActions, subSelects } from '../redux/subscriptionReducer';
import SubscriptionService from '../SubscriptionService';
import HistorySubscription from './HistorySubscription';
import ListEmp from './ListEmp';
import ListInvoice from './ListInvoice';
import MemoSubscription from './MemoSubscription';
import OrderServiceProcess from './OrderServiceProcess';
import PaymentMethod from './PaymentMethod';

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

const { Option } = Select;
function SubscriptionDetail({ typePortal, renewType: renewTypeSup, isOrderService }) {
	const { user } = useUser();
	const CAN_CANCEL =
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/cancel-subscription', user.permissions)) ||
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/cancel-subscription', user.permissions));
	const CAN_CHANGE_PACKAGE =
		(!isOrderService &&
			typePortal === 'ADMIN' &&
			DX.canAccessFuture2('admin/change-combo-pack', user.permissions)) ||
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
	const CAN_CREATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));
	const { pricingInfo, addonsList, countCal, formValue, extraFee, coupons } = useSelector(subSelects.selectSubInfo);
	const { id } = useParams();
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const [formCancelSub] = Form.useForm();
	const [paymenType, setPaymentType] = useState('NOW');
	const history = useHistory();
	const query = useQueryUrl();
	const changeSubscription = query.get('change-subscription');
	const isService = history.location.pathname.indexOf('service') !== -1;
	const { tButton, tOthers, tMessage } = useLng();
	const [openFormChoosePricing, setOpenForm] = useState(false);
	const [defalutRenew, setDefaultRenew] = useState(1);
	function updateFunction(values) {
		setPaymentType(values.paymentType);
	}
	let numberCount = 2;
	const { refetch, isFetching, data } = useQuery(
		['getPricingInfo', id, changeSubscription],
		async () => {
			const dataReal = await SubscriptionDev.getDescription(id);
			if (dataReal.changePricing === 'END_CYCLE') dataReal.changePricing = 'END_OF_PERIOD';
			if (dataReal.changeSubscription === 'END_CYCLE') dataReal.changeSubscription = 'END_OF_PERIOD';

			if (dataReal.subscriptionStatus === 'IN_TRIAL') dataReal.cycleType = dataReal.cycleTypeTry;
			if (
				dataReal.pricingPlan === 'STAIR_STEP' ||
				dataReal.pricingPlan === 'TIER' ||
				dataReal.pricingPlan === 'VOLUMN'
			)
				numberCount += 1;
			dataReal.addonsList.forEach((addon) => {
				if (
					addon.pricingPlan === 'STAIR_STEP' ||
					addon.pricingPlan === 'TIER' ||
					addon.pricingPlan === 'VOLUMN'
				)
					numberCount += 1;
			});
			dataReal.numberCount = numberCount;
			const defaultValue = {
				startChargeAtMod: dataReal.pricingType === 'PREPAY' ? timeMod.NOW : timeMod.CHOOSE,
				startedAt: dataReal.startDate || dataReal.startedAt || moment(),
				startChargeAt: dataReal?.startChargedAt ? moment(dataReal?.startChargedAt, 'DD/MM/YYYY') : moment(),
				startedAtMod: timeMod.CHOOSE,
				paymentCycleText: `${dataReal.paymentCycle} ${CYCLE_TYPE[dataReal.cycleType]}`,
				trialType: dataReal.trialType,
				numberOfTrial: dataReal.trialDay || 1,
				smeInfo: [
					{
						companyName: dataReal.smeName,
						id: dataReal.smeId,
						tin: dataReal?.smeTaxCode,
						address: dataReal?.smeProvince,
						customer: dataReal?.smeFullName,
					},
				],
			};
			dataReal.summary.couponList?.map((el) => {
				el.id = el.couponId;
				return el;
			});

			dataReal.addonsOrigin = dataReal.addonsList.map((el) => {
				el.isOrigin = true;

				return el;
			});

			dataReal.couponList = [...dataReal.couponPricings];
			dispatch(
				subActions.initPricingInfo({
					...dataReal,
					formValue: {
						...formValue,
						...defaultValue,
					},
					coupons: [...dataReal.summary.couponList],
					originQuantity: dataReal.quantity,
					isInit: true,
				}),
			);
			if (
				dataReal.pricingPlan === 'STAIR_STEP' ||
				dataReal.pricingPlan === 'TIER' ||
				dataReal.pricingPlan === 'VOLUMN'
			)
				numberCount + 1;
			dataReal.addonsList.forEach((addon) => {
				if (
					addon.pricingPlan === 'STAIR_STEP' ||
					addon.pricingPlan === 'TIER' ||
					addon.pricingPlan === 'VOLUMN'
				)
					numberCount + 1;
			});
			form.setFieldsValue({
				...defaultValue,
			});
			return dataReal;
		},
		{
			enabled: isService && !changeSubscription,
		},
	);

	const { data: eContractInfo } = useQuery(
		['getEContractInfo', id],
		async () => {
			if (pricingInfo.subscriptionStatus === 'ACTIVE') {
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
			if (data) {
				const res = await SubscriptionDev.getOrderServiceProcess({ id, typePortal });
				return res;
			}
			return null;
		},
	);

	const addonListChange = pricingInfo.addonsList;
	const { goBack } = useNavigation();
	const destroySubInTrial = useMutation(SubscriptionDev.destroySubscriptionIntrial, {
		onSuccess: () => {
			goBack(DX.dev.createPath('/service/list'));
			if (paymenType === 'NOW') message.success('Hủy thuê bao thành công');
			else message.success('Thuê bao sẽ được hủy khi kết thúc chu kỳ');
		},
		onError: (err) => {
			message.error('Hủy thuê bao thất bại.');
		},
	});

	const destroySubActive = useMutation(SubscriptionDev.destroySubscriptionActive, {
		onSuccess: () => {
			goBack(DX.dev.createPath('/service/list'));
			if (paymenType === 'NOW') message.success('Hủy thuê bao thành công');
			else message.success('Thuê bao sẽ được hủy khi kết thúc chu kỳ');
		},
		onError: (err) => {
			message.error('Hủy thuê bao thất bại.');
		},
	});
	const [openExtend, setOnpenExtend] = useState(false);
	function handleClose() {
		setOnpenExtend(false);
	}

	const { pathname } = useLocation();
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab') || '1';
	const [confirmModal, setConFirmModal] = useState(false);

	const pathToList = dropRight(pathname.split('/')).join('/');

	const tagStatus = SubscriptionDev.tagStatusNew[pricingInfo?.subscriptionStatus];

	const expire = moment(pricingInfo.expiredDate, 'YYYY-MM-DD').subtract(10, 'days');
	const isDisplayTime = moment(expire).isBefore(moment());
	const checkNumberOfCycles = pricingInfo.numberOfCycles !== -1 && pricingInfo.numberOfCycles !== null;
	// const { data: dataChange } = useQuery(
	// 	['getPricingInfo', changeSubscription],
	// 	async () => {
	// 		const dataReal = await SubscriptionDev.detailChangeSubs(pricingId, typePortal, id);

	// 		const defaultValue = {
	// 			startChargeAtMod: dataReal.pricingType === 'PREPAY' ? timeMod.NOW : timeMod.CHOOSE,
	// 			startedAt: dataReal.startDate || dataReal.startedAt || moment(),
	// 			startChargeAt: moment(),
	// 			startedAtMod: timeMod.CHOOSE,
	// 			paymentCycleText: `${dataReal.paymentCycle} ${CYCLE_TYPE[dataReal.cycleType]}`,
	// 			trialType: dataReal.trialType,
	// 			numberOfTrial: dataReal.numberOfTrial > 0 ? dataReal.numberOfTrial : '',
	// 			smeInfo: [
	// 				{
	// 					companyName: dataReal.smeName,
	// 					id: dataReal.smeId,
	// 				},
	// 			],
	// 		};
	// 		dispatch(
	// 			subActions.initPricingInfo({
	// 				...dataReal,
	// 				formValue: {
	// 					...formValue,
	// 					...defaultValue,
	// 				},
	// 				isInit: true,
	// 				originQuantity: dataReal.quantity,
	// 			}),
	// 		);
	// 		form.setFieldsValue({
	// 			...defaultValue,
	// 		});

	// 		return dataReal;
	// 	},
	// 	{
	// 		enabled: isService && changeSubscription !== undefined && changeSubscription !== null,
	// 	},
	// );
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
	const renewSub = useMutation(SubscriptionDev.putRenewSubscriptionDev, {
		onSuccess: () => {
			handleClose();
			message.success('Thuê bao đã được gia hạn thành công');
			history.push(pathToList);
		},
		onError: (err) => {
			message.error('Thuê bao đã được gia hạn thất bại');
		},
	});

	function onFinishCancelSub() {
		if (pricingInfo.subscriptionStatus === 'IN_TRIAL') destroySubInTrial.mutate({ id, paymenType });
		else destroySubActive.mutate({ id, paymenType });
	}
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
			name: 'subscriberDetail',
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
			{data?.isContract === 'YES' && CAN_ECONTRACT && !isOrderService && (
				<Menu.Item key="1" onClick={() => onCreateEContract()}>
					{tButton('opt_create', { field: 'econtract' })}
				</Menu.Item>
			)}
			{!moment(pricingInfo.startedAt, 'DD/MM/YYYY').isAfter() && !isOrderService && checkAdmin() && (
				<Menu.Item
					key="1"
					onClick={() => {
						//	destroySubInTrial.mutate(id);
						setConFirmModal(true);
					}}
				>
					Hủy
				</Menu.Item>
			)}
		</Menu>
	);
	const isActionSupcription = useMutation(SubscriptionDev.activeSubscription, {
		onSuccess: () => {
			goBack(DX[toLower(typePortal)].createPath('/service'));
			message.success('Thuê bao đã được kích hoạt lại thành công.');
		},
		onError: (err) => {
			message.error('Kích hoạt lại thất bại');
		},
	});
	const DropdownMenuActive = (
		<Menu className="top-1 w-36">
			{data?.isContract === 'YES' &&
				CAN_ECONTRACT &&
				typePortal === 'ADMIN' &&
				pricingInfo.subscriptionStatus === 'ACTIVE' &&
				!isOrderService && (
					<Menu.Item key="1" onClick={() => onCreateEContract()}>
						{tButton('opt_create', { field: 'econtract' })}
					</Menu.Item>
				)}
			{CAN_CHANGE_PACKAGE && checkAdmin() && pricingInfo.canChange === 'YES' && !isOrderService && (
				<Menu.Item
					key="1"
					onClick={() => {
						setOpenForm(true);
					}}
				>
					Đổi gói dịch vụ
				</Menu.Item>
			)}
			{CAN_CANCEL && checkAdmin() && !isOrderService && (
				<Menu.Item
					key="2"
					onClick={() => {
						// destroySubActive.mutate(id);
						setConFirmModal(true);
					}}
				>
					Hủy
				</Menu.Item>
			)}
		</Menu>
	);

	return (
		<Spin spinning={isFetching}>
			{!changeSubscription ? (
				<>
					<div className="flex justify-between" id="headerId">
						<UrlBreadcrumb breadcrumbs={breadcrumbs} />
						<div>
							{pricingInfo.subscriptionStatus === 'IN_TRIAL' && checkAdmin() && CAN_CREATE && (
								<>
									<Button
										style={{ backgroundColor: '#135EA8', color: '#FFFFFF' }}
										onClick={() =>
											history.push(
												DX[toLower(typePortal)].createPath(
													`/subscription/service/register?serviceIdIn=${pricingInfo.pricingId}
													&subscriptionId=${id}${pricingInfo.pricingMultiPlanId ? `&periodId=${pricingInfo.pricingMultiPlanId}` : ''}`,
												),
											)
										}
									>
										Đăng ký
									</Button>

									{!moment(pricingInfo.startedAt, 'DD/MM/YYYY').isAfter() &&
										CAN_CANCEL &&
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
							{/* isDisplayTime && */}
							{pricingInfo.subscriptionStatus === 'ACTIVE' &&
								checkNumberOfCycles &&
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
							{pricingInfo.subscriptionStatus === 'ACTIVE' &&
								(CAN_CANCEL || CAN_CHANGE_PACKAGE) &&
								checkAdmin() &&
								!isOrderService && (
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
							{pricingInfo.subscriptionStatus === 'CANCELLED' &&
								pricingInfo.canActive === 'YES' &&
								CAN_ACTIVE &&
								checkAdmin() && (
									<Button
										type="primary"
										onClick={() => {
											const dataActive = {};
											dataActive.id = id;
											dataActive.type = typePortal;
											isActionSupcription.mutate(dataActive);
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
									<span className="text-xl font-semibold">Chi tiết thuê bao</span>
									<span className="font-medium ml-3">
										<Tag color={tagStatus?.color}>{tagStatus?.text}</Tag>
									</span>
									<div className="mb-1 mt-1">
										{tOthers('transactionCode')}:{' '}
										{isOrderService ? orderServiceProcess?.transactionCode : data?.dhsxkdSubCode}
									</div>

									{pricingInfo.subscriptionStatus === 'ACTIVE' &&
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
								<TabPane tab="Thông tin chung" key="1" forceRender>
									<SubscriptionService
										typePortal={typePortal}
										typeSupscrip="detail"
										extraFee={extraFee}
										coupons={coupons}
										dataDetail={pricingInfo}
										addonListChange={addonListChange}
										typeGeneral="GENERATE"
										checkAdmin={checkAdmin()}
										isOrderService={isOrderService}
										numberCount={numberCount}
									/>
								</TabPane>
								{/* <TabPane tab="Chi phí kỳ tới" key="2" forceRender>
									<PeriodCost
										typePortal={typePortal}
										typeSupscrip="detail"
										extraFee={extraFee}
										coupons={coupons}
										dataDetail={pricingInfo}
										addonListChange={addonListChange}
										typeGeneral="PERIOD"
									/>
								</TabPane> */}
								{!isOrderService && (
									<TabPane tab="Danh sách nhân viên" key="3">
										<ListEmp dataDetail={pricingInfo} subscriptionId={id} typePortal={typePortal} />
									</TabPane>
								)}
								{isOrderService && (
									<TabPane tab="Tiến trình" key="2.1">
										<OrderServiceProcess
											subId={id}
											typePortal={typePortal}
											refetch={refetchOrderService}
											orderServiceProcess={orderServiceProcess || {}}
										/>
									</TabPane>
								)}
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
												dataDetail={pricingInfo}
												isOrderService={isOrderService}
												subscriptionId={id}
											/>
										</TabPane>
										<TabPane tab="Lịch sử" key="7">
											<HistorySubscription
												subscriptionStatus={pricingInfo.subscriptionStatus}
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
						closable
						maskClosable={false}
						width={600}
						okText="Lưu"
						title="Gia hạn thuê bao"
						onOk={() => {
							setDefaultRenew(form.getFieldValue('numberOfCycles') || '');
							onFinishOpenExtend();
							form.resetFields();
						}}
						onCancel={() => {
							handleClose();
							form.resetFields();
						}}
						okButtonProps={{ loading: renewSub.isLoading }}
					>
						<Form form={form}>
							<Form.Item
								name="numberOfCycles"
								label="Số chu kỳ gia hạn"
								normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
							>
								<Input placeholder="Không giới hạn" defaultValue={defalutRenew} maxLength={3} />
							</Form.Item>
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
						okText="Xác nhận"
						cancelText="Hủy"
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
				<SubscriptionService
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
								`/subscription/service/${update.pricingValue[0].id}?change-subscription=true&smeName=${
									formValue.smeInfo[0].companyName
								}
								 &smeId=${formValue.smeInfo[0].id}&subscriptionId=${id}
								 &changePricing=${pricingInfo.changePricing}${
									update.pricingValue[0].periodId
										? `&periodId=${update.pricingValue[0].periodId}`
										: ''
								}`,
							),
						);
					}}
				>
					<Form.Item name="pricingValue">
						<ChoosePricing
							typePortal={typePortal}
							formValue={formValue?.smeInfo}
							typeChangeSub="YES"
							openModal={openFormChoosePricing}
							setOpenForm={setOpenForm}
							type="CHANGE_SUB"
							pricingInfo={pricingInfo}
						/>
					</Form.Item>
				</Form>
			)}
		</Spin>
	);
}

export default SubscriptionDetail;
