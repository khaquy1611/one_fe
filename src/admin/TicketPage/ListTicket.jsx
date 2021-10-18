import { Space, Table, Tag, Select } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { usePagination, useLng } from 'app/hooks';
import { TicketAdmin, SaasAdmin, Users, DX } from 'app/models';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import useUser from '../../app/hooks/useUser';

const { Option } = Select;

export default function ListTicket() {
	const { tField, tFilterField } = useLng();
	const [searchService, setSearchService] = useState('');
	const [searchSme, setSearchSme] = useState();
	const [count, setCount] = useState(0);
	const [countSme, setCountSme] = useState(0);
	const { user } = useUser();

	const {
		content: ticketList,
		isFetching,
		page,
		pageSize,
		configTable,
		onChangeOneParam,
		query,
		getColumnSortDefault,
	} = usePagination(TicketAdmin.getAllPagination, ['status', 'serviceId', 'smeName']);

	const [status, serviceId, smeName] = [
		query.get('status') || '',
		parseInt(query.get('serviceId'), 10) || null,
		query.get('smeName') || null,
	];

	const { data: optionService, isFetching: serviceLoading } = useQuery(
		['getOptionsService', searchService],
		async () => {
			try {
				const valueStatus = 'APPROVED';
				const { content } = await SaasAdmin.getAllPagination({
					sort: 'name,asc',
					page: 0,
					size: 10,
					displayed: 'UNSET',
					status: valueStatus,
					name: searchService,
				});
				if (count === 0 && serviceId && !content.find((el) => el.id === serviceId)) {
					setCount(1);
					const serviceDetail = await SaasAdmin.getDetail(serviceId);
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
				const { content } = await Users.getListUserByType(DX.sme.role)({
					sort: 'name,asc',
					page: 0,
					size: 10,
					status: '',
					name: searchSme,
				});
				if (countSme === 0 && smeName && !content.find((el) => el.name === smeName)) {
					setCountSme(1);
					// fd
					// const detail = await Users.getSmeDetailByAdmin(smeName);
					// if (detail) {
					content.unshift({
						name: smeName,
						id: smeName,
					});
					// } else {
					// 	onChangeOneParam("smeName")(undefined);
					// }
				}
				return content.map((e) => ({
					label: e.name,
					value: e.name,
				}));
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
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (value, record) => <AvatarWithText name={value} icon={record.icon} />,
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('customerName'),
			dataIndex: 'smeName',
			render: (value, record) => <div className="truncate">{value}</div>,
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('title'),
			dataIndex: 'title',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('updateDay'),
			dataIndex: 'updatedTime',
			sorter: {},
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			render: (value) => {
				const tagInfo = TicketAdmin.tagStatus[value];
				return <Tag color={tagInfo?.color}>{tFilterField('value', tagInfo?.text)}</Tag>;
			},
			width: 150,
			sorter: {},
		},
		{
			align: 'center',
			render: (text, record) => (
				<Space size="middle">
					<Link to={`list/${record.id}`} className="text-blue-400">
						Chi tiết
					</Link>
				</Space>
			),
			hide: !DX.canAccessFuture2('admin/view-ticket', user.permissions),
			width: 130,
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
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb type="listTicket" />
			</div>
			<div className="flex mt-5">
				<div>
					<Select
						showSearch
						allowClear
						onClear={() => onChangeOneParam('serviceId')(undefined)}
						searchValue={searchService}
						className="w-60 mr-6"
						placeholder={`${tField('serviceName')}: ${tField('all')}`}
						onSearch={setSearchService}
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
						placeholder={`${tField('smeName')}: ${tField('all')}`}
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
					<Select value={status} onSelect={onChangeOneParam('status')} className="w-60">
						{statusOptions.map((el) => (
							<Option value={el.value} className="ant-prefix" key={el.label}>
								<span className="prefix">{tFilterField('prefix', 'status')}: </span>
								<span>{el.label}</span>
							</Option>
						))}
					</Select>
				</div>
			</div>

			<Table className="mt-8" columns={getColumnSortDefault(columns.filter((e) => !e.hide))} {...configTable} />
		</div>
	);
}
