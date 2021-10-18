import React from 'react';
import PropTypes from 'prop-types';
import { usePagination } from 'app/hooks';
import { Avatar, Table } from 'antd';
import { AvatarWithText } from 'app/components/Atoms';

function RevenueServiceTable(props) {
	const {
		// data: { content, total },
		isFetching,
		configTable,
		page,
		pageSize,
		query,
		refetch,
		onChangeOneParam,
		getColumnSortDefault,
	} = usePagination();
	// (params) => SMESubscription.getListUserUsing(id, params),
	// ["name", "status"],
	// {
	// 	status: "",
	// 	sort: "updatedTime,desc",
	// }

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: 'Tên dịch vụ',
			dataIndex: 'name',
			render: (value, record) => <AvatarWithText name={value} icon={record.avatar} />,
			sorter: {},
		},
		{
			title: 'Tổng doanh thu',
			dataIndex: 'revenue',
			sorter: {},
			width: 200,
		},
	];
	// temp
	const content = [
		{ name: 'Quản lý ngân sách', revenue: '35.012.000' },
		{ name: 'Tài chính trên MSN', revenue: '31.120.000' },
		{ name: 'Báo kinh tế tài chính', revenue: '30.000.000' },
		{ name: 'Kinh tế năng lượng', revenue: '22.452.120' },
		{ name: 'Đọc báo', revenue: '20.150.000' },
		{ name: 'Khôi phục dữ liệu', revenue: '18.759.021' },
		{ name: 'Quản lý kinh doanh', revenue: '15.925.000' },
		{ name: 'Kinh doanh sản xuất', revenue: '10.498.800' },
		{ name: 'Luật kinh doanh', revenue: '2.936.054' },
		{ name: 'Quản lý thu chi', revenue: '625.001' },
	];
	const total = 10;
	return (
		<Table
			rowKey={(record) => record.id}
			dataSource={content}
			loading={isFetching}
			columns={getColumnSortDefault(columns)}
			pagination={false}
			// pagination={{
			// 	current: page || 1,
			// 	pageSize: pageSize || 10,
			// 	total,
			// 	position: ["bottomCenter"],
			// }}
		></Table>
	);
}

export default RevenueServiceTable;
