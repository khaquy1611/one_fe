import React from 'react';
import { Table, Select, DatePicker, Button } from 'antd';
import { usePagination, useLng } from 'app/hooks';
import { Report } from 'app/models';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';

export default function AddonList() {
	const { configTable, page, pageSize, onChangeOneParam, getColumnSortDefault } = usePagination(Report.getAllRevenue);

	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 60,
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'service',
			key: 'displayed',
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'servicePack',
		},
		{
			title: 'Số tiền đã thanh toán (Chưa thuế)',
			dataIndex: 'amountPaidBeforeTax',
			width: 170,
		},
		{
			title: 'Số tiền nộp thuế',
			dataIndex: 'taxPayment',
			width: 135,
		},
		{
			title: 'Số tiền đã thanh toán (Đã có thuế)',
			dataIndex: 'amountPaidAfterTax',
			width: 170,
		},
	];
	const { RangePicker } = DatePicker;
	return (
		<div>
			<div className="flex gap-y-4 flex-wrap">
				<RangePicker className="w-60 mr-6" />
				<Select placeholder="Tỉnh thành: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Nhà cung cấp: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Khách hàng: Tất cả" className="w-60 mr-6" />
				<Button className="float-right ml-auto" type="default" icon={<FilterOutlined />}>
					Áp dụng lọc
				</Button>
			</div>
			<div className="flex gap-y-4 flex-wrap mt-4">
				<Select placeholder="Nhóm: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Danh mục: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Dịch vụ: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Gói dịch vụ: Tất cả" className="w-60 mr-6" />
				<Button className="float-right ml-auto" type="primary" icon={<ExportOutlined />}>
					Export
				</Button>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
