import { Button, Modal, Table, Tag } from 'antd';
import { SelectDebounce, TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity, useQueryUrl } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { AddonAdmin } from 'app/models';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';

const cycleTypeDisplay = {
	DAILY: {
		text: 'Ngày',
		value: 'DAILY',
	},
	WEEKLY: {
		text: 'Tuần',
		value: 'WEEKLY',
	},
	MONTHLY: {
		text: 'Tháng',
		value: 'MONTHLY',
	},
	YEARLY: {
		text: 'Năm',
		value: 'YEARLY',
	},
};

const tagDisplay = {
	VISIBLE: {
		color: 'success',
		text: 'Hiện',
		value: 'VISIBLE',
	},
	INVISIBLE: {
		color: 'default',
		text: 'Ẩn',
		value: 'INVISIBLE',
	},
};

const ModalChoosePricing = ({ value, form, onChange, paramPopup, handleCloseModal, indexRecord }) => {
	const { tButton, tField } = useLng();
	const getParamPopup = form.getFieldValue('pricingStrategies');
	const getCycleType = getParamPopup[paramPopup].cycleType;
	const getPaymentCycle = getParamPopup[paramPopup].paymentCycle;
	const dataPopup = { paymentCycle: getPaymentCycle, cycleType: getCycleType };
	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await AddonAdmin.getListPricingAddonPeriodic({
				...params,
				...dataPopup,
			});
			return res;
		},
		indexRecord,
		extra: ['serviceName', 'pricingName', 'categoryName', 'cycleType', 'paymentCycle'],
		initItemsPick: value,
		ignorekey: 'multiPlanId',
	});
	const { serviceId, pricingId } = filterLocal;
	const { serviceName, pricingName, categoryName, cycleType, paymentCycle } = filterLocal;
	const COLUMN_LEFT = [
		{
			title: <TextInColumn title="Tên dịch vụ" />,
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Tên gói dịch vụ" />,
			dataIndex: 'planName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'cycleType',
			render: (valueColumn, record) => {
				const cycleInfo = cycleTypeDisplay[valueColumn] || {};
				return (
					<span>
						{record.paymentCycle} {cycleInfo.text}
					</span>
				);
			},
			sorter: true,
		},
		{
			title: <TextInColumn title="Trạng thái hiển thị" />,
			dataIndex: 'displayStatus',
			render: (valueColumn) => {
				const useInfo = tagDisplay[valueColumn] || {};
				return <Tag color={useInfo?.color}>{useInfo.text}</Tag>;
			},
			sorter: true,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: <TextInColumn title="Tên dịch vụ đã chọn" />,
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Tên gói dịch vụ đã chọn" />,
			dataIndex: 'planName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'cycleType',
			render: (valueColumn, record) => {
				const cycleInfo = cycleTypeDisplay[valueColumn] || {};
				return (
					<span>
						{record.paymentCycle} {cycleInfo.text}
					</span>
				);
			},
			sorter: true,
		},
		{
			title: <TextInColumn title="Trạng thái hiển thị" />,
			dataIndex: 'displayStatus',
			render: (valueColumn) => {
				const useInfo = tagDisplay[valueColumn] || {};
				return <Tag color={useInfo?.color}>{useInfo.text}</Tag>;
			},
			sorter: true,
		},
	];

	const optionService = async (param) => {
		const res = await AddonAdmin.getDataDropDown({
			name: param,
			type: 'NAME',
		});
		const temp = res?.map((item) => ({
			value: item.name,
			label: item.name,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPricing = async (param) => {
		const res = await AddonAdmin.getDataDropDown({
			name: param,
			type: 'PLAN_NAME',
		});

		const temp = res?.map((item) => ({
			value: item.name,
			label: item.name,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionCategory = async (param) => {
		const res = await AddonAdmin.getDataDropDown({
			name: param,
			type: 'CATEGORY',
		});

		const temp = res?.map((item) => ({
			value: item.name,
			label: item.name,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPeriod = async (param) => {
		const res = await AddonAdmin.getDataDropDown({
			name: param,
			type: 'PERIOD',
		});

		const temp = res?.map((item) => ({
			value: item.cycleType,
			label: item.paymentCycle,
		}));

		return _uniqBy(temp, 'value');
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
					defaultValue={serviceName}
					onSelect={(valuePri) => {
						onChangeOneParam('serviceName')(valuePri);
					}}
					onClear={() => onChangeOneParam('serviceName')('')}
					maxLength={500}
				/>

				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					defaultValue={pricingName}
					placeholder="Tên gói dịch vụ: Tất cả"
					fetchOptions={(valuePri) =>
						optionPricing({ pricingIdChange: valuePri, serviceIdChange: serviceId })
					}
					onSelect={(valuePri) => {
						onChangeOneParam('pricingName')(valuePri);
					}}
					onClear={() => onChangeOneParam('pricingName')('')}
					maxLength={500}
				/>
				<SelectDebounce
					className="mr-6"
					showSearch
					allowClear
					placeholder="Danh mục: Tất cả"
					fetchOptions={optionCategory}
					onClear={() => onChangeOneParam('id')('')}
					onSelect={(valuePri) => {
						onChangeOneParam('categoryName')(valuePri);
					}}
					defaultValue={categoryName}
					maxLength={500}
				/>
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
						onChangeOneParam('type')('');
						onChangeOneParam('numberOfCycle')('');
					}}
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
						]}
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
						]}
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

function ChoosePricing({ openModal = false, onChange, form, className, paramPopup, value = {}, disabled }) {
	const [isModalVisible, setIsModalVisible] = useState(openModal);

	return (
		<>
			<div className={className}>
				<div className="flex gap-2">
					<div className="text-primary flex-auto pt-2 text-right">
						{value?.length > 0 && `Đã chọn: ${value?.length}`}
					</div>
					<div className="flex justify-between items-center">
						<Button
							onClick={() => {
								setIsModalVisible(true);
							}}
							icon={<AddIcon width="w-3.5" />}
							disabled={disabled}
							size="middle"
						>
							Chọn gói dịch vụ
						</Button>
					</div>
				</div>

				{isModalVisible && (
					<ModalChoosePricing
						value={value}
						paramPopup={paramPopup}
						form={form}
						onChange={onChange}
						indexRecord="multiPlanId"
						handleCloseModal={() => setIsModalVisible(false)}
					/>
				)}
			</div>
		</>
	);
}

export default ChoosePricing;
