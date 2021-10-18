import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, message, Modal, Select, Table, Tag, Tooltip } from 'antd';
import { AvatarWithText, renderOptions } from 'app/components/Atoms';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { usePaginationLocal, useUser } from 'app/hooks';
import { DX, SubscriptionDev } from 'app/models';
import Subscription from 'app/models/DevSubscription';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';

const TYPE = {
	DAILY: ' ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};

export default function ListSubscription({ type = 'DEV' }) {
	const { user } = useUser();
	const CAN_VIEW =
		(type === 'DEV' && DX.canAccessFuture2('dev/view-subscription', user.permissions)) ||
		(type === 'ADMIN' && DX.canAccessFuture2('admin/view-subscription', user.permissions));

	const CAN_DELETE =
		(type === 'DEV' && DX.canAccessFuture2('dev/delete-register-subscription', user.permissions)) ||
		(type === 'ADMIN' && DX.canAccessFuture2('admin/delete-register-subscription', user.permissions));

	const CAN_CREATE_TRIAL =
		(type === 'DEV' && DX.canAccessFuture2('dev/register-trial-subscription-combo', user.permissions)) ||
		(type === 'ADMIN' && DX.canAccessFuture2('admin/register-trial-subscription-combo', user.permissions));

	const CAN_CREATE =
		(type === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
		(type === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));

	const { t: t2 } = useTranslation('saas');
	const history = useHistory();
	const isService = history.location.pathname.indexOf('service') !== -1;
	const { pathname } = useLocation();
	const { configTable, page, pageSize, refetch, query, onChangeOneParam, filterLocal } = usePaginationLocal(
		SubscriptionDev.getListSubscription,
		['search', 'cusName', 'status', 'developerName'],
		{
			portalType: type,
		},
		'getListSub',
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
	const [searchText, cusName, status, developerName, sort] = [
		filterLocal.search || '',
		filterLocal.cusName || '',
		filterLocal.status || '',
		filterLocal.developerName || '',
		filterLocal.sort || '',
	];

	const updateStatus = useMutation(Subscription.updateStatus, {
		onSuccess: () => {
			message.success('Cập nhật bộ phận thành công');
			refetch();
		},
		onError: (e) => {},
	});
	const deleteRecord = useMutation(SubscriptionDev.deleteSupscription, {
		onSuccess: () => {
			message.success('Xóa thuê bao thành công');
			refetch();
		},
		onError: (e) => {},
	});

	function handleDelete(record) {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa thuê bao này?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Đồng ý',
			cancelText: 'Hủy',
			onOk: () => {
				const data = {};
				data.id = record.subscriptionId;
				data.type = type;
				deleteRecord.mutate(data);
			},
			confirmLoading: updateStatus.isLoading,
		});
	}
	function checkRecordDelete(record) {
		if (!user.department?.provinceId && type === 'ADMIN') {
			if (record?.provinceId !== null && record?.portalType === 'ADMIN') return false;
			return true;
		}
		if (user.department?.provinceId && type === 'ADMIN') {
			if (
				(record?.provinceId === null || user.department?.provinceId !== record?.provinceId) &&
				record?.portalType === 'ADMIN'
			)
				return false;
			return true;
		}
		return true;
	}
	async function exportSubscrip() {
		const customer = cusName;
		const sortValue = sort;
		const statusValue = status || null;
		try {
			const file = await SubscriptionDev.exportFileSub({
				search: searchText,
				cusName: customer,
				status: statusValue,
				portalType: type,
				sort: sortValue,
			});
			const fileContent = 'subscriptions';
			const userName = user.name.replaceAll(/\s/g, '_');
			const today = new Date();
			const dd = String(today.getDate()).padStart(2, '0');
			const mm = String(today.getMonth() + 1).padStart(2, '0');
			const yyyy = today.getFullYear();
			const fileName = `${fileContent}_${userName}_${yyyy}${mm}${dd}`;

			DX.exportFile(file, fileName);
		} catch (e) {
			message.error('Tải file lỗi');
		}
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
					icon={record.icon || record.embedUrl}
					subName={record.pricingName}
					linkTo={CAN_VIEW && `${pathname}/${record.subscriptionId}`}
				/>
			),
		},

		{
			title: (
				<span>
					Thông tin <br /> khách hàng
				</span>
			),
			dataIndex: 'customerName',
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
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (value) => {
				const tagInfo = SubscriptionDev.tagStatus[value] || {};
				return <Tag color={tagInfo?.color}>{t2(tagInfo?.text)}</Tag>;
			},
			width: 120,
			sorter: {},
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createAt',
			sorter: {},
			width: 120,
			ellipsis: true,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'type',
			render: (value, record) => {
				if (record.status === 'IN_TRIAL' || record.cycle?.paymentCycle === -1 || record.cycle?.type === -1)
					return '';

				if (record.cycle.paymentCycle > 0) return `${record.cycle.paymentCycle} ${TYPE[record.cycle?.type]}`;
				return 'Không giới hạn';
			},
			width: '10rem',
			sorter: {},
		},
		{
			title: 'Số tiền (VND)',
			dataIndex: 'totalAmount',
			sorter: {},
			render: (value) => DX.formatNumberCurrency(value),
			ellipsis: true,
		},
		{
			title: (
				<span>
					Chu kỳ thanh toán <br /> tiếp theo
				</span>
			),
			dataIndex: 'nextPaymentTime',
			sorter: {},
			width: 120,
		},
		{
			dataIndex: 'subscriptionId',
			render: (value, record) => (
				<>
					{((record.status === 'IN_TRIAL' && moment(record.startedAt, 'DD/MM/YYYY').isAfter()) ||
						record.status === 'FUTURE') &&
						checkRecordDelete() && (
							<Button
								type="text"
								className="text-black p-0"
								onClick={() => handleDelete(record)}
								icon={<DeleteOutlined />}
							/>
						)}
				</>
			),

			hide: !CAN_DELETE,
			width: 50,
		},
	];

	const activeOptions = [
		{
			value: '',
			label: 'Tất cả',
		},
		{
			value: 'FUTURE',
			label: 'Đang chờ',
		},
		{
			value: 'IN_TRIAL',
			label: 'Dùng thử',
		},
		{
			value: 'ACTIVE',
			label: 'Hoạt động',
		},
		{
			value: 'CANCELED',
			label: 'Hủy',
		},
		{
			value: 'NON_RENEWING',
			label: 'Kết thúc',
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex gap-4 tablet:flex-wrap mb-8">
				<div className="flex justify-between gap-4 w-10/12 tablet:w-full">
					<SearchCommon
						className="w-full"
						placeholder="Tên"
						onSearch={(value) => {
							onChangeOneParam('search')(value);
						}}
						autoFocus
						maxLength={100}
						defaultValue={searchText}
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
								onChangeOneParam('developerName')(value);
							}}
							maxLength={100}
							defaultValue={developerName}
						/>
					)}
					<Select className="w-full" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions('Trạng thái', activeOptions)}
					</Select>
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
							<Button type="primary" className="px-8">
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
