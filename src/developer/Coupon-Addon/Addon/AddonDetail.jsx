import React from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { DX, SaasAdmin, AddonDev } from 'app/models';
import { useUser, useLng } from 'app/hooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { trim } from 'opLodash';
import { Form, Button, message, Modal, Tag, Tooltip, Spin } from 'antd';
import RegisterAddonForm from 'admin/Coupon-Addon/Addon/components/RegisterAddonForm';

export default function AddonDetails() {
	const { id } = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const { deleteAddon, putRequestApprove } = AddonDev;
	const { user } = useUser();
	const { tMessage, tButton, tFilterField, tOthers } = useLng();

	const { refetch, data: addonInfo } = useQuery(
		['getAddonInfoDetail', id],
		async () => {
			const res = await AddonDev.getOneAddonById(id);
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
		history.push(DX.dev.createPath('/promotion/addon'));
	};

	const goEditAddon = () => {
		history.push(DX.dev.createPath(`/promotion/addon/${id}/edit`));
	};

	const onMutateDelete = useMutation(deleteAddon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'extraService' }));
			goBack();
		},
		onError: (e) => {
			if (e) message.error(tMessage('opt_isUsed', { field: 'extraService' }));
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
			message.success(tMessage('opt_successfullySendApproved', { field: 'extraService' }));
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

	const addonUpdate = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'extraService',
			url: DX.dev.createPath('/promotion/addon'),
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
						<div>
							{addonInfo.approveStatus !== 'AWAITING_APPROVAL' &&
								addonInfo.approveStatus !== 'REJECTED' &&
								DX.canAccessFuture2('dev/update-addon-by-dev', user.permissions) && (
									<Button type="primary" size="middle" onClick={goEditAddon}>
										{tButton('update')}
									</Button>
								)}
							{addonInfo.approveStatus === 'UNAPPROVED' &&
								DX.canAccessFuture2('dev/request-approved-addon-by-dev', user.permissions) && (
									<Button size="middle" type="default" className="ml-4" onClick={onRequestApprove}>
										{tButton('approvalRequest')}
									</Button>
								)}
						</div>
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
				type="dev"
			/>
		</div>
	);
}
