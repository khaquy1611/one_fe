import { Button, Drawer, Form, Input, message, Radio } from 'antd';
import { DX, UnitApisAdmin } from 'app/models';
import { validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

export default function DrawerFormUnit({ type, form, refetch, unitInfo, closeForm, isModalVisible }) {
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
	}, [isModalVisible]);

	const addMutation = useMutation(UnitApisAdmin.insert, {
		onSuccess: () => {
			message.success('Tạo mới Đơn vị tính thành công.');
			closeForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'name',
						errors: ['Đơn vị tính đã tồn tại'],
					},
				]);
			} else refetch();
		},
	});

	const updateMutation = useMutation(UnitApisAdmin.updateById, {
		onSuccess: () => {
			message.success('Cập nhật Đơn vị tính thành công.');
			closeForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'name',
						errors: ['Đơn vị tính đã tồn tại'],
					},
				]);
			} else if (err.errorCode === 'error.object.not.found') {
				message.error('Đơn vị tính đã được xóa trước đó.');
				closeForm();
				refetch();
			} else refetch();
		},
	});

	function onFormChange() {
		if (type === 'add') {
			if (trim(form.getFieldValue('name'))) {
				setDirty(true);
			} else setDirty(false);
		} else if (!DX.checkEqualsObject(unitInfo, form.getFieldValue()) && trim(form.getFieldValue('name')))
			setDirty(true);
		else setDirty(false);
	}

	const onFinish = (values) => {
		if (type === 'add')
			addMutation.mutate({
				...values,
				name: trim(values.name),
			});
		else
			updateMutation.mutate({
				id: unitInfo.id,
				data: {
					...values,
					name: trim(values.name),
				},
			});
	};

	return (
		<Drawer
			title={type === 'add' ? 'Thêm đơn vị tính' : 'Chỉnh sửa đơn vị tính'}
			width={400}
			onClose={closeForm}
			visible={isModalVisible}
			maskClosable={false}
			footer={
				<div className="text-right mr-2">
					<Button onClick={closeForm}>Hủy</Button>
					<Button
						htmlType="submit"
						type="primary"
						onClick={() => form.submit()}
						disabled={!isDirty}
						loading={type === 'add' ? addMutation.isLoading : updateMutation.isLoading}
						className="ml-4"
					>
						{type === 'add' ? 'Tạo mới' : 'Lưu'}
					</Button>
				</div>
			}
		>
			<Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={onFormChange} autoComplete="off">
				<Form.Item
					name="name"
					label="Đơn vị tính"
					rules={[validateRequireInput('Vui lòng không bỏ trống mục này')]}
				>
					<Input ref={nameRef} placeholder="Đơn vị tính" maxLength={20} />
				</Form.Item>

				<Form.Item name="status" label="Trạng thái">
					<Radio.Group>
						<Radio value="ACTIVE">Hiển thị</Radio>
						<Radio value="INACTIVE">Ẩn</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Drawer>
	);
}
