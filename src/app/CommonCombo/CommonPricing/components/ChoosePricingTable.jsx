import React, { useEffect } from 'react';
import {
	validateRequireCheckbox,
	formatNormalizeNumberOtherZero,
	formatNormalizeNumber,
	formatNormalizeCurrency,
	validateNumberLength,
	formatNormalizeFloatNumber,
	validateMaxInputNumber,
} from 'app/validator';
import { TableEditableCells } from 'app/components/Atoms';
import { Col, Form, Input, Row, Select } from 'antd';
import { ComboPricing } from 'app/models';
import { useLng } from 'app/hooks';
import { trim } from 'opLodash';
import { useDispatch, useSelector } from 'react-redux';
import { comboPricingActions, comboPricingSelects } from 'app/redux/comboPricingReducer';
import TotalPrice from './subComponents/TotalPrice';
import PriceAfterDiscount from './subComponents/PriceAfterDiscount';

export default function ChoosePricingTable({ disabled, form, nameForm, onChangeDiscount }) {
	const dispatch = useDispatch();
	const pricingPick = form.getFieldValue(nameForm);
	const selectShowPricing = useSelector(comboPricingSelects.selectShowPricing);
	useSelector(comboPricingSelects.selectReload);

	useEffect(() => {
		if (!selectShowPricing) {
			form.setFieldsValue({ discountType: ComboPricing.selectDiscountType[0].value, discountValue: null });
		}
	}, [selectShowPricing]);

	const { tMessage, tButton, tField, tValidation } = useLng();
	const onChangeDiscountType = () => {
		form.setFieldsValue({ discountValue: null });
	};

	const onChangeAmount = (value, formName, index) => {
		value = trim(value.toString()).replaceAll(/\D/g, '');
		if (!value) value = '0';

		const formValues = form.getFieldsValue(['periodValue', 'periodType', 'discountType', 'discountValue']);
		dispatch(
			comboPricingActions.calculateOneSubPrice({
				index,
				formName,
				changeValue: parseInt(value, 10),
				periodValue: formValues.periodValue,
				periodType: formValues.periodType,
				discountType: formValues.discountType,
				discountValue: formValues.discountValue,
			}),
		);
	};

	const columnsTable = [
		{
			title: 'Mã dịch vụ',
			dataIndex: 'serviceCode',
			ellipsis: true,
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceName',
			ellipsis: true,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			title: 'SL miễn phí',
			dataIndex: 'freeQuantity',
			name: 'freeQuantity',
			normalize: (value) => formatNormalizeNumber(value),
			child: {
				maxLength: 10,
			},
			width: 105,
			editable: true,
		},
		{
			title: 'Số lượng',
			dataIndex: 'quantity',
			name: 'quantity',
			rules: [validateRequireCheckbox(' ')],
			normalize: (value) => formatNormalizeNumberOtherZero(value, 'normal'),
			child: {
				maxLength: 10,
				addonAfter: 'unitName',
				placeholder: 'Nhập số lượng',
			},
			width: 211,
			editable: true,
		},
		{
			title: 'Giá (VND)',
			dataIndex: 'price',
			width: 150,
			component: true,
		},
		{
			title: '',
			dataIndex: 'id',
			width: 45,
			canDeleted: true,
			hide: disabled,
		},
	];
	return (
		<>
			{selectShowPricing && (
				<>
					<div className="w-full" style={{ border: '1px solid #D9D9D9' }}>
						<TableEditableCells
							columns={columnsTable.filter((column) => !column.hide)}
							dataSource={pricingPick}
							nameForm={nameForm}
							isFetching={false}
							disabled={disabled}
							onChangeAmount={onChangeAmount}
							scroll={{ x: 1880, y: 70 * 5 }}
						/>
						<div className="pt-4" style={{ borderTop: '1px solid #D9D9D9' }}>
							<Row gutter={[16, 16]} justify="end">
								<Col span={16} className="text-right">
									<p>Tổng tiền</p>
								</Col>
								<Col xs={8} sm={8} md={8} lg={7} xl={7} xxl={6} className="text-right">
									<TotalPrice />
								</Col>
							</Row>
							<Row gutter={[16, 16]} justify="end">
								<Col span={10}>
									<p className="text-right pt-2">Giảm theo % hoặc số tiền</p>
								</Col>
								<Col xl={4} xxl={3}>
									<Form.Item name="discountType" className="w-full">
										<Select
											name="discountType"
											disabled={disabled}
											options={ComboPricing.selectDiscountType}
											onChange={onChangeDiscountType}
											onSelect={(value) => onChangeDiscount(value, 'discountType')}
										/>
									</Form.Item>
								</Col>
								<Col xs={8} sm={8} md={8} lg={7} xl={7} xxl={6}>
									<div className="pr-3">
										<Form.Item
											shouldUpdate={(pre, cur) => pre.discountType !== cur.discountType}
											className="m-0"
										>
											{() => {
												if (
													form.getFieldValue('discountType') ===
													ComboPricing.selectDiscountType[1].value
												) {
													return (
														<Form.Item
															name="discountValue"
															normalize={(value, prevValue) =>
																formatNormalizeFloatNumber(value, prevValue)
															}
															rules={[
																validateMaxInputNumber(
																	100,
																	'Phần % giảm phải nhỏ hơn 100%',
																	'not_equal',
																),
															]}
															className="w-full"
														>
															<Input
																onChange={(e) =>
																	onChangeDiscount(e.target.value, 'discountValue')
																}
																className="text-right"
																maxLength={5}
																disabled={disabled}
																addonAfter={
																	<span>
																		<div style={{ width: '29px' }}>%</div>
																	</span>
																}
															/>
														</Form.Item>
													);
												}
												return (
													<Form.Item
														name="discountValue"
														normalize={(value) => formatNormalizeCurrency(value, 'null', 0)}
														rules={[validateNumberLength(13, 'Độ dài vượt quá 10 ký tự')]}
														labelCol={{ span: 10 }}
														className="w-full"
													>
														<Input
															onChange={(e) =>
																onChangeDiscount(e.target.value, 'discountValue')
															}
															className="text-right"
															maxLength={13}
															disabled={disabled}
															addonAfter={<span>VND</span>}
														/>
													</Form.Item>
												);
											}}
										</Form.Item>
									</div>
								</Col>
							</Row>
							<Row gutter={[16, 16]} justify="end">
								<Col span={16}>
									<p className="text-right pt-2">Giá gói Combo sau giảm</p>
								</Col>
								<Col xs={8} sm={8} md={8} lg={7} xl={7} xxl={6}>
									<div className="pr-3">
										<PriceAfterDiscount form={form} disabled={disabled} />
									</div>
								</Col>
							</Row>
						</div>
					</div>
				</>
			)}
		</>
	);
}
