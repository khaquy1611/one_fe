import { DeleteOutlined, ExclamationCircleOutlined, FileDoneOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, message, Modal, Radio, Space, Switch, Table, Tag, Tooltip } from 'antd';
import { TableDragSorting } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { DX, Pricing, SaasAdmin, SubcriptionPlanDev } from 'app/models';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';

const CustomRadio = ({ isChecked, onChange, disabled }) => {
	if (disabled) {
		return <Radio checked={isChecked} />;
	}
	if (isChecked) {
		return (
			<div
				onClickCapture={() => {
					onChange();
				}}
			>
				<Radio checked />
			</div>
		);
	}
	return <Radio onChange={onChange} />;
};

export default function PricingList({ refetchInfoService, isDirty, setIsDirty, serviceInfo }) {
	const isOrderService = serviceInfo.serviceOwner === 'NONE' && serviceInfo.serviceOwnerVNPT === 'VNPT';
	const { id } = useParams();
	const history = useHistory();
	const [data, setData] = useState([]);
	const { tButton, tOthers, tFilterField, tMessage, tField } = useLng();
	const { user } = useUser();

	const CAN_CHANGE_POSITION = DX.canAccessFuture2('dev/change-position-service-pack', user.permissions);
	const CAN_SET_RECOMMEND = DX.canAccessFuture2('dev/set-recommend-service-pack', user.permissions);
	const CAN_REQUEST_APPROVED = DX.canAccessFuture2('dev/request-approved-service-pack', user.permissions);
	const CAN_DELETE = DX.canAccessFuture2('dev/delete-service-pack', user.permissions);
	const CAN_VIEW = DX.canAccessFuture2('dev/view-service-pack', user.permissions);

	const { refetch, data: initValues } = useQuery(
		['getSubscription', id],
		async () => {
			try {
				const res = await SubcriptionPlanDev.getListPricingForService(id);
				const rs = res.map((e, i) => ({
					...e,
					index: i,
				}));
				setData(rs);
				return rs;
			} catch (e) {
				return {};
			}
		},
		{ initialData: [] },
	);

	const updateRecommendSubscription = useMutation(SubcriptionPlanDev.updateRecommendedSubscription, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'servicePackage' }));
			setIsDirty(false);
			refetchInfoService();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.valid.pattern' && err.object === 'pricing') {
				message.error(tMessage('err_valid_pattern_pricing'));
			} else if (err.errorCode === 'error.invalid.subscription.plan' && err.object === 'subscription_plan') {
				message.error(tMessage('error_invalid_subscription_plan'));
			}
			refetch();
		},
	});

	function changeRecommend(value, index) {
		const rf = data;
		if (value.recommendedStatus === 'RECOMMENDED') {
			rf[index].recommendedStatus = 'UN_RECOMMENDED';
		} else {
			const i = rf.findIndex((e) => e.recommendedStatus === 'RECOMMENDED');
			if (i > -1) rf[i].recommendedStatus = 'UN_RECOMMENDED';
			rf[index].recommendedStatus = 'RECOMMENDED';
		}
		setData([...rf]);
		setIsDirty(true);
	}

	function updateSubscription() {
		if (data.length === 0) return;
		Modal.confirm({
			title: tMessage('opt_wantToUpdate', { field: 'servicePackageSetting' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				const rs = data.map((e, i) => ({
					id: e.id,
					displayedOrder: i + 1,
					recommendedStatus: e?.recommendedStatus === 'RECOMMENDED' ? 'RECOMMENDED' : 'UN_RECOMMENDED',
				}));
				updateRecommendSubscription.mutate({
					serviceId: id,
					body: [...rs],
				});
			},
			confirmLoading: updateRecommendSubscription.isLoading,
		});
	}

	const updateStatus = useMutation(Pricing.updateDisplayed, {});

	const requestApprove = useMutation(Pricing.requestApprove, {});

	const deletePricing = useMutation(Pricing.deletePricing, {});

	function handleClickSwitch(checked, record) {
		if (record.isSold !== 'NOT_SOLD_YET') return;
		Modal.confirm({
			title:
				checked === 'VISIBLE'
					? tMessage('opt_wantToHide', { field: 'servicePackage' })
					: tMessage('opt_wantToShow', { field: 'servicePackage' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: async () => {
				try {
					await updateStatus.mutateAsync({
						pricingId: record.id,
						status: checked === 'VISIBLE' ? 'INVISIBLE' : 'VISIBLE',
					});
					message.success(tMessage('opt_successfullyUpdated', { field: 'displayStatus' }));
					refetch();
				} catch (e) {
					if (e.errorCode === 'error.object.need.approve') {
						message.error(tMessage('err_object_need_approve'));
					}
					if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
						message.error(tMessage('error_object_not_found'));
					}
					refetch();
				}
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	function sendRequestApprove(record) {
		if (record.approve !== 'UNAPPROVED') return;
		Modal.confirm({
			title: tMessage('opt_wantToApprove', { field: 'servicePackage' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: async () => {
				try {
					await requestApprove.mutateAsync({
						pricingId: record.id,
					});
					message.success(tMessage('opt_successfullySendApproved'));
					refetch();
				} catch (e) {
					if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
						message.error(tMessage('error_object_not_found'));
					} else if (e.errorCode === 'error.pricing.not.be.draft' && e.field === 'approve') {
						message.error(tMessage('err_pricing_not_be_draft'));
					}
					refetch();
				}
			},
			confirmLoading: requestApprove.isLoading,
		});
	}

	function handleDelete(value) {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'servicePackage' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: async () => {
				try {
					await deletePricing.mutateAsync({
						pricingId: value,
					});
					message.success(tMessage('opt_successfullyDeleted', { field: 'servicePackage' }));
					refetch();
				} catch (e) {
					if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
						message.error(tMessage('error_object_not_found'));
					} else if (e.errorCode === 'error.pricing.still.used') {
						message.error('Không thể xóa gói do đang có thuê bao tồn tại.');
					} else if (e.errorCode === 'error.pricing.coupon.approve') {
						message.error('Không thể xóa gói do đang được sử dụng để làm khuyến mại.');
					} else if (e.errorCode === 'error.combo.using.pricing') {
						message.error('Không thể xóa gói do đang được sử dụng trong combo');
					}
					refetch();
				}
			},
			confirmLoading: deletePricing.isLoading,
		});
	}

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, record, index) => index + 1,
			width: 60,
		},
		{
			title: tField('packageName'),
			dataIndex: 'pricingName',
			key: 'pricingName',
			render: (value, record) => (
				<div className="flex items-center gap-2">
					<div className="truncate">
						{CAN_VIEW ? (
							<Link
								to={DX.dev.createPath(
									`/service/list/${id}/${record.id}?isOrderService=${isOrderService}`,
								)}
							>
								{value}
							</Link>
						) : (
							value
						)}
					</div>
					<div className="flex-none">
						{record.isSold === 'NOT_SOLD_YET' && (
							<Tag color="success">{tFilterField('value', 'selling')}</Tag>
						)}
					</div>
				</div>
			),
			width: '20rem',
			ellipsis: true,
		},
		{
			title: tField('display'),
			dataIndex: 'status',
			key: 'status',
			render: (value, record) => (
				<Switch
					checked={value === 'VISIBLE'}
					disabled={
						record.isSold !== 'NOT_SOLD_YET' ||
						!DX.canAccessFuture2('dev/change-status-service-pack', user.permissions)
					}
					onClick={() => handleClickSwitch(value, record)}
				/>
			),
		},
		{
			title: tField('approvalStatus'),
			dataIndex: 'approve',
			key: 'approve',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				const { icon: Icon } = tagInfo;
				return (
					<Tag color={tagInfo?.color} icon={<Icon />}>
						{tFilterField('approvalStatusOptions', tagInfo?.text)}
					</Tag>
				);
			},
		},
		{
			title: tField('updateTime'),
			dataIndex: 'modifiedAt',
			key: 'modifiedAt',
		},
		{
			align: 'center',
			title: tField('recommendation'),
			dataIndex: 'recommendedStatus',
			key: 'recommendedStatus',
			render: (value, record, index) => (
				<CustomRadio
					disabled={!CAN_SET_RECOMMEND}
					isChecked={value === 'RECOMMENDED'}
					onChange={() => changeRecommend(record, index)}
				/>
			),
			width: '10rem',
		},
		{
			align: 'right',
			render: (text, record) => (
				<Space size="middle">
					{record.approve === 'UNAPPROVED' && CAN_REQUEST_APPROVED && (
						<Tooltip placement="topRight" title={tOthers('sendApprovalRequest')}>
							<FileDoneOutlined className="mr-4" onClick={() => sendRequestApprove(record)} />
						</Tooltip>
					)}
					{CAN_DELETE && <DeleteOutlined onClick={() => handleDelete(record.id)} />}
				</Space>
			),
			width: '6rem',
		},
	];

	return (
		<>
			<Button
				className="mt-3 mb-6"
				icon={<AddIcon width="w-4" />}
				disabled={
					serviceInfo?.status !== 'APPROVED' ||
					!DX.canAccessFuture2('dev/create-service-pack', user.permissions)
				}
				onClick={() => {
					if (serviceInfo?.status === 'APPROVED')
						history.push(
							DX.dev.createPath(`/service/list/${id}/pricing-create?isOrderService=${!!isOrderService}`),
						);
				}}
			>
				{tButton('opt_create', { field: 'servicePackage' })}
			</Button>
			{CAN_CHANGE_POSITION ? (
				<TableDragSorting columns={columns} data={data} setData={setData} setIsDirty={setIsDirty} />
			) : (
				<Table
					className="beauty-scroll-table"
					columns={columns}
					dataSource={data}
					pagination={{ position: ['none'], pageSize: 1000000000 }}
					scroll={{ x: 810, y: 585 }}
				/>
			)}
			<div className="mt-5 float-right">
				<Button
					className="w-20 "
					htmlType="button"
					onClick={() => history.push(DX.dev.createPath('/service/list'))}
				>
					{tButton('opt_cancel')}
				</Button>
				<Button
					type="primary"
					disabled={data.length === 0 || !isDirty}
					icon={<SaveOutlined />}
					className="ml-5"
					onClick={() => updateSubscription()}
				>
					{tButton('opt_save')}
				</Button>
			</div>
		</>
	);
}
