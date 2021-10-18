import React, { useState, useEffect } from 'react';
import { UrlBreadcrumb, DrawerApproval } from 'app/components/Atoms';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { DX, AddonAdmin, SaasAdmin } from 'app/models';
import { useUser, useLng } from 'app/hooks';
import { ExclamationCircleOutlined, MinusOutlined } from '@ant-design/icons';
import { trim } from 'opLodash';
import { Form, Button, message, Modal, Tag, Tooltip, Spin } from 'antd';
import { RegisterAddonForm } from '../components/index';

const AWAITING_APPROVAL = 'AWAITING_APPROVAL';
const EDIT = 'EDIT';
const ADMIN = 'ADMIN';

function ButtonShowModal({ openApproveForm }) {
	const { tButton } = useLng();
	return (
		<Button
			type="primary"
			onClick={() => {
				openApproveForm();
			}}
			className="fixed bottom-0 h-14 px-6 right-0 z-max rounded-none"
		>
			<div className="items-center">
				<span className="text-base mr-4">{tButton('opt_approve', { field: 'extraService' })}</span>
				<MinusOutlined />
			</div>
		</Button>
	);
}

export default function AddonDetails() {
	const { id } = useParams();
	const history = useHistory();
	const { user } = useUser();
	const [disabled, setDisabled] = useState(false);
	const [form] = Form.useForm();
	const CAN_APPROVED = DX.canAccessFuture2('admin/approved-addon', user.permissions);
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('admin/update-addon-by-admin', user.permissions);
	const CAN_REQUEST_APPROVED_BY_ADMIN = DX.canAccessFuture2(
		'admin/request-approved-addon-by-admin',
		user.permissions,
	);
	const rootAdmin = !user.departmentId || !user.department?.provinceId;
	const { putApproveAddon, deleteAddon, putRequestApprove } = AddonAdmin;
	const [showModal, setShowModal] = useState(false);
	const [approve, setApproveStatus] = useState('');
	const [typeLoading, setTypeLoading] = useState('');
	const { tMessage, tValidation, tField, tButton, tFilterField, tOthers, tLowerField } = useLng();
	const { refetch, data: addonInfo } = useQuery(
		['getAddonInfoDetail', id],
		async () => {
			const res = await AddonAdmin.getOneAddonById(id);
			res.unitLimitedList.forEach((e) => {
				e.price = e.price.toLocaleString('vi-VN');
			});
			if (trim(res?.setupFee)) res.setupFee = res.setupFee.toLocaleString('vi-VN');
			if (trim(res?.price)) res.price = res.price.toLocaleString('vi-VN');
			return res;
		},
		{
			initialData: {
				loading: true,
			},
			cacheTime: 0,
			enabled: !!id,
		},
	);

	const tagApproveInfo = SaasAdmin.tagStatus[addonInfo.approveStatus] || {};
	const goBack = () => {
		history.push(DX.admin.createPath('/promotion/addon'));
	};

	const goEditAddon = () => {
		history.push(DX.admin.createPath(`/promotion/addon/${id}/edit`));
	};

	const onMutateDelete = useMutation(deleteAddon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'extraService' }));
			goBack();
		},
		onError: (e) => {
			if (e) message.error(tMessage('opt_isUsed', { field: 'extraService' }));
			console.log(e);
		},
	});

	const onDeleteAddon = () => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'extraService' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateDelete.mutate({ ids: [id] });
			},
			onCancel: () => {},
			confirmLoading: onMutateDelete.isLoading,
		});
	};

	const onMutateRequest = useMutation(putRequestApprove, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyApproved', { field: 'extraService' }));
			goBack();
		},
		onError: (e) => {
			console.log(e);
		},
	});

	const onRequestApprove = () => {
		Modal.confirm({
			title: tMessage('opt_wantToApprove'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateRequest.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: onMutateRequest.isLoading,
		});
	};

	// ---------------------------- modal approve -----------------------------//
	const openApproveForm = () => {
		setShowModal(true);
	};

	const onMutateApprove = useMutation(putApproveAddon, {
		onSuccess: () => {
			if (approve === SaasAdmin.tagStatus.APPROVED.value)
				message.success(tMessage('opt_successfullyApproved', { field: 'extraService' }));
			else if (approve === SaasAdmin.tagStatus.UNAPPROVED.value)
				message.warning(tMessage('opt_successfullyUpdated', { field: 'extraService' }));
			else message.error(tMessage('opt_successfullyRejected', { field: 'extraService' }));
			setShowModal(false);
			refetch();
		},
		onError: (e) => {
			console.log(e);
		},
	});

	const handleClickApprove = () => {
		setTypeLoading(SaasAdmin.tagStatus.APPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.APPROVED.value);
	};

	useEffect(() => {
		if (approve) {
			onMutateApprove.mutate({
				id,
				body: {
					approvedStatus: approve,
					comment: form.getFieldValue('comment') || 'approve',
				},
			});
		}
	}, [approve]);

	const handleClickUnApprove = () => {
		const data = form.getFieldValue('comment');
		if (!trim(data)) {
			form.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.UNAPPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.UNAPPROVED.value);
	};

	const handleClickReject = () => {
		const data = form.getFieldValue('comment');
		if (!trim(data)) {
			form.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.REJECTED.value);
		setApproveStatus(SaasAdmin.tagStatus.REJECTED.value);
	};

	const addonUpdate = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'extraServiceList',
			url: DX.admin.createPath('/promotion/addon'),
		},
		{
			isName: true,
			name: addonInfo.name,
			url: '',
		},
	];
	if (id && addonInfo.loading) {
		return <Spin />;
	}

	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={addonUpdate} />{' '}
			<div className="relative">
				<div className="flex max-w-7xl justify-between mt-4">
					<div className="flex justify-start items-center">
						<Tooltip placement="topLeft" title={tOthers('couponNameHere')}>
							<div className="font-semibold text-xl truncate max-w-lg">
								{addonInfo.name || 'This is coupon name'}
							</div>
						</Tooltip>
						<Tag className="block ml-4 text-sm font-normal" color={tagApproveInfo?.color}>
							{tFilterField('approvalStatusOptions', tagApproveInfo?.text)}
						</Tag>
					</div>
				</div>
				<div className="absolute top-0 w-full ">
					<div className="max-w-6xl mx-auto flex justify-end">
						{(addonInfo.portalType === ADMIN || addonInfo?.createdBy === user.id) && (
							<div>
								{addonInfo.approveStatus !== 'AWAITING_APPROVAL' &&
									CAN_UPDATE_BY_ADMIN &&
									addonInfo.approveStatus !== 'REJECTED' &&
									((rootAdmin && addonInfo.adminType === 'TOTAL_ADMIN') ||
										(!rootAdmin && addonInfo.adminType === 'PROVINCE_ADMIN')) && (
										<Button type="primary" size="middle" onClick={goEditAddon}>
											{tButton('update')}
										</Button>
									)}
								{addonInfo.approveStatus === 'UNAPPROVED' &&
									CAN_REQUEST_APPROVED_BY_ADMIN &&
									((rootAdmin && addonInfo.adminType === 'TOTAL_ADMIN') ||
										(!rootAdmin && addonInfo.adminType === 'PROVINCE_ADMIN')) && (
										<Button
											size="middle"
											type="default"
											className="ml-4"
											onClick={onRequestApprove}
										>
											{tButton('approvalRequest')}
										</Button>
									)}
							</div>
						)}
					</div>
				</div>
			</div>
			<RegisterAddonForm
				className="mt-12"
				form={form}
				disabled
				data={addonInfo}
				onDeleteAddon={onDeleteAddon}
				goBack={goBack}
				typeAddon={EDIT}
				type="admin"
			/>
			{/* approve button */}
			{addonInfo.approveStatus === AWAITING_APPROVAL &&
				addonInfo.portalType !== 'DEV' &&
				CAN_APPROVED &&
				((rootAdmin && addonInfo.adminType === 'TOTAL_ADMIN') ||
					(!rootAdmin && addonInfo.adminType === 'PROVINCE_ADMIN')) && (
					<ButtonShowModal openApproveForm={openApproveForm} />
				)}
			{addonInfo.approveStatus === AWAITING_APPROVAL && addonInfo.portalType === 'DEV' && CAN_APPROVED && (
				<ButtonShowModal openApproveForm={openApproveForm} />
			)}
			{/* -------------- */}
			<DrawerApproval
				closeForm={() => {
					setShowModal(false);
					form.resetFields();
				}}
				visible={showModal}
				form={form}
				disabled={disabled}
				handleClickApprove={handleClickApprove}
				handleClickUnApprove={handleClickUnApprove}
				handleClickReject={handleClickReject}
				loading={onMutateApprove.isLoading}
				typeLoading={typeLoading}
				title={tField('opt_approve', { field: 'extraService' })}
				textAcceptBtn={tButton('accept')}
				content={
					<p>
						{tOthers('inCase')} <b>{tOthers('reject')}</b> {tLowerField('or')}{' '}
						<b>{tOthers('updateRequest')}</b>, {tLowerField('giveDevReason')}
					</p>
				}
				approved={SaasAdmin.tagStatus.APPROVED.value}
				unApproved={SaasAdmin.tagStatus.REJECTED.value}
				rejected={SaasAdmin.tagStatus.UNAPPROVED.value}
			/>
		</div>
	);
}
