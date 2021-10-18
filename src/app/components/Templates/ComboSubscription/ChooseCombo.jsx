import { Button, Modal, Table } from 'antd';
import { SelectDebounce, TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity, useQueryUrl } from 'app/hooks';
import { CircleChangeIcon } from 'app/icons';
import { DX } from 'app/models';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import moment from 'moment';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';

const TYPE = {
	DAILY: ' ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
const ModalChooseCombo = ({
	value,
	onChange,
	handleCloseModal,
	indexRecord,
	typePortal,
	type,
	comboPlanId,
	isTrial,
	setOpenForm,
}) => {
	const query = useQueryUrl();
	const modRegister = query.get('isTrial');
	const reqParams = {
		portalType: typePortal,
		comboPlanId: type === 'CHANGE_SUB' ? comboPlanId : undefined,
		osService: modRegister !== null ? 'NO' : 'YES',
	};
	const { tButton, tFilterField, tField } = useLng();

	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await ComboSubscriptionDev.getListComboPopup({
				...params,
				...reqParams,
				comboType: isTrial ? 'SAAS' : 'ALL',
			});

			return res;
		},
		indexRecord,
		extra: ['name', 'comboPlan', 'cycleType', 'paymentCycle', 'developer', 'type'],

		initItemsPick: [...value],
		ignorekey: 'id',
	});
	const disabled = itemsPick?.length === 1;
	const [disBtnConfirm, setDisBtnConfirm] = useState();

	const { name, comboPlan, type: typeSearch, paymentCycle, developer } = filterLocal;
	useEffect(() => {
		if (itemsPick.length > 0) {
			setDisBtnConfirm(false);
		} else setDisBtnConfirm(true);
	}, [itemsPick]);

	const optionCombo = async (searchValue) => {
		const res = await ComboSubscriptionDev.getComboName({
			comboName: searchValue || null,
		});
		const temp = res.content?.map((item) => ({
			value: item.comboName,
			label: item.comboName,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPricing = async (searchValue) => {
		const res = await ComboSubscriptionDev.getComboPricingName({
			comboPlanName: searchValue || null,
		});

		const temp = res.content?.map((item) => ({
			value: item.comboPlanName,
			label: item.comboPlanName,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionDevelopName = async (searchValue) => {
		const res = await ComboSubscriptionDev.getDevelopName({
			developerName: searchValue || null,
		});

		const temp = res.content?.map((item) => ({
			value: item.developerName,
			label: item.developerName,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPeriod = async (searchValue) => {
		const types = searchValue?.split('-');
		console.log('-----------------', types, searchValue);
		const res = await ComboSubscriptionDev.getComboPeriod({
			cycleType: (types?.length > 2 && types[1]) || undefined,
			paymentCycle: (types?.length > 1 && types[0]) || undefined,
		});
		const temp = res.content?.map((item) => ({
			value: `${item.paymentCycle}-${item.cycleType}`,
			label: `${item.paymentCycle} ${TYPE[item.cycleType]}`,
		}));
		return _uniqBy(temp, 'value');
	};
	const COLUMN_LEFT = [
		{
			title: 'Tên Combo dịch vụ',
			dataIndex: 'comboName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: 'Tên gói Combo dịch vụ',
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			dataIndex: 'paymentCycle',
			title: 'Chu kỳ thanh toán',
			//	dataIndex: 'tin',
			render: (text, record) => {
				if (record.paymentCycle > 0) return record && `${record?.paymentCycle}  ${TYPE[record?.cycleType]}`;
				return 'Không giới hạn';
			},
			sorter: true,
		},

		{
			title: <TextInColumn title="Giá (VND)" />,
			dataIndex: 'price',
			render: (valueColumn) => DX.formatNumberCurrency(valueColumn),
			sorter: true,
			//	hide: typePortal === 'DEV',
		},

		{
			title: 'Nhà phát triển',
			dataIndex: 'developerName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
			hide: typePortal === 'DEV',
		},
	];

	const COLUMN_RIGHT = [
		{
			title: 'Tên Combo dv đã chọn',
			dataIndex: 'comboName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
		{
			title: 'Tên gói Combo dv đã chọn',
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
		{
			dataIndex: 'paymentCycle',
			title: 'Chu kỳ thanh toán',
			//	dataIndex: 'tin',
			render: (text, record) => {
				if (record.paymentCycle > 0) return record && `${record?.paymentCycle}  ${TYPE[record?.cycleType]}`;
				return 'Không giới hạn';
			},
		},

		{
			title: 'Giá (VND)',
			dataIndex: 'price',
			render: (valueColumn) => DX.formatNumberCurrency(valueColumn),
			sorter: true,
			//	hide: typePortal === 'DEV',
		},
		{
			title: 'Nhà phát triển',
			dataIndex: 'developerName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			hide: typePortal === 'DEV',
		},
	];

	return (
		<Modal
			title="Chọn gói Combo dịch vụ"
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
					placeholder="Tên combo dịch vụ: Tất cả"
					fetchOptions={optionCombo}
					// onSelect={(valuePri) => {
					// 	onChangeOneParam('serviceId')(valuePri);
					// 	type === 'CHANGE_SUB' && optionPricing({ serviceIdChange: valuePri });
					// 	type === 'CHANGE_SUB' && optionPeriod({ serviceIdChange: valuePri });
					// }}
					onSelect={(valuePri) => {
						onChangeOneParam('name')(valuePri);
					}}
					onClear={() => onChangeOneParam('name')('')}
					defaultValue={name}
					maxLength={500}
				/>

				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Tên gói combo dịch vụ: Tất cả"
					fetchOptions={optionPricing}
					// onSelect={(valuePri) => {
					// 	onChangeOneParam('pricingId')(valuePri);
					// 	type === 'CHANGE_SUB' &&
					// 		optionPeriod({ pricingIdChange: valuePri, serviceIdChange: serviceId });
					// }}
					onSelect={(valuePri) => {
						onChangeOneParam('comboPlan')(valuePri);
					}}
					onClear={() => onChangeOneParam('comboPlan')('')}
					defaultValue={comboPlan}
					maxLength={500}
				/>
				{typePortal === 'ADMIN' && (
					<SelectDebounce
						className="mr-6"
						showSearch
						allowClear
						placeholder="Nhà phát triên: Tất cả"
						fetchOptions={optionDevelopName}
						// onSelect={(valuePri) => {
						// 	onChangeOneParam('pricingId')(valuePri);
						// 	type === 'CHANGE_SUB' &&
						// 		optionPeriod({ pricingIdChange: valuePri, serviceIdChange: serviceId });
						// }}
						onSelect={(valuePri) => {
							onChangeOneParam('developer')(valuePri);
						}}
						onClear={() => onChangeOneParam('developer')('')}
						defaultValue={developer}
						maxLength={500}
					/>
				)}
				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Chu kỳ: Tất cả"
					fetchOptions={optionPeriod}
					onSelect={(valuePeriod) => {
						const types = valuePeriod?.split('-');
						onChangeOneParam('paymentCycle')(types[0]);
						onChangeOneParam('type')(types[1]);
					}}
					onClear={() => {
						onChangeOneParam('paymentCycle')('');
						onChangeOneParam('type')('');
					}}
					defaultValue={
						paymentCycle && typeSearch ? `${paymentCycle || ''} ${TYPE[typeSearch] || ''}` : undefined
					}
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
												chooseItem(record[indexRecord]);
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

function ChooseCombo({
	isHaveService,
	formValue,
	typePortal = 'DEV',
	dataDetail = {},
	type = '',
	comboPlanId = '',
	typeChange,
	serviceIdChange,
	CAN_UPDATE,
	setOpenForm,
	openModal = false,
	checkChangeSub,
	checkAdmin,
	isOrderService,
	className,
	...argss
}) {
	const query = useQueryUrl();
	const isTrial = query.get('isTrial');
	const isDisplayTime = moment(dataDetail.startDate || dataDetail.startAt, 'DD/MM/YYYY').isAfter(moment());
	const [isModalVisible, setIsModalVisible] = useState(openModal);
	const { value = [], onChange } = argss;

	return (
		<>
			<div className={className}>
				{(((!dataDetail.id || isDisplayTime) &&
					dataDetail?.status !== 'ACTIVE' &&
					dataDetail?.status !== 'CANCELED') ||
					typeChange === 'changeSubscription' ||
					(isDisplayTime && dataDetail.status === 'IN_TRIAL')) &&
					CAN_UPDATE &&
					!checkChangeSub &&
					checkAdmin &&
					!isOrderService &&
					dataDetail.status !== 'NON_RENEWING' && (
						<Button
							icon={!isHaveService ? '' : <CircleChangeIcon />}
							type="default"
							className="block"
							onClick={() => setIsModalVisible(true)}
							disabled={formValue === undefined || (serviceIdChange && !serviceIdChange)}
						>
							{!isHaveService ? 'Chọn gói combo dịch vụ' : 'Đổi gói combo dịch vụ'}
						</Button>
					)}
				{isModalVisible && (
					<Button
						icon={!isHaveService ? '' : <CircleChangeIcon />}
						type="default"
						className="block"
						onClick={() => setIsModalVisible(true)}
						disabled={formValue === undefined || (serviceIdChange && !serviceIdChange)}
					>
						{!isHaveService ? 'Chọn gói combo dịch vụ' : 'Đổi gói combo dịch vụ'}
					</Button>
				)}

				{isModalVisible && (
					<ModalChooseCombo
						value={value}
						onChange={onChange}
						indexRecord="id"
						handleCloseModal={() => setIsModalVisible(false)}
						typePortal={typePortal}
						type={type}
						comboPlanId={comboPlanId}
						isTrial={isTrial}
						setOpenForm={setOpenForm}
					/>
				)}
			</div>
		</>
	);
}

export default ChooseCombo;
