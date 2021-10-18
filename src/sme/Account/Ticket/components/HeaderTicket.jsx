import { Button, Tag, Tooltip } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { DX, SMETicket, TicketAdmin } from 'app/models';
import React from 'react';

const HeaderTicket = ({ className, ticketInfo, loading, closeTicket }) => {
	const {
		icon,
		serviceName,
		status,
		developerName,
		supporterName,
		updatedName,
		updatedRole,
		updatedTime,
		smeUserId,
	} = {
		...ticketInfo,
	};
	const { tButton, tFilterField, tOthers } = useLng();
	const { user } = useUser();
	const CLOSE_IN_PROCESS = DX.canAccessFuture2('sme/close-ticket-pending', user.permissions);
	const CLOSE_ALL_STATUS = DX.canAccessFuture2('sme/close-ticket-all', user.permissions);

	const TagStatus = (display) => {
		const Status = SMETicket.statusArray.filter((item) => item.value === display)[0];
		return (
			<Tag color={Status?.color} className="mr-0 font-semibold">
				{tFilterField('value', Status?.label)}
			</Tag>
		);
	};

	const convertCloseTag = (value) => {
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
		<div className={`flex justify-between ${className}`}>
			<div className="flex">
				<div className="rounded-3xl w-14 h-14 overflow-hidden mr-4">
					<img
						src={icon || '/images/NoImageNew.svg'}
						alt={serviceName || 'NoImage'}
						title={serviceName || 'NoImage'}
						className="w-full h-full object-cover"
					/>
				</div>
				<div>
					<h3 className="text-base mb-2 font-semibold truncate ..." style={{ color: '#263238' }}>
						{serviceName}
					</h3>
					<div className="flex flex-wrap items-center">
						<div className="mr-6 text-sm text-gray-60 mb-1">
							{tFilterField('prefix', 'status')}: {TagStatus(status)}
						</div>
						<div className="mr-6 text-sm text-gray-60 mb-1 max-w-xs truncate">
							{tFilterField('permissionOptions', 'dev')}:{' '}
							<Tooltip title={developerName} placement="topLeft">
								<span className="font-bold">{developerName}</span>
							</Tooltip>
						</div>
						{supporterName && (
							<div className="mr-6 text-sm text-gray-60 mb-1 max-w-xs truncate">
								{tFilterField('value', 'supportStaff')}:{' '}
								<Tooltip title={developerName} placement="topLeft">
									<span className="font-bold" style={{ maxWidth: '6.25rem' }}>
										{supporterName}
									</span>
								</Tooltip>
							</div>
						)}
					</div>
				</div>
			</div>

			{status === 'OPEN' && CLOSE_IN_PROCESS && (
				<Button type="primary" className="font-semibold" onClick={closeTicket} loading={loading}>
					{tButton('closeTicket')}
				</Button>
			)}

			<div
				className="text-right text-gray-500"
				style={{
					display:
						updatedRole && status === tFilterField('value', TicketAdmin.tagStatus.RESOLVED.value)
							? 'block'
							: 'none',
				}}
			>
				<p>
					{tOthers('payer')}: {updatedName} ({convertCloseTag(updatedRole)})
				</p>
				<p>
					{tOthers('time')}: {updatedTime}
				</p>
			</div>
		</div>
	);
};

export default HeaderTicket;
