import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, message, Modal, Radio, Select, Switch, Table } from 'antd';
import { renderOptions, SearchCommon, UrlBreadcrumb } from 'app/components/Atoms';
import { usePagination, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { Categories, DX } from 'app/models';
import { validateRequireInput } from 'app/validator';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';

export default function ListCategory() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-service-category', user.permissions);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [typeAction, setTypeAction] = useState('');
	const [editID, setEditId] = useState();
	const { t } = useTranslation(['category']);
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const nameRef = React.useRef();
	const {
		query,
		onChangeOneParam,
		page,
		pageSize,
		configTable,
		refetch,
		getColumnSortDefault,
	} = usePagination(Categories.getAllPagination, ['displayed', 'name']);

	const [displayed] = [query.get('displayed') || 'UNSET'];

	const displayStatusOptions = [
		{
			value: 'UNSET',
			label: t('categoryList.select.statusOptions.all'),
		},
		{
			value: 'VISIBLE',
			label: t('categoryList.select.statusOptions.show'),
		},
		{
			value: 'INVISIBLE',
			label: t('categoryList.select.statusOptions.hide'),
		},
	];

	const updateStatus = useMutation(Categories.updateDisplayed, {
		onSuccess: () => {
			message.success('Cập nhật thành công');
			refetch();
		},
	});

	function handleClickSwitch(checked, record) {
		Modal.confirm({
			title:
				checked === 'VISIBLE'
					? `Bạn có chắc muốn thay đổi trạng thái hiển thị của category: ${record.name} không?`
					: `Bạn có chắc muốn thay đổi trạng thái hiển thị của category: ${record.name} không?`,
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				let value = '';
				if (checked === 'VISIBLE') value = 'INVISIBLE';
				else value = 'VISIBLE';
				updateStatus.mutate({
					id: record.id,
					displayedStatus: value,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	function editCategory(record) {
		setIsModalVisible(true);
		setTypeAction('modify');
		setEditId(record.id);
		form.setFieldsValue({
			name: record.name,
			displayedStatus: record.displayedStatus,
		});
	}
	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (text, record, index) => (page - 1) * pageSize + index + 1, // text: property, record: record.property, index: index
			width: 90,
		},
		{
			title: 'Tên danh mục',
			dataIndex: 'name',
			sorter: {},
			ellipsis: true,
		},
		{
			title: 'Thời gian cập nhật',
			dataIndex: 'updatedTime',
			sorter: {},
			ellipsis: true,
		},
		{
			title: 'Hiển thị',
			dataIndex: 'displayedStatus',
			key: 'displayed',
			render: (value, record) => (
				<Switch
					checked={value === Categories.tagDisplay.VISIBLE.value}
					disabled={!CAN_UPDATE}
					// disabled={record.status !== "APPROVED"}
					onClick={() => handleClickSwitch(value, record)}
				/>
			),
			sorter: {},
			width: '9rem',
		},
		{
			key: 'action',
			render: (text, record) => (
				<Button type="link" onClick={() => editCategory(record)}>
					Chỉnh sửa
				</Button>
			),
			width: '9rem',
			hide: !CAN_UPDATE,
		},
	];

	const addCategory = () => {
		setIsModalVisible(true);
		setTypeAction('create');
	};

	const buttonAddCategory = () => {
		if (!CAN_UPDATE) return null;
		return (
			<Button className="ml-auto" type="primary" onClick={addCategory} icon={<AddIcon width="w-4" />}>
				{t('categoryList.button.add')}
			</Button>
		);
	};

	const closeForm = () => {
		setIsModalVisible(false);
		setDirty(false);
		form.resetFields();
	};

	const handleSuccess = (messageType) => () => {
		closeForm();
		refetch();
		if (messageType === 'addSuccess') {
			message.success('Thêm danh mục thành công');
		} else {
			message.success('Chỉnh sửa danh mục thành công');
		}
	};

	const handleError = () => (res) => {
		if (res?.field === 'name' && res?.errorCode === 'exists') {
			form.setFields([
				{
					name: 'name',
					errors: ['Danh mục đã tồn tại trong hệ thống'],
				},
			]);
		}
	};

	const addMutation = useMutation(Categories.insert, {
		onSuccess: () => {
			setIsModalVisible(false);

			handleSuccess('addSuccess')();
			refetch();
		},
		onError: (err) => {
			form.setFields([
				{
					name: 'name',
					errors: ['Tên danh mục đã tồn tại'],
				},
			]);
			handleError('addError')(err);
			refetch();
		},
	});

	const updateMutation = useMutation((data) => Categories.updateById({ id: editID, data }), {
		onSuccess: () => {
			setIsModalVisible(false);
			handleSuccess('editSuccess')();
			refetch();
		},
		onError: (err) => {
			form.setFields([
				{
					name: 'name',
					errors: ['Tên danh mục đã tồn tại'],
				},
			]);
			handleError('editError')(err);
			refetch();
		},
	});

	const onFinish = (values) => {
		Modal.confirm({
			title:
				typeAction === 'modify'
					? 'Bạn có chắc chắn muốn chỉnh sửa danh mục?'
					: 'Bạn có chắc chắn muốn thêm danh mục?',
			onOk: typeAction === 'modify' ? () => updateMutation.mutate(values) : () => addMutation.mutate(values),
		});
	};

	useEffect(() => {
		if (isModalVisible && nameRef?.current) {
			setTimeout(() => {
				nameRef.current.focus({
					cursor: 'end',
				});
			}, 50);
		}
	}, [isModalVisible]);

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type="CategoryList" />
				{buttonAddCategory()}
			</div>
			<div className="flex my-5">
				<SearchCommon
					className="w-60 mr-6"
					placeholder={t('categoryList.category')}
					onSearch={onChangeOneParam('name')}
					autoFocus
					defaultValue={query.get('name')}
					maxLength={50}
				/>
				<Select onSelect={onChangeOneParam('displayed')} value={displayed} style={{ minWidth: 30 }}>
					{renderOptions(t('categoryList.select.label.status'), displayStatusOptions)}
				</Select>
			</div>
			<Table columns={getColumnSortDefault(columns.filter((column) => !column.hide))} {...configTable} />

			{isModalVisible && (
				<Drawer
					title={typeAction === 'create' ? t('categoryList.button.add') : t('categoryList.button.modify')}
					width={400}
					onClose={closeForm}
					visible={isModalVisible}
					footer={
						<div className="text-right mr-2">
							<Button onClick={closeForm}>{t('categoryList.button.cancel')}</Button>

							<Button
								htmlType="submit"
								type="primary"
								className="ml-4"
								onClick={() => form.submit()}
								disabled={!isDirty}
							>
								{t('categoryList.button.save')}
							</Button>
						</div>
					}
					maskClosable={false}
				>
					<Form
						form={form}
						layout="vertical"
						onFinish={onFinish}
						initialValues={{
							displayedStatus: 'VISIBLE',
						}}
						onValuesChange={() => !isDirty && setDirty(true)}
					>
						<Form.Item
							name="name"
							label={t('categoryList.drawer.label.name')}
							rules={[validateRequireInput('Tên danh mục không được để trống.')]}
						>
							<Input ref={nameRef} placeholder="Tên danh mục" maxLength={50} />
						</Form.Item>

						<Form.Item
							name="displayedStatus"
							label={
								<span style={{ marginBottom: '-8px' }}>{t('categoryList.drawer.label.status')}</span>
							}
						>
							<Radio.Group>
								<Radio value="VISIBLE">{t('categoryList.drawer.statusOptions.show')}</Radio>
								<Radio value="INVISIBLE">{t('categoryList.drawer.statusOptions.hide')}</Radio>
							</Radio.Group>
						</Form.Item>
					</Form>
				</Drawer>
			)}
		</>
	);
}
