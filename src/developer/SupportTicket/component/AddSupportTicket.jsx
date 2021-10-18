/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button, Spin, message, Modal } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { usePaginateInfinity, useLng, useQueryUrl } from 'app/hooks';
import { DX, TicketDev } from 'app/models';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { BodyTicket } from 'sme/Account/Ticket/components';
import { TicketFeedback } from 'app/components/Templates';
import { SupportHeader } from 'app/components/Molecules';
import useUser from '../../../app/hooks/useUser';

function AddSupportTicket() {
	const { id } = useParams();
	const [responseTicket, setResponseTicket] = useState(null);
	const history = useHistory();
	const { tMessage, tButton } = useLng();
	const { user } = useUser();
	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');

	const { data: ticketInfo, refetch } = useQuery(
		['getSupportInfo', id, paramFollow],
		async () => {
			try {
				const res = await TicketDev.getOneById(id);
				return res;
			} catch (err) {
				if (err.errorCode === 'error.object.not.found' && err.field === 'id')
					history.push(DX.dev.createPath('/page-not-found'));
				throw err;
			}
		},
		{
			initialData: [],
		},
	);

	const { canLoadMore, loadMore, data: responseTickets, refetch: refresh, isFetching } = usePaginateInfinity(
		(params) => TicketDev.responseTicketsPagination(id, params),
		[id, paramFollow],
	);

	const mutationDeleteTicket = useMutation(TicketDev.deleteTicket, {
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

	const mutationCloseTicket = useMutation(TicketDev.resolvedTicket, {
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

	function closeTicket() {
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
	}

	function editTicket(value) {
		const res = {
			id: value.id,
			attachs: value.attachs,
			content: value.content,
		};
		setResponseTicket(res);
	}

	const isCheckRole = (typeRole) => {
		if (typeRole === 'DEVELOPER') return true;
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
			url: DX.dev.createPath('/ticket/list'),
		},
		{
			name: 'supTicketDetail',
			url: '',
		},
	];

	function deleteTicket(idTicket) {
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
	}

	return (
		<div className="pb-10" style={{ marginRight: '10%' }}>
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={detailTicket} />
			</div>
			<div className="mt-5">
				<SupportHeader support={ticketInfo} closeTicket={closeTicket} />

				<BodyTicket
					style={{
						background: ' #F8F8F8',
						border: 'border: 0.5px solid #ECEFF1',
						borderRadius: '0.5rem',
					}}
					ticketInfo={ticketInfo}
					header
					portal="dev"
				/>
			</div>

			{responseTickets.length > 0
				? responseTickets?.map((item, index) => (
						<BodyTicket
							style={
								index % 2 === 0
									? {
											background: ' #FFF',
											border: 'border: none',
									  }
									: {
											background: ' #F8F8F8',
											border: 'border: 0.5px solid #ECEFF1',
											borderRadius: '0.5rem',
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
							portal="dev"
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
						loading={isFetching}
					>
						{tButton('watchMoreComment')}
					</Button>
				</div>
			)}
			{DX.canAccessFuture2('dev/response-ticket', user.permissions) && (
				<TicketFeedback
					portal="dev"
					refresh={refresh}
					responseTicket={responseTicket}
					setResponseTicket={setResponseTicket}
				/>
			)}
		</div>
	);
}

export default AddSupportTicket;
