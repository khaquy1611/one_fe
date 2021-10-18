import React from 'react';
import { Table, Tag, Button, Modal, message, Select, Tooltip, DatePicker } from 'antd';
import { useMutation } from 'react-query';
import { usePaginationLocal, useLng, useUser } from 'app/hooks';
import { BillingPortal, DX, SMESubscription } from 'app/models';
import { SearchCommon, AvatarWithText } from 'app/components/Atoms';
import { DeleteIcon } from 'app/icons';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const rootPath = `${DX.sme.createPath('/account/subscription')}`;
const STATUS = {
	FUTURE: 'FUTURE',
	IN_TRIAL: 'IN_TRIAL',
};
const UNLIMITED = 'UNLIMITED';
const { Option } = Select;
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

export default function OrderServiceList() {
	const { user } = useUser();
	const CAN_DELETE = DX.canAccessFuture2('sme/delete-register-subscription', user.permissions);
	const CAN_VIEW = DX.canAccessFuture2('sme/view-subscription', user.permissions);
	const { getOrderServiceSubscription, orderServiceProcess } = SMESubscription;
	const { tButton, tField, tMessage, tOthers, tFilterField } = useLng();
	const { configTable, refetch, onChangeOneParam, filterLocal, content } = usePaginationLocal(
		getOrderServiceSubscription,
		['serviceName', 'devName', 'status', 'fromDate', 'toDate'],
		{
			sort: '',
		},
		'getListSubOrder',
	);
	const currency = content[0]?.currencyName || 'VND';

	const [serviceName, devName, status, fromDate, toDate] = [
		filterLocal.serviceName || '',
		filterLocal.devName || '',
		filterLocal.status || 'all',
		filterLocal.toDate || '',
		filterLocal.fromDate || '',
	];

	const TagStatus = (data) => {
		const tagInfo = BillingPortal.tagStatus[data];
		if (!tagInfo) return null;

		return <div className="font-semibold">{tFilterField('paymentStatusOptions', tagInfo?.text)}</div>;
		// return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
	};

	const TagOrderServiceStatus = (data) => {
		const tagInfo = orderServiceProcess[data];
		if (!tagInfo) return null;

		return (
			<div className="font-semibold" style={{ color: tagInfo?.color }}>
				{tFilterField('orderServiceProcessOptions', tagInfo?.text)}
			</div>
		);
		// return <Tag color={tagInfo?.color}>{tFilterField('orderServiceProcessOptions', tagInfo?.text)}</Tag>;
	};

	// -----------------------------------button delete----------------------------------//
	const deleteRecord = useMutation(SMESubscription.deleteSubscription, {
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

	const handleDelete = (record) => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn hủy đơn hàng?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				deleteRecord.mutate({ id: record.orderReceiveId, action: 'DELETE' });
			},
		});
	};

	const trialDay = (startTime) => startTime && moment().isBefore(moment(startTime, 'DD/MM/YYYY'));

	const columns = [
		{
			title: 'Thông tin gói dịch vụ',
			dataIndex: 'serviceName',
			render: (value, record) => (
				<AvatarWithText
					name={value}
					icon={record.icon || record.embedURL}
					linkTo={CAN_VIEW && `${rootPath}/${record.subscriptionId}/detail`}
					subName={record.pricingName}
				/>
			),
			sorter: {},
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
			title: 'Nhà cung cấp',
			dataIndex: 'developerName',
			render: (value) => (
				<Tooltip title={value}>
					<span className="line-clamp-1">{value}</span>
				</Tooltip>
			),
			sorter: {},
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
			title: `Số tiền (${currency})`,
			align: 'right',
			dataIndex: 'totalAmount',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			sorter: {},
			// width: '15%',
		},
		{
			dataIndex: 'id',
			align: 'center',
			render: (value, record) =>
				[0, 1].includes(record.statusId) && (
					<Button
						type="text"
						className="text-black p-0"
						onClick={() => handleDelete(record)}
						icon={<DeleteIcon width="w-4" />}
					/>
				),
			hide: !CAN_DELETE,
			width: 60,
		},
	];

	return (
		<>
			<div className="flex justify-between mb-4 gap-4">
				<SearchCommon
					className="w-full"
					placeholder={tField('serviceName', { field: 'service' })}
					onSearch={(value) => {
						onChangeOneParam('serviceName')(value);
					}}
					maxLength={100}
					defaultValue={serviceName}
				/>
				<SearchCommon
					className="w-full"
					placeholder="Nhà cung cấp"
					onSearch={(value) => {
						onChangeOneParam('devName')(value);
					}}
					maxLength={100}
					defaultValue={devName}
				/>

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
					{SMESubscription.orderServiceProcessStep.map((el) => (
						<Select.Option value={el.key.toString()} className="ant-prefix" key={el.key.toString()}>
							<span className="prefix">{tFilterField('prefix', 'statusOrder')}: </span>
							<span>{tFilterField('orderServiceProcessOptions', el.title)}</span>
						</Select.Option>
					))}
				</Select>

				<CustomRangePicker
					defaultValue={[fromDate, toDate]}
					className="w-full"
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

			<Table columns={columns.filter((x) => !x.hide)} {...configTable} />
		</>
	);
}
