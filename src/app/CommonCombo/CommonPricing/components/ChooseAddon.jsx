import React from 'react';
import { CategoryPortal, ComboPricing } from 'app/models';
import { usePickInfinity, useLng } from 'app/hooks';
import { SearchCommon, renderOptions, VirtualTable } from 'app/components/Atoms';
import { Button, Select, Checkbox, Table, Modal, Tag, Row, Col, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { idSelects } from 'actions';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';

const style = { color: '#f5222d' };
const checkIdInactive = (arr, id) => {
	if (arr && arr.length > 0) return arr.includes(id);
	return false;
};

const ModalChooseAddon = ({ value, onChange, form, handleCloseModal, indexRecord, portal, disabled }) => {
	const idArrInactive = useSelector(idSelects.selectId);
	const { tButton, tFilterField } = useLng();

	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await ComboPricing.getListAddons({ portal, query: params });
			res.content.forEach((el, index) => {
				el.isRequired = false;
				el.index = index;
			});
			return res;
		},
		indexRecord,
		extra: ['name', 'categoryId', 'displayStatus'],
		defaultParams: {
			paymentCycle: form.getFieldValue('periodValue'),
			cycleType: form.getFieldValue('periodType'),
		},
		initItemsPick: [...value],
		ignorekey: 'addonIds',
	});
	const { data: categoryOptions, isFetching } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			const arr = [
				{
					label: 'Tất cả',
					value: null,
				},
			];
			res.forEach((e) => {
				arr.push({
					label: e.name,
					value: e.id,
				});
			});
			return arr;
		},
		{
			initialData: [],
		},
	);

	const { name } = filterLocal;
	const COLUMN_LEFT = [
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceName',
			ellipsis: true,
			sorter: true,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'name',
			ellipsis: true,
			sorter: true,
		},
		{
			title: 'Trạng thái hiển thị',
			dataIndex: 'displayed',
			render: (data) => {
				if (data === 'VISIBLE')
					return <Tag color="success">{tFilterField('displayStatusOptions', 'show')}</Tag>;
				return <Tag color="default">{tFilterField('displayStatusOptions', 'hide')}</Tag>;
			},
			width: 100,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: 'Danh sách gói đã chọn',
			dataIndex: 'name',
			ellipsis: true,
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
	];

	const displayOptions = [
		{
			value: null,
			label: 'all',
		},
		{
			value: 'VISIBLE',
			label: 'show',
		},
		{
			value: 'INVISIBLE',
			label: 'hide',
		},
	];

	return (
		<Modal
			title="Chọn dịch vụ bổ sung"
			width="80vw"
			visible
			onOk={() => {
				onChange([...itemsPick]);
				handleCloseModal();
			}}
			okText="Thêm dịch vụ bổ sung"
			okButtonProps={{ disabled }}
			onCancel={() => {
				handleCloseModal();
			}}
			closable
			maskClosable={false}
			centered
		>
			<div className="grid grid-cols-4 gap-2 mb-5">
				<SearchCommon
					placeholder="Tìm dịch vụ, gói dịch vụ"
					onSearch={onChangeOneParam('name')}
					defaultValue={name}
				/>
				<Select loading={isFetching} defaultValue={null} onSelect={onChangeOneParam('categoryId')}>
					{renderOptions('Danh mục', categoryOptions)}
				</Select>
				<Select defaultValue={null} onSelect={onChangeOneParam('displayStatus')}>
					{renderOptions(
						tFilterField('prefix', 'displayStatus'),
						displayOptions.map((e) => ({
							...e,
							label: tFilterField('displayStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div style={{ border: '1px solid #E5E5E5' }}>
					<VirtualTable
						columns={[
							...COLUMN_LEFT,
							{
								align: 'center',
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
														'Số lượng gói dịch vụ bổ sung trong Combo không được vượt quá 30 gói',
													);
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
								dataIndex: indexRecord,
								render: (_, record) => (
									<Button
										disabled={disabled}
										type="link"
										onClick={() => {
											removeChooseItem(record[indexRecord]);
										}}
										style={checkIdInactive(idArrInactive.idArr, record[indexRecord]) ? style : null}
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

function ChooseAddon({ disabled, visible, setVisible, portal, form, ...argss }) {
	const { value = [], onChange } = argss;

	function handleDelete(id) {
		value.splice(
			value.findIndex((i) => i.id === id),
			1,
		);
		onChange([...value]);
	}

	const columnsTable = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (_, item, index) => index + 1,
			width: 50,
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceName',
			ellipsis: true,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			title: 'Trạng thái hiển thị',
			dataIndex: 'displayed',
			render: (displayed) => {
				if (displayed === 'VISIBLE') return <Tag color="success">Hiện</Tag>;
				return <Tag color="default">Ẩn</Tag>;
			},
			width: 110,
		},
		{
			title: 'Bắt buộc',
			dataIndex: 'isRequired',
			render(isRequired, record, index) {
				return (
					<Checkbox
						checked={isRequired}
						onChange={() => {
							const arr = [...value];
							arr[index].isRequired = !isRequired;
							onChange([...arr]);
						}}
						disabled={disabled}
					/>
				);
			},
			align: 'center',
			width: 100,
		},
		{
			title: '',
			dataIndex: 'id',
			render: (_, record) => (
				<div className="text-right">
					<DeleteOutlined onClick={() => handleDelete(record.id)} />
				</div>
			),
			width: 45,
			hide: disabled,
		},
	];
	return (
		<>
			{visible && (
				<ModalChooseAddon
					value={value}
					onChange={onChange}
					form={form}
					indexRecord="id"
					disabled={disabled}
					portal={portal}
					handleCloseModal={() => setVisible(false)}
				/>
			)}
			{value.length > 0 && (
				<Row>
					<Col span={24}>
						<Table
							className="beauty-scroll-table"
							columns={columnsTable.filter((column) => !column.hide)}
							dataSource={value}
							scroll={{ x: 500, y: 280 }}
							pagination={false}
						/>
					</Col>
				</Row>
			)}
		</>
	);
}

export default ChooseAddon;
