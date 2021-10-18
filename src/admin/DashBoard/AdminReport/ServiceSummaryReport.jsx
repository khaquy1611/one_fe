import React, { useState } from 'react';
import { Table, Select, Form, DatePicker, Button } from 'antd';
import { usePagination, useUser, useLng } from 'app/hooks';
import { Report } from 'app/models';
import { SearchCommon, renderOptions } from 'app/components/Atoms';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';

export default function AddonList() {
	const { tButton, tField, tFilterField } = useLng();
	const { configTable, page, pageSize, onChangeOneParam, getColumnSortDefault } = usePagination(Report.getAllService);

	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 60,
		},
		{
			title: 'Nhà cung cấp',
			dataIndex: 'manuFacture',
			key: 'name',
			width: 260,
			ellipsis: true,
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'service',
			key: 'displayed',
			width: 120,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'servicePack',
			width: 130,
		},
		{
			title: 'Tổng số lượt đăng ký',
			dataIndex: 'totalNumberOfRegis',
			width: 110,
		},
		{
			title: 'Tổng số lượt gia hạn',
			dataIndex: 'totalNumberOfRenewals',
			width: 110,
		},
		{
			title: 'Tổng số lượt hủy',
			dataIndex: 'totalNumberOfCancel',
			width: 110,
		},
		{
			title: 'Tổng số kích hoạt lại',
			dataIndex: 'totalNumberOfReactive',
			width: 110,
		},
		{
			title: 'Tổng số đổi gói',
			dataIndex: 'totalNumberOfPackagesChange',
			width: 110,
		},
	];
	const { RangePicker } = DatePicker;
	return (
		<div>
			<div className="flex gap-y-4 flex-wrap">
				<RangePicker className="w-60 mr-6" />
				<Select placeholder="Nhà cung cấp: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Nhóm: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Danh mục: Tất cả" className="w-60 mr-6" />
				<Button className="float-right ml-auto" type="default" icon={<FilterOutlined />}>
					Áp dụng lọc
				</Button>
			</div>
			<div className="flex gap-y-4 flex-wrap mt-4">
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
