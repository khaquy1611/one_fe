import { Button, Modal, Select, Table } from 'antd';
import { renderOptions, SearchCommon, SelectDebounce, TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity, useQueryUrl } from 'app/hooks';
import { AdminCombo, CategoryPortal, SubscriptionDev } from 'app/models';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

const TYPE = {
	DAILY: ' ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
const ModalChooseAddon = ({
	value,
	onChange,
	handleCloseModal,
	indexRecord,
	typePortal,
	pricingInfo,
	typeSupscrip,
	dataDetail,
	addonsList,
	periodIdPricing,
}) => {
	const reqParams = {
		portalType: typePortal,
		typeId: dataDetail.id || pricingInfo.pricingId,
		popUpType: 'PRICING',
		typePortal,
		paymentCyclePricing: pricingInfo.paymentCycle,
		circleTypePricing: pricingInfo.cycleType,
		periodPlanId: periodIdPricing || pricingInfo.pricingMultiPlanId || null,
	};
	const { tButton, tFilterField, tField } = useLng();
	const [disBtnConfirm, setDisBtnConfirm] = useState(true);

	const query = useQueryUrl();
	const modRegister = query.get('isTrial');
	const defaultParanm = {
		portalType: typePortal,
		osService: modRegister !== null ? 'NO' : 'YES',
		typeId: pricingInfo.pricingId,
		popUpType: 'PRICING',
	};
	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await SubscriptionDev.getAddonpopup({
				//	periodId: periodIdPricing,
				addonIdsNot: addonsList.filter((el) => el.canNotDelete)?.map((el) => el.id) || [],
				...params,
				...reqParams,
			});

			return res;
		},
		indexRecord,
		extra: ['addonId', 'serviceId', 'periodId', 'developerId'],
		initItemsPick: [...value],
		ignorekey: 'addonIdsNot',
	});
	useEffect(() => {
		if (itemsPick.length > 0) {
			setDisBtnConfirm(false);
		} else setDisBtnConfirm(true);
	}, [itemsPick]);
	const { serviceId, addonId, periodId, developerId } = filterLocal;
	const COLUMN_LEFT = [
		{
			title: <TextInColumn title="Tên dịch vụ" />,
			dataIndex: 'objectName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Tên gói dịch vụ" />,
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			dataIndex: 'bonusType',
			title: 'Chu kỳ thanh toán',
			//	dataIndex: 'tin',
			render: (text, record) =>
				`${
					record.bonusType !== 'ONCE'
						? `${record.bonusValue || record.paymentCycle}  ${TYPE[record?.type]} `
						: `Một lần`
				}`,
			sorter: true,
		},
		{
			title: 'Nhà phát triển',
			dataIndex: 'companyName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
			hide: typePortal === 'DEV',
		},
	];

	const COLUMN_RIGHT = [
		{
			title: 'Tên dịch vụ đã chọn',
			dataIndex: 'objectName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: 'Tên gói dịch vụ đã chọn',
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			dataIndex: 'bonusType',
			title: 'Chu kỳ thanh toán',
			//	dataIndex: 'tin',
			render: (text, record) =>
				`${
					record.bonusType !== 'ONCE'
						? `${record.bonusValue || record.paymentCycle}  ${TYPE[record?.type]} `
						: `Một lần`
				}`,
			sorter: true,
		},
		{
			title: 'Nhà phát triển',
			dataIndex: 'companyName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
			hide: typePortal === 'DEV',
		},
	];
	const optionService = async (searchValue) => {
		const res = await SubscriptionDev.getServiceAddonDrop({
			...defaultParanm,
			name: searchValue || null,
		});
		const temp = res?.map((item) => ({
			value: item.serviceId,
			label: item.serviceName,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionAddon = async (searchValue) => {
		const res = await SubscriptionDev.getAddonNameDrop({
			...defaultParanm,
			name: searchValue || null,
		});

		const temp = res?.map((item) => ({
			value: item.pricingId,
			label: item.pricingName,
		}));

		return _uniqBy(temp, 'value');
	};
	const optionPeriod = async (searchValue) => {
		try {
			const res = await SubscriptionDev.getPeriodAddonDrop({
				...defaultParanm,
				pricingMultiPlanId: periodIdPricing || pricingInfo.pricingMultiPlanId,
				period: searchValue || null,
				paymentCycle: pricingInfo.paymentCycle,
				circleType: pricingInfo.cycleType,
			});
			const temp = res.map((item) => ({
				value: item.type !== 'TIMES' ? periodIdPricing || pricingInfo.pricingMultiPlanId : -2,
				label: item.type !== 'TIMES' ? `${item.numberOfCycle} ${TYPE[item.type]}` : 'Một lần',
			}));
			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};
	const optionDeveloperName = async (searchValue) => {
		try {
			const res = await SubscriptionDev.getDevelopAddonDrop({
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
			title="Chọn dịch vụ bổ sung"
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
					fetchOptions={optionService}
					onSelect={(valuePri) => {
						onChangeOneParam('serviceId')(valuePri);
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
					fetchOptions={optionAddon}
					onSelect={(valuePri) => {
						onChangeOneParam('addonId')(valuePri);
					}}
					onClear={() => onChangeOneParam('addonId')(undefined)}
					value={addonId}
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
							onChangeOneParam('developerId')(valuePri);
						}}
						onClear={() => onChangeOneParam('developerId')(undefined)}
						value={developerId}
						maxLength={500}
					/>
				)}
				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Chu kỳ: Tất cả"
					fetchOptions={optionPeriod}
					onSelect={onChangeOneParam('periodId')}
					onClear={() => {
						onChangeOneParam('periodId')(undefined);
					}}
					value={periodId}
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

function ChooseAddon({
	dataDetail,
	pricingInfo = {},
	typePortal = 'DEV',
	CAN_UPDATE,
	checkAdmin,
	typeSupscrip,
	isOrderService,
	addonsList,
	periodIdPricing,
	...argss
}) {
	const [isModalVisible, setIsModalVisible] = useState(false);

	const { value = [], onChange } = argss;

	return (
		<>
			<div className="flex">
				{dataDetail?.subscriptionStatus !== 'CANCELLED' &&
					CAN_UPDATE &&
					dataDetail?.subscriptionStatus !== 'NON_RENEWING' &&
					checkAdmin &&
					!isOrderService && (
						<Button className="mr-3 ml-3 " type="default" onClick={() => setIsModalVisible(true)}>
							Chọn gói dịch vụ bổ sung
						</Button>
					)}

				{isModalVisible && (
					<ModalChooseAddon
						value={value}
						onChange={onChange}
						indexRecord="id"
						handleCloseModal={() => setIsModalVisible(false)}
						typePortal={typePortal}
						pricingInfo={pricingInfo}
						typeSupscrip={typeSupscrip}
						dataDetail={dataDetail}
						addonsList={addonsList}
						periodIdPricing={periodIdPricing}
					/>
				)}
			</div>
		</>
	);
}

export default ChooseAddon;
