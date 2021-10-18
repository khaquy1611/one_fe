/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { UploadFile } from 'app/components/Atoms';
import { DX } from 'app/models';
import { useLng } from 'app/hooks';
import { validateFile, validateMaxLengthStr, validateRequireInput } from 'app/validator';
import { imageSelects } from 'actions';
import { useSelector } from 'react-redux';

const Feedback = ({ className, editFeedbackForm, onChangeSave, setShowFeedback, loading, feedBackInfo, type }) => {
	const { title, content, attachs = [] } = { ...feedBackInfo };
	const FileData = useSelector(imageSelects.selectImage);
	const attachEdit = attachs.map((el) => {
		if (DX.checkObjectTypeFile(el.name) === 1) return { ...FileData[el.id] };
		return el;
	});
	const { tButton, tField, tOthers, tValidation } = useLng();
	const initialValue = {
		title,
		content,
		attachs: attachEdit,
	};

	useEffect(() => {
		editFeedbackForm.resetFields();
	}, []);

	const [isDirty, setDirty] = useState(false);

	return (
		<div className={`${className} pt-8`} style={{ borderTop: '1px solid #CFD8DC' }}>
			<h3 className="text-base font-semibold mb-6">
				{type !== 'RESPONSE'
					? tOthers('opt_edit', { field: 'feedback' })
					: tOthers('opt_send', { field: 'feedback' })}
			</h3>
			<Form
				form={editFeedbackForm}
				initialValues={{ ...initialValue }}
				onFinish={onChangeSave}
				layout="vertical"
				onValuesChange={() => !isDirty && setDirty(true)}
				className="inactive-image"
			>
				{type !== 'RESPONSE' && (
					<Form.Item
						label={tField('title')}
						name="title"
						rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'title' }))]}
					>
						<Input type="text" maxLength={200} autoFocus />
					</Form.Item>
				)}
				<Form.Item
					label={type !== 'RESPONSE' ? tField('content') : ''}
					name="content"
					rules={[
						validateRequireInput(
							type !== 'RESPONSE'
								? tValidation('opt_isRequired', { field: 'contentNeedSupport' })
								: tValidation('opt_isRequired', { field: 'feedbackContent' }),
						),
						validateMaxLengthStr(1000, tValidation('opt_enterMaxLength', { maxLength: '1000' })),
					]}
				>
					<Input.TextArea maxLength={1000} showCount rows={4} autoFocus={type === 'RESPONSE'} />
				</Form.Item>
				<Form.Item name="attachs" rules={[validateFile()]}>
					<UploadFile
						multiple
						className="upload-list-inline three-file"
						maxCount={20}
						formEdit={editFeedbackForm}
						fieldName="attachs"
					/>
				</Form.Item>
				<div className="text-right">
					{type !== 'RESPONSE' && (
						<Button
							className="w-max mr-4"
							onClick={() => {
								setShowFeedback(false);
								editFeedbackForm.resetFields();
							}}
							htmlType="button"
						>
							{tButton('opt_cancel')}
						</Button>
					)}

					<Button
						className="w-max"
						htmlType="submit"
						block
						type="primary"
						loading={loading}
						disabled={!isDirty}
					>
						{type !== 'RESPONSE' ? tButton('opt_save', { field: 'change' }) : tButton('sendFeedback')}
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default Feedback;
