import React, { useState } from 'react';
import { Tag, Switch as SwitchAntd, message, Form, Modal } from 'antd';
import { usePagination, useLng } from 'app/hooks';
import { DX, Employee as EmployeeModel } from 'app/models';

import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';
import { AvatarWithText } from 'app/components/Atoms';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import useUser from '../../../app/hooks/useUser';
import Employee from './Employee';

const { confirm } = Modal;

function WrapEmployee() {
	const [form] = Form.useForm();
	const [visibleModalImport, setVisibleModalImport] = useState(false);
	const [visibleModalSuccess, setVisibleModalSuccess] = useState(false);
	const [errorFile, setErrorFile] = useState('');
	const [dataUpload, setDataUpload] = useState({});
	const [responseUpload, setResponseUpload] = useState({});
	const [errorMalformed, setErrorMalformed] = useState(false);
	const { tMessage, tValidation, tField, tButton, tFilterField } = useLng();
	const { pathname } = useLocation();
	const { user } = useUser();

	const {
		data: { content, total },
		page,
		pageSize,
		isFetching,
		refetch,
		configTable,
		getColumnSortDefault,
	} = usePagination(EmployeeModel.getListUserByType());

	const [visibleModal, setVisibleModal] = useState(false);

	function handleModal() {
		setVisibleModal(true);
	}

	const handleSuccess = (messageType) => () => {
		setVisibleModal(false);
		form.resetFields();
		refetch();
		message.success(tMessage(messageType, { field: 'acc' }));
	};

	const handleError = (messageType) => () => {
		message.error(tMessage(messageType, { field: 'acc' }));
	};

	const updateMutation = useMutation(EmployeeModel.updateById, {
		onSuccess: handleSuccess('opt_successfullyEdited'),
		// onError: handleError("editError"),
	});

	const addMutation = useMutation(EmployeeModel.insertEmployee, {
		onSuccess: handleSuccess('opt_successfullyCreated'),
		onError: (res) => {
			handleError('opt_badlyCreated');
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

	function onFinish(value) {
		addMutation.mutate({
			...value,
			createType: value.createType,
			status: value.status ? 'ACTIVE' : 'INACTIVE',
			phoneNumber: value.phoneNumber === '' ? null : value.phoneNumber,
		});
	}

	function showPromiseUpdateStatusConfirm(values) {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'status' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('accept'),
			cancelText: tButton('opt_cancel'),
			onOk: () => updateMutation.mutate(values),
			onCancel() {},
			confirmLoading: updateMutation.isLoading,
		});
	}

	function handleChangeStatus(status, record) {
		showPromiseUpdateStatusConfirm({
			id: record.id,
			status: status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE',
		});
	}

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: tField('userName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) =>
				DX.canAccessFuture2('sme/list-sub-sme-account', user.permissions) ? (
					<AvatarWithText name={value} icon={record.avatar} linkTo={`${pathname}/${record.id}`} />
				) : (
					<AvatarWithText name={value} icon={record.avatar} />
				),
			sorter: true,
			ellipsis: true,
		},
		{
			title: tField('email'),
			dataIndex: 'email',
			key: 'email',
			sorter: true,
			ellipsis: true,
		},
		{
			title: tField('status'),
			key: 'tags',
			dataIndex: 'status',
			render: (status) => (
				<Tag className="capitalize" color={status === 'ACTIVE' ? '#2C3D94' : 'default'}>
					{status === 'ACTIVE'
						? tFilterField('activeStatusOptions', 'active')
						: tFilterField('activeStatusOptions', 'inactive')}
				</Tag>
			),
			sorter: true,
			width: 160,
		},
		{
			title: tField('on_off_activation'),
			dataIndex: 'status',
			key: 'action',
			align: 'center',
			render: (status, record) => (
				<SwitchAntd
					checked={status === 'ACTIVE'}
					disabled={!DX.canAccessFuture2('sme/change-status-sub-sme-account', user.permissions)}
					onChange={() => {
						handleChangeStatus(status, record);
					}}
				/>
			),
			width: 180,
		},
	];

	const exportEmployeeAccountFile = async () => {
		try {
			const res = await EmployeeModel.getFile();
			DX.exportFile(res, 'import_employee');
		} catch (error) {
			message.error(tMessage('downloadErr'));
		}
	};

	function validateFileUpload(file) {
		const isJpgOrPng =
			file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			file.type === 'application/vnd.ms-excel';
		if (!isJpgOrPng) {
			setErrorFile(tValidation('wrongFormatFile'));
			setDataUpload({});
			return false;
		}
		const isLt2M = file.size / 1024 / 1024 < 10;
		if (!isLt2M) {
			setErrorFile(tValidation('fileSize'));
			return false;
		}
		setErrorFile('');
		return true;
	}

	const uploadMutation = useMutation(async () => {
		try {
			const formData = new FormData();
			formData.append('file', dataUpload);
			const res = await EmployeeModel.uploadFile(formData);
			setResponseUpload(res);
			setVisibleModalImport(false);
			setVisibleModalSuccess(true);
			refetch();
			return res;
		} catch (res) {
			if (res.errorCode === 'error.data.format') {
				setErrorMalformed(true);
			}
			setVisibleModalSuccess(true);
			setVisibleModalImport(false);
			return null;
		}
	});
	return (
		<Employee
			columns={getColumnSortDefault(columns)}
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
			formLoading={updateMutation.isLoading || addMutation.isLoading}
			visibleModalImport={visibleModalImport}
			setVisibleModalImport={setVisibleModalImport}
			exportEmployeeAccountFile={exportEmployeeAccountFile}
			uploadMutation={uploadMutation}
			setDataUpload={setDataUpload}
			visibleModalSuccess={visibleModalSuccess}
			dataUpload={dataUpload}
			responseUpload={responseUpload}
			setVisibleModalSuccess={setVisibleModalSuccess}
			validateFileUpload={validateFileUpload}
			errorFile={errorFile}
			setErrorFile={setErrorFile}
			errorMalformed={errorMalformed}
			setErrorMalformed={setErrorMalformed}
		/>
	);
}

export default WrapEmployee;
