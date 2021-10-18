import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, message, Modal, Radio, Switch, Table } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { usePagination, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { CategoryCurrency, DX } from 'app/models';
import { trimNormalizer } from 'app/validator/Validator';
import { pick, toUpper, trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';

export default function CurrencyPage() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-currency-category', user.permissions);
	const { t } = useTranslation(['category']);
	const [form] = Form.useForm();
	const [isDrawerVisible, setIsDrawerVisible] = useState(false);
	const [isDirty, setDirty] = useState(false);
	const [isValid, setValid] = useState(false);
	const [typeAction, setTypeAction] = useState('');
	const [unitInfo, setUnitInfo] = useState();
	const nameRef = React.useRef();
	const {
		page,
		pageSize,
		configTable,
		refetch,
		getColumnSortDefault,
	} = usePagination(CategoryCurrency.customizePagination, ['currencyType', 'status'], { sort: 'currencyType,asc' });

	useEffect(() => {
		setDirty(false);
		if (isDrawerVisible && typeAction === 'create') {
			form.setFieldsValue({
				status: 'ACTIVE',
			});
		}
		if (isDrawerVisible && nameRef?.current) {
			setTimeout(() => {
				nameRef.current.focus({
					cursor: 'end',
				});
			}, 50);
		}
	}, [isDrawerVisible]);

	const updateStatus = useMutation(CategoryCurrency.customizeUpdateDisplayed, {
		onSuccess: () => {
			message.success('Cập nhật thành công');
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') {
				message.error('Đơn vị tiền tệ đã xóa trước đó.');
				refetch();
			}
		},
	});

	const deleteUnit = useMutation(CategoryCurrency.customizeDelete, {
		onSuccess: () => {
			message.success('Xóa đơn vị tiền tệ thành công');
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.used')
				message.error('Đơn vị tiền tệ đã được sử dụng nên không thể xóa.');
			if (err.errorCode === 'error.object.not.found') {
				message.error('Đơn vị tiền tệ đã xóa trước đó.');
				refetch();
			}
		},
	});

	const handleDelBtn = (record) => {
		if (record?.allowDelete === 'NO') {
			message.warning('Đơn vị tiền tệ đã được sử dụng nên không thể xóa.');
			return;
		}
		Modal.confirm({
			title: `Bạn có chắc chắn muốn xóa đơn vị tiền tệ này không?`,
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				deleteUnit.mutate(record.id);
			},
			confirmLoading: updateStatus.isLoading,
		});
	};

	function handleClickSwitch(checked, record) {
		Modal.confirm({
			title: `Bạn có chắc chắn muốn thay đổi trạng thái hiển thị?`,
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				let value = '';
				if (checked === 'ACTIVE') value = 'INACTIVE';
				else value = 'ACTIVE';
				updateStatus.mutate({
					id: record.id,
					status: value,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	const closeForm = () => {
		setIsDrawerVisible(false);
		form.resetFields();
	};

	const handleAddEvent = () => {
		setTypeAction('create');
		setIsDrawerVisible(true);
	};

	const addCurrency = useMutation(CategoryCurrency.customizeAdd, {
		onSuccess: () => {
			message.success('Tạo mới đơn vị tiền tệ thành công.');
			closeForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'currencyType',
						errors: ['Đơn vị tiền tệ đã tồn tại'],
					},
				]);
			} else refetch();
		},
	});

	const modifyCurrency = useMutation(CategoryCurrency.customizeModify, {
		onSuccess: () => {
			message.success('Cập nhật đơn vị tiền tệ thành công.');
			closeForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'currencyType',
						errors: ['Đơn vị tiền tệ đã tồn tại'],
					},
				]);
			}

			if (err.errorCode === 'error.object.not.found') {
				closeForm();
				message.error('Đơn vị tiền tệ đã được xóa trước đó.');
				refetch();
			}
		},
	});

	const getUnitInfo = useMutation(CategoryCurrency.customizeGetDetail, {
		onSuccess: (data) => {
			form.setFieldsValue({
				...data,
			});
			setUnitInfo(data);
			setIsDrawerVisible(true);
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') {
				closeForm();
				message.error('Đơn vị tiền tệ đã được xóa trước đó.');
			}
			refetch();
		},
	});

	const handleModifyEvent = (record) => {
		setTypeAction('modify');
		setValid(true);
		getUnitInfo.mutate(record.id);
	};

	function onFormChange(_, newFormData) {
		if (typeAction === 'create') {
			// setDirty(!!newFormData.currencyType);
			setDirty(true);
		} else {
			setDirty(!DX.checkEqualsObject(pick(unitInfo, ['currencyType', 'status']), newFormData));
		}
	}

	const onFinish = (values) => {
		if (typeAction === 'create') {
			addCurrency.mutate({
				...values,
				currencyType: trim(values.currencyType),
			});
		} else {
			modifyCurrency.mutate({
				id: unitInfo.id,
				...values,
				currencyType: trim(values.currencyType),
			});
		}
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (text, record, index) => (page - 1) * pageSize + index + 1, // text: property, record: record.property, index: index
			width: 90,
		},
		{
			title: 'Đơn vị tiền tệ',
			dataIndex: 'currencyType',
			sorter: {},
			render: (value, record) =>
				CAN_UPDATE ? (
					<Button type="link" onClick={() => handleModifyEvent(record)} className="p-0">
						{value}
					</Button>
				) : (
					value
				),
			width: '48rem',
		},
		{
			title: 'Hiển thị',
			dataIndex: 'status',
			key: 'status',
			render: (value, record) => (
				<Switch
					checked={value === CategoryCurrency.tagDisplay.ACTIVE.value}
					disabled={!CAN_UPDATE}
					// disabled={record.status !== "APPROVED"}
					onClick={() => handleClickSwitch(value, record)}
				/>
			),
			align: 'center',
			sorter: {},
			width: '8rem',
		},
		{
			title: 'Hành động',
			dataIndex: 'allowDelete',
			render: (value, record) => (
				<Button type="text" onClick={() => handleDelBtn(record)} className="ml-4">
					<DeleteOutlined />
				</Button>
			),
			hide: !CAN_UPDATE,
		},
	];

	const buttonAddCurrency = () => {
		if (CAN_UPDATE) {
			return (
				<Button
					className="float-right ml-auto"
					type="primary"
					onClick={handleAddEvent}
					icon={<AddIcon width="w-4" />}
				>
					{t('categoryCurrency.button.add')}
				</Button>
			);
		}
		return <div />;
	};
	const handleChangeCurrency = (value) => {
		if (!trim(value)) {
			setValid(false);
			return form.setFields([{ name: 'currencyType', errors: ['Vui lòng không để trống mục này'] }]);
		}
		if (!/^[a-zA-Z]{1,3}$/.test(trim(value))) {
			setValid(false);
			return form.setFields([{ name: 'currencyType', errors: ['Sai định dạng đơn vị tiền tệ'] }]);
		}
		if (trim(value).length !== 3) {
			setValid(false);
			return form.setFields([{ name: 'currencyType', errors: ['Vui lòng nhập đủ 3 ký tự chữ'] }]);
		}
		setValid(true);
		return form.setFields([{ name: 'currencyType', errors: [] }]);
	};

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type="CategoryCurrency" />
				{buttonAddCurrency()}
			</div>
			<Table columns={getColumnSortDefault(columns.filter((column) => !column.hide))} {...configTable} />

			{isDrawerVisible && (
				<Drawer
					title={
						typeAction === 'create'
							? t('categoryCurrency.drawer.title.add')
							: t('categoryCurrency.drawer.title.modify')
					}
					width={400}
					onClose={closeForm}
					visible
					footer={
						<div className="text-right mr-2">
							<Button onClick={closeForm}>{t('categoryCurrency.button.cancel')}</Button>
							<Button
								htmlType="submit"
								type="primary"
								onClick={() => form.submit()}
								disabled={!isValid || !isDirty}
								className="ml-4"
							>
								{typeAction === 'create'
									? t('categoryCurrency.button.save')
									: t('categoryCurrency.button.modify')}
							</Button>
						</div>
					}
					maskClosable={false}
				>
					<Form
						form={form}
						layout="vertical"
						onFinish={(values) =>
							onFinish({
								...values,
								currencyType: toUpper(values.currencyType),
							})
						}
						initialValues={{
							currencyType: '',
							status: 'ACTIVE',
						}}
						onValuesChange={onFormChange}
					>
						<Form.Item
							name="currencyType"
							label={t('categoryCurrency.drawer.label.name')}
							normalize={trimNormalizer}
							required
						>
							<Input
								ref={nameRef}
								className="uppercase ph-text-transform-none"
								placeholder="Đơn vị tiền tệ"
								maxLength={3}
								autoComplete="off"
								onChange={(e) => handleChangeCurrency(e.target.value)}
							/>
						</Form.Item>

						<Form.Item
							name="status"
							label={
								<span style={{ marginBottom: '-8px' }}>
									{t('categoryCurrency.drawer.label.status')}
								</span>
							}
						>
							<Radio.Group>
								<Radio value="ACTIVE">{t('categoryCurrency.drawer.statusOptions.show')}</Radio>
								<Radio value="INACTIVE">{t('categoryCurrency.drawer.statusOptions.hide')}</Radio>
							</Radio.Group>
						</Form.Item>
					</Form>
				</Drawer>
			)}
		</>
	);
}
