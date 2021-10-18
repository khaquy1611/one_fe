/* eslint-disable prettier/prettier */
import { React, useState } from 'react';
import { Table, Space, Select, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { usePagination, useLng } from 'app/hooks';
import { DX, SaasDev, SubscriptionDev, TicketDev } from 'app/models';
import { renderOptions, UrlBreadcrumb } from 'app/components/Atoms';
import { useQuery } from 'react-query';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import useUser from '../../../app/hooks/useUser';

const { Option } = Select;

export default function ListSupportTicket() {
	const [searchService, setSearchService] = useState();
	const [searchSme, setSearchSme] = useState();
	const [count, setCount] = useState(0);
	const { tField, tFilterField } = useLng();
	const { user } = useUser();
	const {
		content: ticketList,
		page,
		pageSize,
		onChangeOneParam,
		query,
		configTable,
		getColumnSortDefault,
	} = usePagination(TicketDev.getAllPagination, ['serviceId', 'smeName', 'status']);
	const [serviceId, smeName, status] = [
		parseInt(query.get('serviceId'), 10) || null,
		query.get('smeName') || null,
		query.get('status') || '',
	];

	const { data: optionService, isFetching: serviceLoading } = useQuery(
		['getOptionsService', searchService],
		async () => {
			try {
				const valueStatus = 'APPROVED';
				const { content } = await SaasDev.getAllPagination({
					sort: 'name,asc',
					page: 0,
					size: 10,
					displayed: 'UNSET',
					status: valueStatus,
					name: searchService,
				});
				if (count === 0 && serviceId && !content.find((el) => el.id === serviceId)) {
					setCount(1);
					const serviceDetail = await SaasDev.getDetail(serviceId);
					if (serviceDetail && serviceDetail.status === valueStatus) {
						content.unshift(serviceDetail);
					} else {
						onChangeOneParam('serviceId')(undefined);
					}
				}
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
	const { data: optionSme, isFetching: smeLoading } = useQuery(
		['getOptionsSme', searchSme],
		async () => {
			try {
				const { content } = await SubscriptionDev.getSMESubscriptionPagination({
					page: 0,
					size: 1000000000,
					name: searchSme,
				});
				const arr = [];
				content.forEach((e) => {
					if (e.companyName) {
						arr.push({
							label: e.companyName,
							value: e.companyName,
						});
					}
				});
				return arr;
			} catch (e) {
				return [];
			}
		},
		{
			initialData: [],
		},
	);

	const columns = [
		{
			title: '#',
			key: 'key',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: '6rem',
		},
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			key: 'serviceName',
			render: (value, record) => <AvatarWithText name={value} icon={record.icon} />,
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('customerName'),
			dataIndex: 'smeName',
			key: 'smeName',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('title'),
			dataIndex: 'title',
			key: 'title',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('updateDay'),
			dataIndex: 'updatedTime',
			key: 'updatedTime',
			sorter: {},
			width: '10rem',
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			key: 'status',
			render: (value) => {
				const tagInfo = TicketDev.tagStatus[value];
				return <Tag color={tagInfo?.color}>{tFilterField('value', tagInfo?.text)}</Tag>;
			},
			sorter: {},
			width: '9rem',
		},
		{
			render: (text, record) => (
				<Space size="middle">
					<Link to={DX.dev.createPath(`/ticket/list/${record.id}`)} className="text-blue-400">
						Chi tiết
					</Link>
				</Space>
			),
			hide: !DX.canAccessFuture2('dev/view-ticket', user.permissions),
			width: '7rem',
		},
	];

	const statusOptions = [
		{
			value: '',
			label: tFilterField('value', 'all'),
		},
		{
			value: 'OPEN',
			label: tFilterField('value', 'waitingProcess'),
		},
		{
			value: 'IN_PROGRESS',
			label: tFilterField('value', 'inProcess'),
		},
		{
			value: 'RESOLVED',
			label: tFilterField('value', 'processed'),
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex items-center justify-between">
				<UrlBreadcrumb type="listTicketDev" />
			</div>
			<div className="flex">
				<div className="flex items-center mt-5">
					<Select
						showSearch
						allowClear
						onClear={() => onChangeOneParam('serviceId')(undefined)}
						searchValue={searchService}
						className="w-60 mr-6"
						placeholder="Tên dịch vụ: Tất cả"
						onSearch={(searchText) => {
							if (searchText.length > 200) {
								searchText = searchText.substring(0, 200);
							}
							setSearchService(searchText);
						}}
						value={serviceId}
						onSelect={onChangeOneParam('serviceId')}
						filterOption={false}
						loading={serviceLoading}
						autoFocus
					>
						{optionService.map((option) => (
							<Option value={option.value} className="ant-prefix">
								<span>{option.label || ticketList[0]?.serviceName}</span>
							</Option>
						))}
					</Select>
					<Select
						showSearch
						allowClear
						onClear={() => onChangeOneParam('smeName')(undefined)}
						searchValue={searchSme}
						className="w-60 mr-6"
						placeholder="Tên khách hàng: Tất cả"
						onSearch={setSearchSme}
						value={smeName}
						onSelect={onChangeOneParam('smeName')}
						filterOption={false}
						loading={smeLoading}
					>
						{optionSme.map((option) => (
							<Option value={option.value} className="ant-prefix">
								<span>{option.label || ticketList[0]?.planName}</span>
							</Option>
						))}
					</Select>
					<Select className="w-60 mr-6" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions(tFilterField('prefix', 'status'), statusOptions)}
					</Select>
				</div>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns.filter((e) => !e.hide))} {...configTable} />
		</div>
	);
}
