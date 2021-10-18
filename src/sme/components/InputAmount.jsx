import { Input } from 'antd';
import { debounce, isNil } from 'opLodash';
import { useLng } from 'app/hooks';
import React, { useCallback, useEffect, useState } from 'react';

function InputAmount({ handleChangeAmount, haveAddonAfter, defaultValue = 1, forwardRef, preValue, ...props }) {
	const { tOthers } = useLng();
	const [amount, setAmount] = useState(defaultValue);
	const debounceAmount = useCallback(debounce(handleChangeAmount, 400), []);
	const onChangeAmount = (value) => {
		const valueFormat = value.replaceAll(/\D/g, '').trim();
		if (parseInt(valueFormat, 10) !== amount) {
			setAmount(valueFormat ? parseInt(valueFormat, 10) : null);
			debounceAmount(valueFormat ? parseInt(valueFormat, 10) : null);
		}
	};
	useEffect(() => {
		if (!isNil(defaultValue) && defaultValue !== amount) setAmount(defaultValue);
	}, [defaultValue]);
	return (
		<div className="relative">
			<Input
				maxLength={10}
				value={amount}
				onChange={({ target: { value } }) => onChangeAmount(value)}
				ref={forwardRef}
				addonAfter={haveAddonAfter || ''}
				onBlur={() => !amount && onChangeAmount(`${preValue}`)}
				{...props}
			/>
			<div className="absolute text-sm text-red-500 ">{!amount && <div>{tOthers('moreThanZero')}</div>}</div>
		</div>
	);
}

export default InputAmount;
