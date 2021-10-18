import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, DatePicker, Dropdown, Menu, message, Modal, Select, Table, Tooltip } from 'antd';
import { AvatarWithText } from 'app/components/Atoms';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { useLng, usePaginationLocal, useUser } from 'app/hooks';
import { BillingPortal, DX, SubscriptionDev } from 'app/models';
import Subscription from 'app/models/DevSubscription';
import React from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const { RangePicker } = DatePicker;

const CustomRangePicker = styled(RangePicker)`
	.ant-picker-input:first-child {
		position: static;
		> input[value=''] {
			width: calc(100% - 26px);
			position: absolute;
			top: 0px;
			left: 0;
			height: 100%;
			z-index: 2;
			background-color: #fcfcfd;
			padding-left: 10px;
		}
	}
	/* &.ant-picker-focused {
		> .ant-picker-input:first-child {
			position: relative;
			> input[value=''] {
				width: unset;
				position: static;
				top: unset;
				left: unset;
				height: unset;
				z-index: unset;
				background-color: unset;
				&::placeholder {
					color: transparent;
				}
			}
		}
	} */
`;
const UNLIMITED = 'UNLIMITED';

export default function OrderServiceList({ type = 'DEV' }) {
	const { user } = useUser();
	const CAN_VIEW =
		(type === 'DEV' && DX.canAccessFuture2('dev/view-subscription', user.permissions)) ||
		(type === 'ADMIN' && DX.canAccessFuture2('admin/view-subscription', user.permissions));

	const CAN_DELETE =
		(type === 'DEV' && DX.canAccessFuture2('dev/delete-register-subscription', user.permissions)) ||
		(type === 'ADMIN' && DX.canAccessFuture2('admin/delete-register-subscription', user.permissions));

	const CAN_CREATE_TRIAL = false;
	// const CAN_CREATE_TRIAL =
	// 	(type === 'DEV' && DX.canAccessFuture2('dev/register-trial-subscription-combo', user.permissions)) ||
	// 	(type === 'ADMIN' && DX.canAccessFuture2('admin/register-trial-subscription-combo', user.permissions));

	const CAN_CREATE = false;
	// const CAN_CREATE =
	// 	(type === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
	// 	(type === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));

	const { tField, tOthers, tFilterField } = useLng();

	const history = useHistory();
	const isService = history.location.pathname.indexOf('service') !== -1;
	const { pathname } = useLocation();
	const { configTable, page, pageSize, refetch, onChangeOneParam, filterLocal } = usePaginationLocal(
		SubscriptionDev.getOrderServiceSubscription,
		['serviceName', 'devName', 'cusName', 'status', 'fromDate', 'toDate'],
		{
			portalType: type,
			sort: '',
		},
		'getListSubOrder',
		{
			initialData: [],
			enabled: isService,
		},
	);
	const DropdownMenu = (
		<Menu className="top-1 w-44">
			<Menu.Item disabled={!CAN_CREATE} key="1" onClick={() => history.push(`${pathname}/register`)}>
				Thuê bao
			</Menu.Item>
			<Menu.Item
				disabled={!CAN_CREATE_TRIAL}
				key="2"
				onClick={() => history.push(`${pathname}/register?isTrial=true`)}
			>
				Dùng thử
			</Menu.Item>
		</Menu>
	);
	const [serviceName, devName, cusName, status, fromDate, toDate] = [
		filterLocal.serviceName || '',
		filterLocal.devName || '',
		filterLocal.cusName || '',
		filterLocal.status || 'all',
		filterLocal.createAt || '',
		filterLocal.fromDate || '',
		filterLocal.toDate || '',
		filterLocal.sort || '',
	];

	const TagStatus = (data) => {
		const tagInfo = BillingPortal.tagStatus[data];
		if (!tagInfo) return null;

		return <div className="font-semibold">{tFilterField('paymentStatusOptions', tagInfo?.text)}</div>;
		// return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
	};

	const TagOrderServiceStatus = (data) => {
		const tagInfo = SubscriptionDev.orderServiceProcess[data];
		if (!tagInfo) return null;

		return (
			<div className="font-semibold" style={{ color: tagInfo?.color }}>
				{tFilterField('orderServiceProcessOptions', tagInfo?.text)}
			</div>
		);
		// return <Tag color={tagInfo?.color}>{tFilterField('orderServiceProcessOptions', tagInfo?.text)}</Tag>;
	};

	const updateStatus = useMutation(Subscription.updateStatus, {
		onSuccess: () => {
			message.success('Cập nhật bộ phận thành công');
			refetch();
		},
		onError: () => {},
	});
	const deleteRecord = useMutation(SubscriptionDev.cancelOrderServiceProcess, {
		onSuccess: () => {
			message.success('Xóa thành công!');
			refetch();
		},
		onError: (e) => {
			if (e?.errorCode === 'error.object.not.match') {
				Modal.error({
					title: 'Không thể xóa',
					content: 'orderReceiveId không phải của user đăng nhập!',
					onOk: () => refetch(),
				});
			} else if (e?.errorCode === 'error.object.in.progress') {
				Modal.error({
					title: 'Không thể xóa',
					content: 'Đơn hàng đang ở trạng thái "Đang triển khai"',
					onOk: () => refetch(),
				});
			} else if (e?.errorCode === 'error.object.was.cancelled') {
				Modal.error({
					title: 'Không thể xóa',
					content: 'Đơn hàng đã được bộ phận khác hủy',
					onOk: () => refetch(),
				});
			} else {
				Modal.error({
					title: 'Không thể xóa',
					content: 'Đơn hàng xóa không thành công',
					onOk: () => refetch(),
				});
			}
		},
	});

	function handleDelete(record) {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa đơn hàng?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Xóa',
			onOk: () => {
				const data = {};
				data.id = record.subscriptionId;
				data.typePortal = type;
				data.action = 'DELETE';
				deleteRecord.mutate(data);
			},
			confirmLoading: updateStatus.isLoading,
		});
	}
	const columns = [
		// {
		// 	title: '#',
		// 	dataIndex: 'subscriptionId',
		// 	render: (_, item, index) => item.subscriptionId && (page - 1) * pageSize + index + 1,
		// 	width: 98,
		// },
		{
			title: (
				<span>
					Thông tin <br /> gói dịch vụ
				</span>
			),
			dataIndex: 'serviceName',
			sorter: {},
			ellipsis: true,

			render: (value, record) => (
				<AvatarWithText
					name={value}
					icon={record.icon || record.embedURL}
					subName={record.pricingName}
					linkTo={CAN_VIEW && `${pathname}/${record.subscriptionId}`}
				/>
			),
		},
		{
			title: 'ID đơn hàng',
			dataIndex: 'orderReceiveId',
			render: (value) => (
				<Tooltip title={value}>
					<span className="line-clamp-1">{value || 'N/A'}</span>
				</Tooltip>
			),
			sorter: {},
		},
		{
			title: (
				<span>
					Thông tin <br /> khách hàng
				</span>
			),
			dataIndex: 'cusName',
			sorter: {},
			render: (value, record) => (
				<>
					<Tooltip title={value}>
						<div className="truncate">{value}</div>
					</Tooltip>
					<span className="text-sm text-gray-400">{record.tin}</span>
				</>
			),
			ellipsis: true,
		},
		{
			title: 'Nhà cung cấp',
			dataIndex: 'developerName',
			sorter: {},
			ellipsis: true,
			hide: type === 'DEV',
		},

		{
			title: 'Trạng thái đơn hàng',
			dataIndex: 'statusId',
			align: 'left',
			render: (value) => TagOrderServiceStatus(value),
			width: 120,
			sorter: {},
		},
		{
			title: 'Trạng thái thanh toán',
			dataIndex: 'paymentStatus',
			align: 'left',
			render: (value) => TagStatus(value),
			width: 120,
			sorter: {},
		},
		{
			title: 'Ngày tạo đơn hàng',
			dataIndex: 'createAt',
			render: (value) => (value === UNLIMITED ? tOthers('unlimited') : value), // DX.formatDate(value, 'DD/MM/YYYY')),
			sorter: {},
			width: '12%',
		},
		{
			title: `Số tiền`,
			align: 'right',
			dataIndex: 'totalAmount',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			sorter: {},
			// width: '15%',
		},
		{
			dataIndex: 'subscriptionId',
			render: (value, record) => (
				<>
					{[0, 1].includes(record.statusId) && (
						<Button
							type="link"
							className="text-black"
							onClick={() => handleDelete(record)}
							icon={<DeleteOutlined />}
						/>
					)}
				</>
			),

			hide: !CAN_DELETE,
			width: '3rem',
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex gap-4 tablet:flex-wrap mb-8">
				<div className="flex justify-between gap-4 w-10/12 tablet:w-full">
					<SearchCommon
						className="w-full"
						placeholder={tField('serviceName', { field: 'service' })}
						onSearch={(value) => {
							onChangeOneParam('serviceName')(value);
						}}
						autoFocus
						maxLength={100}
						defaultValue={serviceName}
					/>
					<SearchCommon
						className="w-full"
						placeholder="Khách hàng"
						onSearch={(value) => {
							onChangeOneParam('cusName')(value);
						}}
						maxLength={100}
						defaultValue={cusName}
					/>
					{type !== 'DEV' && (
						<SearchCommon
							className="w-full"
							placeholder="Nhà cung cấp"
							onSearch={(value) => {
								onChangeOneParam('devName')(value);
							}}
							maxLength={100}
							defaultValue={devName}
						/>
					)}
					<Select
						value={status}
						onSelect={(value) =>
							value === 'all' ? onChangeOneParam('status')(null) : onChangeOneParam('status')(value)
						}
						className="w-full"
						defaultValue={status}
					>
						<Select.Option value="all" className="ant-prefix" key="all">
							<span className="prefix">{tFilterField('prefix', 'statusOrder')}: </span>
							<span> {tFilterField('value', 'all')}</span>
						</Select.Option>
						{SubscriptionDev.orderServiceProcessStep.map((el) => (
							<Select.Option value={el.key.toString()} className="ant-prefix" key={el.key.toString()}>
								<span className="prefix">{tFilterField('prefix', 'statusOrder')}: </span>
								<span>{tFilterField('orderServiceProcessOptions', el.title)}</span>
							</Select.Option>
						))}
					</Select>
					<CustomRangePicker
						className="w-full"
						defaultValue={[fromDate, toDate]}
						placeholder={['Ngày tạo đơn hàng', '']}
						format="DD/MM/YYYY"
						onChange={(date, dateString) => {
							if (Array.isArray(dateString)) {
								onChangeOneParam('fromDate')(dateString[0]);
								onChangeOneParam('toDate')(dateString[1]);
							} else {
								onChangeOneParam('fromDate')('');
								onChangeOneParam('toDate')('');
							}
						}}
					/>
				</div>
				<div className="w-2/12 flex justify-end gap-4 tablet:w-full">
					{/* <Button type="default" onClick={() => exportSubscrip()}>
						Xuất danh sách
					</Button> */}

					{(CAN_CREATE || CAN_CREATE_TRIAL) && (
						<Dropdown
							overlay={DropdownMenu}
							trigger={['hover']}
							getPopupContainer={() => document.getElementById('headerId')}
							className="cursor-pointer"
							placement="bottomRight"
						>
							<Button className="mr-3 w-32" type="primary">
								Tạo mới
							</Button>
						</Dropdown>
					)}
				</div>
			</div>

			<Table columns={columns.filter((column) => !column.hide)} {...configTable} />
		</div>
	);
}
