import { ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { DX } from 'app/models';
import clsx from 'clsx';
import React from 'react';
import AttachFile from './AttachFile';

const BodyTicket = ({
	className,
	style,
	ticketInfo,
	editTicket,
	statusTicket,
	smeNameBody,
	deleteTicket,
	isCheckRole,
	header,
	portal,
}) => {
	const {
		status,
		updatedTime,
		smeUserAvatar,
		smeUserName,
		title,
		content,
		smeName,
		name,
		avatar,
		type,
		id,
		attachs,
		smeUserId,
		userId,
		updatedContentTime,
	} = { ...ticketInfo };
	const { user } = useUser();
	const { tOthers } = useLng();
	const convertType = (value) => {
		let temp = '';
		switch (value) {
			case 'ADMIN':
				temp = tOthers('admin');
				break;
			case 'DEVELOPER':
				temp = tOthers('dev');
				break;
			default:
				temp = tOthers('sme');
				break;
		}
		return temp;
	};

	return (
		<div className={`p-6 ${className}`} style={style}>
			<div className="flex mb-6 justify-between">
				<div className="flex">
					<div className="rounded-3xl w-12 h-12 overflow-hidden mr-4">
						<img
							src={smeUserAvatar || avatar || '/images/NoImageNew.svg'}
							alt={smeUserName || name || 'NoImage'}
							title={smeUserName || name || 'NoImage'}
							className="w-full h-full object-cover rounded-full"
						/>
					</div>
					<div>
						<div className="flex flex-wrap mb-1">
							<Tooltip placement="topLeft" title={smeUserName || name}>
								<div className="max-w-md mr-2 font-bold line-clamp-1">{smeUserName || name}</div>
							</Tooltip>

							<Tooltip
								placement="topLeft"
								title={type === 'SME' ? smeNameBody : smeName || convertType(type)}
							>
								<Tag
									className="font-medium text-xs inline-block truncate bg-white"
									style={{ maxWidth: '12rem' }}
								>
									{type === 'SME' ? smeNameBody : smeName || convertType(type)}
								</Tag>
							</Tooltip>
						</div>
						<div className="text-sm">
							<ClockCircleOutlined className="mr-2 h-3" />
							{header ? updatedContentTime : updatedTime}
						</div>
					</div>
				</div>
				{/* role sme */}
				{DX.canAccessFuture2('sme/edit-ticket-pending', user.permissions) && status === 'OPEN' && (
					// (DX.canAccessFuture2('sme/edit-ticket-all', user.permissions) && status !== 'OPEN')) &&
					<Button
						onClick={editTicket}
						className="border-none inline-block"
						style={{ background: ' #F8F8F8' }}
						icon={<EditOutlined className="w-4" />}
					/>
				)}

				{/* role admin and dev */}
				{!header && (
					<div>
						{(DX.canAccessFuture2('admin/edit-own-response-ticket', user.permissions) ||
							DX.canAccessFuture2('dev/edit-own-response-ticket', user.permissions)) &&
							userId === user.id &&
							isCheckRole(type || 'DEVELOPER') && (
								<Button
									onClick={() => editTicket(ticketInfo)}
									shape="circle"
									className="mr-2"
									// className={
									// 	statusTicket !==
									// 	TicketAdmin.tagStatus.IN_PROGRESS
									// 		.value
									// 		? "hidden"
									// 		: "mr-4 w-10"
									// }
									style={{
										background: '#fff',
									}}
									icon={<EditOutlined color="#8C8C8C" />}
								/>
							)}
						{/* (DX.canAccessFuture2('sme/delete-own-response-ticket', user.permissions) &&
							userId === user.id) || */}
						{(((DX.canAccessFuture2('admin/delete-own-response-ticket', user.permissions) ||
							DX.canAccessFuture2('dev/delete-own-response-ticket', user.permissions)) &&
							userId === user.id &&
							isCheckRole(type || 'DEVELOPER')) ||
							(DX.canAccessFuture2('admin/delete-other-response-ticket', user.permissions) &&
								userId !== user.id)) && (
							<Button
								onClick={() => deleteTicket(id)}
								shape="circle"
								// className={
								// 	statusTicket !==
								// 	TicketAdmin.tagStatus.IN_PROGRESS.value
								// 		? "hidden"
								// 		: "mr-4 w-10"
								// }
								style={{
									background: ' #fff',
								}}
								icon={<DeleteOutlined color="#8C8C8C" />}
							/>
						)}
					</div>
				)}
			</div>
			{title && <h4 className="mb-3 font-bold truncate ...">{title}</h4>}
			<p className={attachs?.length > 0 ? 'mb-6' : 'mb-0'} style={{ whiteSpace: 'pre-wrap' }}>
				{content}
			</p>
			<div className="flex flex-wrap -mx-2">
				{attachs?.map((item, index) => (
					<div className={clsx('px-2 tablet:w-1/2 w-1/3', index > 2 ? 'mb-3' : '')} key={`${index + 1}`}>
						<AttachFile name={item.name} id={item.id} size={item.size || 0} portal={portal} />
					</div>
				))}
			</div>
		</div>
	);
};

export default BodyTicket;
