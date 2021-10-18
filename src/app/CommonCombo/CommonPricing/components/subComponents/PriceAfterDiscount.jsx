/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import { DX } from 'app/models';
import { formatNormalizeCurrency, validateNumberLength } from 'app/validator';
import { comboPricingActions, comboPricingSelects } from 'app/redux/comboPricingReducer';
import { useDispatch, useSelector } from 'react-redux';

export default function PriceAfterDiscount({ form, disabled }) {
	const dispatch = useDispatch();
	const [rules, setRules] = useState([]);
	const selectPriceAfterDiscount = useSelector(comboPricingSelects.selectPriceAfterDiscount);
	const selectChangeValueAmount = useSelector(comboPricingSelects.selectChangeValueAmount);

	useEffect(() => {
		if (selectPriceAfterDiscount === 0) {
			form.setFieldsValue({ amount: 0 });
		} else if (selectPriceAfterDiscount) {
			const price = DX.formatNumberCurrency(selectPriceAfterDiscount);
			form.setFieldsValue({ amount: price });
		}
	}, [selectPriceAfterDiscount]);

	useEffect(() => {
		if (selectChangeValueAmount) {
			setRules([validateNumberLength(12, 'Vui lòng không nhập quá 12 ký tự.')]);
		} else {
			setRules([]);
		}
	}, [selectChangeValueAmount]);

	return (
		<>
			<Form.Item
				name="amount"
				normalize={(value) => formatNormalizeCurrency(value, 'null', 0)}
				rules={rules}
				labelCol={{ span: 16 }}
				className="w-full"
			>
				<Input
					onChange={() => dispatch(comboPricingActions.setChangeValueAmount())}
					className="text-right"
					maxLength={15}
					disabled={disabled}
					addonAfter={<span>VND</span>}
				/>
			</Form.Item>
		</>
	);
}
