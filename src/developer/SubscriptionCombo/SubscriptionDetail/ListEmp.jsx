import React from 'react';
import { Button, Select, Table, Tag } from 'antd';
import { useNavigation, usePagination, usePaginationLocal, useQueryUrl } from 'app/hooks';
import { DX, Service, SubscriptionDev } from 'app/models';
import { useQuery } from 'react-query';
import { AvatarWithText, renderOptions, SearchCommon } from 'app/components/Atoms';

const statusEmployee = [
	{
		value: '',
		label: 'Tất cả',
	},
	{
		value: 'ACTIVE',
		label: 'Hoạt động',
		color: 'success',
	},
	{
		value: 'INACTIVE',
		label: 'Không hoạt động',
		color: 'default',
	},
];

function ListEmp({ dataDetail, subscriptionId, typePortal }) {
	const { configTable, filterLocal, onChangeOneParam } = usePaginationLocal(
		async (params) => {
			const res = await SubscriptionDev.getListEmpBill(subscriptionId, dataDetail.id, typePortal, params);
			return res;
		},
		['name', 'status'],
		{
			sort: '',
		},
		'getListEmployee',

		{
			initialData: [],
			enabled: !!dataDetail.id,
		},
	);
	const TagStatus = (display) => {
		const Status = statusEmployee.filter((item) => item.value === display)[0];
		return (
			<Tag color={Status?.color} className="w-32">
				{Status?.label}
			</Tag>
		);
	};
	function checkDisplayTable() {
		if ((dataDetail.status === 'IN_TRIAL' || dataDetail.status === 'FUTURE') && configTable?.dataSource?.length > 0)
			return true;
		if (
			(dataDetail.status === 'IN_TRIAL' || dataDetail.status === 'FUTURE') &&
			configTable?.dataSource?.length === 0 &&
			(filterLocal.status || filterLocal.name)
		)
			return true;
		if (dataDetail.status !== 'IN_TRIAL' && dataDetail.status !== 'FUTURE') return true;
		return false;
	}
	// const { configTable, page, pageSize, filterLocal, refetch, onChangeOneParam } = usePaginationLocal(
	// 	(params) => getListUserUsing(id, serviceId, params),
	// 	['name', 'status'],
	// 	{
	// 		sort: '',
	// 	},
	// 	'getListEmployee',
	// 	{ enabled: !!serviceId },
	// );
	// const [status, searchText] =
	// // const [status, name] = [query.get('status') || '', query.get('name') || ''];

	const [status, name] = [filterLocal.status || '', filterLocal.name || ''];

	const displayOptions = [
		{
			value: '',
			label: 'Tất cả',
		},
		{
			value: 'ACTIVE',
			label: 'Hoạt động',
			color: 'success',
		},
		{
			value: 'INACTIVE',
			label: 'Không hoạt động',
			color: 'default',
		},
	];

	const columns = [
		{
			title: 'Tên người dùng',
			dataIndex: 'name',
			render: (value, record) => <AvatarWithText name={value} icon={record.avatar} />,
			sorter: {},
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			sorter: {},
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (display) => TagStatus(display),
			key: 'status',
			sorter: {},
		},
	];

	return (
		<>
			{checkDisplayTable() > 0 ? (
				<>
					<SearchCommon
						className="w-60 mr-6"
						placeholder="Tên người dùng"
						onSearch={(value) => {
							onChangeOneParam('name')(value);
						}}
						autoFocus
						maxLength={100}
						defaultValue={name}
					/>
					<Select className="w-70 mr-6" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions('Trạng thái hiển thị', displayOptions)}
					</Select>
					<Table className="mt-8" columns={columns} {...configTable} />
				</>
			) : (
				<>Chưa có thông tin nhân viên của thuê bao.</>
			)}

			{/* <Button
				className="w-20 float-right"
				htmlType="button"
				onClick={() => goBack(DX.dev.createPath('/service/list'))}
			>
				Hủy
			</Button> */}
		</>
	);
}

export default ListEmp;
