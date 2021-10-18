import { Button, DatePicker, Form, message, Modal, Select, Table, Tag } from 'antd';
import { SearchCommon, SelectDebounce } from 'app/components/Atoms';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import { useLng, usePagination, useUser } from 'app/hooks';
import { DX, SmeService, SMESubscription, SMETicket } from 'app/models';
import moment from 'moment';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import TicketForm from './components/TicketForm';

const rootPath = '/sme-portal/account/ticket';
const { Option } = Select;

export default function TicketList() {
	const [ticketForm] = Form.useForm();
	const { getAllPagination, statusArray } = SMETicket;
	const { tField, tMenu, tButton, tFilterField, tValidation, tMessage } = useLng();
	const { user } = useUser();
	const CAN_CREATE = DX.canAccessFuture2('sme/create-ticket', user.permissions);
	const [showModal, setShowModal] = useState(false);
	const [isDirty, setDirty] = useState(false);
	const [count, setCount] = useState(0);

	const { configTable, page, pageSize, refetch, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		getAllPagination,
		['search', 'serviceId', 'status'],
		{
			status: '',
		},
	);

	const [status] = [query.get('status') || ''];

	const disableDate = (current) => current && current >= moment().endOf('day');

	const [search, serviceId] = [query.get('search') || '', parseInt(query.get('serviceId'), 10) || null];

	// get all service
	const fetchService = async (text) => {
		try {
			const { content: res } = await SMESubscription.getListSubscribe({
				page: 0,
				size: 20,
				name: text,
			});
			if (count === 0 && serviceId && !res.find((el) => el.id === serviceId)) {
				setCount(1);
				const serviceDetail = await SmeService.getDetail(serviceId);
				if (serviceDetail) {
					res.unshift({
						serviceId: serviceDetail.id,
						serviceName: serviceDetail.name,
					});
				} else {
					onChangeOneParam('serviceId')(undefined);
				}
			}
			const temp = res.map((item) => ({
				value: item.serviceId,
				label: item.serviceName,
			}));

			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};

	const TagStatus = (display) => {
		const Status = statusArray.filter((item) => item.value === display)[0];
		return (
			<Tag color={Status?.color} className="w-28 mr-0">
				{tFilterField('value', Status?.label)}
			</Tag>
		);
	};

	// ----------------ticket form------------------
	const createTicket = () => {
		setShowModal(true);
	};

	const mutation = useMutation(SMETicket.createTicket, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'supTicket' }));
			setShowModal(false);
			refetch();
			ticketForm.resetFields();
		},
		onError: (e) => {
			if (e.errorCode === 'error.ticket.invalid.object.type') {
				ticketForm.setFields([
					{
						name: 'attachs',
						errors: [tValidation('opt_isNotValid', { field: 'file' })],
					},
				]);
			} else if (e.errorCode === 'error.duplicate.name') {
				ticketForm.setFields([
					{
						name: 'title',
						errors: [tValidation('opt_isDuplicated', { field: 'title' })],
					},
				]);
			}
		},
	});

	const getIdAttach = (attach) => {
		const temp = [];
		attach?.map((item) =>
			temp.push({
				id: item?.id,
				objectType: DX.checkObjectTypeFile(item.name),
			}),
		);
		return temp;
	};

	const handleSubmit = async () => {
		const validate = await ticketForm.validateFields();
		const ticket = {
			...ticketForm.getFieldsValue(),
			attachs: getIdAttach(ticketForm.getFieldValue('attachs')),
		};

		if (validate) mutation.mutate(ticket);
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			// width: 90,
		},
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (value, record) => <AvatarWithText name={value} icon={record.icon} />,
			sorter: {},
		},
		{
			title: tField('title'),
			dataIndex: 'title',
			render: (value, record) =>
				DX.canAccessFuture2('sme/view-ticket', user.permissions) ? (
					<Link to={`${rootPath}/detail/${record.id}`}>{value}</Link>
				) : (
					<span>{value}</span>
				),
			sorter: {},
		},
		{
			title: tField('updateDay'),
			dataIndex: 'updatedTime',
			align: 'center',
			render: (time) => moment(time, 'DD/MM/YYYY h:mm:ss').format('DD/MM/YYYY'),
			sorter: {},
			// width: 200,
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			align: 'center',
			render: (display) => TagStatus(display),
			// width: 160,
			sorter: {},
		},
	];

	return (
		<div className="box-sme">
			<div className="flex justify-between mb-4">
				<div className="uppercase font-bold text-gray-60 mb-4">{tMenu('supTicketList')}</div>
				{CAN_CREATE && (
					<div>
						<Button className="rounded-xl" type="primary" onClick={createTicket}>
							{tButton('opt_create', { field: 'supTicket' })}
						</Button>
					</div>
				)}
			</div>
			<div className="mb-4 flex justify-between gap-4">
				<SelectDebounce
					showSearch
					allowClear
					className="w-1/4"
					placeholder={`${tField('serviceName')}: ${tField('all')}`}
					onClear={() => onChangeOneParam('serviceId')(undefined)}
					fetchOptions={fetchService}
					onSelect={onChangeOneParam('serviceId')}
					value={serviceId}
				/>
				<Select value={status} onSelect={onChangeOneParam('status')} className="w-1/4">
					{SMETicket.statusArray.map((el) => (
						<Option value={el.value} className="ant-prefix" key={el.label}>
							<span className="prefix">{tFilterField('prefix', 'status')}: </span>
							<span>{tFilterField('value', el.label)}</span>
						</Option>
					))}
				</Select>

				<DatePicker
					className="w-1/4"
					placeholder="Thời gian: Tất cả"
					format="DD/MM/YYYY"
					disabledDate={disableDate}
					onChange={(date, dateString) => onChangeOneParam('updateTime')(dateString)}
				/>

				<SearchCommon
					className="w-1/4"
					placeholder={tField('opt_search', { field: 'title' })}
					onSearch={(value) => {
						onChangeOneParam('search')(value);
					}}
					maxLength={200}
					defaultValue={search}
				/>
			</div>

			<Table columns={getColumnSortDefault(columns)} {...configTable} />

			{showModal && (
				<Modal
					centered
					visible
					onCancel={() => {
						setShowModal(false);
					}}
					footer={null}
					closable={false}
					maskClosable={false}
					width={570}
					bodyStyle={{
						padding: '2.5rem 4.375rem',
						maxHeight: 'calc(100vh - 9rem)',
						overflow: 'auto',
					}}
				>
					<TicketForm
						setShowModal={setShowModal}
						ticketForm={ticketForm}
						loading={mutation.isLoading}
						submit={handleSubmit}
						setDirty={setDirty}
						isDirty={isDirty}
					/>
				</Modal>
			)}
		</div>
	);
}
