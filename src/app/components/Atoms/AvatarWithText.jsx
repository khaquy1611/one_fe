import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { Link } from 'react-router-dom';

function AvatarWithText({ icon, name, linkTo, subName, style }) {
	return (
		<div className="flex items-center">
			<Avatar src={icon} className="mr-2 flex-none">
				{name && name[0]}
			</Avatar>
			<div className="truncate">
				<Tooltip title={style ? 'Chưa xác nhận cập nhật' : name} placement="topLeft">
					<span style={style}>
						{linkTo ? (
							<Link to={linkTo} style={style}>
								{name}
							</Link>
						) : (
							name
						)}
					</span>
				</Tooltip>

				<br />
				{subName && (
					<Tooltip title={subName} placement="topLeft">
						<span className="text-sm text-gray-400">{subName}</span>
					</Tooltip>
				)}
			</div>
		</div>
	);
}

export default AvatarWithText;
