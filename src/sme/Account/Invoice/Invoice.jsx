import { Table, Tag, Select } from 'antd';
import { renderOptions } from 'app/components/Atoms';
import { usePagination, useLng, useUser } from 'app/hooks';
import { DX, BillingPortal } from 'app/models';
import React from 'react';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import moment from 'moment';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { Link } from 'react-router-dom';

export default function Subcription() {
	const { tField, tFilterField, tMenu } = useLng();
	const { user } = useUser();
	const { page, pageSize, configTable, onChangeOneParam, query, getColumnSortDefault } = usePagination(
		BillingPortal.getAllPagination,
		['status', 'code', 'serviceName'],
		{
			sort: 'createdAt,desc',
		},
	);

	const [status, code, serviceName] = [
		query.get('status') || '',
		query.get('code') || '',
		query.get('serviceName') || '',
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
				DX.canAccessFuture2('sme/view-invoice', user.permissions) ? (
					<Link to={`invoice/${record.id}`} className="text-blue-400">
						{value}
					</Link>
				) : (
					value
				),
			sorter: (a, b) => a.code?.localeCompare(b.code),
			width: 150,
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
		},
		{
			align: 'center',
			title: tField('paymentStatus'),
			dataIndex: 'statusSort',
			render: (value, record) => {
				const tagInfo = BillingPortal.tagStatus[record.status];
				if (!tagInfo) return null;
				return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: true,
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
		<div className="box-sme">
			<div className="flex justify-between">
				<div className="uppercase font-bold text-gray-60">{tMenu('billList')}</div>
			</div>
			<div className="flex gap-5 my-5">
				<SearchCommon
					className="w-1/3"
					placeholder={tField('opt_search', { field: 'billCode' })}
					onSearch={onChangeOneParam('code')}
					maxLength={100}
					defaultValue={code}
				/>
				<SearchCommon
					className="w-1/3"
					placeholder={tField('opt_search', { field: 'serviceName' })}
					onSearch={onChangeOneParam('serviceName')}
					maxLength={100}
					defaultValue={serviceName}
				/>
				<Select className="w-1/3" value={status} onSelect={onChangeOneParam('status')}>
					{renderOptions(
						tFilterField('prefix', 'status'),
						statusOptions.map((e) => ({
							...e,
							label: tFilterField('paymentStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>

			<Table columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
