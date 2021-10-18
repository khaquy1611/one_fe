import { Form, Input, Select, Row, Col } from 'antd';
import { useLng } from 'app/hooks';

import { formatNormalizeCurrency } from 'app/validator';
import { isEmpty as _isEmpty } from 'opLodash';
import React, { useState, useEffect } from 'react';

const SELECT_DISCOUNT = {
	PERCENT: 'PERCENT',
	PRICE: 'PRICE',
};

const { Item } = Form;

function PromotionType({ form, onlyView, couponInfo }) {
	const { setFieldsValue, getFieldValue, setFields } = { ...form };

	const [currencyLabel, setCurrencyLabel] = useState('%');
	const { tMessage, tField, tFilterField } = useLng();

	const selectUseType = [
		{ value: SELECT_DISCOUNT.PERCENT, label: '%' },
		{ value: SELECT_DISCOUNT.PRICE, label: tFilterField('value', 'amountOfMoney') },
	];

	const checkPrice = (_, value) => {
		const discountType = getFieldValue('discountType');
		const convertNumber = parseInt((value?.length > 3 && value.replaceAll('.', '')) || value, 10);

		if (convertNumber > 100 && discountType === SELECT_DISCOUNT.PERCENT) {
			return Promise.reject(new Error(tMessage('plsEnterTaxAmount1_100')));
		}

		if (_isEmpty(value)) {
			return Promise.reject(new Error(tMessage('plsEnterTax')));
		}

		return Promise.resolve();
	};

	const onCurrencyChange = (newCurrency) => {
		setFieldsValue({ discountValue: null, discountAmount: null });
		setFields([
			{
				name: 'discountValue',
				errors: [],
			},
		]);
		if (newCurrency === SELECT_DISCOUNT.PERCENT) setCurrencyLabel('%');
		else setCurrencyLabel('VND');
	};

	useEffect(() => {
		if (couponInfo?.discountType === SELECT_DISCOUNT.PERCENT) setCurrencyLabel('%');
		if (couponInfo?.discountType === SELECT_DISCOUNT.PRICE) setCurrencyLabel('VND');
	}, [couponInfo?.discountType]);

	return (
		<>
			<Item className="mb-0" label={tField('discountBy')} required labelCol={{ span: 6 }}>
				<Row gutter={[16, 16]}>
					<Col span={6}>
						<Item name="discountType">
							<Select
								disabled={onlyView}
								value={couponInfo?.discountType || SELECT_DISCOUNT.PERCENT}
								options={selectUseType}
								onChange={onCurrencyChange}
							/>
						</Item>
					</Col>
					<Col span={18}>
						<Item
							name="discountValue"
							normalize={(value) => formatNormalizeCurrency(value, 'null')}
							rules={[{ validator: checkPrice }]}
						>
							<Input
								disabled={onlyView}
								type="text"
								placeholder={tField('discountValue')}
								value={couponInfo?.discountValue}
								maxLength={12}
								addonAfter={<span>{currencyLabel}</span>}
							/>
						</Item>
					</Col>
				</Row>
			</Item>
			<Item noStyle shouldUpdate={(p, c) => p.discountType !== c.discountType}>
				{() =>
					getFieldValue('discountType') === SELECT_DISCOUNT.PERCENT && (
						<Item
							name="discountAmount"
							label={tField('maxPrice')}
							normalize={(value) => formatNormalizeCurrency(value, 'null')}
							labelCol={{ span: 6 }}
						>
							<Input
								placeholder={tField('maxPrice')}
								maxLength={12}
								addonAfter={<span>VND</span>}
								disabled={onlyView}
							/>
						</Item>
					)
				}
			</Item>
		</>
	);
}

export default PromotionType;
