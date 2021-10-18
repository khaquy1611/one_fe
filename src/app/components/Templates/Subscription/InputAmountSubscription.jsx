import { Input } from 'antd';
import { DX } from 'app/models';

import { debounce, isNil } from 'opLodash';
import React, { useCallback, useEffect, useState } from 'react';

function InputAmountSubscription({
	handleChangeAmount,
	defaultValue = 1,
	skipError,
	typeMes,
	changeQuan = {},
	isQuantity,
	preValue,
	formatCurrency,
	canEdit = false,
	dataOrigin,
	setErrorQuanlity,
	...props
}) {
	const [amount, setAmount] = useState(defaultValue);
	const debounceAmount = useCallback(debounce(handleChangeAmount, 800), [handleChangeAmount]);
	const displayError =
		amount > 0 &&
		changeQuan.typeQuan === 'changeQuanlity' &&
		changeQuan.dataDetail &&
		changeQuan.status === 'ACTIVE' &&
		(((changeQuan.typeError === 'INCREASE' || changeQuan.typeError === ['INCREASE']) && amount < dataOrigin) ||
			((changeQuan.typeError === 'DECREASE' || changeQuan.typeError === ['DECREASE']) && amount > dataOrigin));
	function valueIsQuanlity() {
		if (isQuantity) {
			return '';
		}
		return 0;
	}
	useEffect(() => {
		if (displayError && setErrorQuanlity) {
			return setErrorQuanlity(true);
		}
		if (!displayError && setErrorQuanlity) {
			return setErrorQuanlity(false);
		}
		return 0;
	}, [amount, changeQuan]);
	const onChangeAmount = (value) => {
		const valueFormat = value.replaceAll(/\D/g, '').trim();
		setAmount(valueFormat ? parseInt(valueFormat, 10) : '');
		debounceAmount(valueFormat ? parseInt(valueFormat, 10) : valueIsQuanlity());
	};
	useEffect(() => {
		if (!isNil(defaultValue) && defaultValue !== amount) {
			setAmount(defaultValue);
		}
	}, [defaultValue]);
	return (
		<div className="relative">
			<Input
				maxLength={isQuantity ? 10 : 12}
				value={!isQuantity ? DX.formatNumberCurrency(amount) : amount}
				className="text-right"
				onChange={({ target: { value } }) => onChangeAmount(value)}
				onBlur={() => !amount && onChangeAmount(`${preValue}`)}
				{...props}
				disabled={canEdit}
			/>

			<div className="text-sm text-red-500 ">
				{!amount && !skipError && <div>Vui lòng không để trống mục này</div>}
				{amount === 0 && isQuantity && <div>Số lượng tối thiểu là 1</div>}
				{amount === '' && typeMes}
				{displayError &&
					`Vui lòng nhập số lượng  ${
						changeQuan.typeError === 'INCREASE' ? 'lớn' : 'nhỏ'
					} hơn hoặc bằng số lượng ban đầu`}
			</div>
		</div>
	);
}

export default InputAmountSubscription;
