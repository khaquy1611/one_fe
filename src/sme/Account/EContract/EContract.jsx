import { Table, Tag, Button, message } from 'antd';
import { usePagination, useLng, useUser } from 'app/hooks';
import { SMESubscription, DX } from 'app/models';
import { useMutation } from 'react-query';
import React, { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { Link } from 'react-router-dom';

export default function EContract() {
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('sme/view-econtract', user.permissions);

	const { tField, tFilterField, tMessage, tMenu, tOthers } = useLng();
	const { configTable, onChangeOneParam, query, getColumnSortDefault } = usePagination(
		SMESubscription.getAllPaginationEContract,
		['serviceName'],
		{
			sort: 'dateCreate,desc',
		},
	);

	const [contractName, setContractName] = useState();

	const [serviceName] = [query.get('serviceName') || ''];

	const tagStatus = {
		INIT: {
			color: '#78909C',
			text: 'init',
			value: 'INIT',
		},
		PROCCESS: {
			color: '#FFBE5B',
			text: 'processing',
			value: 'PROCCESS',
		},
		REJECT: {
			color: '#252525',
			text: 'reject',
			value: 'REJECT',
		},
		DONE: {
			color: '#50B98F',
			text: 'issued',
			value: 'DONE',
		},
	};

	const downloadMutate = useMutation(SMESubscription.downloadDetailEContract, {
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
					<Link to={CAN_VIEW && `econtract/${record.subscriptionId}/detail`} className="text-blue-400">
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
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (value, record) => (
				<AvatarWithText name={value} icon={record.icon} subName={`  ${record.pricingName}`} />
			),
			ellipsis: true,
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
								setContractName(`EContract_${record.contractNumber}`);
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
			hide: !CAN_VIEW,
		},
	];

	return (
		<div className="box-sme">
			<div className="flex justify-between items-center mb-5">
				<div className="uppercase font-bold text-gray-60 mb-4">{tMenu('econtractList')}</div>
				<SearchCommon
					className="w-1/3"
					// placeholder={tField('opt_search', { field: 'serviceName' })}
					placeholder="Tìm kiếm theo dịch vụ"
					onSearch={onChangeOneParam('serviceName')}
					maxLength={100}
					autoFocus
					defaultValue={serviceName}
				/>
			</div>
			<Table columns={getColumnSortDefault(columns.filter((x) => !x.hide))} {...configTable} />
		</div>
	);
}
