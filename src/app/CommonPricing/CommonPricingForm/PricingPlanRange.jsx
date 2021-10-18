import React from 'react';
import { trim } from 'opLodash';
import { Form, Button, Input, Row, Col, Tooltip } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { formatNormalizeCurrency, formatNormalizeNumber, validateMinInputNumber } from 'app/validator';
import { useLng } from 'app/hooks';

export default function PricingPlanRange({
	form,
	disabled,
	dataRangeItem = [],
	dataRange,
	setDataRange,
	prefixSelector,
	onChangeInputRange,
	objectCheck = {},
	nameRange,
	fieldKeyRange,
}) {
	const { tValidation, tField, tLowerField } = useLng();
	const onChangeRange = (val, key) => {
		const arr = dataRangeItem;
		const value = val.replaceAll(/\D/g, '');
		if (!trim(value)) return false;

		if (value < arr[key - 1] + 1 || value === '0' || key + 1 > 100) return false;
		if (key < dataRangeItem.length) {
			arr[key] = parseInt(value, 10);
			setDataRange({ ...dataRange, [nameRange]: [...arr] });
			return false;
		}

		arr.push(parseInt(value, 10));
		setDataRange({ ...dataRange, [nameRange]: [...arr] });
		return true;
	};

	const removeRange = (key) => {
		if (key > 0) {
			const arr = [...dataRangeItem];
			arr.splice(key - 1);
			setDataRange({ ...dataRange, [nameRange]: [...arr] });
			const data = form.getFieldValue();
			data.pricingStrategies[nameRange].unitLimitedList[key - 1].unitTo = '';
			form.setFieldsValue({
				...data,
			});
		}
	};

	return (
		<Form.List name={[nameRange, 'unitLimitedList']} fieldKey={[fieldKeyRange, 'unitLimitedList']}>
			{(fields, { add, remove }) => (
				<>
					{fields.map(({ key, name, fieldKey, ...restField }) => (
						<Row key={key} gutter={[16, 16]}>
							<Col span={10} offset={6}>
								<Form.Item
									{...restField}
									name={[name, 'unitTo']}
									fieldKey={[fieldKey, 'unitTo']}
									label={
										key === 0
											? `${tField('from')} 1 ${tLowerField('to')}`
											: `${tField('from')} ${dataRangeItem[name - 1] + 1} ${tLowerField('to')}`
									}
									normalize={(value) => formatNormalizeNumber(value)}
									rules={[
										validateMinInputNumber(
											name === 0 ? 1 : dataRangeItem[name - 1] + 1,
											tValidation('UpperBoundValueNotLessThanLowerBound'),
										),
									]}
									labelCol={{ span: 10 }}
									className="w-full"
								>
									<Input
										suffix={
											objectCheck[name]?.unitTo && (
												<span>
													<Tooltip placement="topRight" title={objectCheck[name]?.unitTo}>
														<ExclamationCircleOutlined className="text-base text-yellow-500" />
													</Tooltip>
												</span>
											)
										}
										onBlur={(event) => {
											if (onChangeRange(event.target.value, name)) {
												add();
												setTimeout(() => {
													onChangeInputRange();
												}, 100);
											}
										}}
										disabled={disabled || name !== fields.length - 1 || fields.length === 100}
										maxLength={10}
										placeholder={tField('unlimited')}
									/>
								</Form.Item>
							</Col>
							<Col span={7}>
								<div className="pr-6">
									<Form.Item
										{...restField}
										name={[name, 'price']}
										fieldKey={[fieldKey, 'price']}
										label={tField('unitPrice')}
										normalize={(value) => formatNormalizeCurrency(value)}
										initialValue="0"
									>
										<Input
											suffix={
												objectCheck[name]?.price && (
													<span>
														<Tooltip placement="topRight" title={objectCheck[name].price}>
															<ExclamationCircleOutlined className="text-base text-yellow-500" />
														</Tooltip>
													</span>
												)
											}
											placeholder={tField('opt_enter', { field: 'price' })}
											maxLength={13}
											addonAfter={prefixSelector}
											disabled={disabled}
											onChange={() => onChangeInputRange()}
										/>
									</Form.Item>
								</div>
							</Col>
							<Col span={1}>
								{!disabled && name === dataRangeItem?.length && name !== 0 && (
									<Button
										onClick={() => {
											removeRange(name);
											remove(name);
											onChangeInputRange();
										}}
										type="default"
										icon={<DeleteOutlined />}
										className="float-right"
									/>
								)}
							</Col>
						</Row>
					))}
				</>
			)}
		</Form.List>
	);
}
