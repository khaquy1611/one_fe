import React, { useState } from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { UnitApisAdmin, UnitApisAdminDev, DX } from 'app/models';
import { useMutation } from 'react-query';
import { AddIcon } from 'app/icons';
import { usePagination } from 'app/hooks';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Table, Switch, Modal, message, Button, Form } from 'antd';
import DrawerFormUnit from './DrawerFormUnit';
import useUser from '../../../app/hooks/useUser';

export default function ListUnitApis() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-unit-category', user.permissions);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [type, setType] = useState('add');
	const [unitInfo, setUnitInfo] = useState();

	const {
		page,
		pageSize,
		configTable,
		refetch,
		getColumnSortDefault,
	} = usePagination(UnitApisAdminDev.getAllPagination, [], { sort: 'name,asc' });

	const getUnitInfo = useMutation(UnitApisAdmin.getOneById, {
		onSuccess: (data) => {
			form.setFieldsValue({
				...data,
			});
			setUnitInfo(data);
			setIsModalVisible(true);
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') message.error('Đơn vị tính đã được xóa trước đó.');
			refetch();
		},
	});

	const updateStatus = useMutation(UnitApisAdmin.updateDisplayed, {
		onSuccess: () => {
			message.success('Cập nhật thành công');
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') message.error('Đơn vị tính đã được xóa trước đó.');
			refetch();
		},
	});

	const deleteUnit = useMutation(UnitApisAdmin.deleteById, {
		onSuccess: () => {
			message.success('Xóa đơn vị tính thành công');
			refetch();
		},
		onError: (err) => {
			// eslint-disable-next-line default-case
			switch (err.errorCode) {
				case 'error.object.used':
					message.error('Đơn vị tính đã được sử dụng nên không thể xóa.');
					break;
				case 'error.object.not.found':
					message.error('Đơn vị tính đã được xóa trước đó.');
					refetch();
					break;
			}
		},
	});

	function handleClickSwitch(checked, record) {
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
	}

	function handleClickDelete(record) {
		if (record?.allowDelete === 'NO') {
			message.warning('Đơn vị tính đã được sử dụng nên không thể xóa.');
			return;
		}
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa Đơn vị tính này không?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				deleteUnit.mutate(`deleted/${record.id}`);
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	function handleClickEdit(record) {
		setType('edit');
		getUnitInfo.mutate(record.id);
	}

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
			title: 'Đơn vị tính',
			dataIndex: 'name',
			render: (value, record) =>
				CAN_UPDATE ? (
					<Button className="p-0 m-0" type="link" onClick={() => handleClickEdit(record)}>
						{value}
					</Button>
				) : (
					value
				),
			sorter: {},
			width: '48rem',
		},
		{
			title: 'Hiển thị',
			dataIndex: 'status',
			key: 'status',
			render: (value, record) => (
				<Switch
					disabled={!CAN_UPDATE}
					checked={value === 'ACTIVE'}
					onClick={() => handleClickSwitch(value, record)}
				/>
			),
			align: 'center',
			sorter: {},
			width: '8rem',
		},
		{
			title: 'Hành động',
			key: 'action',
			render: (value, record) => (
				<Button className="ml-4" type="text" onClick={() => handleClickDelete(record)}>
					<DeleteOutlined />
				</Button>
			),
			hide: !CAN_UPDATE,
		},
	];

	return (
		<div>
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type="unitApisList" />
				{CAN_UPDATE && (
					<Button
						className="float-right ml-auto"
						type="primary"
						onClick={() => {
							setType('add');
							setIsModalVisible(true);
						}}
						icon={<AddIcon width="w-4" />}
					>
						Thêm mới
					</Button>
				)}
			</div>
			<Table columns={getColumnSortDefault(columns.filter((x) => !x.hide))} {...configTable} />
			<DrawerFormUnit
				type={type}
				form={form}
				refetch={refetch}
				unitInfo={unitInfo}
				closeForm={closeForm}
				isModalVisible={isModalVisible}
			/>
		</div>
	);
}
