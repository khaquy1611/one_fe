import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, message, Modal, Radio, Switch, Table } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useLng, usePagination, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { CategoryTax, DX } from 'app/models';
import { validateRequireInput } from 'app/validator';
import { pick, trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

export default function TaxPage() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-tax-category', user.permissions);
	const [form] = Form.useForm();
	const [isDrawerVisible, setIsDrawerVisible] = useState(false);
	const [typeAction, setTypeAction] = useState('');
	const [unitInfo, setUnitInfo] = useState();
	const [isDirty, setDirty] = useState(false);
	const [isVat, setIsVat] = useState(false);
	const nameRef = React.useRef();
	const { tMessage, tValidation, tField, tButton, tFilterField } = useLng();
	const { page, pageSize, configTable, refetch, getColumnSortDefault } = usePagination(
		CategoryTax.getAllPagination,
		[],
		{
			sort: 'createdAt,desc',
		},
	);

	const VISIBLE = 'VISIBLE';
	const INVISIBLE = 'INVISIBLE';
	const CREATE = 'CREATE';
	const MODIFY = 'MODIFY';
	const ISDELETED = 'YES';
	const ISVAT = 'YES';
	const LENGTHNAMETAX = 100;
	const LENGTHNOTETAX = 200;
	const ROWDESCRIPTION = 2;
	const defaultValue = {
		name: '',
		description: '',
		status: VISIBLE,
	};

	useEffect(() => {
		if (isDrawerVisible && typeAction === CREATE) {
			form.setFieldsValue({
				status: VISIBLE,
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

	const setCloseForm = () => {
		const display = false;

		setIsDrawerVisible(display);
		form.resetFields();
		setDirty(false);
		setIsVat(false);
	};

	const setAddNewTax = () => {
		const hidden = true;

		setIsDrawerVisible(hidden);
		setTypeAction(CREATE);
	};

	const updateStatus = useMutation(CategoryTax.updateStatusTax, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'tax' }));

			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') {
				message.error(tMessage('opt_isDeleted', { field: 'tax' }));
			}

			refetch();
		},
	});

	const deleteTax = useMutation(CategoryTax.deleteById, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'tax' }));

			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.used') {
				message.error(tMessage('opt_isUsed_notDeleted', { field: 'tax' }));
			} else if (err.errorCode === 'error.object.not.found') {
				message.error(tMessage('opt_isDeleted', { field: 'tax' }));
			}

			refetch();
		},
	});

	const checkAllowDelete = useMutation(CategoryTax.checkAllowDelete, {
		onSuccess: (data) => {
			const isAllowDelete = data.isDeleted === ISDELETED;

			if (isAllowDelete) {
				deleteTax.mutate(data.id);
			} else {
				message.error(tMessage('opt_isUsed_notDeleted', { field: 'tax' }));
				refetch();
			}
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') {
				message.success(tMessage('opt_isDeleted', { field: 'tax' }));
			}

			refetch();
		},
	});

	const addTax = useMutation(CategoryTax.insert, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'tax' }));
			setCloseForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.data.exists') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'tax' })],
					},
				]);
			}

			refetch();
		},
	});

	const modifyTax = useMutation((data) => CategoryTax.updateById({ id: data.id, data }), {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'tax' }));
			setCloseForm();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.data.exists') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'tax' })],
					},
				]);
			} else if (err.errorCode === 'error.object.not.found') {
				setCloseForm();
				message.error(tMessage('opt_isDeleted', { field: 'tax' }));
			} else if (err.errorCode === 'error.not.change') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isNotChangedName', { field: 'tax' })],
					},
				]);
			}

			refetch();
		},
	});

	const handleDelBtn = (record) => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'tax' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				checkAllowDelete.mutate(record.id);
			},
			confirmLoading: updateStatus.isLoading,
		});
	};

	function confirmChangeStatus(checked, record) {
		Modal.confirm({
			title: tMessage('opt_wantToUpdate', { field: 'displayStatus' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				const value = checked === VISIBLE ? INVISIBLE : VISIBLE;

				updateStatus.mutate({
					id: record.id,
					status: value,
				});
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	function displayFormModifyTax(record) {
		const isDisableTextName = record.isVat === ISVAT;

		setIsVat(isDisableTextName);
		setTypeAction(MODIFY);
		setUnitInfo(record);
		setIsDrawerVisible(true);
		form.setFieldsValue({
			...record,
		});
	}

	function onFormChange(_, newFormData) {
		const isAddTax = typeAction === CREATE;

		if (isAddTax) {
			const isValidName = newFormData.name && newFormData.name.trim().length >= 1;

			setDirty(isValidName);
		} else {
			newFormData.name = newFormData.name ? newFormData.name.trim() : '';
			newFormData.description = newFormData.description ? newFormData.description.trim() : '';

			const isChangeForm =
				!DX.checkEqualsObject(pick(unitInfo, ['name', 'status', 'description']), newFormData) &&
				newFormData.name.length >= 1;

			setDirty(isChangeForm);
		}
	}

	const onFinish = (values) => {
		if (typeAction === CREATE) {
			addTax.mutate({
				...values,
				name: trim(values.name),
			});
		} else if (typeAction === MODIFY) {
			modifyTax.mutate({
				id: unitInfo.id,
				...values,
				name: trim(values.name),
			});
		}
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (text, record, index) => (page - 1) * pageSize + index + 1,
		},
		{
			title: tField('tax'),
			dataIndex: 'name',
			sorter: {},
			render: (value, record) =>
				CAN_UPDATE ? (
					<Button type="link" onClick={() => displayFormModifyTax(record)} className="p-0 break-all">
						{value}
					</Button>
				) : (
					value
				),
		},
		{
			title: tField('des'),
			dataIndex: 'description',
			sorter: {},
			render: (value) => <div className="break-all">{value}</div>,
		},
		{
			title: tField('display'),
			dataIndex: 'status',
			key: 'status',
			render: (value, record) => (
				<Switch
					disabled={!CAN_UPDATE}
					checked={value === CategoryTax.tagDisplay.VISIBLE.value}
					onClick={() => confirmChangeStatus(value, record)}
				/>
			),
			align: 'center',
			sorter: {},
			width: '12rem',
		},
		{
			title: tField('action'),
			dataIndex: 'isVat',
			key: 'isVat',
			render: (value, record) => (
				<Button hidden={value === ISVAT} type="text" onClick={() => handleDelBtn(record)} className="ml-4">
					<DeleteOutlined />
				</Button>
			),
			width: '12rem',
			hide: !CAN_UPDATE,
		},
	];

	const buttonAddTax = () =>
		CAN_UPDATE && (
			<Button
				className="float-right ml-auto"
				type="primary"
				onClick={setAddNewTax}
				icon={<AddIcon width="w-4" />}
			>
				{tButton('opt_add', { field: 'new' })}
			</Button>
		);

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type="CategoryTax" />
				{buttonAddTax()}
			</div>
			<Table columns={getColumnSortDefault(columns.filter((column) => !column.hide))} {...configTable} />
			{isDrawerVisible && (
				<Drawer
					title={
						typeAction === CREATE
							? tButton('opt_add', { field: 'tax' })
							: tButton('opt_edit', { field: 'tax' })
					}
					width={400}
					onClose={setCloseForm}
					visible={isDrawerVisible}
					footer={
						<div className="text-right mr-2">
							<Button onClick={setCloseForm}>{tButton('opt_cancel')}</Button>
							<Button
								disabled={!isDirty}
								htmlType="submit"
								className="ml-4"
								type="primary"
								onClick={() => form.submit()}
							>
								{typeAction === CREATE ? tButton('opt_create', { field: 'new' }) : tButton('opt_save')}
							</Button>
						</div>
					}
					maskClosable={false}
				>
					<Form
						form={form}
						layout="vertical"
						onFinish={onFinish}
						initialValues={defaultValue}
						onValuesChange={onFormChange}
					>
						<Form.Item
							name="name"
							label={tField('tax')}
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'tax' }))]}
						>
							<Input
								ref={nameRef}
								disabled={isVat}
								autoComplete="off"
								placeholder={tField('tax')}
								maxLength={LENGTHNAMETAX}
							/>
						</Form.Item>
						<Form.Item name="description" label={tField('des')}>
							<Input.TextArea
								placeholder={tField('taxDes')}
								maxLength={LENGTHNOTETAX}
								showCount
								row={ROWDESCRIPTION}
							/>
						</Form.Item>
						<Form.Item
							name="status"
							label={<span style={{ marginBottom: '-8px' }}>{tField('status')}</span>}
						>
							<Radio.Group>
								<Radio value={VISIBLE}>{tFilterField('value', 'show')}</Radio>
								<Radio value={INVISIBLE}>{tFilterField('value', 'hide')}</Radio>
							</Radio.Group>
						</Form.Item>
					</Form>
				</Drawer>
			)}
		</>
	);
}
