import { Breadcrumb, Button, Form, message, Spin } from 'antd';
import { useLng, usePaginateInfinity, useQueryUrl, useUser } from 'app/hooks';
import { DX, SMETicket, TicketAdmin } from 'app/models';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import { ModalConfirm } from 'sme/components';
import { BodyTicket, Feedback, HeaderTicket } from './components';

const TicketDetail = () => {
	const { id } = useParams();
	const [showModal, setShowModal] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);
	const [editFeedbackForm] = Form.useForm();
	const { user } = useUser();
	const { tMessage, tMenu, tButton, tValidation } = useLng();
	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');

	// show ticket detail
	const { refetch, data: TicketInfo, isFetching: ticketInfoIsFetch } = useQuery(
		['getTicketDetailById', id, paramFollow],
		async () => {
			const res = await SMETicket.getOneById(id);
			return res;
		},
		{
			initialData: {},
		},
	);

	const { canLoadMore, loadMore, data: responseTickets, refetch: refresh, isFetching } = usePaginateInfinity(
		(params) => SMETicket.getAllFeedback(id, params),
		[id, paramFollow],
	);

	// close ticket
	const mutationClose = useMutation(() => SMETicket.closeTicket(id), {
		onSuccess: () => {
			refetch();
			message.success(tMessage('opt_successfullyClosed', { field: 'supTicket' }));
			setShowModal(false);
		},
		onError: (err) => {
			if (err.errorCode === 'error.ticket.must.be.open') {
				setShowModal(false);
				refresh();
				refetch();
				message.error(tMessage('err_ticket_must_be_in_progress'));
			} else message.error('Đóng ticket không thành công');
		},
	});

	const closeTicket = () => {
		setShowModal(true);
	};

	// edit ticket
	const mutationUpdate = useMutation(SMETicket.updateTicket, {
		onSuccess: () => {
			setShowFeedback(false);
			refetch();
			message.success(tMessage('opt_successfullyUpdated', { field: 'supTicket' }));
		},
		onError: (err) => {
			if (err.errorCode === 'error.ticket.must.be.open') {
				setShowFeedback(false);
				refresh();
				refetch();
				message.error(tMessage('err_ticket_must_be_in_progress'));
			} else if (err.errorCode === 'error.duplicate.name') {
				editFeedbackForm.setFields([
					{
						name: 'title',
						errors: [tValidation('opt_isDuplicated', { field: 'title' })],
					},
				]);
			} else message.error('Cập nhật phiếu hỗ trợ không thành công');
		},
	});

	const editTicket = () => {
		setShowFeedback(true);
	};

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

	const submitUpdate = (values) => {
		const ticket = {
			...values,
			attachs: getIdAttach(values.attachs),
		};
		mutationUpdate.mutate({ id, query: ticket });
	};

	// response ticket
	const mutationFeedback = useMutation(SMETicket.responseTicket, {
		onSuccess: () => {
			editFeedbackForm.resetFields();
			if (TicketInfo?.status === TicketAdmin.tagStatus.OPEN.value) refetch();
			refresh();
			message.success(tMessage('opt_successfullySent', { field: 'feedback' }));
		},
		onError: (err) => {
			// if (err.errorCode === "error.ticket.must.not.be.resolved") {
			// 	setShowFeedback(false);
			// 	refresh();
			// 	refetch();
			// 	message.error("Phiếu hỗ trợ đã được đóng trước đó!");
			// }
			message.error('gửi phản hồi không thành công');
		},
	});

	const isCheckRole = (typeRole) => {
		if (typeRole === 'DEVELOPER') return true;
		return false;
	};

	const submitFeedback = (values) => {
		const ticket = {
			...values,
			attachs: getIdAttach(values.attachs),
		};
		mutationFeedback.mutate({ id, query: ticket });
	};

	const showMoreResponse = () => {
		loadMore();
	};

	if (ticketInfoIsFetch || isFetching) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	return (
		<div className="box-sme">
			<Breadcrumb className="mb-3">
				<Breadcrumb.Item>
					<Link to={DX.sme.createPath('/account/ticket')}>
						{tMenu('opt_manage', { field: 'supTicket' })}{' '}
					</Link>
				</Breadcrumb.Item>
				<Breadcrumb.Item>{tMenu('supTicketDetail')}</Breadcrumb.Item>
			</Breadcrumb>
			<div className=" mt-10">
				<HeaderTicket ticketInfo={TicketInfo} closeTicket={closeTicket} className="mb-9" />
				<BodyTicket
					className="rounded-lg mb-6"
					style={{ background: ' #F8F8F8' }}
					ticketInfo={TicketInfo}
					editTicket={editTicket}
					header
					portal="sme"
				/>

				{responseTickets?.length > 0 &&
					responseTickets.map((item, index) => (
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
							editTicket={editTicket}
							smeNameBody={TicketInfo.smeName}
							isCheckRole={isCheckRole}
							header={false}
							key={item.id}
							portal="sme"
							className="mb-6"
						/>
					))}

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

				{showFeedback
					? DX.canAccessFuture2('sme/edit-ticket-pending', user.permissions) && (
							<Feedback
								editFeedbackForm={editFeedbackForm}
								setShowFeedback={setShowFeedback}
								feedBackInfo={TicketInfo}
								onChangeSave={submitUpdate}
								className="mt-6"
								key="form-1"
								loading={mutationUpdate.isLoading}
							/>
					  )
					: DX.canAccessFuture2('sme/response-ticket', user.permissions) && (
							<Feedback
								type="RESPONSE"
								editFeedbackForm={editFeedbackForm}
								onChangeSave={submitFeedback}
								className="mt-6"
								key="form-2"
								loading={mutationFeedback.isLoading}
							/>
					  )}
			</div>
			<ModalConfirm
				mutation={mutationClose.mutateAsync}
				showModal={showModal}
				setShowModal={setShowModal}
				mainTitle={tMessage('closeTicket')}
				subTitle={tMessage('opt_wantToClose', { field: 'supTicket' })}
			/>
		</div>
	);
};

export default TicketDetail;
