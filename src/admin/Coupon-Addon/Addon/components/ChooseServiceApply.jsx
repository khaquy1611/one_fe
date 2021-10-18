import { DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Table, Select } from 'antd';
import { SelectDebounce, TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { AddonAdmin } from 'app/models';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useState } from 'react';
import { useLocation } from 'react-router';

const ModalChooseService = ({ picked, disabledButton, indexRecord, openModal, onChange, initItemPick }) => {
	const { tButton, tField } = useLng();
	const { pathname } = useLocation();
	const [isModalVisible, setIsModalVisible] = useState(openModal);
	function handleCloseModal() {
		setIsModalVisible();
	}
	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await AddonAdmin.getListServiceAddon({
				...params,
			});
			return res;
		},
		indexRecord,
		extra: ['serviceName', 'categoryName'],
		initItemsPick: initItemPick,
		ignorekey: `${picked}`,
	});
	const optionService = async () => {
		const res = await AddonAdmin.getDataDropDown({
			type: 'NAME',
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

	const disabled = itemsPick?.length === 1;
	const { serviceName, categoryName } = filterLocal;

	const COLUMN_LEFT = [
		{
			title: <TextInColumn title="Tên dịch vụ" />,
			dataIndex: 'serviceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Danh mục" />,
			dataIndex: 'categoryName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: <TextInColumn title="Tên dịch vụ" />,
			dataIndex: 'serviceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Danh mục" />,
			dataIndex: 'categoryName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
	];
	const columnShow = [
		{
			title: <TextInColumn title="Tên dịch vụ" />,
			dataIndex: 'serviceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			align: 'right',
			render: (_, record) => (
				<Button
					type="text"
					icon={<DeleteOutlined />}
					disabled={disabledButton}
					onClick={() => {
						removeChooseItem(record[indexRecord]);
					}}
				/>
			),
		},
	];
	return (
		<>
			<Modal
				title="Chọn gói dịch vụ"
				width="80vw"
				visible={isModalVisible}
				onOk={() => {
					onChange(itemsPick[0] || {});
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
						placeholder="Danh mục: Tất cả"
						fetchOptions={optionCategory}
						onClear={() => onChangeOneParam('id')('')}
						onSelect={(valuePri) => {
							onChangeOneParam('categoryName')(valuePri);
						}}
						defaultValue={categoryName}
						maxLength={500}
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
			{pathname.indexOf('detail') === -1 && (
				<Button
					className="block"
					type="default"
					icon={<AddIcon width="w-3.5" />}
					onClick={() => setIsModalVisible(true)}
				>
					Dịch vụ
				</Button>
			)}

			{itemsPick?.length > 0 && (
				<Table
					className="pt-2"
					rowKey={indexRecord}
					columns={columnShow}
					scroll={{ y: itemsPick.length >= 10 ? 540 : undefined }}
					dataSource={itemsPick}
					pagination={false}
					showHeader={false}
					rowClassName="change-bg"
				/>
			)}
		</>
	);
};

function ChooseService({ openModal = false, className, value, disabled, onChange, initItemPick }) {
	return (
		<>
			<div className={className}>
				<ModalChooseService
					picked="serviceId"
					indexRecord="id"
					openModal={openModal}
					value={value}
					onChange={onChange}
					disabledButton={disabled}
					initItemPick={initItemPick}
				/>
			</div>
		</>
	);
}

export default ChooseService;
