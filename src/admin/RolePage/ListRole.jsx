import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, message, Modal, Select, Switch, Table, Tag } from 'antd';
import { renderOptions, SearchCommon, UrlBreadcrumb } from 'app/components/Atoms';
import { useLng, usePagination, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { DX, RoleAdmin } from 'app/models';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import DrawerFormRole from './DrawerFormRole';

export default function ListRole({ portalType = 'ADMIN', breadcrumbType }) {
	const { user } = useUser();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [type, setType] = useState('add');
	const [allowEdit, setAllowEdit] = useState(true);
	const [unitInfo, setUnitInfo] = useState();
	const [defaultPermissions, setDefaultPermissions] = useState();
	const { tField, tFilterField } = useLng();
	const { page, pageSize, configTable, refetch, getColumnSortDefault, query, onChangeOneParam } = usePagination(
		RoleAdmin.getAllPagination,
		['status', 'displayName'],
		{
			sort: 'createdAt,desc',
			portalType,
		},
	);
	const statusOptions = [
		{
			value: '',
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
	const [status, displayName] = [query.get('status') || '', query.get('displayName') || ''];

	const getDefaultPermissionsInfo = useMutation(RoleAdmin.getPermissions, {
		onSuccess: (data) => {
			setDefaultPermissions(data);
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') message.error('Danh sách chức năng không tìm thấy');
			refetch();
		},
	});
	useEffect(() => {
		getDefaultPermissionsInfo.mutate(portalType);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [portalType]);

	const caculateTreeData = (data) => {
		const selected = [];
		const nodes = [];
		data?.permissions?.forEach((per) => {
			let hasChecked = false;
			per.subPermissions.forEach((child) => {
				if (child.checked === 'YES') {
					selected.push(child.id);
					hasChecked = true;
				}
			});
			// if (hasChecked) {
			// 	selected.push(per.id);
			// }
		});
		data?.defaultPermissions?.forEach((per) => {
			const model = {
				title: per.name,
				key: per.id,
				children: [],
			};
			per.subPermissions.forEach((child) => {
				model.children.push({
					title: child.name,
					key: child.id,
				});
			});
			if (model.children.length > 0) {
				nodes.push(model);
			}
		});
		return {
			...data,
			permissions: selected,
			treeDatas: nodes,
		};
	};

	const getUnitInfo = useMutation(RoleAdmin.getOneById, {
		onSuccess: (data) => {
			const model = caculateTreeData({ ...data, portalType, defaultPermissions });
			setUnitInfo(model);
			form.setFieldsValue(model);
			setIsModalVisible(true);
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') message.error('Vai trò đã được xóa trước đó.');
			refetch();
		},
	});

	const updateStatus = useMutation(RoleAdmin.updateStatus, {
		onSuccess: () => {
			message.success('Cập nhật thành công');
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') message.error('Vai trò đã được xóa trước đó.');
			refetch();
		},
	});

	const handleClickSwitch = (checked, record) => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn thay đổi trạng thái hiển thị?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				let value = '';
				if (checked === 'ACTIVE') value = 'INACTIVE';
				else value = 'ACTIVE';
				updateStatus.mutate({
					id: record.id,
					body: {
						status: value,
					},
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	};
	// const deleteUnit = useMutation(RoleAdmin.deleteById, {
	// 	onSuccess: () => {
	// 		message.success('Xóa vai trò thành công');
	// 		refetch();
	// 	},
	// 	onError: (err) => {
	// 		// eslint-disable-next-line default-case
	// 		switch (err.errorCode) {
	// 			case 'error.object.used':
	// 				message.error('Vai trò đã được sử dụng nên không thể xóa.');
	// 				break;
	// 			case 'error.object.not.found':
	// 				message.error('Vai trò đã được xóa trước đó.');
	// 				refetch();
	// 				break;
	// 		}
	// 	},
	// });

	// function handleClickDelete(record) {
	// 	if (record?.allowDelete === 'NO') {
	// 		message.warning('Vai trò đã được sử dụng nên không thể xóa.');
	// 		return;
	// 	}
	// 	Modal.confirm({
	// 		title: 'Bạn có chắc chắn muốn xóa vai trò này không?',
	// 		icon: <ExclamationCircleOutlined />,
	// 		okText: 'Xác nhận',
	// 		cancelText: 'Hủy',
	// 		onOk: () => {
	// 			deleteUnit.mutate(`deleted/${record.id}`);
	// 		},
	// 		confirmLoading: updateStatus.isLoading,
	// 	});
	// }
	const handleClickEdit = (record) => {
		setType('edit');
		setAllowEdit(record.allowEdit === 'YES');
		getUnitInfo.mutate(record.id);
	};
	const handleClickAdd = () => {
		setType('add');
		setAllowEdit(true);
		if (defaultPermissions) {
			const model = caculateTreeData({
				status: 'ACTIVE',
				permissions: null,
				portalType,
				defaultPermissions,
				allowEdit: 'YES',
			});
			setUnitInfo(model);
			form.setFieldsValue(model);
			setIsModalVisible(true);
		}
	};

	const closeForm = () => {
		setIsModalVisible(false);
		form.resetFields();
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (text, record, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: 'Vai trò',
			dataIndex: 'displayName',
			render: (value, record) =>
				(DX.canAccessFuture2('admin/view-admin-role', user.permissions) && portalType === 'ADMIN') ||
				(DX.canAccessFuture2('admin/view-dev-role', user.permissions) && portalType === 'DEV') ||
				(DX.canAccessFuture2('admin/view-sme-role', user.permissions) && portalType === 'SME') ? (
					<Button className="p-0 m-0" type="link" onClick={() => handleClickEdit(record)}>
						{value}
						{record.allowEdit === 'NO' && (
							<Tag className="ml-4" color="#f50">
								<small>Hệ thống</small>
							</Tag>
						)}
					</Button>
				) : (
					<>
						{value}
						{record.allowEdit === 'NO' && (
							<Tag className="ml-4" color="#f50">
								<small>Hệ thống</small>
							</Tag>
						)}
					</>
				),

			sorter: {},
		},
		{
			title: 'Trạng thái hoạt động',
			dataIndex: 'status',
			key: 'status',
			render: (value) =>
				value === 'ACTIVE' ? <Tag color="success">Hoạt động</Tag> : <Tag color="default">Không hoạt động</Tag>,
			align: 'center',
			sorter: {},
			width: '12rem',
		},
		// {
		// 	title: 'Hành động',
		// 	key: 'action',
		// 	render: (value, record) => (
		// 		<Button className="ml-4" type="text" onClick={() => handleClickDelete(record)}>
		// 			<DeleteOutlined />
		// 		</Button>
		// 	),
		// 	width: '8rem',
		// },
	];

	return (
		<div>
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type={breadcrumbType} />
				<Button
					className="float-right ml-auto"
					type="primary"
					hidden={
						(!DX.canAccessFuture2('admin/update-admin-role', user.permissions) && portalType === 'ADMIN') ||
						(!DX.canAccessFuture2('admin/update-dev-role', user.permissions) && portalType === 'DEV') ||
						(!DX.canAccessFuture2('admin/update-sme-role', user.permissions) && portalType === 'SME')
					}
					onClick={() => {
						handleClickAdd();
					}}
					icon={<AddIcon width="w-4" />}
				>
					Thêm mới
				</Button>
			</div>

			<div className=" mt-5">
				<SearchCommon
					className="w-60 mr-6"
					placeholder={tField('opt_search', { field: 'role' })}
					onSearch={onChangeOneParam('displayName')}
					maxLength={100}
					defaultValue={displayName}
				/>

				<Select className="w-70 mr-6" value={status} onSelect={onChangeOneParam('status')}>
					{renderOptions(
						tFilterField('prefix', 'status'),
						statusOptions.map((e) => ({
							...e,
							label: tFilterField('activeStatusOptions', e.label),
						})),
					)}
				</Select>
			</div>
			<br />
			<Table columns={getColumnSortDefault(columns)} {...configTable} />
			<DrawerFormRole
				portalType={portalType}
				type={type}
				form={form}
				refetch={refetch}
				unitInfo={unitInfo}
				canEdit={
					((DX.canAccessFuture2('admin/update-admin-role', user.permissions) && portalType === 'ADMIN') ||
						(DX.canAccessFuture2('admin/update-dev-role', user.permissions) && portalType === 'DEV') ||
						(DX.canAccessFuture2('admin/update-sme-role', user.permissions) && portalType === 'SME')) &&
					allowEdit
				}
				closeForm={closeForm}
				isModalVisible={isModalVisible}
			/>
		</div>
	);
}
