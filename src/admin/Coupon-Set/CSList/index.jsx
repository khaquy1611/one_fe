import React, { useEffect, useState } from 'react';
import { Button, message, Modal, Select, Switch, Table, Tag } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import UrlBreadcrumb from '../../../app/components/Atoms/UrlBreadcrumb';
import AddIcon from '../../../app/icons/AddIcon';
import { AdminCoupon, CategoryCurrency, DevCouponSet, DevCoupon, DX, SaasAdmin, Users } from '../../../app/models';
import useUser from '../../../app/hooks/useUser';
import { useLng, usePagination } from '../../../app/hooks';

import { AvatarWithText, renderOptions, SearchCommon } from '../../../app/components/Atoms';
import { DeleteIcon } from '../../../app/icons';
import DepartmentDev from '../../../app/models/DepartmentDev';
import { parseObjToQueryString, parseQueryStringToObjectStc } from '../../../app/helpers';

// import SearchCommon from '../../../app/components/Atoms/SearchCommon';
// import renderOptions from '../../../app/components/Atoms/renderOptions';
// import { SelectDebounce } from '../../../app/components/Atoms';

const TRUE = 'TRUE';
const styleName = { color: '#f5222d' };

const COUPONSETNAME = 'name';
const STATUS = 'status';
const COUPONID = 'couponId';
const { Option } = Select;

function Index() {
	const { displayApprove, displayOptionsStatusFormatStc, durationOptions } = AdminCoupon;
	const { pathname } = useLocation();
	const { user } = useUser();
	const [selectionRowKeys, setSelectionRowKeys] = useState([]);
	const [dirty, setDirty] = useState(false);
	const { tMessage, tButton, tOthers, tField, tFilterField } = useLng();

	const history = useHistory();

	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		(params) => {
			params.query ? null : (params.query = ``);
			console.log(params.query);
			return DevCouponSet.search(params);
		},
		['query'],
		{
			sort: '',
		},
	);
	const [searchSme, setSearchSme] = useState();
	const { data: couponList, isFetching: couponListLoading } = useQuery(
		['getOptionsSme', searchSme],
		async () => {
			try {
				const { content } = await DevCouponSet.getListCoupon();
				return content.map((e) => ({
					label: e.name,
					value: e.id,
				}));
			} catch (e) {
				return [];
			}
		},
		{
			initialData: [],
		},
	);

	const CAN_DELETE = DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions);
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

	// const onSearch = (value) => {
	// 	onChangeOneParam('name')(value);
	// };

	const deleteRecord = useMutation(DevCouponSet.deleteCopuonSetById, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'couponSet' }));
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === 'error.couponSet.has.child') {
				message.error(tMessage('err_department_child'));
			} else if (e.errorCode === 'error.department.active') {
				message.error(tMessage('err_inactive_department_not_create_delete'));
			} else if (e.status === 404) {
				message.error(tMessage('err_400_department'));
				refetch();
			}
		},
	});

	function handleDelete(checked, record) {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'couponSet' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deleteRecord.mutate({
					id: record.id,
				});
			},
			confirmLoading: deleteRecord.isLoading,
		});
	}

	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 50,
		},
		{
			title: tField('shortcutCodeName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) => (
				<AvatarWithText
					linkTo={
						`${pathname}/${record.id}/detail`
						// DX.canAccessFuture2('dev/view-coupon-by-dev', user.permissions)
						// 	? `${pathname}/${record.id}/detail`
						// 	: null
					}
					name={value}
					icon={record.icon}
					style={record.hasDraft === TRUE ? styleName : null}
				/>
			),
			ellipsis: true,
			width: 170,
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			key: 'status',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatusSTC[value] || SaasAdmin.tagStatusSTC['0'];
				return <Tag color={tagInfo?.color}>{tFilterField('actionstatus', `${value}`)}</Tag>;
			},
			width: 150,
		},
		{
			title: tField('promName'),
			dataIndex: 'couponName',
			key: 'couponName',
			width: 170,
		},
		{
			title: tField('promoDiscountValue'),
			dataIndex: 'discountValue',
			key: 'discountValue',
			render: (value, record) => (record.discountValue ? DX.formatNumberCurrency(record.discountValue) : ''),
		},
		{
			title: tField('endDate'),
			render: (endDate) => DX.formatDate(endDate, 'DD/MM/YYYY'),
			dataIndex: 'endDate',
			key: 'endDate',
		},
		{
			title: tField('couponCodeQuantity'),
			dataIndex: 'totalCouponCode',
			key: 'totalCouponCode',
			render: (value, record) => (record.totalCouponCode ? record.totalCouponCode : '-'),
		},
		{
			title: tField('totalCouponCodeUsed'),
			dataIndex: 'totalUsed',
			key: 'totalUsed',
			render: (value, record) => (record.totalUsed ? record.totalUsed : '-'),
		},
		{
			title: tField('totalCouponCodeInactive'),
			dataIndex: 'totalInactive',
			key: 'totalInactive',
			render: (value, record) => (record.totalInactive ? record.totalInactive : '-'),
		},
		{
			title: tField('create_date'),
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (createdAt) => DX.formatTimestamp(createdAt, 'DD/MM/YYYY'),
			sorter: {},
		},
		{
			dataIndex: 'id',
			render: (value, record) => (
				<>
					<Button
						type="text "
						className="text-black p-0"
						onClick={() => handleDelete(value, record)}
						icon={<DeleteIcon width="w-4" />}
					/>
				</>
			),
			width: '4rem',
			hide: !CAN_DELETE,
		},
	];

	const [queryString] = [query.get('query') || ''];
	const queryObjParsed = parseQueryStringToObjectStc(queryString);

	const onSearch = (value, type) => {
		// console.log('onSearch call',queryObjParsed , value  , type)
		console.log(queryObjParsed);
		let stringSearchSTCFormat = '';
		if (type === COUPONSETNAME) {
			queryObjParsed.name = value ? `*${value}*` : '';
		}
		if (type === STATUS) {
			queryObjParsed.status = value;
		}
		if (type === COUPONID) {
			queryObjParsed.couponId = value;
		}
		stringSearchSTCFormat = parseObjToQueryString(queryObjParsed);
		onChangeOneParam('query')(stringSearchSTCFormat);
	};

	useEffect(() => {
		setSelectionRowKeys([]);
		setDirty(false);
	}, [queryString]);

	const couponSetList = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'couponSet',
			url: '',
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={couponSetList} />
			</div>
			<div className="flex justify-between mt-5">
				<div className="flex gap-6 tablet:gap-4 tablet:flex-wrap w-10/12 tablet:w-9/12">
					<SearchCommon
						placeholder={tField('couponSetName')}
						onSearch={(value) => onSearch(value, COUPONSETNAME)}
						defaultValue={queryObjParsed?.name?.replaceAll('*', '')}
						autoFocus
						maxLength={200}
						className="w-3/12 tablet:w-5/12 "
					/>
					<Select
						className="w-3/12 tablet:w-5/12 "
						value={queryObjParsed.status || ''}
						onSelect={(value) => onSearch(value, STATUS)}
					>
						{renderOptions(
							tFilterField('prefix', 'status'),
							displayOptionsStatusFormatStc.map((e) => ({
								...e,
								label: tFilterField('actionstatus', e.label),
							})),
						)}
					</Select>
					<Select
						className="w-3/12 tablet:w-5/12"
						// placeholder={tField('opt_select', {field: 'prom'})}
						placeholder={tField('allCouponSet')}
						mode="multiple"
						loading={couponListLoading}
						value={queryObjParsed.couponId}
						maxTagCount={1}
						onChange={(value) => {
							onSearch(value.length > 0 ? value : '', COUPONID);
						}}
					>
						{couponList.map((option) => (
							<Option value={option.value} className="ant-prefix">
								<span>
									{option.label.length > 14 ? option.label.substr(0, 11).concat('...') : option.label}
								</span>
							</Option>
						))}
					</Select>
				</div>
				{
					// DX.canAccessFuture2('dev/create-coupon', user.permissions) && (
					<Button
						type="primary"
						icon={<AddIcon width="w-4" />}
						onClick={() => history.push(DX.admin.createPath('/promotion/coupon-set/create'))}
					>
						{tButton('opt_create', { field: 'couponSet' })}
					</Button>
					// )
				}
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}

export default Index;
