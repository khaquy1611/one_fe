import { Table, Tag, Select } from 'antd';
import { renderOptions, UrlBreadcrumb } from 'app/components/Atoms';
import { useLng, usePagination } from 'app/hooks';
import { BillingAdmin, DX } from 'app/models';
import React from 'react';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import moment from 'moment';
import { Link } from 'react-router-dom';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import useUser from '../../app/hooks/useUser';

export default function ListBilling() {
	const { tField, tFilterField } = useLng();
	const { user } = useUser();
	const { page, pageSize, configTable, onChangeOneParam, query, getColumnSortDefault } = usePagination(
		BillingAdmin.getAllPagination,
		['status', 'code', 'serviceName', 'customerName'],
		{
			sort: 'createdAt,desc',
		},
	);

	const [status, code, serviceName, customerName] = [
		query.get('status') || '',
		query.get('code') || '',
		query.get('serviceName') || '',
		query.get('customerName') || '',
	];

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: tField('billCode'),
			dataIndex: 'code',
			render: (value, record) =>
				DX.canAccessFuture2('admin/view-invoice', user.permissions) ? (
					<Link to={`list/${record.id}`} className="text-blue-400">
						{value}
					</Link>
				) : (
					value
				),
			sorter: (a, b) => a.code?.localeCompare(b.code),
			width: 150,
		},
		{
			title: 'Tên khách hàng',
			dataIndex: 'customerName',
			render: (value) => <div className="truncate">{value}</div>,
			ellipsis: true,
			sorter: (a, b) => a.customerName?.localeCompare(b.customerName),
		},
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (value, record) => <AvatarWithText name={value} icon={record.icon} subName={record.pricingName} />,
			ellipsis: true,
			sorter: (a, b) => a.serviceName?.localeCompare(b.serviceName),
		},
		{
			title: tField('totalCost'),
			dataIndex: 'amount',
			render: (value) => DX.formatNumberCurrency(value),
			sorter: (a, b) => a.amount - b.amount,
			ellipsis: true,
			className: 'text-right text-right-important',
			width: 120,
		},
		{
			title: tField('timeForPayment'),
			dataIndex: 'requirePaymentDate',
			render: (requirePaymentDate) => DX.formatDate(requirePaymentDate, 'DD/MM/YYYY'),
			sorter: (a, b) => moment(a.requirePaymentDate).unix() - moment(b.requirePaymentDate).unix(),
			width: 220,
		},
		{
			title: tField('paymentStatus'),
			dataIndex: 'statusSort',
			render: (value, record) => {
				const tagInfo = BillingAdmin.tagStatus[record.status];
				if (!tagInfo) return null;
				return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: true,
			width: 220,
		},
	];

	const statusOptions = [
		{
			value: '',
			label: 'all',
		},
		{
			value: 'INIT',
			label: 'init',
		},
		{
			value: 'WAITING',
			label: 'unpaid',
		},
		{
			value: 'PAID',
			label: 'paid',
		},
		{
			value: 'FAILURE',
			label: 'paymentFailed',
		},
		{
			value: 'OUT_OF_DATE',
			label: 'outOfDate',
		},
	];
	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb type="listBilling" />
			</div>
			<br />
			<div className=" mt-5">
				<SearchCommon
					className="w-60 mr-6"
					placeholder={tField('opt_search', { field: 'billCode' })}
					onSearch={onChangeOneParam('code')}
					maxLength={100}
					defaultValue={code}
				/>
				<SearchCommon
					className="w-60 mr-6"
					placeholder="Tìm tên khách hàng"
					onSearch={onChangeOneParam('customerName')}
					maxLength={100}
					defaultValue={customerName}
				/>
				<SearchCommon
					className="w-60 mr-6"
					placeholder="Tìm tên dịch vụ"
					onSearch={onChangeOneParam('serviceName')}
					maxLength={100}
					defaultValue={serviceName}
				/>
				<Select className="w-70 mr-6" value={status} onSelect={onChangeOneParam('status')}>
					{renderOptions(
						tFilterField('prefix', 'status'),
						statusOptions.map((e) => ({
							...e,
							label: tFilterField('paymentStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>

			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
