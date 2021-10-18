import React, { useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import moment from 'moment';
import { useQueryUrl, useLng } from 'app/hooks';
import { Alert, message, Tabs, Spin } from 'antd';
import { CirclePayIcon, EmployeeIcon, PriceIcon } from 'app/icons';
import { SMESubscription, DX, ComboSME } from 'app/models';
import { ModalConfirm } from 'sme/components';
import { isEmpty } from 'opLodash';
import {
	TitleSubscription,
	EmployeeList,
	PackDetail,
	ComboOrderServiceProcess,
	OrderServiceProcess,
	DebitBalance,
	Invoice,
	PaymentMethods,
	History,
} from './common-subscription';

const { TabPane } = Tabs;

const STATUS_SERVICE = {
	CANCELLED: 'CANCELLED',
	FUTURE: 'FUTURE',
	IN_TRIAL: 'IN_TRIAL',
	ACTIVE: 'ACTIVE',
	NON_RENEWING: 'NON_RENEWING',
};

const OWNER_TYPE = {
	VNPT: 'VNPT',
	SAAS: 'SAAS',
	OTHER: 'OTHER',
};

const REG_TYPE = {
	TRIAL: 'TRIAL',
	OFFICIAL: 'OFFICIAL',
};

const AWAITING_CANCEL = 'AWAITING_CANCEL';
const BATCH = 'batch';
const COMBO = 'COMBO';

const ItemDetail = ({
	title,
	icon,
	className,
	cycleType,
	usedQuantity,
	quantity,
	currentCycle,
	numberOfCycles,
	amountOfCycle,
	tOthers,
	tLowerField,
	status,
}) => {
	function renderCurrentCycle() {
		if (status === STATUS_SERVICE.FUTURE) return '0';
		if ((numberOfCycles === -1 || numberOfCycles === null) && currentCycle >= 0) return currentCycle;
		return `${currentCycle}/${numberOfCycles}`;
	}

	return (
		<div className={`${className} flex tablet:mb-4 mb-0`}>
			<div className="mr-4">{icon}</div>
			<div className="font-semibold" style={{ color: '#263238' }}>
				<div>{title}</div>
				{cycleType && (
					<div className="font-normal text-gray-40">
						<span>{cycleType}</span>
						<br />
						<span>
							{tOthers('currentCycle')}: {renderCurrentCycle()}
						</span>
					</div>
				)}
				{quantity && (
					<div className="font-normal text-gray-40">
						{quantity === -1 ? ` ${tOthers('unlimited')}` : ` ${usedQuantity}/${quantity}`}
					</div>
				)}
				{amountOfCycle && (
					<div className="font-normal text-gray-40">
						<span>
							{tOthers('amountOfMoney')}:{' '}
							{DX.formatNumberCurrency(amountOfCycle.amountNextCycle || amountOfCycle.amountCurrentCycle)}{' '}
							{amountOfCycle.currencyName} ({tLowerField('from')} {amountOfCycle.startCurrentCycle}{' '}
							{tLowerField('to')} {amountOfCycle.endCurrentCycle})
						</span>
						<br />
						{/* nextPaymentTime trả trước, trả sau currentPaymentDate */}
						{(amountOfCycle.nextPaymentTime !== null || amountOfCycle.currentPaymentDate !== null) && (
							<span>
								{tOthers('paymentDate')}:{' '}
								{amountOfCycle.nextPaymentTime || amountOfCycle.currentPaymentDate}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

function CommonSubscription({ dataSubscription, typeSubscription, refetch, subcriptionId }) {
	const [showModal, setShowModal] = useState(false);
	const [initService, setInitService] = useState(null);

	const { tField, tMessage, tMenu, tOthers, tFilterField, tLowerField } = useLng();

	const history = useHistory();
	const { id } = useParams();

	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const { pathname } = useLocation();

	const {
		putUnsubscribe,
		putUnsubscribeCombo,
		getServiceOfSubscription,
		getServiceOfCombo,
		paymentArray,
		statusArray,
	} = SMESubscription;

	const convertType = (value, dataArr = []) => {
		const DataFilter = dataArr.filter((item) => item.value === value)[0];
		return DataFilter?.label;
	};

	const {
		status,
		serviceId,
		comboPlanId,
		endDateSubscription,
		awaitingCancel,
		canceledBy,
		serviceOwner,
		comboOwner,
		regType,
	} = dataSubscription;

	const convertSubscriptionInfo = {
		...dataSubscription,
		status: tFilterField('value', convertType(status, statusArray)),
		cycleType: tFilterField('periodicOptions', convertType(dataSubscription.cycleType, paymentArray)),
	};
	const isOrderService = serviceOwner === OWNER_TYPE.OTHER || comboOwner === OWNER_TYPE.OTHER;
	const { data: orderServiceProcess, refetch: refetchOrderService } = useQuery(
		['get_orderServiceProcess', id, isOrderService, comboPlanId],
		async () => {
			if (isOrderService) {
				if (!comboPlanId) {
					const res = await SMESubscription.getOrderServiceProcess(id);
					return res;
				}
				const res = await ComboSME.getOrderServiceProcess(id);
				return res;
			}

			return null;
		},
	);

	// ------------------------------unsubscribe service-----------------------------------
	const mutationUnsubscribe = useMutation(
		() => (typeSubscription === COMBO ? putUnsubscribeCombo(subcriptionId) : putUnsubscribe(subcriptionId)),
		{
			onSuccess: async () => {
				setShowModal(false);
				const res = await refetch();
				if (res.data.awaitingCancel === AWAITING_CANCEL)
					message.success(tMessage('successfullyCanceledService'));
				else message.success(tMessage('opt_successfullyCanceled', { field: 'service' }));
			},

			onError: () => {
				setShowModal(false);
				message.error(tMessage('opt_badlyCanceled', { field: 'service' }));
			},
		},
	);

	// -------------------get list service of subscription------------------------
	// pricing
	const { data: serviceSelect, isFetching: isFetchingService } = useQuery(
		['serviceOfSubscription', id],
		async () => {
			const res = await getServiceOfSubscription(id);
			setInitService(serviceId || res.data[0]?.id);
			return [
				...res.data.map((e) => ({
					label: e.serviceName,
					value: e.id,
					itemType: e.itemType,
				})),
			];
		},
		{
			initialData: [],
			enabled: typeSubscription !== COMBO && serviceOwner !== OWNER_TYPE.OTHER && !isOrderService,
		},
	);

	// combo
	const { data: serviceComboSelect, isFetching: isFetchingCombo } = useQuery(
		['comboOfSubscription'],
		async () => {
			const res = await getServiceOfCombo(id);
			setInitService(res.data[0]?.id);

			return [
				...res.data.map((e) => ({
					label: e.serviceName,
					value: e.id,
					itemType: e.itemType,
				})),
			];
		},
		{
			initialData: [],
			enabled: typeSubscription === COMBO && status !== STATUS_SERVICE.FUTURE && !isOrderService,
		},
	);

	const onUnsubscribe = () => {
		setShowModal(true);
	};

	const listTab = [
		{
			key: '2',
			title: tMenu('detail'),
			component: (
				<PackDetail
					isOrderService={isOrderService}
					planId={convertSubscriptionInfo.pricingId || comboPlanId}
					typeSubscription={typeSubscription}
					status={status}
					activeTab={getTab}
					currentCycle={convertSubscriptionInfo.currentCycle}
				/>
			),
		},
		{
			key: '2.1',
			title: 'Tiến trình',
			requireOrderService: true,
			component: comboPlanId ? (
				<ComboOrderServiceProcess
					subId={id}
					refetch={refetchOrderService}
					orderServiceProcess={orderServiceProcess || {}}
				/>
			) : (
				<OrderServiceProcess
					subId={id}
					refetch={refetchOrderService}
					orderServiceProcess={orderServiceProcess || {}}
				/>
			),
		},
		// {
		// 	key: '3',
		// 	title: 'Thanh toán kỳ tới',
		// 	component: (
		// 		<NextPaymentTime
		// 			planId={convertSubscriptionInfo.pricingId || comboPlanId}
		// 			status={status}
		// 			typeSubscription={typeSubscription}
		// 		/>
		// 	),
		// 	hide: status === STATUS_SERVICE.NON_RENEWING || status === STATUS_SERVICE.CANCELLED,
		// },
		{
			key: '4',
			title: tMenu('memo'),
			component: (
				<DebitBalance statusService={status} typeSubscription={typeSubscription} className="box-detail" />
			),
		},
		{
			key: '5',
			title: tMenu('paymentMethod'),
			component: <PaymentMethods isOrderService={isOrderService} statusService={status} />,
		},
		{
			key: '6',
			title: tMenu('bill'),
			component: <Invoice typeSubscription={typeSubscription} />,
		},
	];

	function checkServiceOwner() {
		if (isOrderService) {
			return '2';
		}

		if (
			((serviceOwner === OWNER_TYPE.VNPT || serviceOwner === OWNER_TYPE.SAAS) && serviceSelect?.length > 0) ||
			(serviceComboSelect?.length > 0 && comboOwner !== OWNER_TYPE.OTHER)
		) {
			return '1';
		}

		if (
			regType === REG_TYPE.TRIAL &&
			(status === STATUS_SERVICE.CANCELLED || status === STATUS_SERVICE.NON_RENEWING)
		)
			return '7';

		return '2';
	}

	const checkCancelDate =
		endDateSubscription && moment().isAfter(moment(endDateSubscription, 'DD/MM/YYYY').endOf('day'));

	return (
		<div className="pt-4 mb-7">
			<TitleSubscription
				infoSaas={convertSubscriptionInfo}
				className="mb-8"
				onUnsubscribe={onUnsubscribe}
				serviceStatus={status}
				refetch={refetch}
				typeSubscription={typeSubscription}
				orderServiceProcess={orderServiceProcess}
			/>

			{/* được người dùng thao tác Hủy nhưng có thiết lập trong gói dịch vụ Thời điểm hủy sau khi thao tác hủy = Hết chu kỳ */}
			{awaitingCancel === AWAITING_CANCEL && !checkCancelDate && status === STATUS_SERVICE.ACTIVE && (
				<div className="mb-8 inline-block">
					<Alert
						message={`${tMessage('serviceIsCanceledAfter')} ${endDateSubscription}`}
						type="warning"
						showIcon
					/>
				</div>
			)}

			{/* cần check xem do hệ thống hủy hay do người dùng hủy */}
			{canceledBy === BATCH && status === STATUS_SERVICE.CANCELLED && (
				<div className="mb-5 inline-block">
					<Alert message={tMessage('serviceIsCanceledCauseOverDuePayment')} type="error" showIcon />
				</div>
			)}

			{status !== STATUS_SERVICE.IN_TRIAL &&
				regType !== REG_TYPE.TRIAL &&
				status !== STATUS_SERVICE.NON_RENEWING && (
					<div className="box-detail">
						<div className="mb-4 text-primary font-bold">{tMenu('subscriberDetail')}</div>
						<div className="flex -mx-3 justify-between flex-wrap">
							<ItemDetail
								title={tField('paymentCycle')}
								cycleType={convertSubscriptionInfo.cycleType}
								currentCycle={convertSubscriptionInfo.currentCycle}
								numberOfCycles={convertSubscriptionInfo.numberOfCycles}
								icon={<CirclePayIcon width="w-12" className="inline-block" />}
								className="px-3"
								tOthers={tOthers}
								status={status}
							/>
							{typeSubscription !== COMBO && (
								<ItemDetail
									title={tField('usageStatus')}
									usedQuantity={convertSubscriptionInfo.usedQuantity}
									quantity={convertSubscriptionInfo.quantity}
									icon={<EmployeeIcon width="w-12" className="inline-block" />}
									className="px-3"
									tOthers={tOthers}
								/>
							)}
							{!isEmpty(convertSubscriptionInfo.amountOfCycle) && status !== STATUS_SERVICE.CANCELLED ? (
								<ItemDetail
									title={tField('nextPaymentInfo')}
									amountOfCycle={convertSubscriptionInfo.amountOfCycle}
									icon={<PriceIcon width="w-12" className="inline-block" />}
									className="px-3"
									tOthers={tOthers}
									tLowerField={tLowerField}
								/>
							) : (
								<div />
							)}
						</div>
					</div>
				)}

			<Tabs
				activeKey={getTab || checkServiceOwner()}
				onChange={(activeTab) => {
					history.replace(`${pathname}?tab=${activeTab}`);
				}}
				className="custom-tab sub -mx-4 px-4 pb-1"
			>
				{checkServiceOwner() === '1' && initService && !isOrderService && (
					<TabPane
						className="text-base"
						tab={<span className="uppercase font-semibold">{tMenu('employeeList')}</span>}
						key="1"
					>
						<EmployeeList
							refresh={refetch}
							statusService={status}
							typeSubscription={typeSubscription}
							loading={isFetchingService || isFetchingCombo}
							initService={initService}
							selectOptionService={typeSubscription === COMBO ? serviceComboSelect : serviceSelect}
						/>
					</TabPane>
				)}

				{status !== STATUS_SERVICE.IN_TRIAL &&
					regType === REG_TYPE.OFFICIAL &&
					listTab.map(
						(el) =>
							!el.hide &&
							(!el.requireOrderService || (el.requireOrderService && isOrderService)) && (
								<TabPane
									className="text-base"
									tab={<span className="uppercase font-semibold">{el.title}</span>}
									key={el.key}
								>
									{el.component}
								</TabPane>
							),
					)}

				{status !== STATUS_SERVICE.IN_TRIAL && (
					<TabPane
						className="text-base"
						key="7"
						tab={<span className="uppercase font-semibold">{tMenu('history')}</span>}
					>
						<History typeSubscription={typeSubscription} />
					</TabPane>
				)}
			</Tabs>

			<ModalConfirm
				mutation={mutationUnsubscribe.mutateAsync}
				showModal={showModal}
				setShowModal={setShowModal}
				mainTitle={tMessage('opt_cancel', { field: 'register' })}
				subTitle={tMessage('opt_wantToCancel', { field: 'register' })}
				isLoading={mutationUnsubscribe.isLoading}
			/>
		</div>
	);
}

export default CommonSubscription;
