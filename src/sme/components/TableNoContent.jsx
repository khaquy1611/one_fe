import React from 'react';
import { useLng } from 'app/hooks';
import { Table } from 'antd';

function TableNoContent({ currencyName, haveTax }) {
	const { tField } = useLng();
	const columns = [
		{
			title: tField('category'),
			key: 'id',
			dataIndex: 'id',
		},
		{
			title: tField('quantity'),
			key: 'quantity',
		},
		{
			align: 'right',
			title: (
				<>
					{tField('unitPrice')} ({currencyName})
				</>
			),
			key: 'unitPrice',
		},
		{
			align: 'right',
			title: !haveTax ? (
				<>
					{tField('amountOfMoney')} ({currencyName})
				</>
			) : (
				<>
					{tField('amountOfMoneyBeforeTax')} ({currencyName})
				</>
			),
			key: 'preAmountTax',
			fixed: !haveTax ? 'right' : '',
			// width: '20%',
		},
		{
			align: 'right',
			title: (
				<>
					{tField('amountOfMoneyAfterTax')} ({currencyName})
				</>
			),
			key: 'afterAmountTax',
			fixed: 'right',
			// width: '20%',
			hide: !haveTax,
		},
	];

	return (
		<Table
			columns={columns.filter((item) => !item.hide)}
			dataSource={[{ id: '' }]}
			scroll={{ x: 600 }}
			rowKey="id"
			pagination={{ position: ['none'] }}
			className="table-no-content table-title"
		/>
	);
}
TableNoContent.propTypes = {};
export default TableNoContent;
