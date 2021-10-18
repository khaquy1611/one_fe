import { DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, message, Row, Select, Tooltip } from 'antd';
import { useLng } from 'app/hooks';
import {
	formatNormalizeFloatNumber,
	validateMaxInputNumber,
	validateRequireCheckbox,
	formatNormalizeCurrency,
	validateNumberLength,
} from 'app/validator';
import { isEmpty } from 'opLodash';
import React, { useState } from 'react';

const { Item } = Form;

export default function CommonTaxRange({
	disabled,
	selectTaxOption = [],
	loadingTax,
	form,
	objectCheck,
	currencySelector,
	setupFeeInfo,
	setupFeeTaxList,
	valueSetupFee,
}) {
	const { tMessage, tButton, tField, tValidation } = useLng();
	const [disableBtnTax, setDisableBtnTax] = useState(isEmpty(setupFeeTaxList) && valueSetupFee === 0);
	const [initSetupFee, setInitSetupFee] = useState(valueSetupFee);

	const onChangeRange = (fields) => {
		if (selectTaxOption?.length <= fields?.length && !setupFeeInfo) {
			message.warning(tMessage('err_max_tax_option'));
			return false;
		}
		return true;
	};

	const onChangeSetupFee = (value) => {
		const temp = value.replaceAll('.', '');
		setInitSetupFee(parseInt(temp, 10));
		if (parseInt(temp, 10) > 0 && form.getFieldValue('setupFeeTaxList')?.length === 0) setDisableBtnTax(false);
		else setDisableBtnTax(true);

		if (!value) form.setFieldsValue({ setupFeeTaxList: [] });
	};

	return (
		<div className="relative mt-10">
			<Row>
				<Col span={6} className="font-semibold text-right pr-2 mt-2.5">
					<p
						className={
							(objectCheck?.taxList && !setupFeeInfo) || (objectCheck?.setupFeeTaxLists && setupFeeInfo)
								? 'bg-yellow-400 text-xl'
								: 'text-xl'
						}
					>
						{!setupFeeInfo ? 'Thông tin thuế dịch vụ bổ sung' : 'Thông tin phí thiết lập'}
					</p>
				</Col>
				<Col span={10}>
					<Item
						shouldUpdate={(prevValues, curValues) =>
							prevValues.taxList?.length !== curValues.taxList?.length ||
							prevValues.setupFeeTaxList?.length !== curValues.setupFeeTaxList?.length
						}
					>
						{() => {
							const taxList = form.getFieldValue('taxList') || [];
							const setupFeeTaxLists = form.getFieldValue('setupFeeTaxList') || [];
							if (taxList.length === 0) {
								form.setFieldsValue({ hasTax: false });
							}
							if (setupFeeTaxLists.length === 0) {
								form.setFieldsValue({ setupFeeHasTax: false });
							}
							return (
								((!!taxList.length && !setupFeeInfo) ||
									(!!setupFeeTaxLists.length && setupFeeInfo)) && (
									<Item
										name={!setupFeeInfo ? 'hasTax' : 'setupFeeHasTax'}
										className="m-0"
										valuePropName="checked"
									>
										<Checkbox disabled={disabled}>{tField('taxIncluded')}</Checkbox>
									</Item>
								)
							);
						}}
					</Item>
				</Col>
			</Row>

			{setupFeeInfo && (
				<Item
					name="setupFee"
					label={tField('capitalExpenditure')}
					normalize={(value) => formatNormalizeCurrency(value, 'null', 0)}
					rules={[validateNumberLength(13, tValidation('opt_enterMaxLength', { maxLength: '13' }))]}
				>
					<Input
						placeholder={tField('opt_enter', { field: 'capitalExpenditure' })}
						maxLength={13}
						addonAfter={currencySelector}
						disabled={disabled}
						onChange={(e) => onChangeSetupFee(e.target.value)}
					/>
				</Item>
			)}

			<Form.List name={!setupFeeInfo ? 'taxList' : 'setupFeeTaxList'}>
				{(fields, { add, remove }) => (
					<>
						{!disabled && (
							<Button
								className="absolute right-0 top-0"
								type="default"
								icon={<PlusOutlined width="w-4" />}
								onClick={() => {
									if (onChangeRange(fields)) add();
								}}
								disabled={disableBtnTax || (!isEmpty(fields) && initSetupFee > 0)}
							>
								{tButton('opt_add', { field: 'tax' })}
							</Button>
						)}

						{fields.map(
							({ key, name, fieldKey, ...restField }) =>
								((setupFeeInfo && initSetupFee > 0) || !setupFeeInfo) && (
									<Row gutter={['auto', 16]}>
										<Col span={12}>
											<Item
												{...restField}
												name={[name, 'taxId']}
												fieldKey={[fieldKey, 'taxId']}
												labelCol={{ span: 12 }}
												rules={[validateRequireCheckbox(tValidation('mustRequire'))]}
												label={tField('taxImposed')}
											>
												<Select
													name="taxId"
													disabled={disabled}
													options={selectTaxOption}
													loading={loadingTax}
												/>
											</Item>
										</Col>
										<Col span={11}>
											<Item
												{...restField}
												name={[name, 'percent']}
												fieldKey={[fieldKey, 'percent']}
												label={tField('taxRate')}
												normalize={(value, prevValue) =>
													formatNormalizeFloatNumber(value, prevValue)
												}
												rules={[
													validateRequireCheckbox(tValidation('mustRequire')),
													validateMaxInputNumber(999, tValidation('taxRateLessThan1000')),
												]}
											>
												<Input maxLength={6} addonAfter="%" disabled={disabled} />
											</Item>
										</Col>
										<Col span={1}>
											{!disabled && (
												<Button
													type="default"
													icon={<DeleteOutlined />}
													className="float-right"
													disabled={disabled}
													onClick={() => {
														remove(name);
														if (initSetupFee > 0) setDisableBtnTax(false);
													}}
												/>
											)}
										</Col>
									</Row>
								),
						)}
					</>
				)}
			</Form.List>
		</div>
	);
}
