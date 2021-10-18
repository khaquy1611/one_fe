import { Table } from 'antd';
import { AvatarWithText } from 'app/components/Atoms';
import { usePaginationLocal, useLng } from 'app/hooks';
import { SMESubscription } from 'app/models';
import React from 'react';
import { useParams } from 'react-router-dom';

function History() {
	const { id } = useParams();
	const { tField } = useLng();
	const { configTable } = usePaginationLocal(
		(params) => SMESubscription.getHistorySubscription(id, params),
		[],
		{
			sort: '',
		},
		'getListSubscriptionHistory',
	);

	const columns = [
		// {
		// 	title: '#',
		// 	dataIndex: 'id',
		// 	render: (_, item, index) => (page - 1) * pageSize + index + 1,
		// 	width: 100,
		// },
		{
			title: tField('changer'),
			dataIndex: 'modifiedName',
			render: (value, record) => <AvatarWithText name={value} icon={record.icon || record.embedURL} />,
			// sorter: {},
			ellipsis: true,
		},
		{
			title: tField('timeToChange'),
			dataIndex: 'modifiedAt',
			// sorter: {},
		},
		{
			title: tField('content'),
			render: (value) => <span style={{ whiteSpace: 'break-spaces' }}>{value}</span>,
			dataIndex: 'content',
			// sorter: {},
		},
	];
	return (
		<div className="box-detail">
			<Table columns={columns} {...configTable} />
		</div>
	);
}

export default History;
