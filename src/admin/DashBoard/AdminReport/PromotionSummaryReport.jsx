import React, { useState } from 'react';
import { Table, Select, Form, DatePicker, Button } from 'antd';
import { usePagination, useUser, useLng } from 'app/hooks';
import { Report } from 'app/models';
import { SearchCommon, renderOptions } from 'app/components/Atoms';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';

export default function AddonList() {
	const { tButton, tField, tFilterField } = useLng();
	const { configTable, page, pageSize, onChangeOneParam, getColumnSortDefault } = usePagination(
		Report.getAllPromotion,
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
			title: 'Tên chương trình khuyến mại',
			dataIndex: 'couponName',
			key: 'name',
			width: 260,
			ellipsis: true,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'displayed',
			width: 125,
		},
		{
			title: 'Mức áp dụng',
			dataIndex: 'applicableLevel',
			width: 125,
		},
		{
			title: 'Số lần sử dụng',
			dataIndex: 'numberOfUses',
			width: 125,
		},
		{
			title: 'Tổng số lượng khuyến mại',
			dataIndex: 'totalCoupon',
			width: 125,
		},
		{
			title: 'Số lượng đã sử dụng',
			dataIndex: 'couponUsed',
			width: 125,
		},
		{
			title: 'Tổng tiền đã khuyến mại (VND)',
			dataIndex: 'totalAmountOfPromotion',
			width: 170,
		},
	];
	const { RangePicker } = DatePicker;
	return (
		<div>
			<div className="flex gap-y-4 flex-wrap">
				<RangePicker className="w-60 mr-6" />
				<Select placeholder="Nhóm: Tất cả" className="w-60 mr-6" />
				<Select placeholder="Tỉnh thành/công ty: Tất cả" className="w-60 mr-6" />
				<Button className="float-right ml-auto" type="default" icon={<FilterOutlined />}>
					Áp dụng lọc
				</Button>
			</div>
			<div className="flex gap-y-4 flex-wrap mt-4">
				<Select placeholder="Tên chương trình khuyến mại" className="w-60 mr-6" />
				<Select placeholder="Trạng thái: Tất cả" className="w-60 mr-6" />
				<Button className="float-right ml-auto" type="primary" icon={<ExportOutlined />}>
					Export
				</Button>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
