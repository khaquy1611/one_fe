import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Select, Switch, Table, Tag } from 'antd';
import { AvatarWithText, renderOptions, SearchCommon } from 'app/components/Atoms';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { usePagination, useUser, useLng } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { AdminCoupon, CategoryCurrency, DX, SaasAdmin } from 'app/models';
import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';

const ACTIVE = 'ACTIVE';
const INACTIVE = 'INACTIVE';
const NOT_OWN_ERROR = 'error.coupon.user.not.own';
const APPROVED = 'APPROVED';
const ADMIN = 'ADMIN';
const USED_ERROR = 'error.coupon.has.been.used';
const TRUE = 'TRUE';
const styleName = { color: '#f5222d' };

export default function CouponList() {
	const { displayApprove, displayOptions, durationOptions, displayAuthorize } = AdminCoupon;
	const { pathname } = useLocation();
	const { user } = useUser();
	const [selectionRowKeys, setSelectionRowKeys] = useState([]);
	const [dirty, setDirty] = useState(false);
	const CAN_VIEW = DX.canAccessFuture2('admin/view-coupon', user.permissions);
	const CAN_CREATE = DX.canAccessFuture2('admin/create-coupon', user.permissions);
	const CAN_DELETE = DX.canAccessFuture2('admin/delete-coupon', user.permissions);
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('admin/update-coupon-by-admin', user.permissions);
	const CAN_CHANGE_STATUS_BY_ADMIN = DX.canAccessFuture2('admin/change-status-coupon-by-admin', user.permissions); // TODO

	const rootAdmin = !user.isAdminProvince;

	const { tFilterField, tMessage, tButton, tOthers, tField } = useLng();
	const history = useHistory();
	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		AdminCoupon.getAllPagination,
		['searchText', 'status', 'approveStatus', 'duration', 'permission'],
		{
			sort: '',
		},
	);

	const [searchText, status, duration, approveStatus, permission] = [
		query.get('searchText') || '',
		query.get('status') || '',
		query.get('duration') || 'ALL',
		query.get('approveStatus') || '',
		query.get('permission') || 'ALL',
	];

	// ---------------------- Change display --------------------------------//
	const putStatusMutation = useMutation(AdminCoupon.putOnOffStatus, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'status' }));
			refetch();
			setSelectionRowKeys([]);
		},
		onError: (e) => {
			if (e.errorCode === NOT_OWN_ERROR) return message.error(tMessage('err_coupon_user_not_own'));
			return message.error(tMessage('opt_successfullyUpdated', { field: 'status' }));
		},
	});

	const handleClickSwitch = (checked, record) => {
		Modal.confirm({
			title: checked === ACTIVE ? tMessage('offActivity') : tMessage('onActivity'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				let value = '';
				if (checked === ACTIVE) value = INACTIVE;
				else value = ACTIVE;
				putStatusMutation.mutate({
					id: record.id,
					status: value,
				});
			},
			confirmLoading: putStatusMutation.isLoading,
		});
	};

	// ---------------------------Delete promotion----------------------------//
	const deletePromoMutation = useMutation(AdminCoupon.deleteCoupon, {
		onSuccess: (res) => {
			if (res) message.success(res.message);
			else message.success(tMessage('opt_successfullyDeleted', { field: 'prom' }));
			refetch();
			setSelectionRowKeys([]);
			setDirty(false);
		},
		onError: (e) => {
			if (e.errorCode === USED_ERROR && CAN_DELETE) return message.error(tMessage('err_promIsUsed'));

			// if (e.errorCode === USED_ERROR && DX.canAccessFuture2('admin/admin-role', user.permissions))
			// 	return message.errorCode(tMessage('err_prom_NOT_OWN'));

			return message.error(tMessage('opt_badlyDeleted', { field: 'prom' }));
		},
	});

	const handleDeletePromotion = () => {
		Modal.confirm({
			title: `${tMessage('opt_wantToDelete', { field: 'prom' })}`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deletePromoMutation.mutate({ ids: [...selectionRowKeys] });
			},
			onCancel: () => {
				setSelectionRowKeys([]);
				setDirty(false);
			},
			confirmLoading: deletePromoMutation.isLoading,
		});
	};

	// ----------------------check expired time--------------------------//
	const checkExpiredPromo = (startTime, endTime) => {
		if (endTime && moment().isAfter(moment(endTime, 'DD/MM/YYYY').endOf('day')))
			return (
				<span>
					{startTime || '__ /__ /____'} - {endTime}
					<Tag className="ml-2" color="error">
						{tFilterField('value', 'outOfDate')}
					</Tag>
				</span>
			);

		if (!startTime && !endTime) {
			return <span>{tOthers('unlimitedTime')}</span>;
		}
		if (startTime && !endTime)
			return (
				<span>
					{startTime} - {tOthers('unlimitedTime')}
				</span>
			);
		if (!startTime && endTime) return <span> __ /__ /____ - {endTime}</span>;
		return (
			<span>
				{startTime} - {endTime}
			</span>
		);
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: tField('shortcutPromName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) => (
				<AvatarWithText
					linkTo={CAN_VIEW && `${pathname}/${record.id}/detail`}
					disabled={
						record.approveStatus !== APPROVED ||
						record.portalType !== ADMIN ||
						(!CAN_UPDATE_BY_ADMIN && record.createdBy !== user.id)
					}
					name={value}
					icon={record.icon}
					style={record.hasDraft === TRUE ? styleName : null}
				/>
			),
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('shortcutPromCode'),
			dataIndex: 'code',
			key: 'code',
			sorter: {},
		},
		{
			title: (
				<span>
					{tField('time')} <br /> {tField('start_end')}
				</span>
			),
			render: (_, record) => checkExpiredPromo(record.startDate, record.endDate),
			dataIndex: 'startDate',
			key: 'startDate',
			width: 290,
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			key: 'status',
			render: (value, record) => (
				<Switch
					checked={value === CategoryCurrency.tagDisplay.ACTIVE.value}
					disabled={
						record.approveStatus !== APPROVED ||
						record.portalType !== ADMIN ||
						!CAN_CHANGE_STATUS_BY_ADMIN ||
						(!rootAdmin && record.adminType === 'TOTAL_ADMIN')
					}
					onChange={(_, event) => {
						handleClickSwitch(value, record);
						event.stopPropagation();
					}}
				/>
			),
			sorter: {},
		},
		{
			title: tField('approvalStatus'),
			dataIndex: 'approveStatus',
			key: 'approveStatus',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				return <Tag color={tagInfo?.color}>{tFilterField('approvalStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: {},
		},
		{
			title: tField('updateTime'),
			dataIndex: 'updatedTime',
			key: 'updatedTime',
			render: (updatedTime) => DX.formatDate(updatedTime, 'DD/MM/YYYY HH:mm:ss'),
			sorter: {},
		},
	];

	const rowSelection = {
		onChange: (selectedRowKeys, record) => {
			setSelectionRowKeys(selectedRowKeys);
			if (selectedRowKeys.length > 0) setDirty(true);
			else setDirty(false);
		},
		getCheckboxProps: (record) => ({
			disabled: record.portalType === 'DEV' || (!rootAdmin && record.adminType === 'TOTAL_ADMIN'),
		}),
		selectedRowKeys: selectionRowKeys,
		preserveSelectedRowKeys: true,
	};

	const onSearch = (value) => {
		onChangeOneParam('searchText')(value);
	};

	useEffect(() => {
		setSelectionRowKeys([]);
		setDirty(false);
	}, [searchText, status, duration, approveStatus, permission]);

	const couponList = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'prom',
			url: '',
		},
	];

	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={couponList} />
				{CAN_CREATE && (
					<Button
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.admin.createPath('/promotion/coupon/create'))}
					>
						{tButton('opt_create', { field: 'prom' })}
					</Button>
				)}
			</div>
			<div className="flex justify-between mt-5">
				<div className="flex gap-5 tablet:flex-wrap w-10/12 tablet:w-8/12">
					<SearchCommon
						placeholder={tField('promName')}
						onSearch={onSearch}
						autoFocus
						defaultValue={searchText}
						maxLength={200}
						className="w-4/12 tablet:w-4/12"
					/>
					<Select className="w-4/12 tablet:w-4/12" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions(
							tFilterField('prefix', 'status'),
							displayOptions.map((e) => ({
								...e,
								label: tFilterField('activeStatusOptions', e.label),
							})),
						)}
					</Select>
					<Select className="w-4/12 tablet:w-4/12" value={duration} onSelect={onChangeOneParam('duration')}>
						{renderOptions(
							tFilterField('prefix', 'dueDate'),
							durationOptions.map((e) => ({
								...e,
								label: tFilterField('dueDateOptions', e.label),
							})),
						)}
					</Select>
					<Select
						className="w-4/12 tablet:w-4/12"
						value={approveStatus}
						onSelect={onChangeOneParam('approveStatus')}
					>
						{renderOptions(
							tFilterField('prefix', 'approvalStatus'),
							displayApprove.map((e) => ({
								...e,
								label: tFilterField('approvalStatusOptions', e.label),
							})),
						)}
					</Select>
					<Select
						className="w-4/12 tablet:w-4/12"
						value={permission}
						onSelect={onChangeOneParam('permission')}
					>
						{renderOptions(
							tFilterField('prefix', 'permission'),
							displayAuthorize.map((e) => ({
								...e,
								label: tFilterField('permissionOptions', e.label),
							})),
						)}
					</Select>
				</div>
				{CAN_DELETE && (
					<div className="tablet:w-4/12 w-2/12 flex justify-end tablet:items-start">
						<div className="flex items-center">
							<span className="mr-4 inline-block">
								{tOthers('selecting')}: {selectionRowKeys?.length}
							</span>
							<Button icon={<DeleteOutlined />} onClick={handleDeletePromotion} disabled={!dirty}>
								{tButton('delete')}
							</Button>
						</div>
					</div>
				)}
			</div>
			<Table
				rowSelection={CAN_DELETE && { ...rowSelection }}
				className="mt-8"
				columns={getColumnSortDefault(columns)}
				{...configTable}
			/>
		</div>
	);
}
