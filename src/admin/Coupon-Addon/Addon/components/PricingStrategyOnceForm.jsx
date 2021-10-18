import React from 'react';
import { Form, Input, Row, Col, Select, Tooltip, Button } from 'antd';
import { useLng } from 'app/hooks';
import { DX, SubcriptionPlanDev } from 'app/models';
import { validateRequire, formatNormalizeCurrency, formatNormalizeNumber, validateNumberLength } from 'app/validator';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { renderOptionsHighlight } from 'app/components/Atoms';
import PlanRangeOnce from './PlanRangeOnce';
import ChoosePricingApply from './ChoosePricingApply';

export default function PricingStrategyForm({
	form,
	data,
	disabled,
	pricingPlanForm,
	totalPayment,
	onSelectPricingPlan,
	onChangePayment,
	onChangeInputRange,
	selectPricingPlan,
	selectUnitOption,
	selectCurrencyOption,
	loadingCurrency,
	loadingUnit,
	dataRange,
	setDataRange,
	currencySelector,
	setCurrencySelector,
	objectCheck = {},
}) {
	const { tValidation, tField, tOthers, tLowerField } = useLng();

	function onSelectCurrency(option) {
		if (!option) return;
		setCurrencySelector(option.label);
	}

	return (
		<>
			<Form.Item
				name="currencyId"
				label={tField('currency')}
				// validateStatus={`${objectCheck?.currencyId ? 'warning' : ''}`}
				rules={[validateRequire(tValidation('opt_isRequired', { field: 'currency' }))]}
			>
				<Select
					disabled={disabled}
					onSelect={(value, option) => onSelectCurrency(option)}
					loading={loadingCurrency}
				>
					{renderOptionsHighlight(selectCurrencyOption, objectCheck.currencyId)}
				</Select>
			</Form.Item>

			<Form.Item
				name="pricingPlan"
				label={tField('valuationPlan')}
				// validateStatus={`${objectCheck?.pricingPlan ? 'warning' : ''}`}
				tooltip={
					<>
						<span style={{ fontSize: '12px' }}>{tOthers('valuationPlanDetail')} </span>{' '}
						<a
							href="/dev-portal/service-pack/register"
							target="blank"
							style={{ fontSize: '11px', color: '#2493fb', textDecoration: 'underline' }}
						>
							{tOthers('moreInfo')}
						</a>
					</>
				}
				rules={[validateRequire(tValidation('opt_isRequired', { field: 'valuationPlan' }))]}
			>
				<Select disabled={disabled} onSelect={(value, option) => onSelectPricingPlan(option)}>
					{renderOptionsHighlight(selectPricingPlan, objectCheck.pricingPlan)}
				</Select>
			</Form.Item>
			{pricingPlanForm !== SubcriptionPlanDev.selectPricingPlan[0].value && (
				<Form.Item
					name="unitId"
					label={tField('unit')}
					// validateStatus={`${objectCheck?.unitId ? 'warning' : ''}`}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'unit' }))]}
				>
					<Select
						// className={objectCheck?.unitId ? 'form-highlight' : ''}
						disabled={disabled}
						loading={loadingUnit}
					>
						{renderOptionsHighlight(selectUnitOption, objectCheck.unitId)}
					</Select>
				</Form.Item>
			)}

			{/* Giá */}
			{(pricingPlanForm === SubcriptionPlanDev.selectPricingPlan[0].value ||
				pricingPlanForm === SubcriptionPlanDev.selectPricingPlan[1].value) && (
				<Form.Item
					name="price"
					label={
						pricingPlanForm === SubcriptionPlanDev.selectPricingPlan[0].value
							? tField('price')
							: tField('unitPrice')
					}
					// validateStatus={`${objectCheck?.price ? 'warning' : ''}`}
					normalize={(value) => formatNormalizeCurrency(value)}
					rules={[
						validateRequire(
							tValidation('opt_isRequired', {
								field:
									pricingPlanForm === SubcriptionPlanDev.selectPricingPlan[0].value
										? 'price'
										: 'unitPrice',
							}),
						),
						validateNumberLength(10, tValidation('opt_enterMaxLength', { maxLength: '10' })),
					]}
				>
					<Input
						suffix={
							objectCheck.price && (
								<span>
									<Tooltip placement="topRight" title={objectCheck.price}>
										<ExclamationCircleOutlined className="text-base text-yellow-500" />
									</Tooltip>
								</span>
							)
						}
						// className={objectCheck?.price ? 'form-highlight' : ''}
						placeholder={tField('opt_enter', { field: 'price' })}
						maxLength={13}
						addonAfter={currencySelector}
						disabled={disabled}
					/>
				</Form.Item>
			)}

			{pricingPlanForm !== SubcriptionPlanDev.selectPricingPlan[0].value &&
				pricingPlanForm !== SubcriptionPlanDev.selectPricingPlan[1].value && (
					<PlanRangeOnce
						form={form}
						disabled={disabled}
						dataRange={dataRange}
						setDataRange={setDataRange}
						prefixSelector={currencySelector}
						onChangeInputRange={onChangeInputRange}
						objectCheck={objectCheck}
					/>
				)}

			{pricingPlanForm !== SubcriptionPlanDev.selectPricingPlan[0].value &&
				pricingPlanForm !== SubcriptionPlanDev.selectPricingPlan[1].value && (
					<Row gutter={[16, 16]}>
						<Col span={18} offset={6}>
							<div className="bg-blue-50 p-4">
								<p className="font-semibold mb-2">{tOthers('estimatePaymentAmount')}</p>
								<div className="flex items-center text-base">
									<span>{tOthers('ifCustomerBuy')}</span>
									<Form.Item
										name="estimatePayment"
										normalize={formatNormalizeNumber}
										className="w-32 mx-4 mb-0"
									>
										<Input maxLength={10} onChange={onChangePayment} />
									</Form.Item>
									<span>
										{tLowerField('totalPaymentAmount')}{' '}
										<b>{DX.formatNumberCurrency(totalPayment)}</b> {currencySelector}
									</span>
								</div>
							</div>
						</Col>
					</Row>
				)}

			{pricingPlanForm === SubcriptionPlanDev.selectPricingPlan[1].value && (
				<Form.Item
					name="freeQuantity"
					label={tField('freeQuantity')}
					// validateStatus={`${objectCheck?.freeQuantity ? 'warning' : ''}`}
					normalize={formatNormalizeNumber}
				>
					<Input
						suffix={
							objectCheck.freeQuantity && (
								<span>
									<Tooltip placement="topRight" title={objectCheck.freeQuantity}>
										<ExclamationCircleOutlined className="text-base text-yellow-500" />
									</Tooltip>
								</span>
							)
						}
						// className={objectCheck?.freeQuantity ? 'form-highlight' : ''}
						placeholder={tField('freeQuantity')}
						maxLength={10}
						disabled={disabled}
					/>
				</Form.Item>
			)}
			<Row justify="end" align="middle" className="mt-10 mb-6">
				<Form.Item name="multiPlanId">
					<ChoosePricingApply disabled={disabled} addonInFor={data} form={form} />
				</Form.Item>
			</Row>
		</>
	);
}
