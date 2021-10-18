import React, { useState } from 'react';
import { isEmpty } from 'opLodash';
import { Pricing } from 'app/models';
import { usePaginationLocal, useLng } from 'app/hooks';
import { SearchCommon, renderOptions } from 'app/components/Atoms';
import { Button, Select, Checkbox, Table, Modal, Tag, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import useQueryUrl from '../../hooks/useQueryUrl';

const ModalChooseService = ({ value, onChange, form, handleCloseModal }) => {
	const [countSelect, setCountSelect] = useState(0);
	const [preValueSelect, setPreValueSelect] = useState([...value]);
	const { tButton, tMessage, tFilterField, tField, tLowerField } = useLng();
	const [valueSelect, setValueSelect] = useState(() => {
		const f = {};
		value.forEach((el) => {
			f[el.id] = el;
		});
		return f;
	});
	const queryUrl = useQueryUrl();
	const isOrderService = queryUrl.get('isOrderService') === 'true';

	function submitChooseAddon() {
		const arrChoose = [...Object.values(valueSelect)];
		const arrSubmit = [...preValueSelect];
		arrChoose.forEach((e) => {
			if (preValueSelect.findIndex((i) => i.id === e.id) === -1) {
				arrSubmit.push(e);
			}
		});
		onChange([...arrSubmit]);
		handleCloseModal();
	}

	const { configTable, onChangeOneParam, filterLocal } = usePaginationLocal(
		async (params) => {
			let ids = '';
			if (value.length > 0) ids = value.map((e) => e.id);
			const paymentCycle = form.getFieldValue('paymentCycle');
			const cycleType = form.getFieldValue('cycleType');
			const reqParams = {
				...params,
				paymentCycle,
				cycleType,
				addonIds: ids,
				orderService: isOrderService ? 'YES' : 'NO',
			};
			const res = await Pricing.getListAddons(reqParams);
			res.content.forEach((el, index) => {
				el.isRequired = false;
				el.index = index;
			});
			return res;
		},
		['name', 'searchText', 'status'],
		{
			// sort: 'createAt,asc',
		},
		'PricingDev.getAll',
	);

	const { name, searchText } = filterLocal;
	const columns = [
		{
			title: tField('service'),
			dataIndex: 'serviceName',
			ellipsis: true,
		},
		{
			title: tField('servicePackage'),
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			title: tField('displayStatus'),
			dataIndex: 'displayed',
			render: (data) => {
				if (data === 'VISIBLE')
					return <Tag color="success">{tFilterField('displayStatusOptions', 'show')}</Tag>;
				return <Tag color="default">{tFilterField('displayStatusOptions', 'hide')}</Tag>;
			},
			width: 110,
		},
		{
			title: tField('opt_select'),
			dataIndex: 'id',
			render(id, record) {
				const checked = valueSelect[id];
				return (
					<Checkbox
						checked={checked}
						onChange={(e) => {
							if (checked) {
								delete valueSelect[id];
								setCountSelect(countSelect - 1);
								setValueSelect({ ...valueSelect });
								const arr = [...preValueSelect];
								arr.splice(
									arr.findIndex((i) => i.id === id),
									1,
								);
								setPreValueSelect([...arr]);
							} else {
								setCountSelect(countSelect + 1);
								setValueSelect({
									...valueSelect,
									[id]: record,
								});
							}
						}}
					/>
				);
			},
			align: 'center',
			width: 90,
		},
	];

	const renderTitleSelect = () => {
		if (countSelect === 0) return '0';
		if (countSelect > 0 && countSelect < 10) return `0${countSelect}`;
		return `${countSelect}`;
	};

	const displayStatusOptions = [
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
			title={tMessage('opt_select', { field: 'extraServicePackage' })}
			style={{ top: 22 }}
			visible
			width="700px"
			onCancel={() => {
				handleCloseModal();
			}}
			maskClosable={false}
			footer={
				<>
					<Button type="primary" onClick={submitChooseAddon} disabled={isEmpty(valueSelect)}>
						{tButton('opt_select', { field: 'servicePackage' })}
					</Button>
				</>
			}
		>
			<div className="grid grid-cols-3 gap-2 mb-5">
				<SearchCommon
					placeholder={tField('serviceName')}
					onSearch={onChangeOneParam('name')}
					defaultValue={name}
				/>
				<SearchCommon
					placeholder={tField('servicePackage')}
					onSearch={onChangeOneParam('searchText')}
					defaultValue={searchText}
				/>
				<Select defaultValue={null} onSelect={onChangeOneParam('status')}>
					{renderOptions(
						tFilterField('prefix', 'displayStatus'),
						displayStatusOptions.map((e) => ({
							...e,
							label: tFilterField('displayStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>

			<Table
				className="long-table"
				{...configTable}
				columns={columns}
				// dataSource={content}
				scroll={12}
				pagination={{
					...configTable.pagination,
					showSizeChanger: false,
				}}
				rowKey={(record) => JSON.stringify(record)}
			/>
			<p className="text-blue-600 m-0 p-0">
				{renderTitleSelect()} {tLowerField('servicePackageIsSelected')}
			</p>
		</Modal>
	);
};

export default function ServiceAdditional({ disabled, visible, setVisible, portal, form, ...argss }) {
	const { value = [], onChange } = argss;
	const { tField, tFilterField } = useLng();
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
			title: tField('service'),
			dataIndex: 'serviceName',
			ellipsis: true,
		},
		{
			title: tField('servicePackage'),
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			title: tField('displayStatus'),
			dataIndex: 'displayed',
			render: (displayed) => {
				if (displayed === 'VISIBLE')
					return <Tag color="success">{tFilterField('displayStatusOptions', 'show')}</Tag>;
				return <Tag color="default">{tFilterField('displayStatusOptions', 'hide')}</Tag>;
			},
			width: 110,
		},
		{
			title: tField('isRequired'),
			dataIndex: 'isRequired',
			render(isRequired, record, index) {
				return (
					<Checkbox
						checked={isRequired}
						onChange={(e) => {
							const arr = [...value];
							arr[index].isRequired = !isRequired;
							onChange([...arr]);
						}}
						disabled={disabled || portal === 'admin'}
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
			width: 50,
			hide: disabled || portal === 'admin',
		},
	];
	return (
		<>
			{visible && (
				<ModalChooseService
					value={value}
					onChange={onChange}
					form={form}
					handleCloseModal={() => setVisible(false)}
				/>
			)}
			{value.length > 0 && (
				<Table
					className="beauty-scroll-table mb-6"
					columns={columnsTable.filter((column) => !column.hide)}
					dataSource={value}
					scroll={{ x: 500, y: 290 }}
					pagination={false}
				/>
			)}
		</>
	);
}
