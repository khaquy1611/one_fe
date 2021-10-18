import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, message, Modal, Radio, Tree } from 'antd';
import { DX, RoleAdmin } from 'app/models';
import { validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

export default function DrawerFormRole({ type, form, refetch, unitInfo, closeForm, isModalVisible, canEdit }) {
	const nameRef = React.useRef();
	const [isDirty, setDirty] = useState(false);

	useEffect(() => {
		setDirty(false);

		if (isModalVisible && type === 'add') {
			form.setFieldsValue({
				status: 'ACTIVE',
			});
		}
		if (isModalVisible && nameRef?.current) {
			setTimeout(() => {
				nameRef.current.focus({
					cursor: 'end',
				});
			}, 50);
		}
	}, [isModalVisible, type]);

	const addMutation = useMutation(RoleAdmin.insert, {
		onSuccess: () => {
			message.success('Tạo mới vai trò thành công.');
			closeForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'displayName',
						errors: ['Vai trò đã tồn tại'],
					},
				]);
			} else if (err.errorCode === 'error.object.being.used.in.another.object') {
				form.setFields([
					{
						name: 'status',
						errors: ['Đang có tài khoản được gán vai trò, không thể chuyển trạng thái.'],
					},
				]);
			} else refetch();
		},
	});

	const updateMutation = useMutation(RoleAdmin.updateById, {
		onSuccess: () => {
			message.success('Cập nhật vai trò thành công.');
			closeForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'displayName',
						errors: ['Vai trò đã tồn tại'],
					},
				]);
			} else if (err.errorCode === 'error.object.being.used.in.another.object') {
				form.setFields([
					{
						name: 'status',
						errors: ['Đang có tài khoản được gán vai trò, không thể chuyển trạng thái.'],
					},
				]);
			} else if (err.errorCode === 'error.object.not.found') {
				message.error('Vai trò đã được xóa trước đó.');
				closeForm();
				refetch();
			} else refetch();
		},
	});

	function onFormChange() {
		let dirty;
		if (type === 'add') {
			if (trim(form.getFieldValue('displayName'))) {
				dirty = true;
			} else dirty = false;
		} else if (!DX.checkEqualsObject(unitInfo, form.getFieldValue()) && trim(form.getFieldValue('displayName')))
			dirty = true;
		else dirty = false;
		if (!dirty) {
			form.setFields([
				{
					name: 'status',
					errors: [],
				},
			]);
		}
		setDirty(dirty);
	}

	const onFinish = (values) => {
		// Add parent tree
		const parentKey = unitInfo?.treeDatas.map((x) => x.key);
		// eslint-disable-next-line no-param-reassign
		values.permissions = [...values.permissions, ...parentKey];
		if (type === 'add') {
			addMutation.mutate({
				...values,
				name: trim(values.displayName),
			});
		} else
			updateMutation.mutate({
				id: unitInfo.id,
				data: {
					...values,
					name: trim(values.displayName),
				},
			});
	};

	const onCheck = (selectedKeys) => {
		const parentKey = unitInfo?.treeDatas.map((x) => x.key);
		const permissions = [...selectedKeys, ...parentKey];
		form.setFieldsValue({
			permissions,
		});
		onFormChange();
	};

	const onCancelForm = () => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn hủy thay đổi?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Hủy',
			cancelText: 'Không',
			onOk: () => {
				closeForm();
			},
		});
	};

	return (
		<Drawer
			title={type === 'add' ? 'Thêm mới' : 'Chỉnh sửa vai trò'}
			width={650}
			onClose={closeForm}
			visible={isModalVisible}
			maskClosable={false}
			footer={
				canEdit && (
					<div className="text-right mr-2">
						<Button onClick={onCancelForm}>Hủy</Button>
						<Button
							htmlType="submit"
							type="primary"
							onClick={() => form.submit()}
							disabled={!isDirty}
							loading={type === 'add' ? addMutation.isLoading : updateMutation.isLoading}
							className="ml-4"
						>
							{type === 'add' ? 'Thêm mới' : 'Lưu'}
						</Button>
					</div>
				)
			}
		>
			{isModalVisible ? (
				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
					onValuesChange={onFormChange}
					autoComplete="off"
					disabled={!canEdit}
				>
					<Form.Item
						name="displayName"
						label="Tên vai trò"
						rules={[validateRequireInput('Tên vai trò không được bỏ trống')]}
					>
						<Input ref={nameRef} disabled={!canEdit} placeholder="vai trò" maxLength={50} />
					</Form.Item>

					<Form.Item name="status" label="Trạng thái" onch>
						<Radio.Group>
							<Radio disabled={!canEdit} value="ACTIVE">
								Hoạt động
							</Radio>
							<Radio disabled={!canEdit} value="INACTIVE">
								Không hoạt động
							</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name="permissions">
						<Tree
							disabled={!canEdit}
							checkable
							selectable={false}
							onCheck={onCheck}
							defaultCheckedKeys={unitInfo?.permissions}
							treeData={unitInfo?.treeDatas}
						/>
					</Form.Item>
					<Form.Item hidden name="portalType" />
				</Form>
			) : null}
		</Drawer>
	);
}
