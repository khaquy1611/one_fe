import { Button, Modal, Table } from 'antd';
import { SelectDebounce, TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity, useQueryUrl } from 'app/hooks';
import { CircleChangeIcon } from 'app/icons';
import { SubscriptionDev } from 'app/models';
import moment from 'moment';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';

const TYPE = {
	DAILY: ' ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};

const ModalChoosePricing = ({
	value,
	onChange,
	handleCloseModal,
	indexRecord,
	typePortal,
	type,
	pricingInfo,
	setOpenForm,
}) => {
	const query = useQueryUrl();
	const modRegister = query.get('isTrial');

	const reqParams = {
		portalType: typePortal,
		osService: modRegister !== null ? 'NO' : 'YES',
	};
	if (type === 'CHANGE_SUB') {
		reqParams.serviceId = pricingInfo.serviceId;
		reqParams.periodChangeId = pricingInfo.serviceId;
	}
	const { tButton, tFilterField, tField } = useLng();
	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await SubscriptionDev.getPricingpopup({
				...params,
				...reqParams,
			});

			return res;
		},
		indexRecord,
		extra: ['serviceId', 'pricingId', 'type', 'numberOfCycle', 'developId'],
		// defaultParams: {
		// 	paymentCycle: form.getFieldValue('periodValue'),
		// 	cycleType: form.getFieldValue('periodType'),
		// },
		initItemsPick: [...value],
		ignorekey: 'periodId',
	});
	const disabled = itemsPick?.length === 1;
	const [disBtnConfirm, setDisBtnConfirm] = useState();
	const { serviceId, pricingId, type: typeSearch, numberOfCycle, developId } = filterLocal;
	useEffect(() => {
		if (itemsPick.length > 0) {
			setDisBtnConfirm(false);
		} else setDisBtnConfirm(true);
	}, [itemsPick]);
	const defaultParanm = {
		portalType: typePortal,
		osService: modRegister !== null ? 'NO' : 'YES',
	};
	const COLUMN_LEFT = [
		{
			title: <TextInColumn title="Tên dịch vụ" />,
			dataIndex: 'serviceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Tên gói dịch vụ" />,
			dataIndex: 'pricingName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'type',
			render: (text, record) => {
				if (record.numberOfCycles > 0) return record && `${record?.numberOfCycles}  ${TYPE[record?.type]}`;
				return 'Không giới hạn';
			},
			sorter: true,
		},
		{
			title: <TextInColumn title="Nhà phát triển" />,
			dataIndex: 'companyName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
			hide: typePortal === 'DEV',
		},
	];

	const COLUMN_RIGHT = [
		{
			title: 'Tên dịch vụ đã chọn',
			dataIndex: 'serviceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
		{
			title: 'Tên gói dịch vụ đã chọn',
			dataIndex: 'pricingName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'type',
			render: (text, record) => {
				if (record.numberOfCycles > 0) return record && `${record?.numberOfCycles}  ${TYPE[record?.type]}`;
				return 'Không giới hạn';
			},
		},
		{
			title: 'Nhà phát triển',
			dataIndex: 'companyName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			hide: typePortal === 'DEV',
		},
	];

	const fetchDeveloper = async (searchValue) => {
		const res = await SubscriptionDev.getServiceDrop({
			...defaultParanm,
			name: searchValue || null,
		});
		const temp = res?.map((item) => ({
			value: item.serviceId,
			label: item.serviceName,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPricing = async ({ pricingIdChange, serviceIdChange }) => {
		const res = await SubscriptionDev.getPricingDrop({
			...defaultParanm,
			name: pricingIdChange || null,
			serviceId: serviceIdChange,
		});

		const temp = res?.map((item) => ({
			value: item.pricingId,
			label: item.pricingName,
		}));

		return _uniqBy(temp, 'value');
	};
	const optionPeriod = async ({ pricingIdChange, serviceIdChange, periodIdChange }) => {
		try {
			const res = await SubscriptionDev.getPeriodDrop({
				...defaultParanm,
				period: periodIdChange || null,
				pricingId: pricingIdChange,
				serviceId: serviceIdChange,
			});
			const temp = res.map((item) => ({
				value: `${item.numberOfCycle}-${item.type}`,
				label: `${item.numberOfCycle} ${TYPE[item.type]}`,
			}));
			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};
	const optionDeveloperName = async (searchValue) => {
		try {
			const res = await SubscriptionDev.getDevelopPricing({
				...defaultParanm,
				name: searchValue,
			});
			const temp = res.map((item) => ({
				value: item.userId,
				label: item.userName,
			}));
			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};
	return (
		<Modal
			title="Chọn gói dịch vụ"
			width="80vw"
			visible
			onOk={() => {
				onChange([...itemsPick]);
				handleCloseModal();
			}}
			okText="Xác nhận"
			okButtonProps={{ disabled: disBtnConfirm }}
			onCancel={() => {
				handleCloseModal();
				setOpenForm && setOpenForm(false);
			}}
			closable
			maskClosable={false}
			centered
		>
			<div className="grid grid-cols-4 gap-2 mb-5">
				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Tên dịch vụ: Tất cả"
					fetchOptions={fetchDeveloper}
					onSelect={(valuePri) => {
						onChangeOneParam('serviceId')(valuePri);
						type === 'CHANGE_SUB' && optionPricing({ serviceIdChange: valuePri });
						type === 'CHANGE_SUB' && optionPeriod({ serviceIdChange: valuePri });
					}}
					onClear={() => onChangeOneParam('serviceId')(undefined)}
					value={serviceId}
					maxLength={500}
				/>

				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Tên gói dịch vụ: Tất cả"
					fetchOptions={(valuePri) =>
						optionPricing({ pricingIdChange: valuePri, serviceIdChange: serviceId })
					}
					onSelect={(valuePri) => {
						onChangeOneParam('pricingId')(valuePri);
						type === 'CHANGE_SUB' &&
							optionPeriod({ pricingIdChange: valuePri, serviceIdChange: serviceId });
					}}
					onClear={() => onChangeOneParam('pricingId')(undefined)}
					value={pricingId}
					maxLength={500}
				/>
				{typePortal === 'ADMIN' && (
					<SelectDebounce
						className="mr-6"
						showSearch
						allowClear
						placeholder="Nhà phát triển: Tất cả"
						fetchOptions={optionDeveloperName}
						onSelect={(valuePri) => {
							onChangeOneParam('developId')(valuePri);
						}}
						onClear={() => onChangeOneParam('developId')(undefined)}
						value={developId}
						maxLength={500}
					/>
				)}
				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Chu kỳ: Tất cả"
					fetchOptions={(valuePri) =>
						optionPeriod({
							pricingIdChange: pricingId,
							serviceIdChange: serviceId,
							periodIdChange: valuePri,
						})
					}
					onSelect={(valuePeriod) => {
						const types = valuePeriod.split('-');
						onChangeOneParam('type')(types[1]);
						onChangeOneParam('numberOfCycle')(types[0]);
					}}
					onClear={() => {
						onChangeOneParam('type')(undefined);
						onChangeOneParam('numberOfCycle')(undefined);
					}}
					value={numberOfCycle && typeSearch ? `${numberOfCycle || ''} ${TYPE[typeSearch] || ''}` : undefined}
					maxLength={100}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div style={{ border: '1px solid #E5E5E5' }}>
					<VirtualTable
						columns={[
							...COLUMN_LEFT,
							{
								align: 'center',
								title: (
									<div>
										{tField('total')}: {configTable.total}
									</div>
								),
								dataIndex: { indexRecord },
								render: (_, record) => (
									<div className="flex items-center h-full text-center">
										<Button
											type="link"
											className="w-full"
											disabled={disabled}
											onClick={() => {
												chooseItem(record[indexRecord], record.periodId || -1);
											}}
										>
											{tButton('opt_select', { field: '' })}
										</Button>
									</div>
								),
								width: 100,
							},
						]?.filter((column) => !column.hide)}
						chooseItem={chooseItem}
						{...configTable}
					/>
				</div>
				<div style={{ border: '1px solid #E5E5E5' }}>
					<Table
						rowKey={indexRecord}
						columns={[
							...COLUMN_RIGHT,
							{
								align: 'center',
								title: (
									<div>
										{tField('total')}: {itemsPick.length}
									</div>
								),
								dataIndex: indexRecord,
								render: (_, record) => (
									<Button
										type="link"
										onClick={() => {
											removeChooseItem(record[indexRecord]);
										}}
									>
										{tButton('deselect')}
									</Button>
								),
								width: 120,
							},
						]?.filter((column) => !column.hide)}
						scroll={{ y: itemsPick.length >= 10 ? 540 : undefined }}
						dataSource={itemsPick}
						pagination={false}
						rowClassName="selected-tb"
					/>
				</div>
			</div>
		</Modal>
	);
};

function ChoosePricing({
	visible,
	setVisible,
	dataDetail = {},
	disableSmeAccount,
	typePortal,
	isHaveService,
	formValue,
	typeSupscription = 'SUPSCRIPTION',
	typeChange,
	serviceIdChange,
	CAN_UPDATE,
	checkChangeSub,
	setOpenForm,
	openModal = false,
	checkAdmin,
	className,
	type = '',
	isOrderService,
	pricingInfo,
	...argss
}) {
	const isDisplayTime = moment(dataDetail.startDate).isAfter(moment());
	const [isModalVisible, setIsModalVisible] = useState(openModal);
	const { value = [], onChange } = argss;

	const checkDisplayBtn =
		(!dataDetail.smdId || isDisplayTime) &&
		dataDetail?.subscriptionStatus !== 'ACTIVE' &&
		!checkChangeSub &&
		CAN_UPDATE &&
		(dataDetail.regType !== 'TRIAL' || (dataDetail.subscriptionStatus === 'IN_TRIAL' && !isDisplayTime)) &&
		dataDetail?.subscriptionStatus !== 'CANCELLED' &&
		dataDetail?.subscriptionStatus !== 'NON_RENEWING' &&
		checkAdmin &&
		!isOrderService;

	return (
		<>
			<div className={className}>
				{checkDisplayBtn && (
					<Button
						icon={!isHaveService ? '' : <CircleChangeIcon />}
						className="block"
						type="default"
						onClick={() => setIsModalVisible(true)}
						disabled={formValue === undefined || (serviceIdChange && !serviceIdChange)}
					>
						{(typeSupscription === 'SUPSCRIPTION' ||
							!!serviceIdChange ||
							typeChange === 'changeSubscription') &&
							`${!isHaveService ? 'Chọn gói dịch vụ' : 'Đổi gói dịch vụ'}`}
					</Button>
				)}

				{isModalVisible && (
					<ModalChoosePricing
						value={value}
						onChange={onChange}
						indexRecord="id"
						handleCloseModal={() => setIsModalVisible(false)}
						typePortal={typePortal}
						type={type}
						pricingInfo={pricingInfo}
						setOpenForm={setOpenForm}
					/>
				)}
			</div>
		</>
	);
}

export default ChoosePricing;
