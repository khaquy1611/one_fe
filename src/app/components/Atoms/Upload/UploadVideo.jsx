import React, { useState } from 'react';
import { FileOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import { useMutation } from 'react-query';
import { useLng } from 'app/hooks';
import UploadImage from 'app/models/UploadImage';
import { useForm } from 'antd/lib/form/Form';
import UploadByURLForm from './Component/UploadByURLForm';

export function UploadVideo({ value = [], type, onChange, onlyOne, formEdit, fieldName, canUploadByLink, ...props }) {
	const insertImageAva = useMutation(type === 'service' ? UploadImage.insert : UploadImage.insertUserImage);
	const { disabled } = props;

	const [isModalShow, setModalShow] = useState();
	const [form] = useForm();
	const { tButton, tOthers, tMessage } = useLng();
	const [isDirty, setDirty] = useState();
	function validateVideo(file) {
		const isVideo =
			file.type === 'video/quicktime' || // mov
			file.type === 'video/mp4' ||
			file.type === 'video/x-matroska'; // mkv
		if (!isVideo) {
			message.error('Định dạng file không được hỗ trợ.');
			return false;
		}
		const isLt2M = file.size / 1024 / 1024 < 100;
		if (!isLt2M) {
			message.error(tMessage('fileSize'));
			return false;
		}
		return true;
	}

	const insertValue = (res, fileSize) => {
		if (onlyOne) {
			onChange([
				{
					name: res.fileName,
					url: `${res.filePath || res.externalLink}`,
					uid: res.id,
					fileSize,
					thumbUrl: '/images/fileUpload.svg',
				},
			]);
		} else {
			value.push({
				name: res.fileName,
				url: `${res.filePath || res.externalLink}`,
				uid: res.id,
				fileSize,
				thumbUrl: '/images/fileUpload.svg',
			});
			onChange(value);
		}
	};

	const handleInsertVideo = async ({ file, onSuccess, onError }) => {
		try {
			if (validateVideo(file)) {
				const formData = new FormData();
				formData.append('files', file);
				formData.append('fileSize', file.size);
				const res = await insertImageAva.mutateAsync(formData);
				insertValue(res, file.size);
				onSuccess();
			}
		} catch (e) {
			onError();
		}
	};

	const isOverLimitSize = (filelist) => {
		let valueDataSize = 0;
		let fileListDataSize = 0;

		value.map((item) => {
			valueDataSize += item.fileSize;
			return valueDataSize;
		});
		filelist.map((item) => {
			fileListDataSize += item.size;
			return fileListDataSize;
		});

		if (valueDataSize + fileListDataSize > 10 * 1024 * 1024) {
			return true;
		}
		return false;
	};

	const handleBeforeUpload = (file, filelist) => {
		if (!onlyOne) {
			if (props.maxCount && filelist.length + value.length > props.maxCount) {
				formEdit.setFields([
					{
						name: fieldName,
						errors: ['Chỉ chọn tối đa 20 files'],
					},
				]);
				return false;
			}

			if (isOverLimitSize(filelist)) {
				formEdit.setFields([
					{
						name: fieldName,
						errors: ['Tổng dung lượng các file không được quá 100MB'],
					},
				]);
				return false;
			}
		}

		// handleInsertImage(file);
		return true;
	};

	const onFinish = async (valueForm) => {
		const urlTemp = form.getFieldValue('url');
		const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
		const match = urlTemp.match(reg);
		if (match && match[2].length === 11) {
			const url = `https://www.youtube.com/embed/${match[2]}`;
			try {
				const formData = new FormData();
				formData.append('link', url);
				formData.append('fileSize', 0);
				const res = await insertImageAva.mutateAsync(formData);
				insertValue(res, 0);
			} catch (e) {
				message.error('ERROR');
			}

			setModalShow(false);
			form.resetFields();
		} else {
			message.error('Link url không hợp lệ');
		}
	};

	const showModal = () => {
		setModalShow(true);
	};

	const removeImage = (prop) => {
		const filteredList = value.filter((item) => item.uid !== prop.uid);
		onChange(filteredList);
	};
	return (
		<div>
			<div>
				{canUploadByLink && !disabled && (
					<div
						className="absolute left-28"
						onClickCapture={(e) => {
							e.preventDefault();
						}}
					>
						<Button type="link" onClick={showModal}>
							{tOthers('useURL')} {tButton('uploadVideo')}
						</Button>
					</div>
				)}
			</div>
			<Upload
				listType="picture"
				// accept="video/quicktime, video/mp4, video/x-matroska"
				customRequest={handleInsertVideo}
				beforeUpload={handleBeforeUpload}
				fileList={value}
				onRemove={removeImage}
				iconRender={() => <FileOutlined className="text-lg" />}
				{...props}
			>
				<Button disabled={disabled} loading={insertImageAva.isLoading} icon={<UploadOutlined />} {...props}>
					{tButton('uploadVideo')}
				</Button>
			</Upload>
			<UploadByURLForm
				isVideo
				isModalShow={isModalShow}
				setModalShow={setModalShow}
				isDirty={isDirty}
				setDirty={setDirty}
				onFinish={onFinish}
				form={form}
			/>
		</div>
	);
}
