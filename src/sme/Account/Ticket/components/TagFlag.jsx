import React from 'react';
import { Tag, Tooltip } from 'antd';
import { useLng } from 'app/hooks';
import { SMETicket } from 'app/models';

const TagFlag = ({ name, status, nameDev, icon }) => {
	const Status = SMETicket.statusArray.filter((item) => item.value === status)[0];
	const { tFilterField } = useLng();
	return (
		<span
			style={{ color: '#78909C' }}
			className="mr-6 text-sm
    "
		>
			{name}:{' '}
			<Tag color={Status?.color ? Status?.color : ''} className="font-semibold text-xs max-w-xs ">
				{Status?.label ? (
					tFilterField('value', Status?.label)
				) : (
					<Tooltip title={nameDev}>
						<span className=" truncate leading-none ..." style={{ color: '#546E7A', maxWidth: '6.25rem' }}>
							{icon} {nameDev}
						</span>
					</Tooltip>
				)}
			</Tag>
		</span>
	);
};

export default TagFlag;
