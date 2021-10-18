import React, { useEffect } from 'react';
import { Button, message, Upload } from 'antd';
import { useMutation } from 'react-query';
import UploadImage from 'app/models/UploadImage';
import { AttachFileIcon } from 'app/icons';

export function UploadFile({ value = [], onChange, formEdit, fieldName, ...props }) {
	const insertImageAva = useMutation(UploadImage.uploadSecret);
	const [error, setError] = React.useState([]);
	const [validateDone, setValidateDone] = React.useState();
	const { disabled } = props;
	function validateImg(file) {
		const isJpgOrPng =
			file.type === 'image/jpeg' ||
			file.type === 'image/png' ||
			file.type === 'image/jpg' ||
			file.type === 'image/x-icon' ||
			file.type === 'image/jfif';
		if (!isJpgOrPng) {
			return false;
		}

		return true;
	}

	function validateVideo(file) {
		const isVideo =
			file.type === 'video/quicktime' || // mov
			file.type === 'video/mp4' ||
			file.type === 'video/x-matroska'; // mkv
		if (!isVideo) {
			return false;
		}

		return true;
	}

	function validateFile(file) {
		const isVideo =
			file.type === 'application/pdf' ||
			file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
			file.type === 'application/msword' ||
			file.type === 'application/vnd.ms-excel' ||
			file.type === 'application/vnd.ms-powerpoint';
		if (!isVideo) {
			return false;
		}

		return true;
	}

	function validateFileUpload(fileList) {
		for (let i = 0; i < fileList.length; i++) {
			const file = fileList[i];
			if (!validateVideo(file) && !validateImg(file) && !validateFile(file)) {
				setError((old) => [...old, 'File không hợp lệ']);
				return false;
			}
			const isLt2M = file.size / 1024 / 1024 < 10;
			if (!isLt2M) {
				setError((old) => [...old, 'File không được quá 10MB']);
				return false;
			}
		}
		return true;
	}

	const isOverLimitSize = (fileList) => {
		let fileListSize = 0;
		let valueDataSize = 0;
		value.forEach((item) => {
			valueDataSize += item.fileSize || item.size;
		});

		fileList.forEach((item) => {
			fileListSize += item.fileSize || item.size;
		});
		if (valueDataSize + fileListSize > 100 * 1024 * 1024) {
			return true;
		}
		return false;
	};

	const handleInsertFile = async ({ file, onSuccess, onError }) => {
		try {
			const formData = new FormData();
			formData.append('files', file);
			formData.append('fileSize', file.size);
			const res = await insertImageAva.mutateAsync(formData);
			onSuccess(res);
		} catch (e) {
			onError('Không tải được');
		}
	};

	const handleBeforeUpload = (file, fileList) => {
		let validateResult = true;
		if (error.length) {
			validateResult = Upload.LIST_IGNORE;
		} else if (fileList.length + value.length > (props.maxCount || 20)) {
			setError((old) => [...old, 'Chỉ chọn tối đa 20 files']);
			validateResult = Upload.LIST_IGNORE;
		} else if (isOverLimitSize(fileList)) {
			setError((old) => [...old, 'Tổng dung lượng các file không được quá 100M']);
			validateResult = Upload.LIST_IGNORE;
		} else if (!validateFileUpload(fileList)) {
			validateResult = Upload.LIST_IGNORE;
		}
		if (file.uid === fileList[fileList.length - 1].uid) {
			setValidateDone(true);
		}
		return validateResult;
	};

	useEffect(() => {
		if (validateDone) {
			if (error.length) {
				message.error(error[0]);
				setError([]);
			}
			setValidateDone();
		}
	}, [validateDone]);

	return (
		<Upload
			className="ticket"
			listType="picture"
			defaultFileList={[...value]}
			customRequest={handleInsertFile}
			beforeUpload={handleBeforeUpload}
			onChange={({ fileList }) => {
				onChange(
					fileList.map((el) => {
						if (el.response) {
							el.id = el.response.id;
							el.fileName = el.response.fileName;
						}
						return el;
					}),
				);
			}}
			// onPreview={() => {}}
			iconRender={() => <AttachFileIcon width="w-4" />}
			{...props}
		>
			<Button
				disabled={disabled}
				loading={insertImageAva.isLoading}
				icon={<AttachFileIcon width="w-4" />}
				{...props}
			>
				Đính kèm
			</Button>
		</Upload>
	);
}
