import React from 'react';
import { Table, Tag, Button, Modal, message, Select, Tooltip } from 'antd';
import { useMutation } from 'react-query';
import { usePaginationLocal, useLng, useUser } from 'app/hooks';
import { DX, SMESubscription } from 'app/models';
import { SearchCommon, AvatarWithText } from 'app/components/Atoms';
import { DeleteIcon } from 'app/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Avatar from 'antd/lib/avatar/avatar';
import moment from 'moment';

const rootPath = `${DX.sme.createPath('/account/combo')}`;
const STATUS = {
	FUTURE: 'FUTURE',
	IN_TRIAL: 'IN_TRIAL',
};

const ERROR = {
	ACTIVATED: 'error.subscription.activated',
	IN_USE: 'error.object.still.used',
};

const UNLIMITED = 'UNLIMITED';

const { Option } = Select;

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

export default function ComboList() {
	const { user } = useUser();
	const CAN_DELETE = DX.canAccessFuture2('sme/delete-register-subscription', user.permissions);
	const CAN_VIEW = DX.canAccessFuture2('sme/view-subscription', user.permissions);
	const { statusArray, getListComboSubscription } = SMESubscription;
	const { tButton, tField, tMessage, tOthers, tFilterField } = useLng();
	const { configTable, refetch, filterLocal, onChangeOneParam, content } = usePaginationLocal(
		async (params) => {
			const res = await getListComboSubscription(params);
			res.content.forEach((e, i) => {
				e.children = getChildren(e.pricingList);
				delete e.pricingList;
			});
			return res;
		},
		['nameSearch', 'companyName', 'status'],
		{
			sort: '',
		},
		'getListComboSubs',
	);

	const currency = content[0]?.currencyName || 'VND';

	const [nameSearch, companyName, status, type] = [
		filterLocal.nameSearch || '',
		filterLocal.companyName || '',
		filterLocal.status || '',
		filterLocal.type || '',
	];

	const TagStatus = (statusTag, prefix) => {
		const Status = statusArray.filter((item) => item.value === statusTag)[0];
		return (
			<Tag color={Status?.color} className="w-full mr-0">
				{tFilterField(prefix, Status?.label)}
			</Tag>
		);
	};

	const TagOrderServiceStatus = (data) => {
		const tagInfo = SMESubscription.orderServiceProcess[data];
		if (!tagInfo) return null;

		return (
			<div className="font-semibold" style={{ color: tagInfo?.color }}>
				{tFilterField('orderServiceProcessOptions', tagInfo?.text)}
			</div>
		);
		// return <Tag color={tagInfo?.color}>{tFilterField('orderServiceProcessOptions', tagInfo?.text)}</Tag>;
	};

	// -----------------------------------button delete----------------------------------//
	const deleteRecord = useMutation(SMESubscription.deleteComboSubscription, {
		onSuccess: () => {
			message.success('Thuê bao đã được xóa thành công');
			refetch();
		},
		onError: (e) => {
			if (e.errorCode === ERROR.ACTIVATED) message.error('Không thể xóa thuê bao đã được kích hoạt');
			else if (e.errorCode === ERROR.IN_USE) message.error('Không thể xóa thuê bao đang sử dụng');
			message.error('Xóa thuê bao không thành công');
		},
	});

	const handleDelete = (value, serviceName) => {
		Modal.confirm({
			title: `Bạn có chắc chắn muốn xóa thuê bao ${serviceName} này?`,
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
			title: '',
			width: 30,
		},
		{
			title: (
				<span>
					Thông tin gói combo <br /> dịch vụ
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
						linkTo={CAN_VIEW && `${rootPath}/${record.subscriptionId}/detail`}
						subName={record.comboPlanName}
					/>
				);
			},
			ellipsis: true,
			sorter: {},
		},
		{
			title: 'Nhà cung cấp',
			dataIndex: 'companyName',
			ellipsis: true,
			sorter: {},
		},
		{
			title: (
				<span>
					Trạng thái <br /> hoạt động
				</span>
			),
			dataIndex: 'status',
			align: 'center',
			render: (value) => value && TagStatus(value, 'value'),
			width: '18%',
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
			render: (value) => value && TagOrderServiceStatus(value, 'value'),
			width: '16%',
			sorter: false,
		},

		{
			title: `Số tiền (${currency})`,
			align: 'right',
			dataIndex: 'price',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			sorter: {},
			width: '15%',
		},
		{
			title: (
				<span>
					Chu kỳ TT <br /> tiếp theo
				</span>
			),
			dataIndex: 'nextPaymentTime',
			render: (value) => (value === UNLIMITED ? tOthers('unlimited') : value),
			sorter: {},
			width: 120,
		},
		{
			dataIndex: 'comboId',
			align: 'center',
			render: (value, record) =>
				(record.status === STATUS.FUTURE ||
					(record.status === STATUS.IN_TRIAL && trialDay(record.startDate))) && (
					<Button
						type="text"
						className="text-black p-0"
						onClick={() => handleDelete(value, record.comboName)}
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
					placeholder="Tên combo dịch vụ"
					onSearch={(value) => {
						onChangeOneParam('nameSearch')(value);
					}}
					maxLength={100}
					defaultValue={nameSearch}
				/>
				<SearchCommon
					className="w-full"
					placeholder="Nhà cung cấp"
					onSearch={(value) => {
						onChangeOneParam('companyName')(value);
					}}
					maxLength={100}
					defaultValue={companyName}
				/>

				<Select value={status} onSelect={onChangeOneParam('status')} className="w-full">
					{SMESubscription.statusArray.map((el) => (
						<Option value={el.value} className="ant-prefix" key={el.label}>
							<span className="prefix">{tFilterField('prefix', 'status')}: </span>
							<span>{tFilterField('value', el.label)}</span>
						</Option>
					))}
				</Select>
				<Select
					value={type}
					onSelect={(value) =>
						value === '' ? onChangeOneParam('type')(null) : onChangeOneParam('type')(value)
					}
					className="w-full"
				>
					{SMESubscription.comboTypeArray.map((el) => (
						<Option value={el.value} className="ant-prefix" key={el.label}>
							<span className="prefix">{tFilterField('prefix', 'comboType')}: </span>
							<span>{tFilterField('value', el.label)}</span>
						</Option>
					))}
				</Select>
			</div>

			<Table columns={columns} {...configTable} rowKey="subscriptionId" rowClassName="tb-combo" />
		</>
	);
}
