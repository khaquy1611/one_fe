import {
	ClockCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	SendOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Tooltip } from 'antd';
import { useUser } from 'app/hooks';
import { DX } from 'app/models';
import AdminEvaluate from 'app/models/AdminEvaluate';
import DevEvaluate from 'app/models/DevEvaluate';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { trim } from 'opLodash';

const styleDev = {
	border: '1px solid #f6efee',
	background: '#fafafa',
	marginLeft: '4.5rem',
};
const styleSme = {
	border: '1px solid #f6efee',
	background: '#FFFDFD',
	marginLeft: '4.5rem',
};

const responseText = (content) => (
	<div
		className="max-h-32 overflow-y-auto font-medium beauty-scroll break-words"
		style={{
			whiteSpace: 'pre-wrap',
		}}
	>
		{content}
	</div>
);

function ResponseEvaluation({ type, data = {}, form, refetch }) {
	const [isUpdateComment, setUpdateComment] = useState();
	const { user } = useUser();
	const CAN_UPDATE_RESPONSE_DEV =
		type === 'dev' &&
		(DX.canAccessFuture2('dev/update-response-service', user.permissions) ||
			DX.canAccessFuture2('dev/update-response-combo', user.permissions));
	const CAN_DELETE_RESPONSE_ADMIN =
		type === 'admin' && DX.canAccessFuture2('admin/delete-response-service', user.permissions);
	const initialValue = {
		content: data?.responseContent,
	};
	const [isDirty, setDirty] = useState(false);
	function EditComment() {
		form.setFieldsValue(initialValue);
		setUpdateComment(true);
	}
	function closeForm() {
		form.resetFields();
		setUpdateComment(false);
		setDirty(false);
	}
	function setChangeValue() {
		if (trim(form.getFieldValue('content')) === '' || form.getFieldValue('content') === data?.responseContent) {
			setDirty(false);
		} else {
			setDirty(true);
		}
	}
	const mutationUpdateFeedback = useMutation(DevEvaluate.updateResponseComment, {
		onSuccess: () => {
			refetch();
			setUpdateComment(false);
		},
		onError: (e) => {
			if (e.errorCode === 'error.rating.comment.reply.not.owner') {
				message.error('Bạn không có quyền sửa phản hồi!');
			}
		},
	});
	const mutationDelete = useMutation(AdminEvaluate.deleteResponseComment, {
		onSuccess: () => {
			message.success('Xóa phản hồi thành công');
			refetch();
		},
	});
	function openModal() {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xóa phản hồi?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Đồng ý',
			cancelText: 'Hủy',
			onOk: () => {
				mutationDelete.mutate({
					id: data.responseId,
				});
			},
		});
	}
	function submitUpdateRes() {
		const updateResponse = {
			responseContent: form.getFieldValue('content'),
		};
		const idResponse = data.responseId;
		mutationUpdateFeedback.mutate({
			id: idResponse,
			query: updateResponse,
		});
	}

	return (
		<div className="rounded-2xl mt-3 mb-3 p-4" style={type === 'sme' ? styleSme : styleDev}>
			<div className="flex justify-between">
				<div className="flex gap-4 overflow-x-hidden">
					{!isUpdateComment && (
						<div className="h-14 w-14 rounded-full overflow-hidden mb-2 flex-none">
							<img
								className="object-cover w-full h-full"
								alt={data.userName || data.companyName || ''}
								title={data.userName || data.companyName || ''}
								src={data.icon || data.externalLink || data.iconCompany || '/images/NoImageNew.svg'}
							/>
						</div>
					)}

					{(type === 'sme' || type === 'admin') && (
						<div>
							<Tooltip placement="bottomLeft" title={data?.companyName || ''}>
								<div className="font-bold line-clamp-2 mb-1">{data?.companyName || ''}</div>
							</Tooltip>
							<div className="text-sm mb-2" style={{ color: '#999' }}>
								{data.responseTime}
							</div>

							{responseText(data.responseContent)}
						</div>
					)}

					{type === 'dev' && !isUpdateComment && (
						<div>
							{responseText(data.responseContent)}

							<div style={{ color: '#999' }} className="text-sm mt-2 flex items-center">
								Cập nhật lần cuối bởi:&nbsp;
								<div className="text-black max-w-xs truncate ...">{data.userName}</div>
								<ClockCircleOutlined className="ml-4 mr-1" />
								<div>{data.responseTime}</div>
							</div>
						</div>
					)}
				</div>
				<div>
					{type === 'dev' && !isUpdateComment && CAN_UPDATE_RESPONSE_DEV && (
						<Button type="text" icon={<EditOutlined width="w-4" />} onClick={EditComment} className="">
							Sửa câu trả lời
						</Button>
					)}

					{CAN_DELETE_RESPONSE_ADMIN && type === 'admin' && (
						<Button type="text" onClick={openModal} className="">
							<DeleteOutlined width="w-4" /> Xóa
						</Button>
					)}
				</div>
				{type === 'dev' && isUpdateComment && (
					<Form form={form} onFinish={submitUpdateRes} onValuesChange={setChangeValue} className="w-full">
						<Form.Item name="content">
							<Input.TextArea
								id="content"
								className=""
								ref={(ref) => ref && ref.focus()}
								onFocus={(e) =>
									e.currentTarget.setSelectionRange(
										e.currentTarget.value.length,
										e.currentTarget.value.length,
									)
								}
								rows={3}
								maxLength={500}
								showCount
							/>
						</Form.Item>
						<Form.Item className="text-right mb-0">
							<Button className="mr-4" onClick={closeForm}>
								Hủy
							</Button>
							<Button
								className=""
								type="primary"
								htmlType="submit"
								icon={<SendOutlined width="w-4" />}
								disabled={!isDirty}
								loading={mutationUpdateFeedback.isLoading}
							>
								Gửi phản hồi
							</Button>
						</Form.Item>
					</Form>
				)}
			</div>
		</div>
	);
}

export default ResponseEvaluation;
