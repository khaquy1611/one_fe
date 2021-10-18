import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';

import { useMutation } from 'react-query';
import { useLng } from 'app/hooks';
import UploadImage from 'app/models/UploadImage';
import { useForm } from 'antd/lib/form/Form';
import UploadByURLForm from './Component/UploadByURLForm';

export function UploadImg({ value = [], onChange, onlyOne, type, formEdit, fieldName, canUploadByLink, ...props }) {
	const [loading, setLoading] = useState(false);

	const insertImageAva = useMutation(type === 'service' ? UploadImage.insert : UploadImage.insertUserImage);
	const { tButton, tOthers } = useLng();

	// const insertImageAva = useMutation(UploadImage.insert);
	const [isModalShow, setModalShow] = useState();
	const [form] = useForm();
	const [isDirty, setDirty] = useState();
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
				formData.append('files', file);
				formData.append('fileSize', file.size);
				const res = await insertImageAva.mutateAsync(formData);

				if (onlyOne) {
					onChange([
						{
							name: res.fileName,
							url: `${res.filePath}`,
							uid: res.id,
							fileSize: file.size,
						},
					]);
				} else {
					value.push({
						name: res.fileName,
						url: `${res.filePath}`,
						uid: res.id,
						fileSize: file.size,
					});
					onChange(value);
				}
				onSuccess();
			}
		} catch (e) {
			onError();
		}
	};

	let valueDataSize = 0;
	const isOverLimitSize = (file) => {
		if (valueDataSize === 0) {
			value
				.filter((el) => el.id)
				.forEach((item) => {
					valueDataSize += item.fileSize || item.size;
				});
		}

		valueDataSize += file.size;

		if (valueDataSize > 100 * 1024 * 1024) {
			return true;
		}
		return false;
	};

	const handleBeforeUpload = (file, filelist) => {
		// const fileNumberTemp = formEdit.getFieldValue("snapshots").length;
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

			if (isOverLimitSize(file)) {
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

	const removeImage = (prop) => {
		const filteredList = value.filter((item) => item.uid !== prop.uid);
		onChange(filteredList);
	};
	const { disabled } = props;

	const showModal = () => {
		setModalShow(true);
	};

	const setImageURL = async (url) => {
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('link', url);
			formData.append('fileSize', 0);
			const res = await insertImageAva.mutateAsync(formData);
			if (onlyOne) {
				onChange([
					{
						name: res.fileName,
						url: `${res.filePath || res.externalLink}`,
						uid: res.id,
						fileSize: res.fileSize,
					},
				]);
			} else {
				value.push({
					name: res.fileName,
					url: `${res.filePath || res.externalLink}`,
					uid: res.id,
					fileSize: res.fileSize,
				});

				onChange(value);
			}
			setModalShow(false);
			form.resetFields();
		} catch (e) {
			message.error('ERROR');
		}
		setLoading(false);
	};
	const onFinish = async (valueForm) => {
		const url = form.getFieldValue('url');
		setImageURL(url);
	};
	return (
		<div>
			<div className="relative">
				{canUploadByLink && !disabled && (
					<div
						className="absolute left-28"
						onClickCapture={(e) => {
							e.preventDefault();
						}}
					>
						<Button type="link" onClick={showModal}>
							{tOthers('useURL')} {tButton('uploadImg')}
						</Button>
					</div>
				)}
				<Upload
					listType="picture"
					// accept="image/png, image/jpeg, image/jpg, image/x-icon, image/jfif"
					customRequest={handleInsertImage}
					fileList={value}
					beforeUpload={handleBeforeUpload}
					onRemove={removeImage}
					{...props}
				>
					<Button loading={insertImageAva.isLoading} disabled={disabled} icon={<UploadOutlined />}>
						{tButton('uploadImg')}
					</Button>
				</Upload>
			</div>
			<UploadByURLForm
				isModalShow={isModalShow}
				setModalShow={setModalShow}
				isDirty={isDirty}
				setDirty={setDirty}
				onFinish={onFinish}
				form={form}
				loadingBtn={loading}
			/>
		</div>
	);
}
