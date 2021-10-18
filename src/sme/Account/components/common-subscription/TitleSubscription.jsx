import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Dropdown, Menu, message, Modal, Tooltip } from 'antd';
import { appSelects } from 'app/appReducer';
import ServicePack from 'app/components/Templates/PreviewService/ServicePack';
import { useLng, useUser } from 'app/hooks';
import { TransferIcon, UserGroupIcon } from 'app/icons';
import { DX, SMESubscription } from 'app/models';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { ModalConfirm } from 'sme/components';
// import moment from 'moment';

const { Item } = Menu;

const RENEWAL = 'RENEWAL';
const REACTIVE = 'REACTIVE';
const COMBO = 'COMBO';
const PRICING = 'PRICING';
const YES = 'YES';
const OFFICIAL = 'OFFICIAL';

const modal = {
	RENEWAL: {
		mainTitle: 'serviceExtension',
		subTitle: 'opt_wantToExtension',
	},
	REACTIVE: {
		mainTitle: 'serviceReactivation',
		subTitle: 'opt_wantToReactivation',
	},
};

const STATUS = {
	IN_TRIAL: 'IN_TRIAL',
	ACTIVE: 'ACTIVE',
	FUTURE: 'FUTURE',
	CANCELLED: 'CANCELLED',
	NON_RENEWING: 'NON_RENEWING',
};

const QUEUE = {
	WAITING: 'AWAITING_CANCEL',
	CANCELLED: 'CANCELED',
};

const ERROR = {
	BILL: 'error.subscription.billings.outOfDate',
	OVER_DATE: 'error.subscription.can.not.activate.again',
	IN_USE: 'error.subscription.in.use',
	EXTENSION: 'error.can.not.renew.subscription',
};

export default function TitleSubscription({
	infoSaas,
	className,
	onUnsubscribe,
	serviceStatus,
	refetch,
	typeSubscription,
	orderServiceProcess,
}) {
	const {
		serviceId,
		serviceName,
		pricingId,
		pricingName,
		serviceIcon,
		iconExternalLink,
		comboId,
		comboName,
		comboPlanId,
		comboPlanName,
		icon,
		shortDescription,
		developerName,
		createdAt,
		status,
		regType,
		isFinalCycle,
		numberOfCycles,
		startDateSubscription,
		endDateSubscription,
		// numberOfDayRemind,
		isEvaluation,
		awaitingCancel,
		canceledBy,
		countPricing,
		countComboPlan,
		isContract,
		serviceOwner,
		dhsxkdSubCode,
		comboOwner,
	} = {
		...infoSaas,
	};
	const { id } = useParams();
	const { tButton, tMessage, tOthers } = useLng();
	const { user } = useUser();
	const { isMobile } = useSelector(appSelects.selectSetting);

	const isOrderService =
		serviceOwner === 'OTHER' || comboOwner === 'OTHER' || serviceOwner === 'NONE' || comboOwner === 'NONE';
	const isComboOrderService = comboOwner === 'OTHER' || comboOwner === 'NONE';
	const statusOrderId = orderServiceProcess?.statusOrderId;
	const transactionCode = orderServiceProcess?.transactionCode;

	const CAN_CANCEL = DX.canAccessFuture2('sme/cancel-subscription', user.permissions);
	const CAN_CHANGE_PACKAGE = DX.canAccessFuture2('sme/change-combo-pack', user.permissions) && !isOrderService;
	const CAN_CREATE_ECONTRACT = DX.canAccessFuture2('sme/request-econtract', user.permissions) && !isOrderService;
	const CAN_EXTENSION = DX.canAccessFuture2('sme/extension-subscription', user.permissions) && !isOrderService;
	const CAN_ACTIVE = DX.canAccessFuture2('sme/active-subscription', user.permissions) && !isOrderService;
	const CAN_EVALUATE =
		DX.canAccessFuture2('sme/evaluate-service', user.permissions) &&
		(!isOrderService ||
			isComboOrderService ||
			(isOrderService && !isComboOrderService && [3, 4, 2].includes(statusOrderId))) &&
		serviceStatus !== STATUS.IN_TRIAL &&
		isEvaluation !== YES &&
		typeSubscription !== COMBO;
	const CAN_REGISTER = DX.canAccessFuture2('sme/register-subscription-combo', user.permissions);

	const [showModal, setShowModal] = useState(false);
	const [showPopup, setShowPopup] = useState(false);
	const [typeModal, setTypeModal] = useState(RENEWAL);

	// const extendDate =
	// 	numberOfDayRemind &&
	// 	endDateSubscription &&
	// 	moment(moment(endDateSubscription, 'DD/MM/YYYY').subtract(numberOfDayRemind, 'days')).format('DD/MM/YYYY');

	// const checkExtendDate = extendDate && moment().isAfter(moment(extendDate, 'DD/MM/YYYY').endOf('day'));

	const history = useHistory();

	const { data: eContractInfo } = useQuery(
		['getEContractInfo', id],
		async () => {
			if (serviceStatus === STATUS.ACTIVE) {
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

	const mutationRenewal = useMutation(
		() =>
			SMESubscription.putRenewal(
				typeSubscription === COMBO ? { id, renewType: COMBO } : { id, renewType: PRICING },
			),
		{
			onSuccess: () => {
				message.success(tMessage('opt_successfullyExtended', { field: 'service' }));
				setShowModal(false);
				if (typeSubscription === COMBO) history.push(DX.sme.createPath(`/account/combo/${id}/detail?tab=2`));
				else history.push(DX.sme.createPath(`/account/subscription/${id}/detail?tab=2`));
				refetch();
			},
			onError: (e) => {
				if (e.errorCode === ERROR.EXTENSION) message.error('Không thể gia hạn gói không giới hạn');
				else message.error('Gia hạn không thành công');
			},
		},
	);

	const mutationReactive = useMutation(
		() => (typeSubscription === COMBO ? SMESubscription.putReactiveCombo(id) : SMESubscription.putReactive(id)),
		{
			onSuccess: () => {
				message.success(tMessage('opt_successfullyActived', { field: 'service' }));
				setShowModal(false);
				refetch();
			},
			onError: (e) => {
				setShowModal(false);
				if (e.errorCode === ERROR.BILL) message.error(tMessage('err_can_not_active_bill'));
				else if (e.errorCode === ERROR.OVER_DATE) message.error(tMessage('err_can_not_active_date'));
				else if (e.errorCode === ERROR.IN_USE) message.error(tMessage('err_can_not_active_inUse'));
				else message.error(tMessage('opt_badlyActived', { field: 'service' }));
			},
		},
	);

	const mutationCreateEContract = useMutation(() => SMESubscription.postCreateEContract(id), {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreateEcontract', { field: 'service' }));
			refetch();
		},
		onError: (e) => {
			message.error(tMessage('opt_badlyCreateEcontract', { field: 'service' }));
		},
	});

	const onRating = () =>
		typeSubscription === COMBO
			? history.push(`${DX.sme.createPath(`/combo/${comboId}?tab=2`)}`)
			: history.push(`${DX.sme.createPath(`/service/${serviceId}?tab=2`)}`);

	const onRenewal = (type) => {
		setShowModal(true);
		if (type === STATUS.CANCELLED) setTypeModal(REACTIVE);
		else setTypeModal(RENEWAL);
	};

	const onRegister = () => {
		setShowPopup(true);
	};

	const onChangeServicePack = () => {
		if (isFinalCycle === YES)
			Modal.confirm({
				title: 'Không thể đổi gói vào chu kỳ cuối cùng của thuê bao',
				icon: <ExclamationCircleOutlined />,
				okText: tButton('opt_confirm'),
				onOk: () => {},
				cancelButtonProps: { style: { display: 'none' } },
			});
		else setShowPopup(true);
	};

	const onBuyNow = (packId, idPricingPeriod) => {
		if (serviceStatus === STATUS.IN_TRIAL) {
			if (typeSubscription === COMBO) return history.push(DX.sme.createPath(`/combo/pay/${comboId}/${packId}`));
			return history.push(
				DX.sme.createPath(`/service/pay/${serviceId}/${packId}?pricingMultiPlanId=${idPricingPeriod}`),
			);
		}

		if (serviceStatus !== STATUS.IN_TRIAL) {
			if (typeSubscription === COMBO)
				return history.push(DX.sme.createPath(`/combo/change-pack/${comboId}/${packId}?subscriptionId=${id}`));
			return history.push(
				DX.sme.createPath(
					`/service/change-pack/${serviceId}/${packId}?subscriptionId=${id}&pricingMultiPlanId=${idPricingPeriod}`,
				),
			);
		}
		return null;
	};

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

	const btnChangePack = CAN_CHANGE_PACKAGE && (countPricing > 1 || countComboPlan > 1);
	const btnContract = CAN_CREATE_ECONTRACT && isContract === YES;
	const btnCancel =
		CAN_CANCEL &&
		serviceStatus === STATUS.ACTIVE &&
		awaitingCancel !== QUEUE.WAITING &&
		(numberOfCycles === -1 || numberOfCycles === null) &&
		!isOrderService;

	const btnExtension = CAN_EXTENSION && numberOfCycles !== null && numberOfCycles !== -1;
	// && awaitingCancel !== QUEUE.WAITING && checkExtendDate;

	const menuOptionPack = (
		<Menu className="uppercase">
			{btnChangePack && (
				<Item key="1" className="py-2 px-4 font-semibold" onClick={onChangeServicePack}>
					{tButton('opt_change', { field: 'servicePackage' })}
				</Item>
			)}

			{/* // Co the xuat econtract */}
			{btnContract && (
				<Item key="2" className="py-2 px-4 font-semibold" onClick={() => onCreateEContract()}>
					{tButton('opt_create', { field: 'econtract' })}
				</Item>
			)}

			{btnCancel && (
				<Item key="3" className="py-2 px-4 text-gray-400 font-semibold" onClick={onUnsubscribe}>
					{tButton('opt_cancel')}
				</Item>
			)}
		</Menu>
	);

	const btnSubscription = serviceStatus !== STATUS.FUTURE && (
		<>
			{/* trial */}
			{serviceStatus === STATUS.IN_TRIAL && (
				<>
					{CAN_REGISTER && (
						<Button type="primary" className="uppercase font-semibold" onClick={() => onRegister()}>
							{tButton('register')}
						</Button>
					)}
					{CAN_CANCEL && awaitingCancel !== QUEUE.WAITING && (
						<Button className="uppercase font-semibold ml-2.5" onClick={onUnsubscribe}>
							{tButton('opt_cancel')}
						</Button>
					)}
				</>
			)}

			{CAN_EVALUATE && (
				<Button type="primary" className="uppercase font-semibold ml-2.5" onClick={onRating}>
					{tButton('rating')}
				</Button>
			)}

			{serviceStatus === STATUS.ACTIVE && (
				<>
					{/* config hệ thống là numberOfDayRemind ngày trước khi hết hạn, button gia hạn được hiển thị
					 */}
					{btnExtension && (
						<Button type="primary" className="uppercase font-semibold ml-2.5" onClick={onRenewal}>
							{tButton('extension')}
						</Button>
					)}

					{(btnChangePack || btnContract || btnCancel) && (
						<Dropdown
							overlay={menuOptionPack}
							trigger={['hover']}
							className="cursor-pointer ml-2.5"
							placement="bottomRight"
						>
							<Button type="default">. . .</Button>
						</Dropdown>
					)}
				</>
			)}

			{CAN_ACTIVE && serviceStatus === STATUS.CANCELLED && canceledBy !== 'batch' && regType === OFFICIAL && (
				<Button
					type="primary"
					className="uppercase font-semibold ml-2.5"
					onClick={() => onRenewal(STATUS.CANCELLED)}
				>
					{tButton('activation')}
				</Button>
			)}
		</>
	);

	return (
		<div className={className}>
			<div className="flex -mx-4 mobile:flex-wrap mobile:justify-center mb-8">
				<div
					className="rounded-3xl overflow-hidden mx-4 mobile:mb-6"
					style={{ width: '16.875rem', height: '16.875rem' }}
				>
					<img
						src={icon || serviceIcon || iconExternalLink || '/images/NoImageNew.svg'}
						alt={serviceName || comboName}
						title={serviceName || comboName}
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="px-4" style={{ width: isMobile ? '100%' : 'calc(100% - 18.875rem)' }}>
					<div className="flex justify-between gap-8">
						<div className="font-bold mb-4 tablet:mr-0 line-clamp-2 text-2xl">
							{serviceName || comboName}
						</div>
						<div className="flex justify-end tablet:hidden">{btnSubscription}</div>
					</div>
					<Tooltip placement="bottomLeft" title={developerName}>
						<div className="mb-5 tablet:mr-0 font-semibold line-clamp-1" style={{ color: '#37474F' }}>
							<UserGroupIcon width="w-4" className="inline-block mr-2.5" />
							{developerName}
						</div>
					</Tooltip>
					<div className="mb-6 line-clamp-5 mobile:line-clamp-none font-medium whitespace-pre-wrap break-words mr-32 tablet:mr-0">
						{shortDescription}
					</div>
					<div
						className="inline-block rounded-lg text-primary text-sm font-medium py-1 px-3"
						style={{ backgroundColor: '#eaecf4' }}
					>
						{pricingName || comboPlanName}
					</div>
				</div>
			</div>
			<div className="hidden tablet:block text-center mb-7">{btnSubscription}</div>
			<div className="flex justify-between flex-wrap mb-4">
				<div className="font-medium tablet:mb-2">
					{tOthers('registrationDate')}: {createdAt}
				</div>
				<div className="font-medium tablet:mb-2">
					{tOthers('status')}:{' '}
					{serviceStatus === STATUS.CANCELLED && isOrderService ? (
						<span className="text-red-500">{status}</span>
					) : (
						<span className="text-green-400">{status}</span>
					)}
				</div>
				<div className="font-medium tablet:mb-2">
					{tOthers('startDate')}: {startDateSubscription}
				</div>
				{endDateSubscription !== null && (
					<div className="font-medium tablet:mb-2">
						{tOthers('endDate')}: {endDateSubscription}
					</div>
				)}
			</div>

			<div className="font-medium mb-7">
				{tOthers('transactionCode')}: {isOrderService ? transactionCode : dhsxkdSubCode}
			</div>

			{serviceStatus === STATUS.ACTIVE && isContract !== YES && !eContractInfo?.data?.contractExist && (
				<>
					<div className="inline-block">
						<Alert message={tOthers('econtractWaittingNotification')} type="warning" showIcon />
					</div>
					<br />
				</>
			)}
			<ModalConfirm
				mutation={typeModal === RENEWAL ? mutationRenewal.mutateAsync : mutationReactive.mutateAsync}
				showModal={showModal}
				setShowModal={setShowModal}
				mainTitle={tMessage(modal[typeModal].mainTitle, { field: 'service' })}
				subTitle={tMessage(modal[typeModal].subTitle, { field: 'service' })}
				isLoading={typeModal === RENEWAL ? mutationRenewal.isLoading : mutationReactive.isLoading}
			/>
			<Modal
				centered
				visible={showPopup}
				onCancel={() => setShowPopup(false)}
				footer={null}
				closable={false}
				maskClosable
				width="85rem"
				bodyStyle={{ padding: '1rem 1rem 0.5rem', maxHeight: 'calc(100vh - 3rem)', overflow: 'auto' }}
			>
				<div className="justify-center flex mb-4">
					<TransferIcon width="w-12" className="inline-block text-primary" />
				</div>
				<h4 className="text-center font-semibold">{tOthers('changeServicePackage')}</h4>
				<ServicePack
					idURL={serviceId || comboId}
					onBuyNow={onBuyNow}
					idBought={serviceStatus !== STATUS.IN_TRIAL ? pricingId || comboPlanId : 'null'}
					// stopBuying={user.id && !DX.canAccessFuture2('sme/payment', user.permissions)}
					typeScreen={typeSubscription}
				/>
			</Modal>
		</div>
	);
}
