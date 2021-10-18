import React from 'react';
import { Tag } from 'antd';
import { useLng } from 'app/hooks';

const SupportTagStatus = React.memo(({ status }) => {
	const { tFilterField } = useLng();
	let text = tFilterField('value', 'unprocessed');
	let color = 'green';
	if (status === 'OPEN') {
		text = tFilterField('value', 'unprocessed');
		color = 'red';
	} else if (status === 'IN_PROGRESS') {
		text = tFilterField('value', 'inProcess');
		color = 'orange';
	} else if (status === 'RESOLVED') {
		text = tFilterField('value', 'processed');
		color = 'orange';
	}
	return <Tag color={color}>{text}</Tag>;
});
export default SupportTagStatus;
