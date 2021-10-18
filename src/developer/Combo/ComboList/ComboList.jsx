import { Table, Tag, Switch, Select, Modal, message, Button } from 'antd';
import { useLng, usePagination } from 'app/hooks';
import { DevCombo, CategoryPortal, DX, SaasAdmin } from 'app/models';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { uniqBy as _uniqBy } from 'opLodash';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { AvatarWithText, SelectDebounce } from 'app/components/Atoms';
import { useMutation, useQuery } from 'react-query';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import renderOptions from 'app/components/Atoms/renderOptions';
import AddIcon from '../../../app/icons/AddIcon';
import useUser from '../../../app/hooks/useUser';

const VISIBLE = 'VISIBLE';
const INVISIBLE = 'INVISIBLE';
const ERROR_NOT_OWN = 'error.addon.user.not.own';
const NOT_OWN_ERROR = 'error.coupon.user.not.own';

export default function ComboListDev() {
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('dev/view-combo', user.permissions);
	const CAN_CREATE = DX.canAccessFuture2('dev/create-combo', user.permissions);
	const CAN_DELETE = DX.canAccessFuture2('dev/delete-combo', user.permissions);
	const CAN_CHANGE_STATUS = DX.canAccessFuture2('dev/change-status-combo', user.permissions);

	const { displayApprove, displayOptions } = DevCombo;
	const { configTable, page, pageSize, query, onChangeOneParam, refetch, getColumnSortDefault } = usePagination(
		(params) => {
			params.createdBy = params.createdName;
			params.createdName = null;
			return DevCombo.getAllPagination(params);
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
		parseInt(query.get('createdName'), 10) || null,
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

	const deletePromoMutation = useMutation(DevCombo.deleteCombo, {
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

	const putStatusMutation = useMutation(DevCombo.putOnOffStatus, {
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
				checked === VISIBLE
					? `Bạn có muốn ẩn hiển thị Combo dịch vụ ${record.name} này?`
					: `Bạn có muốn hiển thị Combo dịch vụ ${record.name} này?`,
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
			const { content: res } = await DevCombo.getListDeveloper({
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
					linkTo={CAN_VIEW && DX.dev.createPath(`/combo/${record.id}`)}
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
					disabled={record.approvedStatus !== 'APPROVED' || !CAN_CHANGE_STATUS}
					checked={value === DevCombo.tagDisplay.VISIBLE.value}
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
						record.isSubscription === 'No')) && (
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
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={comboList} />
				{CAN_CREATE && (
					<Button
						className="float-right ml-auto"
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.dev.createPath('/combo/create'))}
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
						onClear={() => onChangeOneParam('createdName')('')}
						defaultValue={createdName}
					/>
				</div>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns.filter((e) => !e.hide))} {...configTable} />
		</div>
	);
}
