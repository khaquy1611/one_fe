import { Table } from 'antd';
import { AvatarWithText } from 'app/components/Atoms';
import { usePaginationLocal, useLng } from 'app/hooks';
import { SubscriptionDev } from 'app/models';
import React from 'react';
import { useParams } from 'react-router-dom';

function HistorySubscription({ subscriptionStatus, typePortal }) {
	const { id } = useParams();
	const { tField } = useLng();
	const { configTable } = usePaginationLocal(
		() => SubscriptionDev.getHistorySubscription(id, typePortal === 'ADMIN' ? 'admin' : 'dev'),
		[],
		{
			sort: '',
		},
		'getSubscriptionHistory',
	);

	const columns = [
		{
			title: tField('changer'),
			dataIndex: 'modifiedName',
			render: (value, record) => <AvatarWithText name={value} icon={record.icon || record.embedURL} />,
			ellipsis: true,
		},
		{
			title: tField('timeToChange'),
			dataIndex: 'modifiedAt',
		},
		{
			title: tField('content'),
			render: (value) => <span style={{ whiteSpace: 'break-spaces' }}>{value}</span>,
			dataIndex: 'content',
		},
	];

	return (
		<div>
			{subscriptionStatus !== 'IN_TRIAL' ? (
				<Table columns={columns} {...configTable} />
			) : (
				<div>Chưa có thông tin lịch sử của thuê bao</div>
			)}
		</div>
	);
}

export default HistorySubscription;
