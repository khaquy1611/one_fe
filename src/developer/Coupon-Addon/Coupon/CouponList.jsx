import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Select, Switch, Table, Tag } from 'antd';
import { AvatarWithText, renderOptions, SearchCommon } from 'app/components/Atoms';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { usePagination, useLng } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { AdminCoupon, CategoryCurrency, DevCoupon, DX, SaasAdmin } from 'app/models';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import useUser from '../../../app/hooks/useUser';

const ACTIVE = 'ACTIVE';
const INACTIVE = 'INACTIVE';
const APPROVED = 'APPROVED';
const USED_ERROR = 'error.coupon.has.been.used';
const TRUE = 'TRUE';
const styleName = { color: '#f5222d' };

export default function CouponList() {
	const { displayApprove, displayOptions, durationOptions } = AdminCoupon;
	const { pathname } = useLocation();
	const { user } = useUser();
	const [selectionRowKeys, setSelectionRowKeys] = useState([]);
	const [dirty, setDirty] = useState(false);
	const { tMessage, tButton, tOthers, tField, tFilterField } = useLng();

	const history = useHistory();

	const {
		configTable,
		page,
		pageSize,
		refetch,
		query,
		onChangeOneParam,
		getColumnSortDefault,
	} = usePagination(DevCoupon.getAllPagination, ['searchText', 'status', 'approveStatus', 'duration'], { sort: '' });

	const [searchText, status, duration, approveStatus] = [
		query.get('searchText') || '',
		query.get('status') || '',
		query.get('duration') || 'ALL',
		query.get('approveStatus') || '',
	];

	// ------------------------ Update status show/hide-----------------------------//
	const putStatusMutation = useMutation(DevCoupon.putOnOffStatus, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'status' }));
			refetch();
			setSelectionRowKeys([]);
		},
		onError: (e) => {
			if (e.errorCode === 'error.coupon.user.not.own') return message.error(tMessage('err_coupon_user_not_own'));
			return message.error(tMessage('opt_badlyUpdated', { field: 'status' }));
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

	// -----------------------------Delete promotion------------------------------//
	const deletePromoMutation = useMutation(AdminCoupon.deleteCoupon, {
		onSuccess: (res) => {
			if (res) message.success(res.message);
			else message.success(tMessage('opt_successfullyDeleted', { field: 'prom' }));
			refetch();
			setSelectionRowKeys([]);
			setDirty(false);
		},
		onError: (e) => {
			if (e.errorCode === USED_ERROR) return message.error(tMessage('err_promIsUsed'));
			return message.error(tMessage('opt_badlyDeleted', { field: 'prom' }));
		},
	});

	const handleDeletePromotion = () => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'prom' }),
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

	// ----------------------check expired time---------------------------//
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

	const rowSelection = {
		onChange: (selectedRowKeys) => {
			setSelectionRowKeys(selectedRowKeys);
			if (selectedRowKeys.length > 0) setDirty(true);
			else setDirty(false);
		},
		selectedRowKeys: selectionRowKeys,
		preserveSelectedRowKeys: true,
	};

	const onSearch = (value) => {
		onChangeOneParam('searchText')(value);
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 50,
		},
		{
			title: tField('shortcutPromName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) => (
				<AvatarWithText
					linkTo={
						DX.canAccessFuture2('dev/view-coupon-by-dev', user.permissions)
							? `${pathname}/${record.id}/detail`
							: null
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
						!DX.canAccessFuture2('dev/change-status-coupon-by-dev', user.permissions)
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

	useEffect(() => {
		setSelectionRowKeys([]);
		setDirty(false);
	}, [searchText, status, duration, approveStatus]);

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
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={couponList} />
				{DX.canAccessFuture2('dev/create-coupon', user.permissions) && (
					<Button
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.dev.createPath('/promotion/coupon/create'))}
					>
						{tButton('opt_create', { field: 'prom' })}
					</Button>
				)}
			</div>
			<div className="flex justify-between mt-5">
				<div className="flex gap-6 tablet:gap-4 tablet:flex-wrap w-10/12 tablet:w-9/12">
					<SearchCommon
						placeholder={tField('promName')}
						onSearch={onSearch}
						defaultValue={searchText}
						autoFocus
						maxLength={200}
						className="w-3/12 tablet:w-5/12"
					/>
					<Select className="w-3/12 tablet:w-5/12" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions(
							tFilterField('prefix', 'status'),
							displayOptions.map((e) => ({
								...e,
								label: tFilterField('activeStatusOptions', e.label),
							})),
						)}
					</Select>
					<Select className="w-3/12 tablet:w-5/12" value={duration} onSelect={onChangeOneParam('duration')}>
						{renderOptions(
							tFilterField('prefix', 'dueDate'),
							durationOptions.map((e) => ({
								...e,
								label: tFilterField('dueDateOptions', e.label),
							})),
						)}
					</Select>
					<Select
						className="w-3/12 tablet:w-5/12"
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
				</div>
				{DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions) && (
					<div className=" w-2/12 lg:w-3/12 flex justify-end lg:items-start">
						<div className="flex items-center">
							<span className="mr-4">
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
				rowSelection={
					DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions) ? { ...rowSelection } : null
				}
				className="mt-8"
				columns={getColumnSortDefault(columns)}
				{...configTable}
			/>
		</div>
	);
}
