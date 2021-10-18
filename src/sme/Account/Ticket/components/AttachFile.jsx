import React, { useEffect } from 'react';
import { DX, UploadImage, ResizeImage } from 'app/models';
import { useMutation } from 'react-query';
import { Tooltip, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { imagePrivateActions, imageSelects } from 'actions';
import { PaperClipOutlined } from '@ant-design/icons';

const AttachFile = ({ name, id, size, portal }) => {
	const FileData = useSelector(imageSelects.selectImage);
	const dispatch = useDispatch();

	useEffect(
		() => () => {
			dispatch(imagePrivateActions.clear({ uid: id }));
		},
		[],
	);

	const imgBase64 = FileData[id]?.url;
	const convertBlobToBase64 = (blobFile) => {
		const reader = new FileReader();
		reader.readAsDataURL(blobFile);
		reader.onloadend = () => {
			ResizeImage.imageFileResize(blobFile, (url) => {
				dispatch(
					imagePrivateActions.setImage({
						id,
						name,
						url,
						size,
					}),
				);
			});
		};
	};

	// read file from attach field response
	const downloadFile = useMutation(UploadImage.downloadFileSecret, {
		onSuccess: (res) => {
			convertBlobToBase64(res);
		},
	});

	useEffect(() => {
		if (DX.checkObjectTypeFile(name) === 1) {
			downloadFile.mutate({ id, portal });
		}
	}, []);

	const onDownload = async () => {
		const temp = await downloadFile.mutateAsync({ id, portal });
		DX.exportFileByBlob(temp, name);
	};

	return (
		<Spin spinning={downloadFile.isLoading}>
			<div
				style={{ border: '1px solid #E6E6E6', background: '#fff' }}
				className="flex items-center rounded-xl p-2.5 cursor-pointer"
				onClickCapture={onDownload}
			>
				<div className="h-12 w-12 rounded-lg overflow-hidden mr-2 flex items-center ">
					{DX.checkObjectTypeFile(name) !== 1 ? (
						<PaperClipOutlined className="text-3xl" />
					) : (
						<img
							src={`${imgBase64}` || '/images/NoImageNew.svg'}
							alt={name}
							title={name}
							className="w-full h-full object-cover"
						/>
					)}
				</div>
				<Tooltip title={name} placement="topLeft">
					<div
						className="truncate ..."
						style={{
							color: 'var(--color-primary)',
							width: 'calc(100% - 3rem)',
						}}
					>
						{name}
					</div>
				</Tooltip>
			</div>
		</Spin>
	);
};

export default AttachFile;
