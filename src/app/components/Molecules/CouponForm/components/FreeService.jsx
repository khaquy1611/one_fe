import { Form, Input, Radio, Select, Space } from 'antd';
import { formatNormalizeNumberOtherZero, validateRequireSelectItems } from 'app/validator';
import React from 'react';
import { useLng } from 'app/hooks';
import ChooseService from './ChooseService';

const { Item } = Form;

const selectPeriod = [
	{ value: 'DAY', label: 'day' },
	{ value: 'WEEK', label: 'week' },
	{ value: 'MONTH', label: 'month' },
	{ value: 'YEAR', label: 'year' },
];

const typeTime = {
	UNLIMITED: 'UNLIMITED',
	LIMITED: 'LIMITED',
};

export default function FreeService({ form, onlyView, couponInfo, checkStatus, reFresh, typeCoupon }) {
	const { UNLIMITED, LIMITED } = typeTime;
	const { setFieldsValue, getFieldValue } = { ...form };
	const { tFilterField, tField, tMessage, tValidation } = useLng();

	const onChangeTimeType = () => {
		setFieldsValue({ limitedQuantity: '', type: 'MONTH' });
	};

	return (
		<>
			{/* Áp dụng chiết khấu */}
			{/* <Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('applyDiscount')}</span>}
			/> */}

			<Item
				name="enterpriseGroup"
				label={tField('enterprise')}
				labelCol={{ span: 6 }}
				validateTrigger="onSubmit"
				rules={[validateRequireSelectItems(tValidation('opt_isRequiredItem', { field: 'enterprise' }))]}
			>
				<ChooseService
					itemName="enterpriseGroup"
					form={form}
					onlyView={onlyView}
					checkStatus={checkStatus}
					typeModal="enterpriseType"
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
					itemName="pricingGroup"
					form={form}
					typeModal="pricingType"
					onlyView={onlyView}
					checkStatus={checkStatus}
					title={tField('opt_select', { field: 'serviceApplyTax' })}
					placeholder={tField('opt_search', { field: 'serviceName' })}
					couponInfo={couponInfo}
					reFresh={reFresh}
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
					itemName="addonGroup"
					typeModal="addonsType"
					form={form}
					onlyView={onlyView}
					checkStatus={checkStatus}
					title={tField('opt_select', { field: 'extraService' })}
					couponInfo={couponInfo}
					reFresh={reFresh}
					placeholder={tField('opt_search', { field: 'extraServiceCode_Name' })}
					typeCoupon={typeCoupon}
				/>
			</Item>
			<Item label={tField('useTime')} className="mb-0" required labelCol={{ span: 6 }}>
				<Item name="timesUsedType">
					<Radio.Group disabled={onlyView} onChange={onChangeTimeType}>
						<Space direction="vertical" className="mt-2">
							<Radio value={UNLIMITED}>{tFilterField('value', 'forever')}</Radio>
							<Radio value={LIMITED}>{tFilterField('value', 'limited')}</Radio>
						</Space>
					</Radio.Group>
				</Item>
				<Item className="absolute top-9 left-24" shouldUpdate={(p, c) => c.timesUsedType !== p.timesUsedType}>
					{() =>
						getFieldValue('timesUsedType') === LIMITED && (
							<>
								<Item
									name="limitedQuantity"
									normalize={(value) => formatNormalizeNumberOtherZero(value)}
									rules={[{ required: true, message: tMessage('plsEnterLimitAmount') }]}
									className="inline-block mr-2 mb-0 w-52"
								>
									<Input type="text" maxLength={12} disabled={onlyView} />
								</Item>
								<Item name="type" className="inline-block w-24 mb-0">
									<Select
										options={selectPeriod.map((e) => ({
											...e,
											label: tFilterField('timeOptions', e.label),
										}))}
										className="w-24"
										disabled={onlyView}
									/>
								</Item>
							</>
						)
					}
				</Item>
			</Item>
		</>
	);
}
