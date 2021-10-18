import React, { useState, useEffect } from 'react';
import { Table, Tag, message, Switch, Select, Button, Modal } from 'antd';
import { usePagination, useUser, useLng } from 'app/hooks';
import { useMutation } from 'react-query';
import { DX, AddonAdmin, SaasAdmin } from 'app/models';
import { useHistory, useLocation } from 'react-router-dom';
import { UrlBreadcrumb, SearchCommon, renderOptions } from 'app/components/Atoms';
import AddIcon from 'app/icons/AddIcon';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const VISIBLE = 'VISIBLE';
const INVISIBLE = 'INVISIBLE';
const APPROVED = 'APPROVED';
const ADMIN = 'ADMIN';
const ERROR_NOT_OWN = 'error.addon.user.not.own';
const NOT_OWN_ERROR = 'error.coupon.user.not.own';
const USED_ERROR = 'error.addon.still.used';

export default function AddonList() {
	const { tMessage, tButton, tField, tFilterField } = useLng();
	const [dirty, setDirty] = useState(false);
	const { user } = useUser();
	const [selectionRowKeys, setSelectionRowKeys] = useState([]);
	const { serviceType, displayAuthorize, displayApprove, displayOptions } = AddonAdmin;
	const CAN_VIEW = DX.canAccessFuture2('admin/view-addon', user.permissions);
	const CAN_CREATE = DX.canAccessFuture2('admin/create-addon', user.permissions);
	const CAN_DELETE = DX.canAccessFuture2('admin/delete-addon', user.permissions);
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('admin/update-addon-by-admin', user.permissions);
	const CAN_CHANGE_STATUS_BY_ADMIN = DX.canAccessFuture2('admin/change-status-addon-by-admin', user.permissions); // TODO

	const rootAdmin = !user.departmentId || !user.department?.provinceId;
	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		AddonAdmin.getAllPagination,
		['displayStatus', 'approveStatus', 'type', 'search', 'roleCreated'],
		{
			sort: 'createdAt,desc',
		},
	);

	const [search, displayStatus, approveStatus, type, roleCreated] = [
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
	}, [search, displayStatus, approveStatus, type, roleCreated]);

	const { pathname } = useLocation();
	const putStatusMutation = useMutation(AddonAdmin.putOnOffStatus, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'display' }));
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === NOT_OWN_ERROR) return message.error(tMessage('err_coupon_user_not_own'));
			return message.error(tMessage('opt_badlyUpdated', { field: 'status' }));
		},
	});
	const handleClickSwitch = (checked, record) => {
		Modal.confirm({
			title: checked === VISIBLE ? tMessage('opt_wantToHide') : tMessage('opt_wantToShow'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				let value = '';
				if (checked === VISIBLE) value = INVISIBLE;
				else value = VISIBLE;
				putStatusMutation.mutate({
					id: record.id,
					displayedStatus: value,
				});
			},
			confirmLoading: putStatusMutation.isLoading,
		});
	};
	const history = useHistory();
	const deletePromoMutation = useMutation(AddonAdmin.deleteAddon, {
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
			title: `${tMessage('opt_wantToDelete', { field: 'extraService' })}`,
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
		onChange: (selectedRowKeys) => {
			setSelectionRowKeys(selectedRowKeys);
			if (selectedRowKeys.length > 0) setDirty(true);
			else setDirty(false);
		},
		getCheckboxProps: (record) => ({
			disabled: record.portalType === 'DEV' || (!rootAdmin && record.adminType === 'TOTAL_ADMIN'),
		}),
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
			title: tField('shortcut_ExtraServiceName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) => (
				<Button
					type="link"
					disabled={!CAN_VIEW}
					onClick={() => {
						history.push(`${pathname}/${record.id}/detail`);
					}}
					className="flex items-center p-0 m-0"
				>
					<div className="truncate">{value}</div>
				</Button>
			),
			width: 260,
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('serviceCode'),
			dataIndex: 'code',
			key: 'displayed',
			width: 120,
			sorter: {},
		},
		{
			title: tField('serviceType'),
			dataIndex: 'type',
			render: (value) => tFilterField('value', `${value}`),
			sorter: {},
			width: 130,
		},
		{
			title: tField('display'),
			dataIndex: 'displayStatus',
			render: (value, record) => (
				<Switch
					checked={value === AddonAdmin.tagDisplay.VISIBLE.value}
					disabled={
						!CAN_CHANGE_STATUS_BY_ADMIN ||
						record.approveStatus !== APPROVED ||
						record.portalType !== ADMIN ||
						(!rootAdmin && record.adminType === 'TOTAL_ADMIN')
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
			title: tField('approvalStatus'),
			dataIndex: 'approveStatus',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				return <Tag color={tagInfo?.color}>{tFilterField('approvalStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: {},
			width: 180,
		},
		{
			title: tField('updateTime'),
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
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={addonList} />
				{CAN_CREATE && (
					<Button
						className="float-right ml-auto"
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.admin.createPath('/promotion/addon/create'))}
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
					<Select className="w-60 mr-6" value={roleCreated} onSelect={onChangeOneParam('roleCreated')}>
						{renderOptions(
							tFilterField('prefix', 'permission'),
							displayAuthorize.map((e) => ({
								...e,
								label: tFilterField('permissionOptions', e.label),
							})),
						)}
					</Select>
				</div>
				{CAN_DELETE && (
					<div className="">
						<div className="flex items-center">
							<span className="mr-4 inline-block">Đang chọn: {selectionRowKeys?.length}</span>
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
				rowSelection={CAN_DELETE && { ...rowSelection }}
				columns={getColumnSortDefault(columns)}
				{...configTable}
			/>
		</div>
	);
}
