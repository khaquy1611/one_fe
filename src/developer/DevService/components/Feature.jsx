/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { Button, Form, message, Modal, Table } from 'antd';
import { Link, useHistory, useParams } from 'react-router-dom';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { usePaginationLocal, useLng } from 'app/hooks';
import { DX, Service } from 'app/models';
import { AddIcon } from 'app/icons';
import { ButtonEllipsis } from 'app/components/Atoms';
import { useMutation } from 'react-query';
import FeatureForm from './FeatureForm';
import useUser from '../../../app/hooks/useUser';

const { confirm } = Modal;

function Feature({ typePortal }) {
	const { id } = useParams();
	const [form] = Form.useForm();
	const [typeForm, setTypeForm] = useState('');
	const [visible, setVisible] = useState(false);
	const [idFeature, setIdFeature] = useState(null);
	const [isDirty, setDirty] = useState(false);
	const { tButton, tField, tMessage, tValidation } = useLng();
	const { user } = useUser();

	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getParamNull } = usePaginationLocal(
		(params) => Service.getListFeature(id, params),
		[],
		{ id },
	);
	const history = useHistory();
	const updateFeature = (idF, data) => {
		setVisible(true);
		setTypeForm('updateFeature');
		setIdFeature(idF);
		form.setFieldsValue({
			name: data.name,
			code: data.code,
		});
	};

	const addMutation = useMutation(Service.createFeature, {
		onSuccess: (res) => {
			setVisible(false);
			form.resetFields();
			refetch();
			message.success(tMessage('opt_successfullyCreated', { field: 'feature' }));
		},
		onError: (res) => {
			if (res?.field === 'name' && res?.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'featureName' })],
					},
				]);
			} else if (res?.field === 'code' && res?.errorCode === 'error.duplicate.code') {
				form.setFields([
					{
						name: 'code',
						errors: [tValidation('opt_isDuplicated', { field: 'featureCode' })],
					},
				]);
			}
		},
	});

	const updateMutation = useMutation(Service.updateFeature, {
		onSuccess: () => {
			setVisible(false);
			form.resetFields();
			refetch();
			message.success(tMessage('opt_successfullyUpdated', { field: 'feature' }));
		},
		onError: (res) => {
			if (res?.field === 'name' && res?.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'featureName' })],
					},
				]);
			}
		},
	});

	const deleteMutation = useMutation(Service.deleteFeature);
	function showConfirmDelete(data) {
		confirm({
			title: tMessage('opt_wantToDeleteButUseData', { data: data.name }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			async onOk() {
				try {
					await deleteMutation.mutateAsync(data.id);
					refetch();
					message.success(tMessage('opt_successfullyDeleted', { field: 'feature' }));
				} catch (err) {
					refetch();
					if (err.errorCode === 'error.feature.still.used') {
						message.error(tMessage('err_feature_still_used'));
					}
				}
			},
			onCancel() {},
		});
	}
	const handleDeleted = (data) => {
		showConfirmDelete(data);
	};

	const createFeature = () => {
		setVisible(true);
		setTypeForm('createForm');
		form.setFieldsValue({
			name: '',
			code: '',
		});
	};
	const onClose = () => {
		setVisible(false);
		setDirty(false);
		form.setFieldsValue({
			name: '',
			code: '',
		});
	};

	const onFinish = (value) => {
		if (typeForm === 'createForm') {
			addMutation.mutate({
				...value,
				serviceId: parseInt(id, 10),
			});
		} else {
			updateMutation.mutate({ id: parseInt(idFeature, 10), name: value.name });
		}
	};
	const columns = [
		{
			title: tField('featureName'),
			dataIndex: 'name',
			render: (value, record) => (
				<ButtonEllipsis type="link" onClick={() => updateFeature(record.id, record)} className="px-0">
					{value}
				</ButtonEllipsis>
			),
			key: 'name',
			ellipsis: true,
			sorter: {},
			className: 'whitespace-none',
		},
		{
			title: tField('featureCode'),
			dataIndex: 'code',
			key: 'code',
			ellipsis: true,
			sorter: {},
		},
		{
			dataIndex: 'delete',
			render: (_, record) => (
				<Button
					type="link"
					onClick={() => handleDeleted(record)}
					disabled={!DX.canAccessFuture2('dev/update-service', user.permissions)}
					className="text-black"
					icon={<DeleteOutlined />}
				/>
			),
			width: '4rem',
		},
	];
	return (
		<>
			{DX.canAccessFuture2('dev/update-service', user.permissions) && (
				<Button
					type="default"
					onClick={() => createFeature()}
					className={`text-black mt-3 mb-6 ${typePortal === 'ADMIN' ? 'hidden' : 'show'}`}
					icon={<AddIcon width="w-4" />}
				>
					{tButton('opt_create', { field: 'new' })}
				</Button>
			)}
			<Table columns={columns} {...configTable} />
			<FeatureForm
				onClose={onClose}
				visible={visible}
				form={form}
				onFinish={onFinish}
				typeForm={typeForm}
				isDirty={isDirty}
				setDirty={setDirty}
			/>
			{typePortal === 'ADMIN' && (
				<Link to={DX.admin.createPath('/saas/list')}>
					<Button
						className="w-20 float-right border-217  mt-5"
						onClick={() => history.push(DX.admin.createPath('/saas/list'))}
					>
						{tButton('opt_cancel')}
					</Button>
				</Link>
			)}
		</>
	);
}
Feature.propTypes = {};
export default Feature;
