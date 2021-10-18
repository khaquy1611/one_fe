/* eslint-disable consistent-return */
import { YoutubeOutlined } from '@ant-design/icons';
import { Form, Input, Modal, message } from 'antd';
import { validateRequireInput, validateMaxLengthStr } from 'app/validator';
import React, { useState } from 'react';
import { trim } from 'opLodash';

function UploadByURLForm({ isModalShow, setModalShow, isDirty, setDirty, onFinish, form, isVideo, loadingBtn }) {
	const [url, setUrl] = useState();

	return (
		<div>
			{isModalShow && (
				<Modal
					title={`Sử dụng URL để tải ${isVideo ? 'video' : 'ảnh'}`}
					centered
					visible
					onCancel={() => {
						form.resetFields();
						setModalShow(false);
						setDirty(false);
					}}
					width={570}
					maskClosable={false}
					onOk={() => {
						if (!isVideo) {
							const img = document.getElementById('imgff');
							if (img.width + img.height > 0) {
								onFinish();
							} else {
								message.error('Link url không hợp lệ');
							}
						} else {
							onFinish();
						}
						setDirty(false);
					}}
					onClose={() => {
						form.resetFields();
						setModalShow(false);
						setDirty(false);
					}}
					okText="Tải lên"
					okButtonProps={{ disabled: !isDirty || !trim(url) || url.length > 500, loading: loadingBtn }}
					cancelText="Hủy"
				>
					<Form layout="horizontal" form={form} onValuesChange={() => !isDirty && setDirty(true)}>
						<Form.Item
							name="url"
							className="mb-0"
							rules={[
								validateRequireInput('Link URL không được bỏ trống'),
								validateMaxLengthStr(500, 'Độ dài URL không quá 500 ký tự'),
							]}
							normalize={trim}
						>
							<Input
								autoComplete="off"
								prefix={
									isVideo && (
										<YoutubeOutlined
											className="site-form-item-icon "
											style={{
												color: 'red',
												fontSize: '1.5rem',
											}}
										/>
									)
								}
								placeholder={`Nhập URL ${isVideo ? 'video' : 'ảnh'}`}
								onChange={(e) => setUrl(e.target.value)}
								required
							/>
						</Form.Item>
					</Form>
					<img src={url} alt="urlImage" id="imgff" style={{ display: 'none' }} />
				</Modal>
			)}
		</div>
	);
}

export default UploadByURLForm;
