import { Table, Tag, Button, message } from 'antd';
import { usePagination, useLng } from 'app/hooks';
import { AdminSubscription, DX } from 'app/models';
import { useMutation } from 'react-query';
import React, { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { Link } from 'react-router-dom';
import { UrlBreadcrumb } from 'app/components/Atoms';
import useUser from '../../app/hooks/useUser';

export default function EContract() {
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('admin/view-econtract', user.permissions);
	const { tField, tFilterField, tMessage, tMenu, tOthers } = useLng();
	const { page, pageSize, configTable, onChangeOneParam, query, getColumnSortDefault } = usePagination(
		AdminSubscription.getAllPaginationEContract,
		['serviceName', 'searchKey'],
		{
			sort: 'dateCreate,desc',
		},
	);

	const [serviceName, searchKey] = [query.get('serviceName') || '', query.get('searchKey') || ''];

	const tagStatus = {
		INIT: {
			color: 'default',
			text: 'init',
			value: 'INIT',
		},
		PROCCESS: {
			color: 'processing',
			text: 'processing',
			value: 'PROCCESS',
		},
		REJECT: {
			color: 'error',
			text: 'reject',
			value: 'REJECT',
		},
		DONE: {
			color: 'success',
			text: 'issued',
			value: 'DONE',
		},
	};

	const downloadMutate = useMutation(AdminSubscription.downloadDetailEContract, {
		onSuccess: (res) => {
			const filename = `EContract.pdf`;
			DX.exportFile(res, filename);
		},
		onError: () => {
			message.error(tMessage('opt_badlyGetEcontract'));
		},
	});

	const columns = [
		// {
		// 	title: '#',
		// 	dataIndex: 'id',
		// 	key: 'id',
		// 	render: (value, item, index) => (page - 1) * pageSize + index + 1,
		// 	width: 90,
		// },
		{
			title: tField('eContractCode'),
			dataIndex: 'contractNumber',
			render: (value, record) =>
				value ? (
					<Link to={CAN_VIEW && `list/${record.subscriptionId}/detail`} className="text-blue-400">
						{value}
					</Link>
				) : (
					<>{tOthers('econtractWaittingTitle')}</>
				),
			width: 150,
			sorter: {},
		},

		{
			title: tField('eContractName'),
			dataIndex: 'contractName',
			render: (value) => value || tOthers('econtractWaittingTitle'),
			ellipsis: true,
			sorter: {},
		},

		{
			title: tField('subscriptionCode'),
			dataIndex: 'subscriptionCode',
			ellipsis: true,
			// className: 'text-right text-right-important',
			width: 150,
			sorter: false,
		},
		{
			title: 'Thông tin khách hàng',
			dataIndex: 'tenToChuc',
			render: (value, record) => (
				<>
					<div className="truncate">{record.tenToChuc}</div>
					<span className="text-sm text-gray-400">{record.sdt}</span>
				</>
			),
			sorter: {},
		},
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (value, record) => (
				<AvatarWithText name={value} icon={record.icon} subName={`${record.pricingName}`} />
			),
			sorter: {},
		},
		{
			align: 'center',
			title: tField('status'),
			dataIndex: 'status',
			render: (value) => {
				const tagInfo = tagStatus[value] || { color: 'default', text: 'init', value: 'INIT' };
				return <Tag color={tagInfo?.color}>{tFilterField('econtractStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: {},
			width: 150,
		},
		{
			align: 'center',
			title: '',
			dataIndex: 'code',
			render: (value, record) =>
				record.status !== 'INIT' ? (
					<>
						<Button
							size="small"
							loading={downloadMutate.isLoading}
							disabled={downloadMutate.isLoading}
							onClick={() => {
								downloadMutate.mutate(record.subscriptionId);
							}}
							icon={<DownloadOutlined />}
							type="text"
						/>
					</>
				) : (
					<></>
				),
			sorter: false,
			width: 60,
		},
	];

	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb type="listEContract" />
			</div>
			<br />
			<div className=" mt-5">
				<SearchCommon
					className="w-72 mr-8"
					placeholder="Khách hàng"
					onSearch={(value) => {
						onChangeOneParam('searchKey')(value);
					}}
					maxLength={100}
					defaultValue={searchKey}
				/>
				<SearchCommon
					className="w-72"
					// placeholder={tField('opt_search', { field: 'serviceName' })}
					placeholder="Tìm kiếm theo dịch vụ"
					onSearch={onChangeOneParam('serviceName')}
					maxLength={100}
					autoFocus
					defaultValue={serviceName}
				/>
			</div>

			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
