import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Spin } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { SupportHeader } from 'app/components/Molecules';
import { TicketFeedback } from 'app/components/Templates';
import { useLng, usePaginateInfinity, useQueryUrl, useUser } from 'app/hooks';
import { DX, TicketAdmin } from 'app/models';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { BodyTicket } from 'sme/Account/Ticket/components';

export default function DetailTicket() {
	const { user } = useUser();
	const { id } = useParams();
	const [searchName, setSearchName] = useState();
	const [responseTicket, setResponseTicket] = useState(null);
	const history = useHistory();
	const { tMessage, tOthers, tButton } = useLng();
	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');

	const { data: ticketInfo, refetch, isFetching } = useQuery(
		['getTicketAdminInfo', id, paramFollow],
		async () => {
			try {
				const res = await TicketAdmin.getOneById(id);
				return res;
			} catch (err) {
				if (err.errorCode === 'error.object.not.found' && err.field === 'id')
					history.push(DX.admin.createPath('/page-not-found'));
				throw err;
			}
		},
		{
			initialData: {},
			enabled: !!id,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: options } = useQuery(
		['getOptionsEmployee', ticketInfo, searchName],
		async () => {
			try {
				if (DX.canAccessFuture2('admin/assign-ticket', user.permissions) && ticketInfo.developerId) {
					const { content } = await TicketAdmin.getListCustomerSupport(ticketInfo.developerId, id, {
						page: 0,
						size: 10,
						name: searchName,
					});
					const members = [];
					if (ticketInfo.supporterName) {
						if (ticketInfo.supporterId === ticketInfo.developerId) {
							members.push({
								label: `${ticketInfo?.supporterName} (${tOthers('dev')})`,
								value: ticketInfo?.supporterId,
							});
						} else {
							members.push({
								label: `${ticketInfo?.supporterName} (${tOthers('admin')})`,
								value: ticketInfo?.supporterId,
							});
						}
					}
					content.forEach((e) => {
						if (e.id !== ticketInfo.supporterId) {
							if (e.role === 'PLATFORM') {
								members.push({
									label: `${e.name} (${tOthers('admin')})`,
									value: e.id,
								});
							} else {
								members.push({
									label: `${e.name} (${tOthers('dev')})`,
									value: e.id,
								});
							}
						}
					});
					return members;
				}
				return [];
			} catch (e) {
				return [];
			}
		},
		{
			initialData: [],
		},
	);

	const {
		canLoadMore,
		loadMore,
		data: responseTickets,
		refetch: refresh,
		isFetching: isFetchResponse,
	} = usePaginateInfinity((params) => TicketAdmin.responseTicketsPagination(id, params), [id, paramFollow]);

	const mutation = useMutation(TicketAdmin.assignTicket, {
		onSuccess: () => {
			message.success(tMessage('successfullyAssignedSupTicket'));
			refetch();
		},
	});

	const mutationCloseTicket = useMutation(TicketAdmin.resolvedTicket, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyClosed', { field: 'supTicket' }));
			refetch();
			refresh();
		},
		onError: (err) => {
			switch (err.errorCode) {
				case 'error.ticket.user.not.be.supporter':
					message.error(tMessage('err_ticket_user_not_be_supporter'));
					refetch();
					refresh();
					break;
				case 'error.ticket.must.be.in.progress':
					message.error(tMessage('err_ticket_must_be_in_progress'));
					refetch();
					refresh();
					break;
				default:
					refetch();
					refresh();
					break;
			}
		},
	});

	const mutationDeleteTicket = useMutation(TicketAdmin.deleteTicket, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyDeleted', { field: 'feedback' }));
			refresh();
		},
		onError: (err) => {
			if (err.errorCode === 'error.ticket.user.not.be.supporter')
				message.error(tMessage('err_ticket_user_not_be_supporter'));
			else if (err.errorCode === 'error.object.not.found') {
				refetch();
				refresh();
				message.error(tMessage('feedbackClosedBefore'));
			}
		},
	});

	const onSelectEmployee = (option) => {
		if (!option) return;
		Modal.confirm({
			title: `${tMessage('wantToChangeSupportStaff')} "${option.label}"?`,
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				mutation.mutate({
					idTicket: id,
					assigner: option.value,
				});
			},
			confirmLoading: mutation.isLoading,
		});
	};

	const closeTicket = () => {
		Modal.confirm({
			title: tMessage('opt_wantToClose', { field: 'supTicket' }),
			content: tMessage('canNotReopenSupTicket'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				mutationCloseTicket.mutate({
					idTicket: id,
				});
			},
			confirmLoading: mutationCloseTicket.isLoading,
		});
	};

	const editTicket = (value) => {
		const res = {
			id: value.id,
			attachs: value.attachs,
			content: value.content,
			type: 'EDIT',
		};
		setResponseTicket(res);
	};

	const deleteTicket = (idTicket) => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'feedback' }),
			content: tMessage('canNotRecoveredFeedback'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				mutationDeleteTicket.mutate({
					id: idTicket,
				});
			},
			confirmLoading: mutationDeleteTicket.isLoading,
		});
	};

	const isCheckRole = (typeRole) => {
		if (typeRole === 'ADMIN') return true;
		return false;
	};

	const showMoreResponse = () => {
		loadMore();
	};

	const detailTicket = [
		{
			isName: true,
			name: 'Quản lý HTKH',
			url: '',
		},
		{
			name: 'supTicketList',
			url: DX.admin.createPath('/ticket/list'),
		},
		{
			name: 'supTicketDetail',
			url: '',
		},
	];

	if (isFetching) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	return (
		<div className="xl:mr-40 mr-0">
			<UrlBreadcrumb breadcrumbs={detailTicket} />

			<SupportHeader
				className="mb-8 mt-6"
				support={ticketInfo}
				closeTicket={closeTicket}
				options={options}
				searchName={searchName}
				setSearchName={setSearchName}
				onSelectEmployee={onSelectEmployee}
				isCheckRole={isCheckRole}
			/>

			<BodyTicket
				style={{
					background: ' #F8F8F8',
					border: 'border: 0.5px solid #ECEFF1',
					borderRadius: '0.5rem',
				}}
				ticketInfo={ticketInfo}
				header
				portal="admin"
				className="mb-6"
			/>

			{responseTickets.length > 0
				? responseTickets?.map((item, index) => (
						<BodyTicket
							style={
								item.type !== 'SME'
									? {
											background: ' #FFF',
									  }
									: {
											background: ' #F8F8F8',
											border: 'border: 0.5px solid #ECEFF1',
											borderRadius: '8px',
									  }
							}
							ticketInfo={item}
							statusTicket={ticketInfo?.status}
							smeNameBody={ticketInfo.smeName}
							editTicket={editTicket}
							deleteTicket={deleteTicket}
							isCheckRole={isCheckRole}
							header={false}
							key={item.id}
							portal="admin"
							className="mb-6"
						/>
				  ))
				: ''}
			{canLoadMore && (
				<div className="text-center mt-6">
					<Button
						type="link"
						htmlType="button"
						className="text-blue-600 hover:text-blue-800"
						onClick={showMoreResponse}
						loading={isFetchResponse}
					>
						{tButton('watchMoreComment')}
					</Button>
				</div>
			)}
			{(DX.canAccessFuture2('admin/response-ticket', user.permissions) ||
				(DX.canAccessFuture2('admin/edit-own-response-ticket', user.permissions) &&
					responseTicket?.type === 'EDIT')) && (
				<TicketFeedback
					portal="admin"
					refresh={refresh}
					refetch={refetch}
					responseTicket={responseTicket}
					setResponseTicket={setResponseTicket}
					ticketStatus={ticketInfo?.status}
				/>
			)}
		</div>
	);
}
