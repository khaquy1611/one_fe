import { DatePicker, Select, Table, Tag } from 'antd';
import { SearchCommon } from 'app/components/Atoms';
import { usePaginationLocal, useLng } from 'app/hooks';
import { SMESubscription, SubscriptionDev } from 'app/models';
import { convertTime } from 'app/validator';
import React from 'react';
import { useParams } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Option } = Select;

const STATUS_SERVICE = {
	FUTURE: 'FUTURE',
};

const COMBO = 'COMBO';

function DebitBalance({ statusService, typeSubscription, className, typePortal = 'sme' }) {
	const { id } = useParams();
	const { tOthers, tFilterField, tMenu, tField } = useLng();
	const { statusDebitBalance, debitBalanceType } = SMESubscription;

	// ----------pricing and combo---------------
	const { configTable, page, pageSize, filterLocal, refetch, onChangeOneParam } = usePaginationLocal(
		(params) =>
			typeSubscription === COMBO
				? SubscriptionDev.getComboListDebitBalance(id, typePortal, params)
				: SubscriptionDev.getListDebitBalance(id, typePortal, params),
		['fromDate', 'toDate', 'billingCode', 'noteType', 'status'],
		{
			sort: '',
		},
		'getListDebit',
		{ enabled: statusService !== STATUS_SERVICE.FUTURE },
	);

	const [fromDate, toDate, searchBillingCode, noteType, status] = [
		filterLocal.fromDate || '',
		filterLocal.toDate || '',
		filterLocal.billingCode || '',
		filterLocal.noteType || '',
		filterLocal.status || '',
	];

	const TagStatus = (display) => {
		const Status = statusDebitBalance.filter((item) => item.value === display)[0];
		return (
			<Tag color={Status?.color} className="w-32">
				{tFilterField('debitBalanceOptions', Status?.label)}
			</Tag>
		);
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			render: (_, item, index) => (page - 1) * pageSize + index + 1,
			width: 100,
		},
		{
			title: tField('create_date'),
			dataIndex: 'createdAt',
			sorter: {},
			width: 150,
		},
		{
			title: tField('memoType'),
			render: (value) =>
				debitBalanceType.map((e) => value === e.value && tFilterField('debitBalanceType', e.label)),
			dataIndex: 'noteType',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('billCode'),
			dataIndex: 'billingCode',
			sorter: {},
			width: 150,
		},
		{
			title: tField('status'),
			render: (display) => TagStatus(display),
			dataIndex: 'status',
			align: 'center',
			sorter: {},
			width: 150,
		},
		{
			title: tField('reason'),
			render: (value) =>
				value.length > 0 &&
				value.map((el) => (
					<span className="block" style={{ whiteSpace: 'break-spaces' }}>
						{el}
					</span>
				)),
			dataIndex: 'contents',
			ellipsis: true,
		},
	];

	if (statusService === STATUS_SERVICE.FUTURE)
		return <div className="font-semibold">{tOthers('noInfoToRemember')}</div>;

	return (
		<div className={className}>
			<div className="mb-4">
				{typePortal === 'sme' && (
					<div className="mb-4 uppercase font-bold text-gray-60">{tMenu('memoList')}</div>
				)}
				<div className="flex flex-wrap justify-end">
					<div>
						{tOthers('create_time')}:{' '}
						<RangePicker
							// className="w-72"
							format="DD/MM/YYYY"
							allowEmpty={[true, true]}
							// value={[fromDate, toDate]}
							onChange={(value) => {
								onChangeOneParam('fromDate')(convertTime(value, 0));
								onChangeOneParam('toDate')(convertTime(value, 1));
							}}
						/>
					</div>
					<SearchCommon
						className="w-56 ml-4 tablet:mb-2"
						placeholder={tField('billCode')}
						onSearch={(value) => {
							onChangeOneParam('billingCode')(value);
						}}
						maxLength={200}
						defaultValue={searchBillingCode}
					/>

					<Select value={noteType} onSelect={onChangeOneParam('noteType')} className="w-56 ml-4">
						{debitBalanceType.map((el) => (
							<Option value={el.value} className="ant-prefix" key={el.label}>
								<span className="prefix">{tFilterField('prefix', 'memoType')}: </span>
								<span>{tFilterField('debitBalanceType', el.label)}</span>
							</Option>
						))}
					</Select>

					<Select value={status} onSelect={onChangeOneParam('status')} className="w-56 ml-4">
						{statusDebitBalance.map((el) => (
							<Option value={el.value} className="ant-prefix" key={el.label}>
								<span className="prefix">{tFilterField('prefix', 'status')}: </span>
								<span>{tFilterField('debitBalanceOptions', el.label)}</span>
							</Option>
						))}
					</Select>
				</div>
			</div>
			<Table columns={columns} {...configTable} />
		</div>
	);
}

export default DebitBalance;
