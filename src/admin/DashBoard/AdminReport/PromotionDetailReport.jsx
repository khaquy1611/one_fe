import React, { useState } from 'react';
import { Table, Select, Form, DatePicker, Button } from 'antd';
import { usePagination, useUser, useLng } from 'app/hooks';
import { Report } from 'app/models';
import { SearchCommon, renderOptions } from 'app/components/Atoms';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';

export default function AddonList() {
	const { tButton, tField, tFilterField } = useLng();
	const { configTable, page, pageSize, onChangeOneParam, getColumnSortDefault } = usePagination(
		Report.getAllCouponDetail,
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
			width: 260,
			ellipsis: true,
		},
		{
			title: 'Tên khách hàng',
			dataIndex: 'cusName',
			key: 'displayed',
			width: 240,
		},
		{
			title: 'Mã thuê bao',
			dataIndex: 'code',
			width: 110,
		},
		{
			title: 'Dịch vụ chính',
			dataIndex: 'mainService',
			width: 240,
		},
		{
			title: 'Số lần KM đã sử dụng',
			dataIndex: 'couponUsed',
			width: 125,
		},
		{
			title: 'Tổng tiền đã khuyến mại (VNĐ)',
			dataIndex: 'totalAmountOfPromotion',
			width: 170,
		},
	];
	const { RangePicker } = DatePicker;
	return (
		<div>
			<div className="flex">
				<Select placeholder="Khuyến mại giảm 50% cho tất cả" className="w-1/2 mr-6" />
				<Button className="float-right ml-auto" type="default" icon={<FilterOutlined />}>
					Áp dụng lọc
				</Button>
			</div>
			<div className="flex mt-4">
				<div className="flex gap-6">
					<p className="font-bold">Số lượng khuyến mại: 50/100</p>
					<p className="font-bold">Số lần khuyến mại: 30</p>
					<p className="font-bold">Mức khuyến mại: 20%</p>
				</div>
				<Button className="float-right ml-auto" type="primary" icon={<ExportOutlined />}>
					Export
				</Button>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
