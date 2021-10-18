import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { SaasAdmin, DX, AddonDev } from 'app/models';
import { usePagination, useLng } from 'app/hooks';
import { renderOptions } from 'app/components/Atoms';
import { Table, Switch, message, Select, Button, Tag, Modal } from 'antd';
import { AddIcon } from 'app/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import useUser from '../../../app/hooks/useUser';

const ERROR_NOT_OWN = 'error.addon.user.not.own';
const USED_ERROR = 'error.addon.still.used';

export default function () {
	const history = useHistory();
	const { pathname } = useLocation();
	const { tMessage, tButton, tField, tFilterField, tOthers } = useLng();
	const { user } = useUser();
	const [selectionRowKeys, setSelectionRowKeys] = useState([]);
	const [dirty, setDirty] = useState(false);
	const { serviceType, displayAuthorize, displayApprove, displayOptions } = AddonDev;
	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		AddonDev.getAllPagination,
		['displayStatus', 'approveStatus', 'type', 'search'],
		{
			sort: 'createdAt,desc',
		},
	);

	const [search, displayStatus, approveStatus, type] = [
		query.get('search') || '',
		query.get('displayStatus') || '',
		query.get('approveStatus') || '',
		query.get('type') || '',
		query.get('roleCreated') || '',
	];

	const onSearch = (value) => {
		onChangeOneParam('search')(value);
	};

	useEffect(() => {
		setSelectionRowKeys([]);
		setDirty(false);
	}, [search, displayStatus, approveStatus, type]);

	const updateStatus = useMutation(AddonDev.putOnOffStatus, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'display' }));
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === 'error.service.status.can.not.change') {
				message.error(tMessage('err_service_status_can_not_change'));
				refetch();
			}
		},
	});

	function handleClickSwitch(checked, record) {
		Modal.confirm({
			title:
				checked === 'VISIBLE'
					? tMessage('opt_wantToHide', { field: 'servicePackage' })
					: tMessage('opt_wantToShow', { field: 'servicePackage' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				if (checked === 'VISIBLE') checked = 'INVISIBLE';
				else checked = 'VISIBLE';
				updateStatus.mutate({
					id: record.id,
					displayedStatus: checked,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	const deletePromoMutation = useMutation(AddonDev.deleteAddon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'extraService' }));
			refetch();
			setSelectionRowKeys([]);
			setDirty(false);
		},
		onError: (e) => {
			if (e.errorCode === ERROR_NOT_OWN) return message.error(tMessage('err_NOT_OWN'));
			if (e.errorCode === USED_ERROR) return message.error(tMessage('err_NOT_OWN'));
			return message.error(tMessage('opt_badlyDeleted', { field: 'extraService' }));
		},
	});
	const handleDeletePromotion = () => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'extraService' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deletePromoMutation.mutate({ ids: [...selectionRowKeys] });
			},
			onCancel: () => {
				setSelectionRowKeys([]);
				setDirty(false);
			},
			confirmLoading: deletePromoMutation.isLoading,
		});
	};

	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectionRowKeys(selectedRowKeys);
			if (selectedRowKeys.length > 0) setDirty(true);
			else setDirty(false);
		},
		selectedRowKeys: selectionRowKeys,
		preserveSelectedRowKeys: true,
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 60,
		},
		{
			title: `${tField('shortcut_ExtraServiceName')}`,
			dataIndex: 'name',
			key: 'name',
			render: (value, record) =>
				DX.canAccessFuture2('dev/view-addon-by-dev', user.permissions) ? (
					<Button
						onClick={() => {
							history.push(`${pathname}/${record.id}/detail`);
						}}
						type="link"
						className="flex items-center"
					>
						<div className="truncate">{value}</div>
					</Button>
				) : (
					<div className="flex items-center">
						<div className="truncate">{value}</div>
					</div>
				),
			width: 260,
			sorter: {},
			ellipsis: true,
		},
		{
			title: `${tField('serviceCode')}`,
			dataIndex: 'code',
			key: 'displayed',
			width: 120,
			sorter: {},
		},
		{
			title: `${tField('serviceType')}`,
			dataIndex: 'type',
			render: (value) => tFilterField('value', `${value}`),
			sorter: {},
			width: 130,
		},
		{
			title: `${tField('display')}`,
			dataIndex: 'displayStatus',
			render: (value, record) => (
				<Switch
					checked={value === AddonDev.tagDisplay.VISIBLE.value}
					disabled={
						record.approveStatus !== 'APPROVED' ||
						!DX.canAccessFuture2('dev/change-status-addon-by-dev', user.permissions)
					}
					onChange={(_, event) => {
						handleClickSwitch(value, record);
						event.stopPropagation();
					}}
				/>
			),
			sorter: {},
			width: 120,
		},
		{
			title: `${tField('approvalStatus')}`,
			dataIndex: 'approveStatus',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				return <Tag color={tagInfo?.color}>{tFilterField('approvalStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: {},
			width: 180,
		},
		{
			title: `${tField('updateTime')}`,
			dataIndex: 'updatedTime',
			render: (updatedTime) => DX.formatDate(updatedTime, 'DD/MM/YYYY HH:mm:ss'),
			sorter: {},
			width: 170,
		},
	];

	const addonList = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'extraServiceList',
			url: '',
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={addonList} />
				{DX.canAccessFuture2('dev/create-addon', user.permissions) && (
					<Button
						className="float-right ml-auto"
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.dev.createPath('/promotion/addon/create'))}
					>
						{tButton('opt_create', { field: 'extraService' })}
					</Button>
				)}
			</div>
			<div className="flex mt-5 justify-between">
				<div className="flex gap-y-6 flex-wrap">
					<SearchCommon
						placeholder={tField('extraServiceName')}
						autoFocus
						onSearch={onSearch}
						defaultValue={search}
						maxLength={200}
						className="w-60 mr-6"
					/>
					<Select className="w-60 mr-6" value={displayStatus} onSelect={onChangeOneParam('displayStatus')}>
						{renderOptions(
							tFilterField('prefix', 'displayStatus'),
							displayOptions.map((e) => ({
								...e,
								label: tFilterField('displayStatusOptions', e.label),
							})),
						)}
					</Select>
					<Select className="w-60 mr-6" value={approveStatus} onSelect={onChangeOneParam('approveStatus')}>
						{renderOptions(
							tFilterField('prefix', 'approvalStatus'),
							displayApprove.map((e) => ({
								...e,
								label: tFilterField('approvalStatusOptions', e.label),
							})),
						)}
					</Select>
					<Select className="w-60 mr-6" value={type} onSelect={onChangeOneParam('type')}>
						{renderOptions(
							tFilterField('prefix', 'serviceType'),
							serviceType.map((e) => ({
								...e,
								label: tFilterField('serviceTypeOptions', e.label),
							})),
						)}
					</Select>
				</div>
				{DX.canAccessFuture2('dev/delete-addon-by-dev', user.permissions) && (
					<div className="">
						<div className="flex items-center">
							<span className="mr-4 inline-block">
								{tOthers('selecting')}: {selectionRowKeys?.length}
							</span>

							<Button
								inline-block
								icon={<DeleteOutlined />}
								onClick={handleDeletePromotion}
								disabled={!dirty}
							>
								{tButton('delete')}
							</Button>
						</div>
					</div>
				)}
			</div>
			<Table
				className="mt-8"
				rowSelection={
					DX.canAccessFuture2('dev/delete-addon-by-dev', user.permissions) ? { ...rowSelection } : null
				}
				columns={getColumnSortDefault(columns)}
				{...configTable}
			/>
		</div>
	);
}
