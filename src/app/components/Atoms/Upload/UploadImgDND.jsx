import React, { useCallback, useRef, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Tooltip, Upload } from 'antd';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import update from 'immutability-helper';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useMutation } from 'react-query';
import { useLng } from 'app/hooks';
import UploadImage from 'app/models/UploadImage';
import { useForm } from 'antd/lib/form/Form';
import { v4 } from 'uuid';
import UploadByURLForm from './Component/UploadByURLForm';

export function UploadImgDND({ value = [], type, onChange, formEdit, fieldName, ...props }) {
	const typeDrag = 'DragableUploadList';
	const { disabled } = props;
	const [isModalShow, setModalShow] = useState();
	const [form] = useForm();
	const [isDirty, setDirty] = useState();
	const [loading, setLoading] = useState(false);
	const { tButton, tOthers } = useLng();
	const DragableUploadListItem = ({ originNode, moveRow, file, fileList }) => {
		const ref = useRef();
		const index = fileList.indexOf(file);

		const [{ isOver, dropClassName }, drop] = useDrop({
			accept: typeDrag,
			collect: (monitor) => {
				const { index: dragIndex } = monitor.getItem() || {};
				if (dragIndex === index) {
					return {};
				}
				return {
					isOver: monitor.isOver(),
					dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
				};
			},
			drop: (item) => {
				moveRow(item.index, index);
			},
		});
		const [, drag] = useDrag(
			() => ({
				type: typeDrag,
				item: { index },
				collect: (monitor) => ({
					isDragging: monitor.isDragging(),
				}),
			}),
			[index],
		);
		drop(drag(ref));
		const errorNode = (
			<Tooltip title="Upload Error" getPopupContainer={() => document.body}>
				{originNode.props.children}
			</Tooltip>
		);
		return (
			<div
				ref={ref}
				className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
				style={{ cursor: 'move' }}
			>
				{file.status === 'error' ? errorNode : originNode}
			</div>
		);
	};

	const moveRow = useCallback(
		(dragIndex, hoverIndex) => {
			const dragRow = value[dragIndex];

			onChange(
				update(value, {
					$splice: [
						[dragIndex, 1],
						[hoverIndex, 0, dragRow],
					],
				}),
			);
		},
		[value],
	);

	const insertImageAva = useMutation(type === 'service' ? UploadImage.insert : UploadImage.insertUserImage);

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

	const handleInsertImage = async ({ file, fileList }) => {
		try {
			if (validateImg(file)) {
				const formData = new FormData();
				formData.append('files', file);
				formData.append('fileSize', file.size);
				const res = await insertImageAva.mutateAsync(formData);

				value.push({
					name: res.fileName,
					url: `${res.filePath}`,
					uid: res.id,
					fileSize: res.fileSize,
				});
				onChange([...value]);
				// onSuccess();
			}
		} catch (e) {
			console.log(e);
			//  onError();
		}
	};

	const removeImage = (prop) => {
		const filteredList = value.filter((item) => item.uid !== prop.uid);
		onChange(filteredList);
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

		if (valueDataSize + fileListDataSize > 100 * 1024 * 1024) {
			return true;
		}
		return false;
	};

	const handleBeforeUpload = (file, filelist) => {
		// const fileNumberTemp = formEdit.getFieldValue("snapshots").length;
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

		// handleInsertImage(file);
		return true;
	};

	const showModal = () => {
		setModalShow(true);
	};

	const onFinish = async (valueForm) => {
		const url = form.getFieldValue('url');
		if (value.length >= props.maxCount) {
			formEdit.setFields([
				{
					name: fieldName,
					errors: ['Chỉ chọn tối đa 20 files'],
				},
			]);
			setModalShow(false);
			form.resetFields();
			return;
		}
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('link', url);
			formData.append('fileSize', 0);
			const res = await insertImageAva.mutateAsync(formData);

			value.push({
				name: res.fileName,
				url: `${res.filePath || res.externalLink}`,
				uid: res.id,
				fileSize: res.fileSize,
			});
			onChange([...value]);
			setModalShow(false);
			form.resetFields();
			// onSuccess();
		} catch (e) {
			console.log(e);
			//  onError();
		}
		setLoading(false);
	};

	return (
		<div className="relative">
			{!disabled && (
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

			<DndProvider backend={HTML5Backend}>
				<Upload
					listType="picture"
					// accept="image/png, image/jpeg, image/jpg, image/x-icon, image/jfif"
					itemRender={(originNode, file, currFileList) => (
						<DragableUploadListItem
							originNode={originNode}
							file={file}
							fileList={currFileList}
							moveRow={moveRow}
						/>
					)}
					fileList={value}
					onRemove={removeImage}
					customRequest={handleInsertImage}
					beforeUpload={handleBeforeUpload}
					{...props}
				>
					<Button disabled={disabled} icon={<UploadOutlined />}>
						{tButton('uploadImg')}
					</Button>
				</Upload>
			</DndProvider>
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
