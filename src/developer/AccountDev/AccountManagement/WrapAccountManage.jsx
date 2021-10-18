import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Form, message, Modal, Switch as SwitchAntd, Tag } from 'antd';
import { AvatarWithText } from 'app/components/Atoms';
import { useLng, usePagination } from 'app/hooks';
import { DX, Users } from 'app/models';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';
import useUser from '../../../app/hooks/useUser';
import AccountManage from './AccountManage';

const { confirm } = Modal;

function WrapAccountManage() {
	const [form] = Form.useForm();
	const { user } = useUser();
	const { pathname } = useLocation();
	const { tButton, tMessage, tValidation, tField, tFilterField, tOthers } = useLng();

	const {
		data: { content, total },
		page,
		pageSize,
		isFetching,
		refetch,
		configTable,
		getColumnSortDefault,
	} = usePagination(Users.getListAccountDevAdmin(DX.dev.role));

	const [visibleModal, setVisibleModal] = useState(false);

	function handleModal() {
		setVisibleModal(true);
	}

	const handleSuccess = (action, field) => () => {
		setVisibleModal(false);
		form.resetFields();
		refetch();
		message.success(tMessage(action, { field }));
	};

	// cập nhật tk
	const updateStatusMutation = useMutation(Users.activeStatusByDevAdmin, {
		onSuccess: handleSuccess('opt_successfullyUpdated', 'status'),
		onError: () => message.error(tMessage('opt_badlyCreated', { field: 'acc' })),
	});

	// tạo tk
	const addMutation = useMutation(Users.insertDevAdmin, {
		onSuccess: handleSuccess('opt_successfullyCreated', 'acc'),
		onError: (res) => {
			message.error(tMessage('opt_badlyCreated', { field: 'acc' }));

			if (res?.field === 'email' && res?.errorCode === 'exists') {
				form.setFields([
					{
						name: 'email',
						errors: [tValidation('opt_isDuplicated', { field: 'email' })],
					},
				]);
			} else if (res?.field === 'phoneNumber' && res?.errorCode === 'exists') {
				// chuyển tới form có input phone
				form.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else if (res.errorCode === 'error.user.techId') {
				form.setFields([
					{
						name: 'techId',
						errors: [tValidation('opt_isDuplicated', { field: 'TechID' })],
					},
				]);
			}
		},
	});

	const onFinish = (values) => {
		const data = { ...values };
		data.createType = data.createType === '0' ? 0 : 1;
		data.status = data.status ? 'ACTIVE' : 'INACTIVE';
		data.phoneNumber = data.phoneNumber === '' ? null : data.phoneNumber;
		addMutation.mutate(data);
	};

	const showPromiseUpdateStatusConfirm = (values) => {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'status' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => updateStatusMutation.mutate(values),
			confirmLoading: updateStatusMutation.isLoading,
		});
	};

	const handleChangeStatus = (status, record) => {
		showPromiseUpdateStatusConfirm({
			id: record.id,
			status: status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE',
		});
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 120,
		},
		{
			title: `${tField('userName')}`,
			dataIndex: 'name',
			key: 'name',
			render: (value, record) =>
				DX.canAccessFuture2('dev/list-sub-dev-account', user.permissions) ? (
					<AvatarWithText name={value} icon={record.avatar} linkTo={`${pathname}/${record.id}`} />
				) : (
					<AvatarWithText name={value} icon={record.avatar} />
				),
			sorter: true,
			ellipsis: true,
		},
		{
			title: `${tField('email')}`,
			dataIndex: 'email',
			key: 'email',
			sorter: true,
			ellipsis: true,
		},
		{
			title: `${tField('decentralization')}`,
			dataIndex: 'roles',
			key: 'role',
			sorter: true,
			render: (roles) =>
				roles
					.filter((x) => !DX.SYSTEM_ROLES.includes(x.id) && x.portal.find((p) => p.name === 'DEV'))
					.map((role) => role.description || tOthers(`role-${role.id}`))
					.join(', '),
			ellipsis: true,
		},
		{
			title: `${tField('status')}`,
			key: 'tags',
			dataIndex: 'status',
			render: (status) => (
				<Tag className="capitalize" color={status === 'ACTIVE' ? '#2C3D94' : 'default'}>
					{status === 'ACTIVE'
						? tFilterField('activeStatusOptions', 'active')
						: tFilterField('activeStatusOptions', 'inactive')}
				</Tag>
			),
			width: '10rem',
			sorter: true,
		},
		{
			align: 'center',
			title: `${tField('on_off_activation')}`,
			dataIndex: 'status',
			key: 'action',
			render: (status, record) => (
				<SwitchAntd
					checked={status === 'ACTIVE'}
					onChange={() => {
						handleChangeStatus(status, record);
					}}
				/>
			),
			hide: !DX.canAccessFuture2('dev/change-status-sub-dev-account', user.permissions),
			width: '12rem',
			sorter: true,
		},
	];

	return (
		<>
			<AccountManage
				columns={getColumnSortDefault(columns.filter((e) => !e.hide))}
				data={content}
				page={page}
				pageSize={pageSize}
				total={total}
				isLoading={isFetching}
				onModal={handleModal}
				visibleModal={visibleModal}
				setVisibleModal={setVisibleModal}
				form={form}
				onFinish={onFinish}
				configTable={configTable}
				// isLoadingRoles={loadingRoles}
				formLoading={updateStatusMutation.isLoading || addMutation.isLoading}
			/>
		</>
	);
}

export default WrapAccountManage;
