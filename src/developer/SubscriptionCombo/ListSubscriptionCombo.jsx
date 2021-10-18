import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Menu, message, Modal, Select, Table, Tag, Tooltip } from 'antd';
import { AvatarWithText, renderOptions } from 'app/components/Atoms';
import SearchCommon from 'app/components/Atoms/SearchCommon';
import { usePaginationLocal, useUser, useLng } from 'app/hooks';
import { DX } from 'app/models';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import moment from 'moment';
import React from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { SubscriptionDev } from 'app/models';

const rootPath = `${DX.sme.createPath('/account/combo')}`;

const TYPE = {
	DAILY: ' ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};

const activeOptions = [
	{
		value: '',
		label: 'Tất cả',
	},
	{
		value: 'ACTIVE',
		label: 'Hoạt động',
	},
	{
		value: 'IN_TRIAL',
		label: 'Dùng thử',
	},
	{
		value: 'FUTURE',
		label: 'Đang chờ',
	},
	{
		value: 'CANCELLED',
		label: 'Đã hủy',
	},
	{
		value: 'NON_RENEWING',
		label: 'Kết thúc',
	},
];

const comboTypeOptions = [
	{
		value: '',
		label: 'Tất cả',
	},
	{
		value: 'SERVICE',
		label: 'Phần mềm',
	},
	{
		value: 'ORDER',
		label: 'Dịch vụ order',
	},
];

function getChildren(array) {
	const rs = [];
	if (array.length > 0) {
		for (let i = 0; i < array.length; i++) {
			const combo = array[i];
			rs.push({
				...combo,
				comboName: combo.serviceName,
				comboPlanName: combo.pricingName,
				status: null,
				nextPaymentTime: null,
				price: null,
			});
		}
		return rs;
	}
	return null;
}
export default function ListSubscriptionCombo({ typePortal = 'DEV' }) {
	const { user } = useUser();
	const { tField, tOthers, tFilterField } = useLng();
	function checkRecordDelete(record) {
		if (!user.department?.provinceId && typePortal === 'ADMIN') {
			if (record?.provinceId !== null && record?.portalType === 'ADMIN') return false;
			return true;
		}
		if (user.department?.provinceId && typePortal === 'ADMIN') {
			if (
				(record?.provinceId === null || user.department?.provinceId !== record?.provinceId) &&
				record?.portalType === 'ADMIN'
			)
				return false;
			return true;
		}
		return true;
	}
	const CAN_VIEW =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/view-subscription', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/view-subscription', user.permissions));

	const CAN_DELETE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/delete-register-subscription', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/delete-register-subscription', user.permissions));

	const CAN_CREATE_TRIAL =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-trial-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-trial-subscription-combo', user.permissions));

	const CAN_CREATE =
		(typePortal === 'DEV' && DX.canAccessFuture2('dev/register-subscription-combo', user.permissions)) ||
		(typePortal === 'ADMIN' && DX.canAccessFuture2('admin/register-subscription-combo', user.permissions));
	const { pathname } = useLocation();
	const history = useHistory();
	const isCombo = history.location.pathname.indexOf('combo') !== -1;
	const { configTable, refetch, onChangeOneParam, page, pageSize, filterLocal } = usePaginationLocal(
		async (params) => {
			const res = await ComboSubscriptionDev.getListComboSubscription(params, typePortal);
			res.content.forEach((e, i) => {
				e.children = getChildren(e.pricingList);
				delete e.pricingList;
			});
			return res;
		},
		['nameSearch', 'companyName', 'devName', 'status', 'type'],
		{
			sort: '',
		},
		'getListComboSubs',
		{
			initialData: [],
			enabled: isCombo,
		},
	);
	const TagStatus = (statusTag, prefix) => {
		const Status = ComboSubscriptionDev.statusArray.filter((item) => item.value === statusTag)[0];
		return (
			<Tag color={Status?.color} className="w-28">
				{('Trạng thái', Status?.label)}
			</Tag>
		);
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
	const [nameSearch, companyName, devName, status, type] = [
		filterLocal.nameSearch || '',
		filterLocal.companyName || '',
		filterLocal.devName || '',
		filterLocal.status || '',
		filterLocal.type || '',
	];
	const DropdownMenu = (
		<Menu className="top-1 w-44">
			<Menu.Item key="1" disabled={!CAN_CREATE} onClick={() => history.push(`${pathname}/register`)}>
				Thuê bao Combo
			</Menu.Item>
			<Menu.Item
				key="2"
				disabled={!CAN_CREATE_TRIAL}
				onClick={() => history.push(`${pathname}/register?isTrial=true`)}
			>
				Dùng thử Combo
			</Menu.Item>
		</Menu>
	);
	// -------------------------------button delete -------------------------------;//
	const deleteRecord = useMutation(ComboSubscriptionDev.deleteSubscriptionCombo, {
		onSuccess: () => {
			message.success('Thuê bao đã được xóa thành công.');
			refetch();
		},
		onError: (e) => {
			// if (e.errorCode === 'error.department.has.child') {
			// 	message.error('Không thể xóa thuê bao đang có thuê bao con trực thuộc');
			// } else if (e.errorCode === 'error.department.active') {
			// 	message.error('Không thể xóa thuê bao do vẫn còn nhân viên đang hoạt động');
			// } else if (e.status === 404) {
			// 	message.error('thuê bao không tồn tại trong hệ thống');
			// 	refetch();
			// }
			message.error('Không thể xóa thuê bao đã được kích hoạt.');
		},
	});

	function handleDelete(record) {
		Modal.confirm({
			title: `Bạn có chắc chắn muốn xóa thuê bao ${record.comboName} này?`,
			icon: <ExclamationCircleOutlined />,
			okText: 'Đồng ý',
			cancelText: 'Hủy',
			onOk: () => {
				const data = {};
				data.id = record.id;
				data.type = typePortal;
				deleteRecord.mutate(data);
			},
			//	confirmLoading: updateStatus.isLoading,
		});
	}
	const columns = [
		{
			title: '',
			width: 30,
		},
		{
			title: (
				<span>
					Thông tin gói <br />
					combo dịch vụ
				</span>
			),
			dataIndex: 'comboName',
			render: (value, record) => {
				if (record.serviceId)
					return (
						<div className="flex items-center ml-5">
							<Avatar src={record.filePath || record.extLink} className="mr-2 flex-none">
								{record.serviceName}
							</Avatar>
							<div className="truncate">
								<Tooltip title={record.serviceName}>
									<span>{record.serviceName}</span>
								</Tooltip>
								<br />
								<Tooltip title={record.pricingName} placement="leftBottom">
									<span className="text-sm text-gray-400">{record.pricingName}</span>
								</Tooltip>
							</div>
						</div>
					);
				return (
					<AvatarWithText
						name={value}
						icon={record.filePath || record.extLink}
						linkTo={CAN_VIEW && `${pathname}/${record.id}`}
						subName={record.comboPlanName}
					/>
				);
			},
			ellipsis: true,
			sorter: {},
		},
		{
			title: (
				<span>
					Thông tin <br /> khách hàng
				</span>
			),
			dataIndex: 'companyName',
			render: (value, record) => {
				if (!record.serviceId) {
					return (
						<>
							<Tooltip title={value} placement="leftBottom">
								<span className="line-clamp-1">{value}</span>
							</Tooltip>
							<span className="text-sm text-gray-400">{record.taxNo}</span>
						</>
					);
				}
				return null;
			},
			sorter: {},
		},
		{
			title: 'Nhà cung cấp',
			dataIndex: 'devName',
			render: (value) => (
				<Tooltip title={value} placement="leftBottom">
					<span className="line-clamp-2">{value}</span>
				</Tooltip>
			),
			sorter: {},
			hide: typePortal === 'DEV',
		},
		{
			title: (
				<span>
					Trạng thái <br /> hoạt động
				</span>
			),
			dataIndex: 'statusSort',
			align: 'center',
			render: (value, record) => record.status && TagStatus(record.status, 'value'),
			width: 150,
			sorter: {},
		},
		{
			title: (
				<span>
					Trạng thái <br /> đơn hàng
				</span>
			),
			dataIndex: 'orderService',
			align: 'center',
			render: (value, record) => record.orderService && TagOrderServiceStatus(record.orderService, 'value'),
			width: 150,
			sorter: false,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createDate',
			sorter: {},
			width: '9rem',
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'cycleType',

			render: (value, record) => {
				if (record.status === 'IN_TRIAL') return '';
				if (record.paymentCycle > 0) return `${record.paymentCycle} ${TYPE[record.cycleType]}`;
				if (record.paymentCycle === undefined) return '';
				return 'Không giới hạn';
			},
			sorter: {},
			width: '10rem',
		},
		{
			title: 'Số tiền (VND)',
			align: 'right',
			dataIndex: 'amount',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			sorter: {},
		},
		{
			title: (
				<span>
					Chu kỳ thanh toán <br /> tiếp theo
				</span>
			),
			dataIndex: 'nextPaymentTime',
			render: (value) => {
				if (value === '01/01/1970') return '';
				return value;
			},
			sorter: {},
			width: 120,
		},

		{
			dataIndex: 'id',
			align: 'center',

			render: (value, record) => (
				<>
					{((record.status === 'IN_TRIAL' && moment(record.startDate, 'DD/MM/YYYY').isAfter()) ||
						record.status === 'FUTURE') &&
						checkRecordDelete() && (
							<Button
								type="link"
								className="text-black"
								onClick={() => handleDelete(record)}
								icon={<DeleteOutlined />}
							/>
						)}
				</>
			),
			width: 50,
			hide: !CAN_DELETE,
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex gap-4 tablet:flex-wrap mb-8">
				<div className="flex justify-between gap-4 w-10/12 tablet:w-full">
					<SearchCommon
						className="w-full"
						placeholder="Tên combo dịch vụ"
						onSearch={(value) => {
							onChangeOneParam('nameSearch')(value);
						}}
						maxLength={100}
						defaultValue={nameSearch}
						autoFocus
					/>
					<SearchCommon
						className="w-full"
						placeholder="Khách hàng"
						onSearch={(value) => {
							onChangeOneParam('companyName')(value);
						}}
						maxLength={100}
						defaultValue={companyName}
					/>
					{typePortal === 'ADMIN' && (
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
					<Select className="w-full" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions('Trạng thái', activeOptions)}
					</Select>
					<Select
						className="w-full"
						value={type}
						onSelect={(value) =>
							value === '' ? onChangeOneParam('type')(null) : onChangeOneParam('type')(value)
						}
					>
						{renderOptions('Phân loại combo', comboTypeOptions)}
					</Select>
				</div>

				<div className="w-2/12 flex justify-end gap-4 tablet:w-full">
					{/* <Button type="default">
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
							<Button className="px-8" type="primary">
								Tạo mới
							</Button>
						</Dropdown>
					)}
				</div>
			</div>

			<Table
				columns={columns.filter((column) => !column.hide)}
				{...configTable}
				rowKey="id"
				rowClassName="tb-combo"
			/>
		</div>
	);
}
