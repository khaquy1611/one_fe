import React, { useState } from 'react';
import { Table, Select, Form, DatePicker, Button } from 'antd';
import { usePagination, useUser, useLng } from 'app/hooks';
import { Report } from 'app/models';
import { SearchCommon, renderOptions } from 'app/components/Atoms';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';

export default function AddonList() {
	const { tButton, tField, tFilterField } = useLng();
	const { configTable, page, pageSize, onChangeOneParam, getColumnSortDefault } = usePagination(
		Report.getAllTrialSummary,
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
			title: 'Tên dịch vụ',
			dataIndex: 'service',
			key: 'displayed',
			width: 280,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'servicePack',
			width: 280,
		},
		{
			title: 'Số lượng đăng ký dùng thử',
			dataIndex: 'numberOfTrialSubscriptions',
			width: 140,
		},
		{
			title: 'Đang trong dùng thử',
			dataIndex: 'inTrail',
			width: 140,
		},
		{
			title: 'Đăng ký dùng chính thức',
			dataIndex: 'officialRegistration',
			width: 140,
		},
		{
			title: 'Không đăng ký dùng chính thức',
			dataIndex: 'noneOfficialRegistration',
			width: 140,
		},
	];
	const { RangePicker } = DatePicker;
	return (
		<div>
			<div className="flex gap-y-4 flex-wrap">
				<RangePicker className="w-60 mr-6" />
				<Select placeholder="Tỉnh thành: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Danh mục: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Nhóm: Tất cả" className="w-60 mr-6" />
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
