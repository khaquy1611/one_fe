import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Table } from 'antd';
import { isEmpty, noop } from 'opLodash';
import { useLng } from 'app/hooks';
import { CalculatorIcon, CheckCircleIcon } from 'app/icons';
import { DX, SMESubscription } from 'app/models';

function CalculationDetail({ showCalculation, closeModalCalculation, dataPopupByType, pricingPlan, currencyName }) {
	const { tField, tButton, tMessage } = useLng();
	const isChecked = (record) => (!isEmpty(record.quantity) || record.quantity > 0) && !record.key;
	const [dataPopup, setDataPopup] = useState([]);
	const total = (type) =>
		dataPopupByType
			?.map((item) => item[type])
			?.reduce((accumulator, currentValue) => accumulator + currentValue || 0);

	useEffect(() => {
		if (!isEmpty(dataPopupByType)) {
			setDataPopup([
				...dataPopupByType,
				{
					amountAfterTax: total('amountAfterTax'),
					amountBeforeTax: total('amountBeforeTax'),
					amount: total('amount'),
					quantity: total('quantity'),
					unitFrom: 'Tổng số:',
					unitPrice: null,
					unitTo: '',
					key: 'total',
				},
			]);
		} else setDataPopup([]);
	}, [dataPopupByType]);

	const ConvertZeroAndChar = (type, record) => {
		if (!isEmpty(record[type]) || record[type] > 0) {
			return DX.formatNumberCurrency(record[type]);
		}
		return 0;
	};

	const columns = [
		{
			render: (value, record) =>
				isChecked(record) && (
					<div className="flex justify-center items-center">
						<CheckCircleIcon width="w-4" />
					</div>
				),
			key: 'checkIcon',
			width: 50,
		},
		{
			title: tField('valueRange'),
			render: (value, record) => (
				<div className={`${record.key ? 'font-semibold' : ''}`}>
					{record.unitFrom}
					{record.key ? record.unitTo : `-${record.unitTo || 'Không giới hạn'}`}
				</div>
			),
			key: 'valueRange',
		},
		{
			title: tField('quantity'),
			render: (value, record) => (
				<div className={`${record.key ? 'font-semibold' : ''}`}>{ConvertZeroAndChar('quantity', record)}</div>
			),
		},
		{
			align: 'right',
			title: `${tField('unitPrice')} (${currencyName})`,
			key: 'unitPrice',
			dataIndex: 'unitPrice',
			render: (value, record) => (
				<div className={`${record.key ? 'font-semibold' : ''}`}>
					{record.key ? '' : ConvertZeroAndChar('unitPrice', record)}
				</div>
			),
		},
		{
			align: 'right',
			title: `${tField('amountOfMoney')} (${currencyName})`,
			key: 'amountBeforeTax',
			dataIndex: 'amountBeforeTax',
			render: (value, record) => (
				<div className={`${record.key ? 'font-semibold' : ''}`}>
					{ConvertZeroAndChar(pricingPlan !== 'TIER' ? 'amountBeforeTax' : 'amount', record)}
				</div>
			),
		},
	];
	return (
		<Modal visible={showCalculation} closable={false} footer={null} width={1000}>
			<div className="flex flex-col items-center">
				<CalculatorIcon width="w-12" className="mt-4" />
				<p className="mb-8 font-semibold mt-1">
					{tMessage('calculationDetail')} - {SMESubscription.formatPricingPlanToText[pricingPlan]}
				</p>
				<Table
					columns={columns}
					dataSource={dataPopup}
					scroll={{ x: 900 }}
					pagination={{ position: ['none'] }}
					rowClassName={(record) => (isChecked(record) ? 'bg-blue-250' : '')}
				/>
				<Button type="primary" onClick={() => closeModalCalculation()} className="mt-8 px-16">
					{tButton('close')}
				</Button>
			</div>
		</Modal>
	);
}
CalculationDetail.propTypes = {
	showCalculation: PropTypes.bool,
	closeModalCalculation: PropTypes.func,
};
CalculationDetail.defaultProps = {
	showCalculation: false,
	closeModalCalculation: noop,
};
export default CalculationDetail;
