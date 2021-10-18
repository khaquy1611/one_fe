import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UploadFile } from 'app/components/Atoms';
import { validateMaxLengthStr, validateRequireInput } from 'app/validator';
import { SendOutlined } from '@ant-design/icons';
import { trim } from 'opLodash';

export default function FormFeedback({
	className,
	form,
	onChangeSave,
	loading,
	responseTicket,
	setResponseTicket,
	count,
}) {
	const [disable, setDisable] = useState(true);
	useEffect(() => {
		if (trim(form.getFieldValue('content'))) setDisable(false);
		else setDisable(true);
	}, [count]);

	const onValuesChange = (changedValues, allValues) => {
		const { content } = allValues;
		if (content && trim(content)) setDisable(false);
		else setDisable(true);
	};
	return (
		<div className={`${className}`}>
			<h3 className="text-base font-semibold mb-6">
				{responseTicket ? 'Chỉnh sửa phản hồi của bạn' : 'Gửi phản hồi của bạn'}
			</h3>
			<Form form={form} onValuesChange={onValuesChange} layout="vertical">
				<Form.Item
					name="content"
					rules={[
						validateRequireInput('Nội dung phản hồi không được bỏ trống'),
						validateMaxLengthStr(1000, 'Nội dung không quá 500 ký tự'),
					]}
				>
					<Input.TextArea id="content" maxLength={1000} showCount rows={4} />
				</Form.Item>
				<Form.Item name="attachs">
					<UploadFile multiple className="upload-list-inline three-file" maxCount={20} />
				</Form.Item>
				<div className="text-right">
					{responseTicket && (
						<Button
							className="w-max mr-4 px-4"
							disabled={loading}
							onClick={() => {
								setResponseTicket(null);
								form.resetFields();
							}}
						>
							Hủy
						</Button>
					)}

					<Button
						className="w-max px-4"
						onClick={onChangeSave}
						block
						type="primary"
						icon={<SendOutlined />}
						loading={loading}
						disabled={disable || loading}
					>
						{responseTicket ? 'Chỉnh sửa phản hồi' : 'Gửi phản hồi'}
					</Button>
				</div>
			</Form>
		</div>
	);
}
