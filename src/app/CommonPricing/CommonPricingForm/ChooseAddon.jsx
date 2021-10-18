import { PlusOutlined } from '@ant-design/icons';
import { idSelects } from 'actions';
import { Button, Checkbox, message, Modal, Select, Table, Tag, Spin } from 'antd';
import { filterOption, SelectDebounce, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity, useQueryUrl } from 'app/hooks';
import { CategoryPortal, Pricing } from 'app/models';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

const PERIOD_TYPE = {
	DAILY: 'Ngày',
	WEEKLY: 'Tuần',
	MONTHLY: 'Tháng',
	YEARLY: 'Năm',
};

const style = { color: '#f5222d' };
const checkIdInactive = (arr, id) => {
	if (arr && arr.length > 0) return arr.includes(id);
	return false;
};

const ModalChooseAddon = ({
	value,
	onChange,
	handleCloseModal,
	indexRecord,
	disabled,
	bonusType,
	commonAddon,
	portal = 'dev',
}) => {
	const idArrInactive = useSelector(idSelects.selectId);
	const { tButton, tFilterField } = useLng();

	const { cycleType, paymentCycle } = bonusType;

	const queryUrl = useQueryUrl();
	const isOrderService = queryUrl.get('isOrderService') === 'true';

	const [searchCategory, setSearchCategory] = useState('');

	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const reqParams = {
				...params,
				...bonusType,
				orderService: isOrderService ? 'YES' : 'NO',
			};
			const res = await Pricing.getListAddons(portal, reqParams);
			res.content.forEach((el, index) => {
				el.isRequired = false;
				el.index = index;
			});
			return res;
		},
		indexRecord,
		extra: ['serviceId', 'addonId', 'categoryId', 'paymentCycle', 'cycleType', 'hasBonusTypeOnce', 'addonType'],
		initItemsPick: value,
		ignorekey: 'addonIds',
	});

	// const { serviceId, pricingId, categoryId, paymentCycle, cycleType } = filterLocal;

	const optionService = async (searchValue) => {
		const res = await Pricing.getServiceDrop(portal, {
			name: searchValue || null,
			cycleType,
			paymentCycle,
			orderService: isOrderService ? 'YES' : 'NO',
		});
		const temp = res.map((item) => ({
			value: item.serviceId,
			label: item.serviceName,
		}));

		return temp;
	};

	const optionPricing = async (searchValue) => {
		const res = await Pricing.getPricingDrop(portal, {
			name: searchValue || null,
			cycleType,
			paymentCycle,
			orderService: isOrderService ? 'YES' : 'NO',
		});

		const temp = res.map((item) => ({
			value: item.addonsId,
			label: item.name,
		}));

		return temp;
	};

	const { data: categoryOptions, isFetching: categoryIsFetching } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			return [
				...res.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	const optionPeriod = async (searchValue) => {
		const arrPeriod = [];
		const res = await Pricing.getPeriodDrop(portal, {
			name: searchValue || null,
			type: commonAddon ? 'ALL' : 'PERIODIC',
			cycleType,
			paymentCycle,
			orderService: isOrderService ? 'YES' : 'NO',
		});

		res?.forEach((el) => {
			if (el.bonusType === 'ONCE') arrPeriod.push({ value: el.bonusType, label: 'Một lần' });
			else
				arrPeriod.push({
					value: `${el.numberOfCycle}-${el.type}`,
					label: `${el.numberOfCycle} ${PERIOD_TYPE[el.type]}`,
				});
		});

		return arrPeriod;
	};

	const COLUMN_LEFT = [
		{
			title: 'Tên dịch vụ',
			dataIndex: 'serviceName',
			ellipsis: true,
			sorter: true,
		},
		{
			title: 'Tên gói dịch vụ',
			dataIndex: 'name',
			ellipsis: true,
			sorter: true,
		},
		{
			title: (
				<span>
					Chu kỳ <br /> thanh toán
				</span>
			),
			render: (_, record) => {
				if (record.bonusType === 'ONCE') return <span>Một lần</span>;
				return (
					<span>
						{record.paymentCycle} {PERIOD_TYPE[record.type]}
					</span>
				);
			},
		},
		{
			title: (
				<span>
					Trạng thái <br /> hiển thị
				</span>
			),
			dataIndex: 'displayed',
			render: (data) => {
				if (data === 'VISIBLE')
					return (
						<div className="mr-0 text-center">
							<Tag className="mr-0" color="success">
								{tFilterField('displayStatusOptions', 'show')}
							</Tag>
						</div>
					);
				return (
					<div className="mr-0 text-center">
						<Tag className="mr-0" color="default">
							{tFilterField('displayStatusOptions', 'hide')}
						</Tag>
					</div>
				);
			},
			width: 100,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: (
				<span>
					Tên dịch vụ <br /> đã chọn
				</span>
			),
			dataIndex: 'serviceName',
			ellipsis: true,
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
		{
			title: (
				<span>
					Tên gói dịch vụ <br /> đã chọn
				</span>
			),
			dataIndex: 'name',
			ellipsis: true,
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
		{
			title: (
				<span>
					Chu kỳ <br /> thanh toán
				</span>
			),
			render: (_, record) => {
				if (record.bonusType === 'ONCE') return <span>Một lần</span>;
				return (
					<span>
						{record.paymentCycle} {PERIOD_TYPE[record.type]}
					</span>
				);
			},
		},
		{
			align: 'center',
			title: (
				<span>
					Trạng thái <br /> hiển thị
				</span>
			),
			dataIndex: 'displayed',
			render: (el) => {
				if (el === 'VISIBLE')
					return (
						<Tag className="mr-0" color="success">
							{tFilterField('displayStatusOptions', 'show')}
						</Tag>
					);
				return (
					<Tag className="mr-0" color="default">
						{tFilterField('displayStatusOptions', 'hide')}
					</Tag>
				);
			},
			width: 100,
		},
		{
			title: 'Bắt buộc',
			dataIndex: 'isRequired',
			render: (isRequired, record, index) => (
				<Checkbox
					checked={isRequired}
					onChange={() => {
						const arr = [...itemsPick];
						arr[index].isRequired = !isRequired;
						onChange([...arr]);
					}}
					disabled={disabled}
				/>
			),
			align: 'center',
			width: 90,
		},
	];

	return (
		<Modal
			title="Chọn dịch vụ bổ sung"
			width="90%"
			visible
			onOk={() => {
				onChange([...itemsPick]);
				handleCloseModal();
			}}
			okText="Xác nhận"
			okButtonProps={{ disabled }}
			onCancel={() => handleCloseModal()}
			closable
			maskClosable={false}
			centered
		>
			<div className="grid grid-cols-4 gap-5 mb-5">
				<SelectDebounce
					showSearch
					allowClear
					placeholder="Tên dịch vụ: Tất cả"
					fetchOptions={optionService}
					onSelect={onChangeOneParam('serviceId')}
					onClear={() => onChangeOneParam('serviceId')('')}
				/>

				<SelectDebounce
					showSearch
					allowClear
					placeholder="Tên gói dịch vụ: Tất cả"
					fetchOptions={optionPricing}
					onSelect={onChangeOneParam('addonId')}
					onClear={() => onChangeOneParam('addonId')('')}
				/>

				<Select
					showSearch
					allowClear
					placeholder="Danh mục: Tất cả"
					onSearch={setSearchCategory}
					searchValue={searchCategory}
					loading={categoryIsFetching}
					onSelect={onChangeOneParam('categoryId')}
					onClear={() => onChangeOneParam('categoryId')('')}
					filterOption={filterOption}
					options={categoryOptions}
				/>

				<SelectDebounce
					showSearch
					allowClear
					placeholder="Chu kỳ thanh toán: Tất cả"
					fetchOptions={optionPeriod}
					onSelect={(valuePeriod) => {
						if (valuePeriod === 'ONCE') {
							onChangeOneParam('hasBonusTypeOnce')('YES');
							onChangeOneParam('addonType')('ALL');
						} else {
							onChangeOneParam('hasBonusTypeOnce')('NO');
							onChangeOneParam('addonType')('PERIODIC');
						}
					}}
					onClear={() => {
						onChangeOneParam('hasBonusTypeOnce')('YES');
						onChangeOneParam('addonType')('PERIODIC');
					}}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div style={{ border: '1px solid #E5E5E5' }}>
					<VirtualTable
						columns={[
							...COLUMN_LEFT,
							{
								align: 'center',
								title: <span>Tổng số: {configTable.total}</span>,
								dataIndex: { indexRecord },
								render: (_, record) => (
									<div className="flex items-center h-full text-center">
										<Button
											type="link"
											className="w-full"
											disabled={disabled}
											onClick={() => {
												if (itemsPick.length < 30) chooseItem(record[indexRecord]);
												else
													message.warning(
														'Số lượng gói dịch vụ bổ sung trong gói dịch vụ không được vượt quá 30 gói',
													);
											}}
										>
											{tButton('opt_select', { field: '' })}
										</Button>
									</div>
								),
								width: 130,
							},
						]}
						chooseItem={chooseItem}
						{...configTable}
					/>
				</div>
				<div style={{ border: '1px solid #E5E5E5' }}>
					<Spin spinning={configTable.isFetching}>
						<Table
							rowKey={indexRecord}
							columns={[
								...COLUMN_RIGHT,
								{
									align: 'center',
									title: <span>Tổng số: {itemsPick.length}</span>,
									dataIndex: indexRecord,
									render: (_, record) => (
										<Button
											disabled={disabled}
											type="link"
											onClick={() => {
												removeChooseItem(record[indexRecord]);
											}}
											style={
												checkIdInactive(idArrInactive.idArr, record[indexRecord]) ? style : null
											}
										>
											{tButton('deselect')}
										</Button>
									),
									width: 130,
								},
							]}
							scroll={{ y: itemsPick.length >= 10 ? 540 : undefined }}
							dataSource={itemsPick}
							pagination={false}
							rowClassName="selected-tb"
						/>
					</Spin>
				</div>
			</div>
		</Modal>
	);
};

function ChooseAddon({
	disabled,
	commonAddon,
	portal,
	className,
	keyName,
	triggerPaymentCycle,
	periodicType,
	...args
}) {
	const { tField } = useLng();
	const { value = [], onChange } = args;
	const [visibleModal, setVisibleModal] = useState(false);

	return (
		<>
			<div className={className}>
				{value?.length > 0 && <span className="text-gray-60 mr-4">Đã chọn {value?.length}</span>}
				<Button
					type="default"
					icon={<PlusOutlined width="w-4" />}
					disabled={!commonAddon && !triggerPaymentCycle[keyName]}
					onClick={() => setVisibleModal(true)}
				>
					{tField('extraService')} {commonAddon && 'chung'}
				</Button>
			</div>

			{visibleModal && (
				<ModalChooseAddon
					value={value}
					onChange={onChange}
					indexRecord="id"
					disabled={disabled}
					portal={portal}
					handleCloseModal={() => setVisibleModal(false)}
					bonusType={commonAddon ? { addonType: 'ALL' } : { ...periodicType }}
					commonAddon={commonAddon}
				/>
			)}
		</>
	);
}

export default ChooseAddon;
