import React from 'react';
import { Table, Tag, Button, Modal, message, Select, Tooltip } from 'antd';
import { useMutation } from 'react-query';
import { usePaginationLocal, useLng, useUser } from 'app/hooks';
import { DX, SMESubscription } from 'app/models';
import { SearchCommon, AvatarWithText } from 'app/components/Atoms';
import { DeleteIcon } from 'app/icons';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const rootPath = `${DX.sme.createPath('/account/subscription')}`;
const STATUS = {
	FUTURE: 'FUTURE',
	IN_TRIAL: 'IN_TRIAL',
};
const UNLIMITED = 'UNLIMITED';
const { Option } = Select;

export default function SubscriptionList() {
	const { user } = useUser();
	const CAN_DELETE = DX.canAccessFuture2('sme/delete-register-subscription', user.permissions);
	const CAN_VIEW = DX.canAccessFuture2('sme/view-subscription', user.permissions);
	const { getAllPagination, statusArray } = SMESubscription;
	const { tButton, tField, tMessage, tOthers, tFilterField } = useLng();
	const { configTable, refetch, onChangeOneParam, filterLocal, content } = usePaginationLocal(
		getAllPagination,
		['search', 'developer', 'status'],
		{
			sort: '',
		},
	);

	const currency = content[0]?.currencyName || 'VND';

	const [search, developer, status] = [
		filterLocal.search || '',
		filterLocal.developer || '',
		filterLocal.status || '',
	];

	const TagStatus = (show, prefix) => {
		const Status = statusArray.filter((item) => item.value === show)[0];
		return (
			<Tag color={Status?.color} className="w-full mr-0">
				{tFilterField(prefix, Status?.label)}
			</Tag>
		);
	};

	// -----------------------------------button delete----------------------------------//
	const deleteRecord = useMutation(SMESubscription.deleteSubscription, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'subscriber' }));
			refetch();
		},
		onError: (e) => {
			if (e) message.error('Xóa thuê bao thất bại');
		},
	});

	const handleDelete = (value) => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa dịch vụ đã đăng ký?',
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deleteRecord.mutate(value);
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
					icon={record.icon || record.embedUrl}
					linkTo={CAN_VIEW && `${rootPath}/${record.id}/detail`}
					subName={record.pricingName}
				/>
			),
			sorter: {},
			ellipsis: true,
		},
		{
			title: 'Nhà cung cấp',
			dataIndex: 'developerName',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			align: 'center',
			render: (value) => TagStatus(value, 'value'),
			width: '18%',
			sorter: {},
		},
		{
			title: (
				<span>
					Chu kỳ TT <br /> tiếp theo
				</span>
			),
			dataIndex: 'nextPaymentDate',
			render: (value) => (value === UNLIMITED ? tOthers('unlimited') : value),
			sorter: {},
			width: 120,
		},
		{
			title: `Số tiền (${currency})`,
			align: 'right',
			dataIndex: 'amount',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			sorter: {},
			width: '15%',
		},
		{
			dataIndex: 'id',
			align: 'center',
			render: (value, record) =>
				(record.status === STATUS.FUTURE ||
					(record.status === STATUS.IN_TRIAL && trialDay(record.startDate))) && (
					<Button
						type="text"
						className="text-black p-0"
						onClick={() => handleDelete(value)}
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
						onChangeOneParam('search')(value);
					}}
					maxLength={100}
					defaultValue={search}
				/>
				<SearchCommon
					className="w-full"
					placeholder="Nhà cung cấp"
					onSearch={(value) => {
						onChangeOneParam('developer')(value);
					}}
					maxLength={100}
					defaultValue={developer}
				/>

				<Select value={status} onSelect={onChangeOneParam('status')} className="w-full">
					{SMESubscription.statusArray.map((el) => (
						<Option value={el.value} className="ant-prefix" key={el.label}>
							<span className="prefix">{tFilterField('prefix', 'status')}: </span>
							<span>{tFilterField('value', el.label)}</span>
						</Option>
					))}
				</Select>
			</div>

			<Table columns={columns.filter((x) => !x.hide)} {...configTable} />
		</>
	);
}
