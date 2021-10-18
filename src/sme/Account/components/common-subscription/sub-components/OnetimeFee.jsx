import { Table } from 'antd';
import { DX } from 'app/models';
import { useLng } from 'app/hooks';
import React from 'react';

const formatCurrency = (value) => (
	<span className="font-semibold text-primary">{DX.formatNumberCurrency(value, 'null')}</span>
);

function OnetimeFee({ onceTimeFee, currencyName }) {
	const { tField } = useLng();
	const columns = [
		{
			title: tField('feeName'),
			dataIndex: 'name',
		},
		{
			title: tField('dateFee'),
			dataIndex: 'dateFee',
		},
		{
			title: (
				<span>
					{tField('amountOfMoney')} ({currencyName})
				</span>
			),
			dataIndex: 'price',
			render: (value) => formatCurrency(value),
			align: 'right',
		},
		// {
		// 	title: (
		// 		<span>
		// 			{tField('amountOfMoneyAfterTax')} ({currencyName})
		// 		</span>
		// 	),
		// 	dataIndex: 'afterTax',
		// 	render: (value) => formatCurrency(value),
		// 	align: 'right',
		// },
	];

	return <Table columns={columns} dataSource={onceTimeFee} pagination={false} />;
}

export default OnetimeFee;
