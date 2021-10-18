import { FileAddOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Radio, Row, Space, Checkbox, Select } from 'antd';
import PricingStrategyForm from 'app/CommonPricing/CommonPricingForm/PricingStrategyForm';
import { useNavigation, useUser, useLng } from 'app/hooks';
import { AddonAdmin, DX, SubcriptionPlanDev } from 'app/models';
import { validateRequire, validateRequireApplyService, validateRequireInput, validateCode } from 'app/validator';
import { renderOptionsHighlight } from 'app/components/Atoms';
import { isEmpty, noop, trim } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import PricingStrategyOnce from './PricingStrategyOnce';
import ChooseServiceApply from './ChooseServiceApply';
import TaxRange from './TaxRange';

const { TextArea } = Input;
const OPTION_ADDON_TYPE = {
	ONCE: 'ONCE',
	PERIODIC: 'PERIODIC',
};
export default function RegisterAddonFormContent({
	data,
	disabled,
	isLoading,
	currencyDefault,
	selectTaxOption,
	loadingTax,
	selectCurrencyOption,
	selectUnitOption,
	loadingUnit,
	loadingCurrency,
	currencySelector,
	setCurrencySelector,
	onFinish,
	pricingPlanItem,
	onDeleteAddon,
	form,
	unitIdDefault,
	errorService,
	triggerPaymentCycle,
	setTriggerPaymentCycle,
	setPricingPlanItem,
	objectCheck,
	dataRange,
	setDataRange,
	triggerErrorTitle,
	onTriggerData,
	type,
}) {
	const onSelectCurrency = (option) => {
		if (!option) return;
		setCurrencySelector(option.label);
	};
	const { path } = useRouteMatch();
	const { user } = useUser();
	const [typeTime, setTypeTime] = useState();
	const regex = /^[a-zA-Z0-9#!@$%&_-]+$/;
	const [pricingPlanForm, setPricingPlanForm] = useState('');
	const [selectDefaultCycle, setSelectDefaultCycle] = useState([{ value: 0, label: `Cố định - 0 VND / Tháng` }]);
	const { setFieldsValue } = { ...form };
	const { tMessage, tButton, tField, tFilterField, tValidation } = useLng();
	const CAN_DELETE =
		(type === 'admin' && DX.canAccessFuture2('admin/delete-addon', user.permissions)) ||
		(type === 'dev' && DX.canAccessFuture2('dev/delete-addon-by-dev', user.permissions));
	const CAN_CHANGESTATUS =
		(data.portalType === 'ADMIN' && DX.canAccessFuture2('admin/change-status-addon-by-admin', user.permissions)) ||
		(data.portalType === 'DEV' && DX.canAccessFuture2('dev/change-status-addon-by-dev', user.permissions));
	const rootAdmin = !user.departmentId || !user.department?.provinceId;
	const DEV_ROLE = DX.dev.canAccessPortal(user);
	const disableStatusUpdate = () => {
		if (rootAdmin || DEV_ROLE) {
			return !CAN_CHANGESTATUS;
		}
		return !CAN_CHANGESTATUS || (CAN_CHANGESTATUS && data.adminType === 'TOTAL_ADMIN');
	};

	const convertHeaderPricing = (values, currency = currencySelector) => {
		const arrCycle = [];
		let duration = '';
		let unitName = '';
		let priceTier = 0;

		if (!isEmpty(values)) {
			values.forEach((item, index) => {
				const pricingName = SubcriptionPlanDev.formatPricingPlanToText[item.pricingPlan];
				duration = SubcriptionPlanDev.selectCycleType.find((el) => el.value === item.cycleType)?.label;
				unitName = item.unitName || selectUnitOption.find((el) => el.value === item.unitId)?.label;

				if (!isEmpty(item.unitLimitedList)) priceTier = item.unitLimitedList[0].price;

				const cycleItemDefault = `${pricingName} - ${
					item.pricingPlan === 'FLAT_RATE' || item.pricingPlan === 'UNIT'
						? item.price || 0
						: `Giá bắt đầu từ ${priceTier || 0}`
				} ${currency} ${item.pricingPlan !== 'FLAT_RATE' ? `/ ${item.unitId ? unitName : 'Đơn vị'}` : ''} / ${
					item.paymentCycle ? item.paymentCycle : ''
				} ${duration}`;

				if (pricingName) arrCycle.push({ value: index, label: cycleItemDefault });
			});
			setSelectDefaultCycle([...arrCycle]);
		}
		return arrCycle;
	};

	useEffect(() => {
		if (data.id) {
			onTriggerData(data.pricingStrategies);
			convertHeaderPricing(data.pricingStrategies, data.currencyName);
			form.setFieldsValue({
				cycleType: 'MONTHLY',
				multiPlanId: (data.addonPricingApplies || []).map((item) => ({
					id: item.multiPlanId,
					serviceId: item.id,
					pricingId: item.planId,
					type: item.type,
				})),
				currencyId: currencyDefault > 0 ? currencyDefault : '',
				trialType: 'DAILY',
				...data,
				type: data.type || AddonAdmin.TYPE_TIME.DAILY,
				serviceId: {
					id: data.serviceId,
					serviceName: data.serviceName,
				},
				pricingStrategies: (data.pricingStrategies || []).map((el) => {
					el.multiPlanId = el.multiPlanList;
					return el;
				}),
				unitLimitedList: data.unitLimitedList.length === 0 ? [{}] : data.unitLimitedList,
				hasTax: data.hasTax === 'YES',
				setupFeeHasTax: data.setupFeeHasTax === 'YES',
			});
			setCurrencySelector(data.currencyName);
		} else {
			form.setFieldsValue({
				cycleType: 'MONTHLY',
				pricingPlan: 'FLAT_RATE',
				currencyId: currencyDefault > 0 ? currencyDefault : '',
				price: '0',
				trialType: 'DAILY',
				unitLimitedList: [{}],
				taxList: [],
				freeType: 'DATE',
				bonusType: OPTION_ADDON_TYPE.ONCE,
				type: AddonAdmin.TYPE_TIME.DAILY,
				setupFeeTaxList: [],
			});
			setPricingPlanForm(SubcriptionPlanDev.selectPricingPlan[0].value);
		}
		if (unitIdDefault && !data.id)
			form.setFieldsValue({
				unitId: unitIdDefault,
			});
	}, [data.id, data.updateAt, currencyDefault, unitIdDefault]);

	const { goBack } = useNavigation();
	const [valueRad, setValueRad] = useState((data && data?.bonusType) || OPTION_ADDON_TYPE.ONCE);
	const [changeOption, setChangeOption] = useState(data?.id && data?.pricingBonusType === 'ALL');

	const onChangeValuesForm = (changeValues, values) => {
		if (changeValues.pricingStrategies || changeValues.currencyId) {
			const currency = changeValues.currencyId
				? selectCurrencyOption.find((item) => item.value === values.currencyId)?.label
				: currencySelector;
			convertHeaderPricing(values.pricingStrategies, currency);
		}
	};

	function RadioConfirm({ value, onChange, ...props }) {
		const handleChangeValue = (newValue) => {
			Modal.confirm({
				content: tMessage('selectServicePackageAfterChangeExtraService'),
				onOk: () => {
					onChange(newValue);
					setTypeTime(form.getFieldValue('type'));
				},
				okText: tButton('opt_confirm'),
			});
		};
		const handleChange = (newValue) => {
			onChange(newValue);
			setTypeTime(newValue.target.value === OPTION_ADDON_TYPE.PERIODIC ? form.getFieldValue('type') : null);
		};
		return (
			<Radio.Group
				value={value}
				onChange={valueRad === OPTION_ADDON_TYPE.ONCE && changeOption ? handleChangeValue : handleChange}
				{...props}
			/>
		);
	}

	return (
		<>
			<div className="max-w-6xl mx-auto">
				<Form
					data={data}
					form={form}
					labelCol={{ span: 6 }}
					// wrapperCol={{ span: 18 }} // k dc bật cái này lên
					className="pt-10 pb-20"
					layout="horizontal"
					onFinish={onFinish}
					autoComplete="off"
					onValuesChange={(valueChange, values) => onChangeValuesForm(valueChange, values)}
					scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
					initialValues={{
						allowReturn: 'YES',
						allowPriceChange: 'YES',
					}}
				>
					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 1: */}
					{/* Thông tin chung */}
					<Row>
						<Col span={6}>
							<p className="text-xl font-semibold mb-6 float-right pr-2">{tField('generalInfo')}</p>
						</Col>
					</Row>
					<Form.Item
						label={tField('service')}
						rules={[
							validateRequireApplyService(tValidation('opt_isRequiredItem', { field: 'serviceUseFor' })),
						]}
						required
						name="serviceId"
					>
						<ChooseServiceApply
							form={form}
							disabled={disabled}
							addonInFor={data}
							initItemPick={data.id ? [{ id: data.serviceId, serviceName: data.serviceName }] : []}
							errorService={errorService}
						/>
					</Form.Item>
					<Form.Item
						name="name"
						label={tField('extraServiceName')}
						rules={[validateRequireInput(tValidation('mustRequire'))]}
					>
						<Input placeholder={tField('extraServiceName')} maxLength={50} disabled={disabled} autoFocus />
					</Form.Item>
					<Form.Item
						name="code"
						normalize={trim}
						label={tField('extraServiceCode')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'extraServiceCode' })),
							validateCode(tValidation('opt_isNotValid', { field: 'addonCode' }), regex),
						]}
					>
						<Input placeholder={tField('extraServiceCode')} disabled={disabled} maxLength={10} />
					</Form.Item>
					<Form.Item
						name="description"
						label={tField('des')}
						rules={[validateRequireInput(tValidation('mustRequire'))]}
					>
						<TextArea
							placeholder={tField('extraServiceDes')}
							showCount
							maxLength={5000}
							rows={2}
							disabled={disabled}
						/>
					</Form.Item>

					{/* Form module 2: */}
					{/* Loại dịch vụ bổ sung */}
					<Row>
						<Col span={6}>
							<p className="text-xl font-semibold mb-6 mt-8 float-right pr-2">
								{tField('extraServiceType')}
							</p>
						</Col>
					</Row>
					<Form.Item
						name="bonusType"
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'extraServiceType' }))]}
						wrapperCol={{ offset: 6 }}
						className="w-full"
					>
						<RadioConfirm disabled={disabled} className="w-full">
							<Space direction="vertical">
								<Radio value={OPTION_ADDON_TYPE.ONCE}>{tFilterField('value', 'once')}</Radio>
								<Radio value={OPTION_ADDON_TYPE.PERIODIC}>{tFilterField('value', 'periodic')}</Radio>
							</Space>
						</RadioConfirm>
					</Form.Item>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 3: */}
					{/* Chiến lược định giá */}
					{form.getFieldValue('bonusType') === OPTION_ADDON_TYPE.ONCE ? (
						<>
							<Row>
								<Col span={6}>
									<p className="text-xl font-semibold mb-6 mt-8 float-right pr-2">
										{tField('pricingStrategy')}
									</p>
								</Col>
							</Row>
							<PricingStrategyOnce
								data={data}
								errorService={errorService}
								form={form}
								disabled={disabled}
								pricingPlanForm={pricingPlanForm}
								setPricingPlanForm={setPricingPlanForm}
								selectUnitOption={selectUnitOption}
								selectCurrencyOption={selectCurrencyOption}
								loadingUnit={loadingUnit}
								loadingCurrency={loadingCurrency}
								currencySelector={currencySelector}
								setCurrencySelector={setCurrencySelector}
							/>
						</>
					) : (
						<>
							<Row>
								<Col span={6}>
									<p className="text-xl font-semibold mb-6 mt-8 float-right pr-2">
										{tField('pricingStrategy')}
									</p>
								</Col>
							</Row>
							<Form.Item
								name="currencyId"
								className="m-0"
								label={tField('currency')}
								rules={[validateRequire(tValidation('opt_isRequired', { field: 'currency' }))]}
							>
								<Select
									disabled={disabled}
									onChange={(value, option) => onSelectCurrency(option)}
									loading={loadingCurrency}
								>
									{renderOptionsHighlight(selectCurrencyOption, objectCheck?.currencyId)}
								</Select>
							</Form.Item>
							<PricingStrategyForm
								data={data}
								form={form}
								disabled={disabled}
								selectUnitOption={selectUnitOption}
								loadingUnit={loadingUnit}
								currencySelector={currencySelector}
								selectDefaultCycle={selectDefaultCycle}
								triggerPaymentCycle={triggerPaymentCycle}
								setTriggerPaymentCycle={setTriggerPaymentCycle}
								triggerErrorTitle={triggerErrorTitle}
								dataRange={dataRange}
								setDataRange={setDataRange}
								onTriggerData={onTriggerData}
								setPricingPlanItem={setPricingPlanItem}
								pricingPlanItem={pricingPlanItem}
							/>
						</>
					)}

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 5: */}
					{/* Thông tin thuế */}
					<TaxRange
						disabled={disabled}
						data={data}
						selectTaxOption={selectTaxOption}
						loadingTax={loadingTax}
						form={form}
					/>
					{/* --------------------------------------------------------------------------------------- */}
					{/* Thông tin thuế */}
					<TaxRange
						disabled={disabled}
						data={data}
						selectTaxOption={selectTaxOption}
						loadingTax={loadingTax}
						currencySelector={currencySelector}
						form={form}
						setupFeeInfo
						valueSetupFee={data.setupFee || 0}
						setupFeeTaxList={data.setupFeeTaxList}
					/>
					{/* --------------------------------------------------------------------------------------- */}
					{/* Thông tin thiết lập */}
					<Row>
						<Col span={6}>
							<p className="text-xl font-semibold mb-6 mt-8 float-right pr-2">{tField('settingInfo')}</p>
						</Col>
					</Row>
					<Form.Item label={tField('allowPriceChange')} required name="allowPriceChange">
						<Radio.Group disabled={disabled}>
							<Radio value="YES">{tFilterField('value', 'yes')}</Radio>
							<Radio value="NO">{tFilterField('value', 'no')}</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label={tField('allowQuantityChange')} name="allowChangeQuantity">
						<Checkbox.Group>
							<Checkbox disabled={disabled} value={1}>
								{tField('allowIncrease')}
							</Checkbox>
							<Checkbox disabled={disabled} value={2}>
								{tField('allowDecrease')}
							</Checkbox>
						</Checkbox.Group>
					</Form.Item>
					<Form.Item label={tField('allowRefund')} required name="allowReturn">
						<Radio.Group>
							<Radio disabled={disabled} value="YES">
								{tFilterField('value', 'yes')}
							</Radio>
							<Radio disabled={disabled} value="NO">
								{tFilterField('value', 'no')}
							</Radio>
						</Radio.Group>
					</Form.Item>
					{/* --------------------------------------------------------------------------------------- */}
					{/* Các button */}
					{/* trong form */}
					<Row>
						<Col offset={6} span={6}>
							{path.indexOf('detail') !== -1 &&
								data?.createdBy === user.id &&
								CAN_DELETE &&
								data.portalType === 'ADMIN' && (
									<Button type="dashed" danger onClick={onDeleteAddon}>
										{tButton('delete')}
									</Button>
								)}
						</Col>

						<Col className="flex justify-end" span={12}>
							<Button onClick={goBack}>{tButton('opt_cancel')}</Button>
							{path.indexOf('detail') === -1 && (
								<Button
									className="ml-5"
									type="primary"
									htmlType="submit"
									icon={
										path.indexOf('create') !== -1 ? (
											<FileAddOutlined width="w-4" />
										) : (
											<SaveOutlined width="w-4" />
										)
									}
									loading={isLoading}
								>
									{path.indexOf('create') !== -1
										? tButton('opt_create', { field: 'extraService' })
										: tButton('opt_save')}
								</Button>
							)}
						</Col>
					</Row>
				</Form>
			</div>
		</>
	);
}

RegisterAddonFormContent.propTypes = {
	data: PropTypes.objectOf(),
	disabled: PropTypes.bool,
	onFinish: PropTypes.func,
};

RegisterAddonFormContent.defaultProps = {
	data: {},
	disabled: false,
	onFinish: noop,
};
