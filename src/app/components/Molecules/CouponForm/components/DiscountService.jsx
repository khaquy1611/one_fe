import { Form, Input, Radio, Select, Row, Col, Space } from 'antd';
import { useUser, useLng } from 'app/hooks';
import { DX } from 'app/models';
import {
	formatNormalizeCurrency,
	formatNormalizeNumberOtherZero,
	validateRequireInput,
	validateRequireSelectItems,
} from 'app/validator';
import { isEmpty as _isEmpty } from 'opLodash';
import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import ChooseService from './ChooseService';

const ONCE = 'ONCE';
const UNLIMITED = 'UNLIMITED';
const LIMITED = 'LIMITED';
const REGISTERFEE = 'REGISTERFEE';
const COMMISSION = 'COMMISSION';
// const SELECT_DISCOUNT = {
// 	PERCENT: 'PERCENT',
// 	PRICE: 'PRICE',
// };
const DEV = 'DEV';
const RADIO_TYPE = {
	NONE: 'NONE',
	ALL: 'ALL',
	OPTION: 'OPTION',
};

const { Item } = Form;

export default function DiscountService({ form, onlyView, couponInfo, checkStatus, reFresh, disableRad, typeCoupon }) {
	const { user } = useUser();
	const { setFieldsValue, getFieldValue, setFields } = { ...form };
	const { path } = useRouteMatch();
	// const [currencyLabel, setCurrencyLabel] = useState('%');
	const { tMessage, tField, tFilterField, tValidation, tOthers } = useLng();
	const ALL_ADMIN_ROLE = DX.admin.canAccessPortal(user);
	// const selectUseType = [
	// 	{ value: SELECT_DISCOUNT.PERCENT, label: '%' },
	// 	{ value: SELECT_DISCOUNT.PRICE, label: tFilterField('value', 'amountOfMoney') },
	// ];

	// const checkPrice = (_, value) => {
	// 	const discountType = getFieldValue('discountType');
	// 	const convertNumber = parseInt((value?.length > 3 && value.replaceAll('.', '')) || value, 10);

	// 	if (convertNumber > 100 && discountType === SELECT_DISCOUNT.PERCENT) {
	// 		return Promise.reject(new Error(tMessage('plsEnterTaxAmount1_100')));
	// 	}

	// 	if (_isEmpty(value)) {
	// 		return Promise.reject(new Error(tMessage('plsEnterTax')));
	// 	}

	// 	return Promise.resolve();
	// };

	const onChangeTimeType = () => {
		setFieldsValue({ limitedQuantity: '' });
	};

	// const onCurrencyChange = (newCurrency) => {
	// 	setFieldsValue({ discountValue: null, discountAmount: null });
	// 	setFields([
	// 		{
	// 			name: 'discountValue',
	// 			errors: [],
	// 		},
	// 	]);
	// 	if (newCurrency === SELECT_DISCOUNT.PERCENT) setCurrencyLabel('%');
	// 	else setCurrencyLabel('VND');
	// };

	// useEffect(() => {
	// 	if (couponInfo?.discountType === SELECT_DISCOUNT.PERCENT) setCurrencyLabel('%');
	// 	if (couponInfo?.discountType === SELECT_DISCOUNT.PRICE) setCurrencyLabel('VND');
	// }, [couponInfo?.discountType]);

	return (
		<>
			{/* <Item className="mb-0" label={tField('discountBy')} required labelCol={{ span: 6 }}>
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
			</Item> */}
			{/* Áp dụng chiết khấu */}
			{/* <Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('applyDiscount')}</span>}
			/> */}
			<Item name="totalBillType" label={tField('totalBill')} labelCol={{ span: 6 }}>
				<Radio.Group disabled={onlyView}>
					<Radio value="NO">{tFilterField('value', 's-NO')}</Radio>
					<Radio value="YES">{tFilterField('value', 's-YES')}</Radio>
				</Radio.Group>
			</Item>
			<Item
				name="enterpriseGroup"
				label={tField('enterprise')}
				labelCol={{ span: 6 }}
				validateTrigger="onSubmit"
				rules={[validateRequireSelectItems(tValidation('opt_isRequiredItem', { field: 'enterprise' }))]}
			>
				<ChooseService
					onlyView={onlyView}
					checkStatus={checkStatus}
					typeModal="enterpriseType"
					form={form}
					itemName="enterpriseGroup"
					title={tField('opt_select', { field: 'enterprise' })}
					placeholder={tField('opt_search', { field: 'enterpriseName' })}
					couponInfo={couponInfo}
					reFresh={reFresh}
				/>
			</Item>

			<Item
				name="pricingGroup"
				label={tField('product')}
				labelCol={{ span: 6 }}
				validateTrigger="onSubmit"
				rules={[validateRequireSelectItems(tValidation('opt_isRequiredItem', { field: 'servicePackage' }))]}
			>
				<ChooseService
					form={form}
					itemName="pricingGroup"
					onlyView={onlyView}
					checkStatus={checkStatus}
					typeModal="pricingType"
					title={tField('opt_select', { field: 'serviceApplyTax' })}
					placeholder={tField('opt_search', { field: 'serviceName' })}
					couponInfo={couponInfo}
					reFresh={reFresh}
					disableRad={disableRad}
					typeCoupon={typeCoupon}
				/>
			</Item>
			<Item
				name="addonGroup"
				label={tField('extraService')}
				labelCol={{ span: 6 }}
				validateTrigger="onSubmit"
				rules={[validateRequireSelectItems(tValidation('opt_isRequiredItem', { field: 'extraService' }))]}
			>
				<ChooseService
					form={form}
					itemName="addonGroup"
					onlyView={onlyView}
					checkStatus={checkStatus}
					title={tField('opt_select', { field: 'extraService' })}
					placeholder={tField('opt_search', { field: 'extraServiceCode_Name' })}
					typeModal="addonsType"
					couponInfo={couponInfo}
					reFresh={reFresh}
					disableRad={disableRad}
					typeCoupon={typeCoupon}
				/>
			</Item>

			{((ALL_ADMIN_ROLE && path.indexOf('create') !== -1) ||
				(ALL_ADMIN_ROLE && path.indexOf('create') === -1 && couponInfo.portalType !== DEV)) && (
				<Item
					name="supplierGroup"
					label={tField('serviceProvider')}
					labelCol={{ span: 6 }}
					validateTrigger="onSubmit"
					rules={[
						validateRequireSelectItems(tValidation('opt_isRequiredItem', { field: 'serviceProvider' })),
					]}
				>
					<ChooseService
						form={form}
						itemName="supplierGroup"
						onlyView={onlyView}
						checkStatus={checkStatus}
						title={tField('opt_select', { field: 'serviceProvider' })}
						placeholder={tField('opt_search', { field: 'serviceProvider' })}
						typeModal="supplierType"
						couponInfo={couponInfo}
						reFresh={reFresh}
					/>
				</Item>
			)}

			{ALL_ADMIN_ROLE && (
				<Form.Item noStyle shouldUpdate={(p, c) => p.supplierGroup.type !== c.supplierGroup.type}>
					{() =>
						(getFieldValue('supplierGroup').type === RADIO_TYPE.ALL ||
							getFieldValue('supplierGroup').type === RADIO_TYPE.OPTION) && (
							<Item
								name="discountSupplierType"
								label={tField('discountForProvider')}
								labelCol={{ span: 6 }}
							>
								<Radio.Group disabled={onlyView}>
									<Space direction="vertical" className="mt-2">
										<Radio value={REGISTERFEE}>
											{tFilterField('value', 'discountOnRegistrationFee')}
										</Radio>
										<Radio value={COMMISSION}>
											{tFilterField('value', 'discountOnCommission')}
										</Radio>
									</Space>
								</Radio.Group>
							</Item>
						)
					}
				</Form.Item>
			)}

			<Item label={tField('timeOfUse')} className="mb-0" required labelCol={{ span: 6 }}>
				<Item name="timesUsedType">
					<Radio.Group disabled={onlyView} onChange={onChangeTimeType}>
						<Space direction="vertical" className="mt-2">
							<Radio value={ONCE}>{tFilterField('value', 'once')}</Radio>
							<Radio value={UNLIMITED}>{tFilterField('value', 'forever')}</Radio>
							<Radio value={LIMITED}>{tFilterField('value', 'limited')}</Radio>
						</Space>
					</Radio.Group>
				</Item>
				<Item
					className="absolute left-24 mb-0"
					shouldUpdate={(p, c) => c.timesUsedType !== p.timesUsedType}
					style={{ top: '4.3rem' }}
				>
					{() =>
						getFieldValue('timesUsedType') === LIMITED && (
							<>
								<Item
									className="inline-block mx-4 w-52"
									name="limitedQuantity"
									normalize={(value) => formatNormalizeNumberOtherZero(value)}
									labelCol={{ span: 6 }}
									rules={[
										validateRequireInput(tValidation('opt_isRequired', { field: 'timeOfUse' })),
									]}
								>
									<Input type="text" maxLength={12} disabled={onlyView} />
								</Item>
								<span className="inline-block mt-2 tablet:mt-1">({tOthers('times')})</span>
							</>
						)
					}
				</Item>
			</Item>
		</>
	);
}
