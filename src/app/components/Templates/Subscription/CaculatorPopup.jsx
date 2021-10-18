import { Modal, Table } from 'antd';
import { CheckIconAdmin } from 'app/icons';
import { DX, SMESubscription, SubscriptionDev } from 'app/models';
import { convertToNumber } from 'app/validator';
import { isEmpty, toLower } from 'opLodash';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import InputAmountSubscription from './InputAmountSubscription';

const TYPE_CACULATOR = {
	TIER: ' lũy kế',
	STAIR_STEP: ' bậc thang',
	VOLUME: ' khối lượng',
};
function checkPricePro(value) {
	if (value > 0) {
		const dataPrice = DX.formatNumberCurrency(value);
		const arr = dataPrice?.replace(/\|/g, ',').replaceAll('.', '');
		return Number.parseInt(arr, 10);
	}
	return value;
}
const addTotal = (dataInit) => {
	const total = (type) =>
		dataInit
			?.map((item) => item[type])
			?.reduce((accumulator, currentValue) => checkPricePro(accumulator) + (checkPricePro(currentValue) || 0));
	return [
		...dataInit,
		{
			quantity: total('quantity'),
			unitFrom: 'Tổng',
			unitPrice: null,
			unitTo: '',
			key: 'total',
			amountBeforeTax: total('amountBeforeTax'),
			amount: total('amount'),
		},
	];
};

const priceValue = (value) => {
	const listItem = [];
	value?.map((item) => {
		if (!isEmpty(item.quantity) || item.quantity > 0) {
			listItem.push(convertToNumber(item.unitPrice || item.price));
		}
		return '';
	});
	return Math.max(...listItem);
};

function CaculatorPopup({
	showCalculation,
	setCalculation,
	popupInfo,
	typeModal,
	setPriceValue,
	setDataCalculator,
	checkDisplayPrice,
	dataPopupByType,
	setDataCalTier,
	setCheckChangeInput,
}) {
	const isChecked = (record) => (!isEmpty(record.quantity) || record.quantity > 0) && !record.key;
	// const [unitFrom, setUniForm] = useState();
	// const [price, setPrice] = useState();
	const [subcriptionInfo, setSubcriptionInfo] = useState([]);

	// const { data: dataPopupByType } = useQuery(
	// 	['getListPopupByType', unitFrom, price],
	// 	async () => {
	// 		const res = await SubscriptionDev.getListPopupByType(
	// 			SMESubscription.formatPricingPlan[popupInfo.pricingPlan],
	// 			{
	// 				planId: popupInfo.pricingId || popupInfo.id,
	// 				quantity: popupInfo.quantity || 1,
	// 				typeSub: typeModal,
	// 			},
	// 			{
	// 				unitFrom,
	// 				price,
	// 			},
	// 		);
	// 		const dataUpdate = res.filter((column) => column.amountBeforeTax !== 0);
	// 		setDataCalculator(
	// 			dataUpdate.map((item) => ({
	// 				unitFrom: item.unitFrom,
	// 				unitTo: item.unitTo,
	// 				price: item.unitPrice,
	// 			})),
	// 			priceValue(res),
	// 		);
	// 		return addTotal(res);
	// 	},
	// 	{
	// 		initialData: [],
	// 		enabled: !isEmpty(popupInfo) && ['VOLUME', 'TIER', 'STAIR_STEP'].some((el) => el === popupInfo.pricingPlan),
	// 		keepPreviousData: true,
	// 	},
	// );
	function checkPricingPlan() {
		if (dataPopupByType.length > 0) return addTotal(dataPopupByType?.filter((column) => !column.key));
		return dataPopupByType;
	}

	const handleChangeAmount = (value, index, record) => {
		dataPopupByType[index].unitPrice = value;
		setCheckChangeInput && setCheckChangeInput(true);
		if (popupInfo.pricingPlan !== 'TIER') {
			setSubcriptionInfo([...dataPopupByType]);
		} else {
			setDataCalTier([
				...dataPopupByType
					.filter((column) => !column.key)
					.map((item) => ({
						unitFrom: item.unitFrom,
						unitTo: item.unitTo,
						price: item.unitPrice,
					})),
			]);
		}
	};

	const { data: dataCalculate, isFetching } = useQuery(
		['getDataCalculate', subcriptionInfo, popupInfo.pricingId || popupInfo.id, toLower(typeModal)],
		async () => {
			try {
				const body = [...dataPopupByType.filter((column) => !column.key)];
				const res = await SubscriptionDev.getDataCalculate(
					SMESubscription.formatPricingPlan[popupInfo.pricingPlan],
					toLower(typeModal),
					{
						planId: popupInfo.pricingId || popupInfo.id,
						body,
					},
				);
				//	const dataUpdate = res.filter((column) => column.amountBeforeTax !== 0);
				setDataCalculator(
					res.map((item) => ({
						unitFrom: item.unitFrom,
						unitTo: item.unitTo,
						price: item.unitPrice,
						amountBeforeTax: item.amountBeforeTax,
					})),
				);
				setPriceValue(priceValue(res));
				Object.assign(dataPopupByType, res);

				return addTotal(res);
			} catch (error) {
				return error;
			}
		},
		{
			enabled:
				subcriptionInfo.length > 0 &&
				!isEmpty(subcriptionInfo) &&
				['VOLUME', 'STAIR_STEP'].some((el) => el === popupInfo.pricingPlan),
			keepPreviousData: true,
			initialData: dataPopupByType,
		},
	);

	const ConvertZeroAndChar = (type, record, notFormatCurrency) => {
		if (!isEmpty(record[type]) || record[type] > 0) {
			return notFormatCurrency ? record[type] : DX.formatNumberCurrency(record[type]);
		}
		// if (popupInfo.pricingPlan === 'VOLUME') {
		// 	return 0;
		// }
		return '--';
	};

	const columns = [
		{
			render: (value, record) =>
				isChecked(record) && (
					<div className="flex justify-center items-center">
						<CheckIconAdmin width="w-4" className="text-green-400" />
					</div>
				),
			key: 'checkIcon',
			width: 50,
		},
		{
			title: 'Đơn vị',
			render: (value, record) => (
				<div className={`${record.key ? 'font-semibold' : ''}`}>{`${record.unitFrom}${
					record.key ? record.unitTo : `-${record.unitTo || ' trở lên'}`
				}`}</div>
			),
			key: 'valueRange',
		},
		{
			title: 'Số lượng',
			render: (value, record) => (
				<div className={`${record.key ? 'font-semibold' : ''}`}>
					{ConvertZeroAndChar('quantity', record, true)}
				</div>
			),
		},
		{
			// title: `Đơn giá(${popupInfo.currencyType})`,
			title: 'Đơn giá(VND)',
			align: 'right',
			render: (value, record, index) =>
				value !== null && (
					<div className="text-right">
						{(popupInfo.hasChangePrice === 'YES' || typeModal !== 'PRICING') && checkDisplayPrice ? (
							<InputAmountSubscription
								defaultValue={value}
								handleChangeAmount={(amountValue) => handleChangeAmount(amountValue, index, record)}
								skipError="YES"
								id={index}
								formatCurrency="YES"
							/>
						) : (
							<>{DX.formatNumberCurrency(value)}</>
						)}
					</div>
				),
			dataIndex: 'unitPrice',
		},
		{
			//	title: `Chi phí(${popupInfo.currencyType})`,
			title: 'Chi phí(VND)',
			align: 'right',
			key: 'amountBeforeTax',
			dataIndex: 'amountBeforeTax',
			render: (value, record) => (
				//	<div className={`${record.key ? 'font-semibold' : ''}`}>{DX.formatNumberCurrency(value)}</div>
				<div className={`${record.key ? 'font-semibold' : ''} float-right`}>
					{ConvertZeroAndChar(popupInfo.pricingPlan === 'TIER' ? 'amount' : 'amountBeforeTax', record)}
				</div>
			),
			width: 250,
		},
	];
	return (
		<>
			<Modal
				visible={showCalculation}
				onCancel={() => setCalculation(false)}
				title={`Chi tiết${TYPE_CACULATOR[popupInfo.pricingPlan]}`}
				centered
				width={1000}
				okText="Đóng"
				onOk={() => setCalculation(false)}
				cancelButtonProps={{ hidden: true }}
				maskClosable={false}
			>
				<div>
					<Table
						columns={columns}
						dataSource={isEmpty(subcriptionInfo) ? checkPricingPlan() : dataCalculate || []}
						scroll={{ x: 900 }}
						pagination={{ position: ['none'] }}
						rowClassName={(record) => (isChecked(record) ? 'bg-blue-250' : '')}
						rowKey={(record) => record.unitFrom}
					/>
					<div className="text-right mt-2 text-gray-400">Đơn giá không bao gồm thuế</div>
				</div>
			</Modal>
		</>
	);
}

export default CaculatorPopup;
