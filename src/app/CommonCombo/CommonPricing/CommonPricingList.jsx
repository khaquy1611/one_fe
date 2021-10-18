import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';
import { DX, SaasAdmin, ComboPricing } from 'app/models';
import { TableDragSorting } from 'app/components/Atoms';
import { Button, message, Modal, Radio, Switch, Table, Tag, Tooltip } from 'antd';
import { AddIcon } from 'app/icons';
import { DeleteOutlined, ExclamationCircleOutlined, FileDoneOutlined, SaveOutlined } from '@ant-design/icons';
import { useLng } from 'app/hooks';
import useUser from '../../hooks/useUser';

const CustomRadio = ({ isChecked, onChange }) => {
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

function CommonPricingList({ comboInfo, portal, isOwnerProvince }) {
	const { user } = useUser();
	const CAN_CREATE =
		(portal === 'admin' && DX.canAccessFuture2('admin/create-combo-pack', user.permissions)) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/create-combo-pack', user.permissions));
	const CAN_VIEW =
		(portal === 'admin' && DX.canAccessFuture2('admin/view-combo-pack', user.permissions)) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/view-combo-pack', user.permissions));
	const CAN_DELETE =
		(portal === 'admin' && DX.canAccessFuture2('admin/delete-combo-pack', user.permissions) && isOwnerProvince) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/delete-combo-pack', user.permissions));
	const CAN_CHANGE_STATUS =
		(portal === 'admin' &&
			DX.canAccessFuture2('admin/change-status-combo-pack', user.permissions) &&
			isOwnerProvince) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/change-status-combo-pack', user.permissions));
	const CAN_CHANGE_POSITION =
		(portal === 'admin' &&
			DX.canAccessFuture2('admin/change-position-combo-pack', user.permissions) &&
			isOwnerProvince) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/change-position-combo-pack', user.permissions));
	const CAN_REQUEST_APPROVED =
		(portal === 'admin' &&
			DX.canAccessFuture2('admin/request-approved-combo-pack', user.permissions) &&
			isOwnerProvince) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/request-approved-combo-pack', user.permissions));

	const CAN_SET_RECOMMEND =
		(portal === 'admin' &&
			DX.canAccessFuture2('admin/set-recommend-combo-pack', user.permissions) &&
			isOwnerProvince) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/set-recommend-combo-pack', user.permissions));

	const { id } = useParams();
	const history = useHistory();
	const [data, setData] = useState([]);
	const [isDirty, setIsDirty] = useState(false);
	const { tMessage, tFilterField, tField, tButton, tOthers } = useLng();
	const { ownerDev } = comboInfo;
	const isOwner =
		(portal === 'admin' && ownerDev === 'NO' && isOwnerProvince) || (portal === 'dev' && ownerDev === 'YES');

	const { refetch } = useQuery(
		['getListPricingByComboId', id],
		async () => {
			try {
				const res = await ComboPricing.getListPricingByComboId(id);
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
		{
			initialData: [],
			// enabled: !!comboId,
		},
	);

	const updateRecommendedPricing = useMutation(ComboPricing.updateRecommendedPricing, {
		onSuccess: () => {
			message.success('Cập nhật gói combo khuyên dùng thành công');
			setIsDirty(false);
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === 'error.object.need.approve') {
				message.error(tMessage('err_object_need_approve'));
			} else if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
				message.error(tMessage('error_object_not_found'));
			}
			refetch();
		},
	});

	function changeRecommend(value, index) {
		const rf = data;
		if (value.recommended === 'YES') {
			rf[index].recommended = 'NO';
		} else {
			const i = rf.findIndex((e) => e.recommended === 'YES');
			if (i > -1) rf[i].recommended = 'NO';
			rf[index].recommended = 'YES';
		}
		setData([...rf]);
		setIsDirty(true);
	}

	function updateSubscription() {
		if (data.length === 0) return;
		const rs = data.map((e, i) => ({
			id: e.id,
			displayedOrder: i + 1,
			recommended: e?.recommended === 'YES' ? 'YES' : 'NO',
		}));
		updateRecommendedPricing.mutate({
			comboId: id,
			body: [...rs],
		});
	}

	const updateStatus = useMutation(ComboPricing.updateDisplayed, {});

	const requestApprove = useMutation(ComboPricing.requestApprove, {});

	const deletePricing = useMutation(ComboPricing.deletePricing, {});

	function handleClickSwitch(checked, record) {
		if (record.labelSale !== 'SOLD') return;
		Modal.confirm({
			title: `Bạn có muốn ${checked === 'VISIBLE' ? 'ẩn' : ''} hiển thị gói Combo dịch vụ ${record.name} này?`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: async () => {
				if (checked === 'VISIBLE') checked = 'INVISIBLE';
				else checked = 'VISIBLE';
				try {
					await updateStatus.mutateAsync({
						portal,
						pricingId: record.id,
						status: checked,
					});
					message.success('Cập nhật trạng thái hiển thị thành công');
					refetch();
				} catch (e) {
					if (e.errorCode === 'error.object.need.approve') {
						message.error(tMessage('err_object_need_approve'));
					} else if (e.errorCode === 'error.object.not.found' && e.field === 'comboDraftId') {
						message.error('Gói Combo dịch vụ không tồn tại.');
					}
					refetch();
				}
			},
			confirmLoading: updateStatus.isLoading,
		});
	}

	function sendRequestApprove(record) {
		if (record.approvedStatus !== 'UNAPPROVED') return;
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn gửi yêu cầu phê duyệt cho Gói Combo dịch vụ?',
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: async () => {
				try {
					await requestApprove.mutateAsync({
						portal,
						comboId: record.id,
					});
					message.success(tMessage('opt_successfullySendApproved'));
					refetch();
				} catch (e) {
					if (e.errorCode === 'error.object.not.found' && e.field === 'comboPlanDraftId') {
						message.error('Gói Combo này đã bị xóa');
					} else if (e.errorCode === 'error.combo.must.unApproved' && e.field === 'approveStatus') {
						message.error('Gói Combo này đã được gửi yêu cầu phê duyệt');
					}
					refetch();
				}
			},
			confirmLoading: requestApprove.isLoading,
		});
	}

	function handleDelete(value) {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa gói Combo dịch vụ?',
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: async () => {
				try {
					await deletePricing.mutateAsync({
						comboPlanId: value,
					});
					message.success('Xóa gói Combo dịch vụ thành công');
					refetch();
				} catch (e) {
					if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
						message.error(tMessage('error_object_not_found'));
					} else if (e.errorCode === 'error.combo.used') {
						message.error(tMessage('err_pricing_still_used'));
					} else if (e.errorCode === 'error.pricing.coupon.approve') {
						message.error(tMessage('err_pricing_coupon_approve'));
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
			title: tField('comboPackageName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) => (
				<div className="flex items-center gap-2">
					<div className="truncate">
						{CAN_VIEW ? (
							<Link
								to={
									portal === 'admin'
										? DX.admin.createPath(`/combo/${id}/${record.id}`)
										: DX.dev.createPath(`/combo/${id}/${record.id}`)
								}
							>
								{value}
							</Link>
						) : (
							value
						)}
					</div>
					<div className="flex-none">
						{record.labelSale === 'SOLD' && <Tag color="success">{tFilterField('value', 'selling')}</Tag>}
					</div>
				</div>
			),
			width: '20rem',
			ellipsis: true,
		},
		{
			title: tField('servicePackageQuantity'),
			dataIndex: 'quantity',
			key: 'quantity',
			width: '5rem',
		},
		{
			title: tField('display'),
			dataIndex: 'statusString',
			key: 'statusString',
			render: (value, record) => {
				if ((portal === 'admin' && ownerDev === 'NO') || (portal === 'dev' && ownerDev === 'YES')) {
					return (
						<Switch
							checked={value === 'VISIBLE'}
							disabled={record.labelSale !== 'SOLD' || !CAN_CHANGE_STATUS}
							onClick={() => handleClickSwitch(value, record)}
						/>
					);
				}
				const tagDisplay = SaasAdmin.tagDisplay[value] || {};
				return <Tag color={tagDisplay?.color}>{tFilterField('displayStatusOptions', tagDisplay?.text)}</Tag>;
			},
			width: '6rem',
		},
		{
			align: 'center',
			title: tField('approvalStatus'),
			dataIndex: 'approvedStatus',
			key: 'approvedStatus',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				return <Tag color={tagInfo?.color}>{tFilterField('approvalStatusOptions', tagInfo?.text)}</Tag>;
			},
			width: '10rem',
		},
		{
			title: tField('updateTime'),
			dataIndex: 'updatedTime',
			key: 'updatedTime',
			width: '9rem',
		},
		{
			align: 'center',
			title: tField('recommendation'),
			dataIndex: 'recommended',
			key: 'recommended',
			render: (value, record, index) => {
				if (isOwner && CAN_SET_RECOMMEND)
					return (
						<CustomRadio
							disabled={!CAN_SET_RECOMMEND}
							isChecked={value === 'YES'}
							onChange={() => changeRecommend(record, index)}
						/>
					);
				return <Radio disabled checked={value === 'YES'} />;
			},
			width: '8rem',
		},
		{
			align: 'right',
			render: (_, record) => (
				<div
					className={`flex ${
						record.approvedStatus === 'UNAPPROVED' && CAN_REQUEST_APPROVED
							? 'justify-between'
							: 'justify-end'
					}`}
				>
					{record.approvedStatus === 'UNAPPROVED' && CAN_REQUEST_APPROVED && (
						<Tooltip placement="topRight" title={tOthers('sendApprovalRequest')}>
							<FileDoneOutlined className="p-1" onClick={() => sendRequestApprove(record)} />
						</Tooltip>
					)}
					{CAN_DELETE && <DeleteOutlined className="p-1" onClick={() => handleDelete(record.id)} />}
				</div>
			),
			width: '5.5rem',
			hide: !isOwner || (!CAN_REQUEST_APPROVED && !CAN_DELETE),
		},
	];

	return (
		<>
			{isOwner ? (
				<>
					{CAN_CREATE ? (
						<Button
							className="mt-3 mb-6"
							icon={<AddIcon width="w-4" />}
							onClick={() => {
								if (portal === 'admin')
									history.push(DX.admin.createPath(`/combo/${id}/pricing-create`));
								else history.push(DX.dev.createPath(`/combo/${id}/pricing-create`));
							}}
						>
							{tButton('opt_create', { field: 'serviceComboPackage' })}
						</Button>
					) : (
						''
					)}
					{CAN_CHANGE_POSITION ? (
						<TableDragSorting
							columns={columns.filter((column) => !column.hide)}
							data={data}
							setData={setData}
							setIsDirty={setIsDirty}
						/>
					) : (
						<Table
							className="beauty-scroll-table"
							columns={columns.filter((column) => !column.hide)}
							dataSource={data}
							pagination={false}
							scroll={{ x: 810, y: 550 }}
						/>
					)}
				</>
			) : (
				<Table
					className="beauty-scroll-table"
					columns={columns.filter((column) => !column.hide)}
					dataSource={data}
					pagination={false}
					scroll={{ x: 810, y: 550 }}
				/>
			)}
			<div className="mt-5 mb-10 float-right">
				<Button
					className="w-20"
					htmlType="button"
					onClick={() => {
						if (portal === 'admin') history.push(DX.admin.createPath('/combo'));
						else history.push(DX.dev.createPath('/combo'));
					}}
				>
					{tButton('opt_cancel')}
				</Button>
				{isOwner && (CAN_CHANGE_POSITION || CAN_SET_RECOMMEND) && (
					<Button
						type="primary"
						disabled={data.length === 0 || !isDirty}
						icon={<SaveOutlined />}
						className="ml-5"
						onClick={() => updateSubscription()}
						loading={updateRecommendedPricing.isLoading}
					>
						{tButton('opt_save')}
					</Button>
				)}
			</div>
		</>
	);
}

export default CommonPricingList;
