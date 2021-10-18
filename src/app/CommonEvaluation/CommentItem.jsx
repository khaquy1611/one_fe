import { Form } from 'antd';
import classnames from 'classnames';
import React from 'react';
import CommentEvaluation from './CommentEvaluation';
import ResponseEvaluation from './ResponseEvaluation';

function CommentItem({ type, data, refetch, updateLikeStatus, updateComment, commenter, isUpdate }) {
	const [form] = Form.useForm();
	const [formCreate] = Form.useForm();
	const { responseDetail } = data;
	return (
		<div
			className={classnames({
				'border-b-2 ': type === 'dev',
				'mb-6 pb-2': !isUpdate,
			})}
		>
			<CommentEvaluation
				type={type}
				data={data}
				formCreate={formCreate}
				refetch={refetch}
				updateLikeStatus={updateLikeStatus}
				updateComment={updateComment}
				commenter={commenter}
				isUpdate={isUpdate}
			/>
			{responseDetail && <ResponseEvaluation type={type} data={responseDetail} form={form} refetch={refetch} />}
		</div>
	);
}

export default CommentItem;
