import React from 'react';
import { Table } from 'antd';
import { DX } from 'app/models';
import { isEmpty, range } from 'opLodash';

const SummaryRow = Table.Summary.Row;
const SummaryCell = Table.Summary.Cell;

const COST = {
	ALL_BILL: 'ALL_BILL',
	INCURRED: 'INCURRED',
};

function removeDuplicates(arr, key) {
	return [...new Map(arr.map((item) => [key(item), item])).values()];
}

function convertTaxName(str = '') {
	const arr = str.split(' ').slice(0, -1);
	for (let i = 0; i < arr.length; i++) {
		const isNumber = parseFloat(arr[i]);
		if (typeof isNumber === 'number' && !Number.isNaN(isNumber)) arr[i] = `${isNumber}%`;
	}
	return arr.join(' ');
}

const getLengthColumns = (data = []) => {
	let lengthSelfPercent = 0;
	let lengthSelfPrice = 0;
	let lengthInvoicePercent = 0;
	let lengthInvoicePrice = 0;
	const tempAllTax = [];

	for (let i = 0; i < data.length; i++) {
		if (data[i].couponPrices?.length > lengthSelfPrice) {
			lengthSelfPrice = data[i].couponPrices.length;
		}
		if (data[i].couponPercents?.length > lengthSelfPercent) {
			lengthSelfPercent = data[i].couponPercents.length;
		}
		if (data[i].invoiceCouponPrices?.length > lengthInvoicePrice) {
			lengthInvoicePrice = data[i].invoiceCouponPrices.length;
		}
		if (data[i].invoiceCouponPercents?.length > lengthInvoicePercent) {
			lengthInvoicePercent = data[i].invoiceCouponPercents.length;
		}
		// check tax
		data[i].taxes?.forEach((el) => tempAllTax.push({ taxName: convertTaxName(el.taxName), id: el.id }));
	}

	const allTax = removeDuplicates(tempAllTax, (item) => item.taxName);

	return { lengthSelfPercent, lengthSelfPrice, lengthInvoicePercent, lengthInvoicePrice, allTax };
};

const getColumns = (length, field = 'couponPrices', header = 'STKM riêng (ST-index)', type) =>
	range(0, length).map((index) => ({
		align: 'right',
		title: header.replace('index', index + 1),
		width: 120,
		render(_, record) {
			return DX.formatNumberCurrency(record[field][index]?.price, 'null');
		},
		summary: (record, total = 0) => total + (record[field][index]?.price || 0),
		hide: type === COST.INCURRED,
	}));

const getTaxColumns = (taxList = [], field = 'taxes') =>
	taxList.map((el) => ({
		align: 'right',
		title: el.taxName,
		width: 120,
		render(_, record) {
			let temp = null;
			record[field].forEach((taxItem, index) => {
				if (el.taxName === convertTaxName(taxItem.taxName))
					temp = DX.formatNumberCurrency(record[field][index]?.amount, 'null');
			});
			return temp;
		},
		summary(record, total = 0) {
			record[field].forEach((taxItem, index) => {
				if (el.taxName === convertTaxName(taxItem.taxName)) total += record[field][index]?.amount || 0;
			});
			return total;
		},
	}));

function renderColumnType(data = [], type) {
	const { lengthSelfPrice, lengthSelfPercent, lengthInvoicePercent, lengthInvoicePrice, allTax } = getLengthColumns(
		!isEmpty(data) && data,
	);

	const beforeCoupon =
		lengthSelfPrice > 0 || lengthSelfPercent > 0 || lengthInvoicePercent > 0 || lengthInvoicePrice > 0;

	const afterCoupon =
		(lengthSelfPrice > 0 || lengthSelfPercent > 0) && (lengthInvoicePercent > 0 || lengthInvoicePrice > 0);

	const columnsType = [
		{
			fixed: true,
			title: 'STT',
			align: 'center',
			dataIndex: 'itemId',
			render: (value, item, index) => index + 1,
			width: 80,
			summary: () => <span className="font-semibold">Tổng</span>,
		},
		{
			fixed: true,
			title: 'Dịch vụ',
			dataIndex: 'itemName',
			className: 'serviceNameCss',
			render: (value, record) => (
				<span className="break-words">
					{value} <br />
					{type === COST.ALL_BILL && `(${record.startDate} - ${record.endDate})`}
				</span>
			),
			width: 200,
			summary: () => '',
		},
		// --------------ST trước KM riêng-------------------
		{
			title: <span className="break-words">ST trước KM</span>,
			align: 'right',
			dataIndex: 'preAmountTax',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			width: 120,
			summary: (record, total = 0) => total + (record.preAmountTax || 0),
			hide: type === COST.INCURRED || !beforeCoupon,
		},
		...getColumns(lengthSelfPrice, 'couponPrices', 'STKM riêng (ST-index)', type),
		...getColumns(lengthSelfPercent, 'couponPercents', 'STKM riêng (theo %-index)', type),

		{
			title: <span className="break-words">ST sau KM riêng</span>,
			align: 'right',
			dataIndex: 'intoAmountPreTax',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			width: 120,
			summary: (record, total = 0) => total + (record.intoAmountPreTax || 0),
			hide: type === COST.INCURRED || !afterCoupon,
		},

		// -------------STKM HĐ--------------------
		...getColumns(lengthInvoicePrice, 'invoiceCouponPrices', 'STKM HD (ST-index)', type),
		...getColumns(lengthInvoicePercent, 'invoiceCouponPercents', 'STKM HD (theo %-index)', type),

		// ----------------ST trước thuế-----------------
		{
			title: <span className="break-words">{allTax.length > 0 ? 'ST trước thuế' : 'Số tiền'}</span>,
			align: 'right',
			dataIndex: 'finalAmountPreTax',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			width: 120,
			summary: (record, total = 0) => total + (record.finalAmountPreTax || 0),
		},

		// ------thuế------
		...getTaxColumns(allTax, 'taxes'),

		// ----------------ST sau thuế-----------------
		{
			title: <span className="break-words">ST sau thuế</span>,
			align: 'right',
			// fixed: 'right',
			dataIndex: 'finalAmountAfterTax',
			render: (value) => DX.formatNumberCurrency(value, 'null'),
			width: 120,
			summary: (record, total = 0) => total + (record.finalAmountAfterTax || 0),
			hide: allTax.length === 0,
		},
	];

	return columnsType;
}

function getTotalRow(columns, data) {
	let lastRow = Array(columns.length).fill(0);
	if (!isEmpty(data))
		data.forEach((record) => {
			lastRow = lastRow.map((total, index) => columns[index].summary(record, total));
		});
	return lastRow;
}

function RenderSummary({ summaryBill = [] }) {
	return (
		<Table.Summary fixed>
			<SummaryRow>
				{summaryBill.map((el, index) => (
					<SummaryCell index={index} align="right" key={`${index + 1}`}>
						{typeof el === 'number' ? DX.formatNumberCurrency(el, 'null') : el}
					</SummaryCell>
				))}
			</SummaryRow>
		</Table.Summary>
	);
}

function BillingDetails({ dataCost = {}, isFirst = false }) {
	const dataOldBill = dataCost.oldBill;
	const dataAllBill = !isEmpty(dataCost?.allBill) && dataCost.allBill?.costIncurred;
	const columnAllBillIncurred = renderColumnType(dataAllBill, COST.ALL_BILL).filter((el) => !el.hide);

	return (
		<>
			<div className="border border-solid border-gray-100 rounded-xl p-4 mb-4">
				{!isEmpty(dataOldBill) && (
					<>
						<div className="text-primary font-bold mb-4">
							{isFirst ? 'Thông tin dịch vụ' : 'Chi tiết tính tiền'}{' '}
						</div>
						{!isEmpty(dataOldBill) &&
							dataOldBill.map(
								(item, index) =>
									!isEmpty(item) && (
										<div key={`${index + 1}`}>
											{!isFirst && (
												<div className="font-medium mb-4">
													Thông tin hóa đơn lần {item.times}
												</div>
											)}
											<Table
												scroll={{ x: 800 }}
												columns={renderColumnType(item.costIncurred).filter((el) => !el.hide)}
												dataSource={item.costIncurred}
												pagination={false}
												summary={() => (
													<RenderSummary
														summaryBill={getTotalRow(
															renderColumnType(item.costIncurred).filter(
																(el) => !el.hide,
															),
															item.costIncurred,
														)}
													/>
												)}
											/>
										</div>
									),
							)}
					</>
				)}
				<br />
				{!isFirst && (
					<>
						<div className="font-medium mb-4">Thông tin chi phí cả chu kỳ</div>
						<Table
							scroll={{ x: 800 }}
							columns={columnAllBillIncurred}
							dataSource={dataAllBill}
							pagination={false}
							summary={() => (
								<RenderSummary summaryBill={getTotalRow(columnAllBillIncurred, dataAllBill)} />
							)}
						/>
					</>
				)}
			</div>
		</>
	);
}

export default BillingDetails;
