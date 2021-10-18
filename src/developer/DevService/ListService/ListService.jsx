import { Table, Tag, Switch, message, Select, Button, Modal } from 'antd';
import { usePagination, useLng, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { DX, SaasDev, SaasAdmin } from 'app/models';
import React from 'react';
import { useMutation } from 'react-query';
import { renderOptions, SearchCommon, UrlBreadcrumb, AvatarWithText } from 'app/components/Atoms';
import { useHistory } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export default function ServiceList() {
	const history = useHistory();
	const { tButton, tMessage, tFilterField, tField } = useLng();
	const { user } = useUser();

	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		SaasDev.getAllPagination,
		['name', 'status', 'displayed'],
		{
			sort: 'updatedTime,desc',
			status: 'UNSET',
			displayed: 'UNSET',
		},
	);
	const [name, displayed, status] = [
		query.get('name') || '',
		query.get('displayed') || 'UNSET',
		query.get('status') || 'UNSET',
	];
	const updateStatus = useMutation(SaasDev.updateStatus, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetch();
		},
	});

	const handleClickSwitch = (checked, record) => {
		Modal.confirm({
			title:
				checked === 'VISIBLE'
					? tMessage('opt_wantToHide', { field: 'service' })
					: tMessage('opt_wantToShow', { field: 'service' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				let value = '';
				if (checked === 'VISIBLE') value = 'INVISIBLE';
				else value = 'VISIBLE';
				updateStatus.mutate({
					id: record.id,
					status: value,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 100,
		},
		{
			title: `${tField('serviceName')}`,
			dataIndex: 'name',
			key: 'name',
			render: (value, record) =>
				DX.canAccessFuture2('dev/view-service', user.permissions) ? (
					<AvatarWithText
						name={value}
						icon={record.icon || record.externalLink}
						linkTo={DX.dev.createPath(`/service/list/${record.id}`)}
					/>
				) : (
					<AvatarWithText name={value} icon={record.icon} />
				),
			sorter: {},
			ellipsis: true,
		},
		{
			title: `${tField('display')}`,
			dataIndex: 'displayed',
			key: 'displayed',
			render: (value, record) => (
				<Switch
					checked={value === SaasAdmin.tagDisplay.VISIBLE.value}
					disabled={
						record.status !== 'APPROVED' ||
						!DX.canAccessFuture2('dev/change-status-service', user.permissions)
					}
					onClick={() => handleClickSwitch(value, record)}
				/>
			),
			sorter: {},
		},
		{
			title: `${tField('approvalStatus')}`,
			dataIndex: 'status',
			key: 'status',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				const { icon: Icon } = tagInfo;
				if (!Icon) return null;
				return (
					<Tag color={tagInfo?.color} icon={<Icon />}>
						{tFilterField('approvalStatusOptions', tagInfo?.text)}
					</Tag>
				);
			},
			sorter: {},
		},
		{
			title: `${tField('updateTime')}`,
			dataIndex: 'updatedTime',
			key: 'updatedTime',
			render: (updatedTime) => DX.formatDate(updatedTime, 'DD/MM/YYYY HH:mm:ss'),
			sorter: {},
		},
	];

	const onSearch = (value) => {
		onChangeOneParam('name')(value);
	};

	return (
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb type="listService" />
				{DX.canAccessFuture2('dev/create-service', user.permissions) && (
					<Button
						className="float-right ml-auto mr-3"
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.dev.createPath('/service/register'))}
					>
						{tButton('opt_create', { field: 'service' })}
					</Button>
				)}
			</div>
			<div className="flex mt-5 gap-6">
				<SearchCommon
					className="w-60 mr-6"
					placeholder={tField('opt_search', { field: 'service' })}
					onSearch={onSearch}
					autoFocus
					defaultValue={name}
					maxLength={50}
				/>
				<Select className="w-60 mr-6" value={displayed} onSelect={onChangeOneParam('displayed')}>
					{renderOptions(
						tFilterField('prefix', 'displayStatus'),
						SaasAdmin.displayOptions.map((e) => ({
							...e,
							label: tFilterField('displayStatusOptions', e.label),
						})),
					)}
				</Select>
				<Select className="w-60 mr-6" value={status} onSelect={onChangeOneParam('status')}>
					{renderOptions(
						tFilterField('prefix', 'approvalStatus'),
						SaasAdmin.approvalStatusOptions.map((e) => ({
							...e,
							label: tFilterField('approvalStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>

			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
