import React from 'react';
import { Tooltip } from 'antd';

function TextInColumn({ title, inactive }) {
	const style = { color: '#f5222d' };
	return (
		<Tooltip title={title}>
			<div className="line-clamp-1 w-full" style={inactive ? style : null}>
				{title}
			</div>
		</Tooltip>
	);
}

export default TextInColumn;
