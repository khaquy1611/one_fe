import React from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import { useMutation } from 'react-query';
import UploadImage from 'app/models/UploadImage';
import styled from 'styled-components';
import ImgCrop from 'antd-img-crop';
import 'antd/es/modal/style';
import 'antd/es/slider/style';

const UploadCircle = styled(Upload)`
	.ant-upload {
		width: 9rem;
		height: 9rem;
		border-radius: ${(props) => (props.circle ? '9999px' : '')};
	}
`;

export function UploadAvatar({ value = {}, onChange, circle, isSme, ...props }) {
	const insertImageAva = useMutation(UploadImage.insertUserImage);

	function validateImg(file) {
		const isJpgOrPng =
			file.type === 'image/jpeg' ||
			file.type === 'image/png' ||
			file.type === 'image/jpg' ||
			file.type === 'image/x-icon' ||
			file.type === 'image/jfif';
		if (!isJpgOrPng) {
			message.error('Định dạng file không được hỗ trợ.');
			return false;
		}
		const isLt2M = file.size / 1024 / 1024 < 10;
		if (!isLt2M) {
			message.error('File không được quá 10MB');
			return false;
		}
		return true;
	}

	const handleInsertImage = async ({ file, onSuccess, onError }) => {
		try {
			if (validateImg(file)) {
				const formData = new FormData();
				const formClear = {};

				onChange(formClear);
				formData.append('files', file);
				formData.append('fileSize', file.size);
				const res = await insertImageAva.mutateAsync(formData);
				onChange(res);
				onSuccess();
			}
		} catch (e) {
			onError();
		}
	};

	const uploadButton = <div>{insertImageAva.isLoading ? <LoadingOutlined /> : <PlusOutlined />}</div>;

	const handleBeforeUpload = (file) => {
		if (!validateImg(file)) {
			return false;
		}
		return true;
	};

	return (
		<>
			<ImgCrop rotate shape={circle ? 'round' : 'square'} beforeCrop={handleBeforeUpload}>
				<UploadCircle
					listType="picture-card "
					className="avatar-uploader mx-auto text-center relative z-10"
					showUploadList={false}
					customRequest={handleInsertImage}
					beforeUpload={handleBeforeUpload}
					circle={circle}
					{...props}
				>
					{value?.filePath ? (
						<img
							className="mx-auto text-center  object-cover  w-full h-full"
							src={`${value.filePath}`}
							alt="avatar"
							style={
								circle
									? {
											borderRadius: '100%',
									  }
									: {}
							}
						/>
					) : (
						uploadButton
					)}
				</UploadCircle>
			</ImgCrop>
			<br />
			{isSme && !value?.filePath ? (
				<p className="text-center text-sm text-primary font-medium">Thay đổi ảnh đại diện</p>
			) : (
				''
			)}
		</>
	);
}
