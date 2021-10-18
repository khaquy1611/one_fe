import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, message, Modal, Switch as SwitchAntd, Table } from 'antd';
import { SearchCommon } from 'app/components/Atoms';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { useLng, usePagination, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { DX, Users } from 'app/models';
import { trim } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { AdminForm, DevelopForm, SMEForm } from './components';

const { confirm } = Modal;
const defaultFieldsForm = {
	status: 'ACTIVE',
	email: '',
	firstname: '',
	lastname: '',
	roles: [],
};

export default function AccountAdminRoute({ type }) {
	const { pathname } = useLocation();
	const { user } = useUser();
	const { tMessage, tButton, tField, tValidation, tOthers } = useLng();
	const [form] = Form.useForm();

	const [openForm, setOpenForm] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState({});
	const [openConfirm, setOpenConfirm] = useState(false);
	const [typeAction, setTypeAction] = useState('');
	const [valueForm, setValueForm] = useState(null);

	const {
		page,
		pageSize,
		refetch,
		configTable,
		onChangeParams,
		getColumnSortDefault,
		query,
	} = usePagination(Users.getListUserByType(type), ['search']);

	const onSearch = (value) => {
		onChangeParams({ search: value });
	};

	function closeForm() {
		setOpenForm(false);
		form.resetFields();
	}

	const handleSuccess = (messageType) => () => {
		closeForm();
		refetch();
		message.success(tMessage(messageType, { field: 'acc' }));
	};

	const handleError = () => (res) => {
		if (res?.field === 'email' && res?.errorCode === 'exists') {
			form.setFields([
				{
					name: 'email',
					errors: [tValidation('opt_isDuplicated', { field: 'email' })],
				},
			]);
		} else if (res?.field === 'phoneNumber' && res?.errorCode === 'exists') {
			form.setFields([
				{
					name: 'phoneNumber',
					errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
				},
			]);
		} else if (res?.field === 'name' && res?.errorCode === 'exists') {
			form.setFields([
				{
					name: 'name',
					errors: [
						type === DX.dev.role
							? tValidation('opt_isDuplicated', { field: 'devName' })
							: tValidation('opt_isDuplicated', { field: 'enterpriseName' }),
					],
				},
			]);
		}
	};
	const addMutation = useMutation(Users.insertAdminByAdmin, {
		onSuccess: () => {
			setOpenConfirm(false);
			setOpenForm(false);
			handleSuccess('opt_successfullyCreated')();
			refetch();
		},
		onError: (err) => {
			setOpenConfirm(false);
			handleError('opt_badlyCreated')(err);
			refetch();
		},
	});

	const updateMutation = useMutation(Users.updateById, {
		onSuccess: () => {
			setOpenConfirm(false);
			setOpenForm(false);
			handleSuccess('opt_successfullyEdited')();
			refetch();
		},
		onError: (err) => {
			setOpenConfirm(false);
			handleError('opt_badlyEdit')(err);
			refetch();
		},
	});

	const updateStatusMutation = useMutation(Users.activeStatusById, {
		onSuccess: handleSuccess('opt_successfullyUpdated'),
		onError: handleError('opt_badlyEdit'),
	});

	const getInfoAccount = useMutation(Users.getInfoAccount, {
		onSuccess: (data) => {
			form.setFieldsValue({
				...data,
				roles: (data.roles || []).map((c) => c.id),
			});
			setSelectedAccount(data);
		},
		onError: handleError('opt_badlyEdit'),
	});

	function addAccount() {
		setOpenForm(true);
		form.setFieldsValue(defaultFieldsForm);
		setSelectedAccount({});
	}

	function editAccount(account) {
		setOpenForm(true);
		getInfoAccount.mutate({
			id: account.id,
			isCustomer: type !== DX.admin.role,
		});
	}

	function onFinish(values) {
		setValueForm(values);
		setOpenConfirm(true);
		if (selectedAccount.id == null) {
			setTypeAction('create');
		} else {
			setTypeAction('edit');
		}
	}

	function onFinishSubmit() {
		if (typeAction === 'create') {
			addMutation.mutate(valueForm);
		} else {
			let portal = '';
			// eslint-disable-next-line default-case
			switch (type) {
				case DX.dev.role:
					portal = 'DEV';
					break;
				case DX.sme.role:
					portal = 'SME';
					break;
			}
			updateMutation.mutate({
				id: selectedAccount.id,
				data: {
					...valueForm,
					lastname: trim(valueForm.lastname),
					firstname: trim(valueForm.firstname),
				},
				isCustomer: type !== DX.admin.role,
				portalType: portal,
			});
		}
	}

	const buttonDisplay = () => {
		if (type === DX.admin.role && DX.canAccessFuture2('admin/create-admin-account', user.permissions)) {
			return (
				<Button className="ml-auto" type="primary" onClick={addAccount} icon={<AddIcon width="w-4" />}>
					{tButton('opt_create', { field: 'acc' })}
				</Button>
			);
		}
		return <div />;
	};

	function showPromiseUpdateStatusConfirm(values) {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'status' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => updateStatusMutation.mutate(values),
			onCancel() {},
			confirmLoading: updateStatusMutation.isLoading,
		});
	}

	function handleChangeStatus(status, record) {
		showPromiseUpdateStatusConfirm({
			id: record.id,
			data: {
				status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
			},
		});
	}

	const columns = [
		{
			title: '#',
			key: 'key',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: type === DX.dev.role ? tField('devName') : tField('smeName'),
			dataIndex: 'name',
			sorter: true,
			types: [DX.sme.role],
			ellipsis: true,
			width: '12rem',
		},
		{
			title: tField('devName'),
			dataIndex: 'name',
			sorter: true,
			types: [DX.dev.role],
			ellipsis: true,
			width: '12rem',
		},
		{
			title: tField('email'),
			dataIndex: 'email',
			key: 'email',
			sorter: {},
			ellipsis: true,
			types: [DX.admin.role, DX.dev.role, DX.sme.role],
			width: '12rem',
		},

		{
			title: tField('phoneNum'),
			dataIndex: 'phoneNumber',
			key: 'phone',
			sorter: {},
			types: [DX.dev.role, DX.sme.role],
			ellipsis: true,
			width: '12rem',
		},
		{
			title: tField('name'),
			dataIndex: 'last_name',
			render: (name, record) => <div>{record.name}</div>,
			sorter: true,
			types: [DX.admin.role],
			ellipsis: true,
			width: '12rem',
		},
		{
			title: tField('decentralization'),
			dataIndex: 'roles',
			key: 'role',
			sorter: true,
			render: (roles) =>
				roles
					.filter((x) => !DX.SYSTEM_ROLES.includes(x.id))
					.map((role) => role.description || tOthers(`role-${role.id}`))
					.join(', '),
			ellipsis: true,
			types: [DX.admin.role],
			width: 'auto',
		},
		{
			title: tField('status'),
			key: 'status',
			dataIndex: 'status',
			sorter: true,
			render: (status, record) => (
				<SwitchAntd
					checked={status === 'ACTIVE'}
					onChange={() => handleChangeStatus(status, record)}
					disabled={
						record.id === user.id ||
						!DX.canAccessFuture2('admin/change-status-admin-account', user.permissions)
					}
				/>
			),
			width: '8rem',
			types: [DX.admin.role],
		},
		{
			title: tField('on_off_activation'),
			key: 'status',
			dataIndex: 'status',
			sorter: true,
			render: (status, record) => (
				<SwitchAntd
					checked={status === 'ACTIVE'}
					onChange={() => handleChangeStatus(status, record)}
					disabled={record.id === user.id}
				/>
			),
			width: '12rem',
			types: [DX.sme.role, DX.dev.role],
			hide: !DX.canAccessFuture2('admin/change-status-customer-account', user.permissions),
		},
		{
			key: 'action',
			render: (text, record) => (
				<Button type="link" onClick={() => editAccount(record)} disabled={record.id === user.id}>
					{tButton('opt_edit')}
				</Button>
			),
			width: '9rem',
			types: [DX.admin.role],
			hide: !DX.canAccessFuture2('admin/update-admin-account', user.permissions),
		},
		{
			key: 'action',
			render: (text, record) => (
				<Button onClick={() => editAccount(record)} disabled={record.id === user.id} type="link">
					{tButton('opt_edit')}
				</Button>
			),
			width: '9rem',
			types: [DX.sme.role, DX.dev.role],
			hide: !DX.canAccessFuture2('admin/update-customer-account', user.permissions),
		},
		{
			key: 'actionViewProfileDev',
			render: (text, record) => (
				<Link
					to={{
						pathname: `${pathname}/${record.id}`,
						state: { devProfileProps: record },
					}}
				>
					{tField('viewProfile')}
				</Link>
			),
			types: [DX.dev.role],
			width: '9rem',
		},
		{
			key: 'actionViewProfileSme',
			render: (text, record) => (
				<Link
					to={{
						pathname: `${pathname}/${record.id}`,
						state: { devProfileProps: record },
					}}
				>
					{tField('viewProfile')}
				</Link>
			),
			types: [DX.sme.role],
			width: '9rem',
		},
	];

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type={type} />
				{buttonDisplay()}
				<SearchCommon
					placeholder={tField('opt_search')}
					onSearch={onSearch}
					className="w-72 ml-6"
					autoFocus
					defaultValue={query.get('search')}
				/>
			</div>
			<Table
				columns={getColumnSortDefault(
					columns.filter((column) => (!column.types || column.types?.includes(type)) && !column.hide),
				)}
				{...configTable}
			/>

			{type === DX.admin.role && (
				<AdminForm
					closeForm={closeForm}
					account={selectedAccount}
					visible={openForm}
					onFinish={onFinish}
					form={form}
				/>
			)}

			{type === DX.dev.role && (
				<DevelopForm
					closeForm={closeForm}
					account={selectedAccount}
					visible={openForm}
					onFinish={onFinish}
					form={form}
				/>
			)}

			{type === DX.sme.role && (
				<SMEForm
					closeForm={closeForm}
					account={selectedAccount}
					visible={openForm}
					onFinish={onFinish}
					form={form}
				/>
			)}

			<Modal visible={openConfirm} closable={false} maskClosable={false} footer={null} width={416}>
				<div className="flex text-base">
					<div className="mr-4">
						<ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '22px' }} />
					</div>
					<div className="font-medium">
						{tMessage(typeAction === 'edit' ? 'opt_wantToEdit' : 'opt_wantToCreate', {
							field: 'accInfo',
						})}
					</div>
				</div>
				<div className="mt-6 text-right">
					<Button onClick={() => setOpenConfirm(false)}>{tButton('opt_cancel')}</Button>
					<Button
						className="ml-2"
						type="primary"
						onClick={() => onFinishSubmit()}
						loading={typeAction === 'create' ? addMutation.isLoading : updateMutation.isLoading}
					>
						{tButton('opt_confirm')}
					</Button>
				</div>
			</Modal>
		</>
	);
}

AccountAdminRoute.propTypes = {
	type: PropTypes.number.isRequired,
};
