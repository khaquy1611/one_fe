import React, { useState } from 'react';
import { Table, Tag, Select, message, Button, Switch, Modal } from 'antd';
import { usePagination, useLng } from 'app/hooks';
import { DX, AdminCombo, SaasAdmin, CategoryPortal } from 'app/models';
import { useHistory } from 'react-router-dom';
import { uniqBy as _uniqBy } from 'opLodash';
import { UrlBreadcrumb, SearchCommon, renderOptions, SelectDebounce } from 'app/components/Atoms';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import AddIcon from 'app/icons/AddIcon';
import { useMutation, useQuery } from 'react-query';
import useUser from '../../../app/hooks/useUser';

const VISIBLE = 'VISIBLE';
const INVISIBLE = 'INVISIBLE';
const ERROR_NOT_OWN = 'error.addon.user.not.own';
const NOT_OWN_ERROR = 'error.coupon.user.not.own';

export default function ComboListAdmin() {
	const { user } = useUser();
	const CAN_CREATE = DX.canAccessFuture2('admin/create-combo', user.permissions);
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-combo', user.permissions);
	const CAN_VIEW = DX.canAccessFuture2('admin/view-combo', user.permissions);
	const CAN_DELETE = DX.canAccessFuture2('admin/delete-combo', user.permissions);
	const CAN_CHANGE_STATUS = DX.canAccessFuture2('admin/change-status-combo', user.permissions);

	const { displayAuthorize, displayApprove, displayOptions } = AdminCombo;
	const { configTable, page, pageSize, query, onChangeOneParam, refetch, getColumnSortDefault } = usePagination(
		(params) => {
			if (params.createdName && !['ADMIN', 'DEV', ''].includes(params.createdName)) {
				params.createdBy = params.createdName;
				params.createdName = null;
			}
			return AdminCombo.getAllPagination(params);
		},

		['approvedStatus', 'categoryId', 'name', 'displayedStatus', 'createdName'],
		{
			sort: 'createdAt,desc',
		},
	);
	const { tField, tButton, tFilterField, tMessage } = useLng();
	const [approvedStatus, categoryId, name, displayedStatus, createdName] = [
		query.get('approvedStatus') || '',
		query.get('categoryId')
			? query
					.get('categoryId')
					.split(',')
					.map((el) => parseInt(el, 10))
			: [],
		query.get('name') || '',
		query.get('displayedStatus') || '',
		parseInt(query.get('createdName'), 10) || '',
	];

	const { data: categorySelect } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			return [
				...res.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	const deletePromoMutation = useMutation(AdminCombo.deleteCombo, {
		onSuccess: () => {
			message.success('Xóa gói Combo dịch vụ thành công');
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === ERROR_NOT_OWN) return message.error(tMessage('err_NOT_OWN'));
			return message.error('Lỗi');
		},
	});
	const handleDeletePromotion = (record) => {
		Modal.confirm({
			title: `Bạn có chắc chắn muốn xóa Combo ${record.name}?`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deletePromoMutation.mutate(record.id);
			},
			confirmLoading: deletePromoMutation.isLoading,
		});
	};

	const putStatusMutation = useMutation(AdminCombo.putOnOffStatus, {
		onSuccess: () => {
			message.success('Cập nhật trạng thái hiển thị thành công');
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === NOT_OWN_ERROR) return message.error(tMessage('err_coupon_user_not_own'));
			return message.error(tMessage('opt_badlyUpdated', { field: 'status' }));
		},
	});

	const handleClickSwitch = (checked, record) => {
		Modal.confirm({
			title:
				checked === INVISIBLE
					? `Bạn có muốn hiển thị Combo dịch vụ ${record.name} này?`
					: `Bạn có muốn ẩn hiển thị Combo dịch vụ ${record.name} này?`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				let value = '';
				if (checked === VISIBLE) value = INVISIBLE;
				else value = VISIBLE;
				putStatusMutation.mutate({
					id: record.id,
					displayedStatus: value,
				});
			},
			confirmLoading: putStatusMutation.isLoading,
		});
	};

	const onSearch = (value) => {
		onChangeOneParam('name')(value);
	};

	const fetchDeveloper = async (searchValue) => {
		try {
			const { content: res } = await AdminCombo.getListDeveloper({
				page: 0,
				size: 10,
				fullName: searchValue,
			});
			const temp = res.map((item) => ({
				value: item.id,
				label: item.fullName,
			}));

			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};

	const history = useHistory();
	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 60,
		},
		{
			title: tField('comboName'),
			dataIndex: 'name',
			render: (value, record) => (
				<AvatarWithText
					name={value}
					icon={record.icon || record.iconEmbedUrl}
					linkTo={CAN_VIEW && DX.admin.createPath(`/combo/${record.id}`)}
				/>
			),
			sorter: {},
		},
		{
			title: tField('serviceComboPackageQuantity'),
			dataIndex: 'quantity',
			sorter: {},
			align: 'center',
			width: 160,
		},
		{
			title: tField('display'),
			dataIndex: 'displayedStatus',
			render: (value, record) => (
				<Switch
					disabled={
						record.approvedStatus !== 'APPROVED' ||
						record.labelName === 'DEV' ||
						!CAN_CHANGE_STATUS ||
						!DX.checkIsOwnerProvince(user?.department?.provinceId, record?.provinceId)
					}
					checked={value === AdminCombo.tagDisplay.VISIBLE.value}
					onChange={(_, event) => {
						handleClickSwitch(value, record);
						event.stopPropagation();
					}}
				/>
			),
			sorter: {},
			width: 120,
		},
		{
			title: tField('approvalStatus'),
			dataIndex: 'approvedSort',
			render: (value, record) => {
				const tagInfo = SaasAdmin.tagStatus[record.approvedStatus] || {};
				return <Tag color={tagInfo?.color}>{tFilterField('approvalStatusOptions', tagInfo?.text)}</Tag>;
			},
			sorter: {},
			width: 180,
		},
		{
			title: tField('creator'),
			dataIndex: 'createdName',
			render: (value, record) => {
				const createdByPortal = AdminCombo.createdBy[record.labelName] || {};
				return (
					<div className="flex gap-2">
						<div className="truncate mt-1">{record.createdName}</div>
						<Tag color={createdByPortal?.color}>{createdByPortal.text}</Tag>
					</div>
				);
			},
			sorter: {},
			width: 230,
		},
		{
			title: tField('updateTime'),
			dataIndex: 'updatedTime',
			sorter: {},
			width: 200,
		},
		{
			dataIndex: 'delete',
			render: (_, record) =>
				((record.approvedStatus === 'UNAPPROVED' && record.statusBrowsing === 'NEVER_BROWSED') ||
					record.approvedStatus === 'REJECTED' ||
					(record.approvedStatus === 'APPROVED' &&
						record.displayedStatus === 'INVISIBLE' &&
						record.isSubscription === 'No')) &&
				record.labelName !== 'DEV' &&
				DX.checkIsOwnerProvince(user?.department?.provinceId, record?.provinceId) && (
					<Button
						onClick={() => handleDeletePromotion(record)}
						type="link"
						className="text-black"
						icon={<DeleteOutlined />}
					/>
				),
			width: '4rem',
			hide: !CAN_DELETE,
		},
	];

	const comboList = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'comboList',
			url: '',
		},
	];

	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={comboList} />
				{CAN_CREATE && (
					<Button
						className="float-right ml-auto"
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.admin.createPath('/combo/create'))}
					>
						{tButton('opt_create', { field: 'serviceCombo' })}
					</Button>
				)}
			</div>
			<div className="flex mt-5 justify-between">
				<div className="flex gap-y-6 flex-wrap">
					<SearchCommon
						placeholder={tField('comboName')}
						autoFocus
						onSearch={onSearch}
						defaultValue={name}
						maxLength={100}
						className="w-60 mr-6"
					/>
					<Select
						className="w-60 mr-6"
						value={categoryId}
						mode="multiple"
						maxTagCount="responsive"
						onChange={(values) => {
							// if (values[0] === null) {
							// 	onChangeOneParam('categoryId')(values.slice(1).join(',') || undefined);
							// } else {
							onChangeOneParam('categoryId')(values.join(',') || undefined);
							// }
						}}
						showArrow
						placeholder="Danh mục: Tất cả"
						options={[...categorySelect]}
					/>
					<Select
						className="w-60 mr-6"
						value={displayedStatus}
						onSelect={onChangeOneParam('displayedStatus')}
					>
						{renderOptions(
							tFilterField('prefix', 'displayStatus'),
							displayOptions.map((e) => ({
								...e,
								label: tFilterField('displayStatusOptions', e.label),
							})),
						)}
					</Select>
					<Select className="w-60 mr-6" value={approvedStatus} onSelect={onChangeOneParam('approvedStatus')}>
						{renderOptions(
							tFilterField('prefix', 'approvalStatus'),
							displayApprove.map((e) => ({
								...e,
								label: tFilterField('approvalStatusOptions', e.label),
							})),
						)}
					</Select>
					<SelectDebounce
						className="w-60 mr-6"
						showSearch
						allowClear
						placeholder="Người tạo: Tất cả"
						fetchOptions={fetchDeveloper}
						onSelect={onChangeOneParam('createdName')}
						defaultValue={createdName}
						onClear={() => onChangeOneParam('createdName')('')}
					>
						{['ADMIN', 'DEV', ''].includes(createdName) &&
							renderOptions(
								tFilterField('prefix', 'person'),
								displayAuthorize.map((e) => ({
									...e,
									label: tFilterField('permissionOptions', e.label),
								})),
							)}
					</SelectDebounce>
				</div>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns.filter((x) => !x.hide))} {...configTable} />
		</div>
	);
}
