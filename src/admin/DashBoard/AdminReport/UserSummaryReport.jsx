import React from 'react';
import { Table, Select, DatePicker, Button } from 'antd';
import { usePagination } from 'app/hooks';
import { Report } from 'app/models';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';

export default function AddonList() {
	const { configTable, page, pageSize, onChangeOneParam, getColumnSortDefault } = usePagination(
		Report.getAllUserSummary,
	);

	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 60,
		},
		{
			title: 'Tỉnh thành',
			dataIndex: 'province',
			key: 'name',
			ellipsis: true,
		},
		{
			title: 'Tổng số khách hàng',
			dataIndex: 'totalCustomer',
			key: 'displayed',
			width: 180,
		},
		{
			title: 'Tổng số nhà cung cấp',
			dataIndex: 'totalManufacture',
			width: 180,
		},
		{
			title: 'Khách hàng đã mua dịch vụ',
			dataIndex: 'customerPurchasedService',
			width: 180,
		},
		{
			title: 'Nhà cung cấp đã bán sản phẩm',
			dataIndex: 'supplierSoldProduct',
			width: 180,
		},
	];
	return (
		<div>
			<div className="flex">
				<Select placeholder="Tỉnh thành: Tất cả" className="w-60 mr-6" />
				<Button type="default" icon={<FilterOutlined />}>
					Áp dụng lọc
				</Button>
				<Button className="float-right ml-auto" type="primary" icon={<ExportOutlined />}>
					Export
				</Button>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
