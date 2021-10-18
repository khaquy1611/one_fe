import { Form, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { DX, TicketAdmin, TicketDev } from 'app/models';
import { useUser } from 'app/hooks';
import scrollIntoView from 'scroll-into-view-if-needed';
import { imageSelects } from 'actions';
import { useSelector } from 'react-redux';

import FormFeedback from './FormFeedback';

export default function TicketFeedback({ refresh, refetch, responseTicket, setResponseTicket, ticketStatus, portal }) {
	const { id } = useParams();
	const [form] = Form.useForm();
	const { user } = useUser();
	const history = useHistory();
	const [count, setCount] = useState(0);
	const getIdAttach = (attach) => {
		const temp = [];
		attach?.map((item) =>
			temp.push({
				id: item?.id,
				objectType: DX.checkObjectTypeFile(item?.name),
			}),
		);
		return temp;
	};

	const FileData = useSelector(imageSelects.selectImage);
	useEffect(() => {
		const node = document.getElementById('content');

		const initialValue = {
			content: responseTicket?.content,
			attachs: responseTicket?.attachs?.map((el) => ({
				...FileData[el.id],
			})),
		};
		setCount(count + 1);
		form.setFieldsValue(initialValue);
		scrollIntoView(node, {
			behavior: 'smooth',
		});
		node.focus({
			preventScroll: true,
		});
	}, [responseTicket]);

	// response ticket
	const mutationFeedback = useMutation(TicketAdmin.responseTicket, {
		onSuccess: () => {
			form.resetFields();
			if (ticketStatus !== TicketAdmin.tagStatus.IN_PROGRESS.value) refetch();
			refresh();
			refetch();
			setCount(count + 1);
			message.success('Gửi phản hồi thành công!');
		},
		onError: (err) => {},
	});

	const mutationReFeedback = useMutation(TicketAdmin.reResponseTicket, {
		onSuccess: () => {
			setResponseTicket(null);
			form.resetFields();
			refresh();
			refetch();
			setCount(count + 1);
			message.success('Chỉnh sửa phản hồi thành công!');
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') {
				setResponseTicket(null);
				form.resetFields();
				refresh();
				message.error('Phản hồi đã bị xóa trước đó!');
			}
		},
	});

	const mutationFeedbackDev = useMutation(TicketDev.responseTicket, {
		onSuccess: () => {
			form.resetFields();
			refresh();
			refetch();
			setCount(count + 1);
			message.success('Gửi phản hồi thành công!');
		},
		onError: (err) => {
			if (err.errorCode === 'error.ticket.user.not.be.supporter') {
				setResponseTicket(null);
				form.resetFields();
				message.error('Bạn không được phân quyền xử lý ticket này. Quay lại trang danh sách!');
				history.push(DX.dev.createPath('/ticket/list'));
			}
		},
	});

	const mutationReFeedbackDev = useMutation(TicketDev.reResponseTicket, {
		onSuccess: () => {
			setResponseTicket(null);
			form.resetFields();
			refresh();
			refetch();
			setCount(count + 1);
			message.success('Chỉnh sửa phản hồi thành công!');
		},
		onError: (err) => {
			if (err.errorCode === 'error.object.not.found') {
				setResponseTicket(null);
				form.resetFields();
				refresh();
				message.error('Phản hồi đã bị xóa trước đó!');
			}
		},
	});

	const submitFeedback = async () => {
		const validate = await form.validateFields();
		const ticket = {
			content: form.getFieldValue('content'),
			attachs: getIdAttach(form.getFieldValue('attachs')),
		};
		if (validate) {
			if (responseTicket) {
				const idResponse = responseTicket.id;
				if (portal === 'admin')
					mutationReFeedback.mutate({
						id: idResponse,
						query: ticket,
					});
				else if (portal === 'dev')
					mutationReFeedbackDev.mutate({
						id: idResponse,
						query: ticket,
					});
				else message.warning('Bạn không được quyền chỉnh sửa phản hồi!');
			} else if (portal === 'admin') mutationFeedback.mutate({ id, query: ticket });
			else if (portal === 'dev') mutationFeedbackDev.mutate({ id, query: ticket });
			else message.warning('Bạn không được quyền gửi phản hồi!');
		}
	};

	return (
		<div>
			<FormFeedback
				responseTicket={responseTicket}
				setResponseTicket={setResponseTicket}
				form={form}
				onChangeSave={submitFeedback}
				count={count}
				className="mt-6"
				loading={
					mutationFeedback.isLoading ||
					mutationReFeedback.isLoading ||
					mutationFeedbackDev.isLoading ||
					mutationReFeedbackDev.isLoading
				}
			/>
		</div>
	);
}
