import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Select, Switch, Table } from 'antd';
import { renderOptions } from 'app/components/Atoms';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { useLng, usePagination, useUser } from 'app/hooks';
import { AddIcon, DeleteIcon } from 'app/icons';
import { DX } from 'app/models';
import DepartmentDev from 'app/models/DepartmentDev';
import React from 'react';
import { useMutation } from 'react-query';
import { Link, useHistory } from 'react-router-dom';

export default function ListDepartment({ type = 'dev' }) {
	const { user } = useUser();
	function checkAdmin(record, typeDepartment) {
		if (user.department?.provinceId && type === 'admin') {
			if (
				(user.department?.provinceId !== record.childProvinceId && typeDepartment === 'children') ||
				(user.department?.provinceId !== record.parentProvinceId && typeDepartment === 'parent')
			)
				return false;
			return true;
		}
		return true;
	}
	const CAN_UPDATE =
		(type === 'admin' && DX.canAccessFuture2('admin/update-department', user.permissions)) ||
		(type === 'dev' && DX.canAccessFuture2('dev/update-department', user.permissions)) ||
		(type === 'sme' && DX.canAccessFuture2('sme/update-department', user.permissions));
	const CAN_VIEW =
		(type === 'admin' && DX.canAccessFuture2('admin/view-department', user.permissions)) ||
		(type === 'dev' && DX.canAccessFuture2('dev/view-department', user.permissions)) ||
		(type === 'sme' && DX.canAccessFuture2('sme/view-department', user.permissions));

	const { tButton, tMessage, tField, tFilterField, tMenu } = useLng();
	const history = useHistory();
	const {
		configTable,
		page,
		pageSize,
		refetch,
		query,
		onChangeOneParam,
		getParamNull,
	} = usePagination(DepartmentDev.getAllPagination, ['search', 'status', 'parentName']);
	const [search, status, parentName] = [
		query.get('search') || '',
		getParamNull('status'),
		query.get('parentName') || '',
	];
	const typeDeportal = type ? type.toUpperCase() : 'DEV';

	const updateStatus = useMutation(DepartmentDev.updateStatus, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'department' }));
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === 'error.department.active.employee') {
				message.error(tMessage('err_inactive_department_not_create_turnOff'));
			} else if (e.errorCode === 'error.department.active.sub.department') {
				message.error(tMessage('err_department_active_sub_department'));
			} else if (e.errorCode === 'error.parent.department.inactive') {
				message.error(tMessage('err_parent_department_inactive'));
			} else if (e.status === 404) {
				message.error(tMessage('err_400_department'));
				refetch();
			}
		},
	});
	const deleteRecord = useMutation(DepartmentDev.deleteDepartmentById, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'department' }));
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === 'error.department.has.child') {
				message.error(tMessage('err_department_child'));
			} else if (e.errorCode === 'error.department.active') {
				message.error(tMessage('err_inactive_department_not_create_delete'));
			} else if (e.status === 404) {
				message.error(tMessage('err_400_department'));
				refetch();
			}
		},
	});

	function handleDelete(checked, record) {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'department' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deleteRecord.mutate({
					id: record.id,
					portalType: typeDeportal,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	}
	function handleClickSwitch(checked, record) {
		Modal.confirm({
			title: tMessage('opt_wantToChange', { field: 'departmentStatus' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				if (checked === 'ACTIVE') checked = 'INACTIVE';
				else checked = 'ACTIVE';
				updateStatus.mutate({
					id: record.id,
					status: checked,
					portalType: typeDeportal,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	const columns = [
		{
			title: type === 'sme' ? tField('ordinalNumbers') : '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: tField('departmentCode'),
			dataIndex: 'code',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('departmentName'),
			dataIndex: 'name',
			sorter: {},
			render: (text, record) =>
				CAN_VIEW && checkAdmin(record, 'children') ? (
					<Link to={`department/${record.id}`}>{record.name}</Link>
				) : (
					record.name
				),
			ellipsis: true,
		},
		{
			title: tField('parentDepartmentName'),
			dataIndex: 'parentName',
			sorter: {},
			render: (text, record) =>
				CAN_VIEW && checkAdmin(record, 'parent') ? (
					<Link to={`department/${record.parentId}`}>{record.parentName}</Link>
				) : (
					record.parentName
				),
			ellipsis: true,
		},
		{
			title: tField('active'),
			dataIndex: 'status',
			render: (value, record) => (
				<Switch
					disabled={!CAN_UPDATE}
					checked={value === 'ACTIVE'}
					onClick={() => handleClickSwitch(value, record)}
				/>
			),
			sorter: {},
		},
		{
			title: type === 'sme' ? tField('updateDay') : tField('updateTime'),
			dataIndex: 'updatedTime',
			width: '12rem',
			render: (value) => DX.formatDate(value, 'DD/MM/YYYY'),
			sorter: {},
		},
		{
			dataIndex: 'id',
			render: (value, record) => (
				<>
					<Button
						type="text "
						className="text-black p-0"
						onClick={() => handleDelete(value, record)}
						icon={type === 'sme' ? <DeleteIcon width="w-4" /> : <DeleteOutlined />}
					/>
				</>
			),
			width: '4rem',
			hide: !CAN_UPDATE,
		},
	];

	const activeOptions = [
		{
			value: null,
			label: 'all',
		},
		{
			value: 'ACTIVE',
			label: 'active',
		},
		{
			value: 'INACTIVE',
			label: 'inactive',
		},
	];

	return (
		<>
			<div className="flex justify-between">
				{type === 'sme' ? (
					<div className="uppercase font-bold mb-4 text-gray-60">{tMenu('departmentList')}</div>
				) : (
					<UrlBreadcrumb type="DepartmentList" />
				)}
				{CAN_UPDATE && (
					<Button
						type="primary"
						icon={type !== 'sme' ? <AddIcon width="w-4" /> : null}
						onClick={() => history.push('department/register')}
					>
						{tButton('opt_create', { field: 'department' })}
					</Button>
				)}
			</div>
			<div className="flex gap-5 my-5">
				<SearchCommon
					className="w-1/3"
					placeholder={tField('departmentName_Code')}
					onSearch={(value) => {
						onChangeOneParam('search')(value);
					}}
					maxLength={100}
					defaultValue={search}
				/>

				<SearchCommon
					className="w-1/3"
					placeholder={tField('parentDepartmentName')}
					onSearch={(value) => {
						onChangeOneParam('parentName')(value);
					}}
					maxLength={100}
					defaultValue={parentName}
				/>
				<Select className="w-1/3" value={status} onSelect={onChangeOneParam('status')}>
					{renderOptions(
						tFilterField('prefix', 'activeStatus'),
						activeOptions.map((e) => ({
							...e,
							label: tFilterField('activeStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>

			<Table columns={columns.filter((x) => !x.hide)} {...configTable} />
		</>
	);
}
