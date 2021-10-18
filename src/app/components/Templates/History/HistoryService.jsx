import React from 'react';
import { Button, Select, Table, Tag } from 'antd';
import { useNavigation, usePaginationLocal, useLng } from 'app/hooks';
import { DX, Service } from 'app/models';
import { useQuery } from 'react-query';

const { Option } = Select;
function HistoryService({ data }) {
	const { goBack } = useNavigation();
	const { tButton, tField, tFilterField } = useLng();
	const { configTable, filterLocal, onChangeOneParam } = usePaginationLocal(
		async (params) => {
			const res = await Service.getListHistory(data.id, params);
			return res;
		},
		['type', 'name'],
		{
			type: 'ALL',
		},
		'Service.getListHistory',
		{
			enabled: !!data?.id,
		},
	);

	const { data: dataDropdown } = useQuery(
		['getDataDropdown'],
		async () => {
			try {
				const res = await Service.getDataDropdown(data.id);
				return res;
			} catch (e) {
				return {};
			}
		},
		{ initialData: [], enabled: !!data?.id },
	);

	const { type } = filterLocal;

	const STATUS_CODE = {
		AWAITING_APPROVAL: {
			label: tFilterField('approvalStatusOptions', 'pending'),
			color: 'orange',
		},
		UNAPPROVED: {
			label: tFilterField('approvalStatusOptions', 'notApprovedYet'),
			color: 'default',
		},
		APPROVED: {
			label: tFilterField('approvalStatusOptions', 'approved'),
			color: 'success',
		},
		REJECTED: {
			label: tFilterField('approvalStatusOptions', 'reject'),
			color: 'red',
		},
	};

	const columns = [
		{
			title: tField('item'),
			dataIndex: 'object',
			key: 'object',
			sorter: {},
		},
		{
			title: tField('status'),
			dataIndex: 'approve',
			render: (value) => <Tag color={STATUS_CODE[value].color}>{STATUS_CODE[value].label}</Tag>,
			key: 'approve',
			sorter: {},
		},
		{
			title: tField('content'),
			dataIndex: 'content',
			key: 'content',
			sorter: {},
		},
		{
			title: tField('influencer'),
			dataIndex: 'createdBy',
			render: (value, record) => <div>{`${record.createdBy} (${record.portal})`}</div>,
			key: 'portal',
			sorter: {},
		},
		{
			title: tField('time'),
			dataIndex: 'createdAt',
			render: (value) => <div>{DX.formatTime(value, 'YYYY-MM-DD HH:mm:ss')}</div>,
			key: 'createdAt',
			sorter: {},
		},
	];

	const handleSelectOption = (_, record) => {
		onChangeOneParam('type')(record.type);
		// onChangeOneParam('name')(record.name);
		onChangeOneParam('name')(record.type === 'ALL' ? undefined : record.name);
	};

	return (
		<>
			<Select
				className="w-60"
				defaultValue={type}
				onChange={(value, record) => handleSelectOption(value, record)}
			>
				<Option value="ALL" key="ALL" type="ALL">
					{tFilterField('value', 'all')}
				</Option>
				{dataDropdown?.map((item, index) => (
					// eslint-disable-next-line react/no-array-index-key
					<Option value={index} key={item.name + index} type={item.type} name={item.name}>
						{item.name}
					</Option>
				))}
			</Select>
			<Table className="mt-8" columns={columns} {...configTable} />
			<Button
				className="w-20 float-right"
				htmlType="button"
				onClick={() => goBack(DX.dev.createPath('/service/list'))}
			>
				{tButton('opt_cancel')}
			</Button>
		</>
	);
}
HistoryService.propTypes = {};
export default HistoryService;
