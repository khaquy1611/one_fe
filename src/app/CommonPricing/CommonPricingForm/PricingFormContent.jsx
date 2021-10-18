import { ExclamationCircleOutlined, FileAddOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Radio, Row, Select, Space, Tag, Tooltip, message } from 'antd';
import { renderOptionsHighlight } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { DX, SaasAdmin, SubcriptionPlanDev } from 'app/models';
import {
	formatNormalizeNumberOtherZero,
	validateCustomPattern,
	validateMaxLengthStr,
	validateNumberLength,
	validateRequire,
	validateRequireInput,
} from 'app/validator';
import { isEmpty, noop, pick, uniqBy } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import ChooseAddon from './ChooseAddon';
import CommonTaxRange from './CommonTaxRange';
import PricingStrategyForm from './PricingStrategyForm';

const { TextArea } = Input;
const { Item } = Form;

export default function PricingFormContent({
	data,
	disabled,
	selectDurationType,
	selectFeatureOption,
	selectTaxOption,
	selectCurrencyOption,
	selectUnitOption,
	onFinish,
	form,
	currencyDefault,
	loadingFeature,
	loadingTax,
	loadingCurrency,
	loadingUnit,
	loading,
	portal,
	objectCheck = {},
}) {
	const { tButton, tValidation, tField, tMenu, tFilterField } = useLng();
	const { user } = useUser();
	const { pathname } = useLocation();
	const history = useHistory();
	const { id } = useParams();
	const { setFieldsValue, getFieldValue } = { ...form };

	const [isDirty, setDirty] = useState();
	const [currencySelector, setCurrencySelector] = useState(data.currencyName || (currencyDefault > 0 ? 'VND' : ''));
	const [pricingPlanItem, setPricingPlanItem] = useState({ 0: 'FLAT_RATE' });
	const [selectDefaultCycle, setSelectDefaultCycle] = useState([
		{ value: 0, label: `Cố định - 0 ${currencySelector} / Tháng` },
	]);
	const [dataRange, setDataRange] = useState({ 0: [] });
	const [triggerPaymentCycle, setTriggerPaymentCycle] = useState({ 0: '' });
	const [triggerErrorTitle, setTriggerErrorTitle] = useState([]);

	const convertHeaderPricing = (values, currency = currencySelector) => {
		const arrCycle = [];
		let duration = '';
		let unitName = '';
		let priceTier = 0;

		if (!isEmpty(values)) {
			values.forEach((item, index) => {
				const pricingName = SubcriptionPlanDev.formatPricingPlanToText[item.pricingPlan];
				duration = SubcriptionPlanDev.selectCycleType.find((el) => el.value === item.cycleType)?.label;
				unitName = selectUnitOption.find((el) => el.value === item.unitId)?.label;

				if (!isEmpty(item.unitLimitedList)) priceTier = item.unitLimitedList[0].price;

				const cycleItemDefault = `${pricingName} - ${
					item.pricingPlan === 'FLAT_RATE' || item.pricingPlan === 'UNIT'
						? item.price || 0
						: `Giá bắt đầu từ ${priceTier || 0}`
				} ${currency} ${item.pricingPlan !== 'FLAT_RATE' ? `/ ${item.unitId ? unitName : 'Đơn vị'}` : ''} / ${
					item.paymentCycle ? item.paymentCycle : ''
				} ${duration}`;

				if (pricingName)
					arrCycle.push({
						value: index,
						label: cycleItemDefault,
						show:
							(item.pricingPlan === 'FLAT_RATE' ||
								item.pricingPlan === 'UNIT' ||
								(item.pricingPlan !== 'FLAT_RATE' && item.pricingPlan !== 'UNIT' && item.unitId)) &&
							item.paymentCycle,
					});
			});
			setSelectDefaultCycle([...arrCycle]);
		}

		if (isEmpty(values)) {
			setSelectDefaultCycle([]);
			setFieldsValue({ defaultCircle: '', addonList: [] });
		}

		return arrCycle;
	};

	const onTriggerData = (arr = []) => {
		if (!isEmpty(arr)) {
			const allRange = {};
			const allPayment = {};
			const allPricingPlan = {};

			arr.forEach((el, index) => {
				const arrItem = [];
				if (el.pricingPlan) allPricingPlan[index] = el.pricingPlan;
				if (el.pricingPlan !== 'FLAT_RATE' && el.pricingPlan !== 'UNIT') {
					el.unitLimitedList?.forEach((e) => {
						if (e.unitTo > 0) arrItem.push(e.unitTo);
					});
				}
				if (!isEmpty(arrItem)) {
					allRange[index] = [...arrItem];
				}
				if (el.paymentCycle) allPayment[index] = el.paymentCycle;
			});

			setDataRange({ ...allRange });
			setTriggerPaymentCycle({ ...allPayment });
			setPricingPlanItem({ ...allPricingPlan });
		}
	};

	const triggerAddon = (values = [], changeValues) => {
		const addonOnce = [];
		let isExistAddon = false;
		values.pricingStrategies?.forEach((el, index) => {
			if (changeValues.addonList) {
				const addonPeriodic = [];
				el.addonList?.forEach((item) => {
					if (item.bonusType !== 'ONCE') addonPeriodic.push(item);
				});

				if (el.paymentCycle) {
					if (!isEmpty(el.addonList))
						form.setFields([
							{
								name: ['pricingStrategies', index, 'addonList'],
								value: [...addonPeriodic, ...values.addonList],
							},
						]);

					if (isEmpty(el.addonList))
						form.setFields([
							{
								name: ['pricingStrategies', index, 'addonList'],
								value: [...values.addonList],
							},
						]);
				}
			}

			if (changeValues.pricingStrategies) {
				isExistAddon = true;
				el.addonList?.forEach((e) => {
					if (e.bonusType === 'ONCE') addonOnce.push(e);
				});
			}
		});

		if (isExistAddon && addonOnce.length > 0) setFieldsValue({ addonList: uniqBy(addonOnce, 'id') });
		if (isExistAddon && addonOnce.length === 0 && !isEmpty(values.addonList)) setFieldsValue({ addonList: [] });
	};

	const onChangeValuesForm = (changeValues, values) => {
		if (!isDirty) setDirty(true);
		if (changeValues.pricingStrategies || changeValues.currencyId) {
			const currency = changeValues.currencyId
				? selectCurrencyOption.find((item) => item.value === values.currencyId)?.label
				: currencySelector;
			convertHeaderPricing(values.pricingStrategies, currency);
		}

		triggerAddon(values, changeValues);
	};

	useEffect(() => {
		if (data.id) {
			onTriggerData(data.pricingStrategies);

			setFieldsValue({
				...data,
				updateSubscriptionDate: data.updateSubscriptionDate === null ? 'NOW' : data.updateSubscriptionDate,
				changePricingDate: data.changePricingDate === null ? 'NOW' : data.changePricingDate,
				setupFee: data.setupFee?.toLocaleString('vi-VN'),
			});

			setCurrencySelector(data.currencyName);
			convertHeaderPricing(data.pricingStrategies);
		} else {
			setCurrencySelector(currencyDefault > 0 ? 'VND' : '');
			setFieldsValue({
				currencyId: currencyDefault > 0 ? currencyDefault : '',
				pricingStrategies: [
					{
						addonList: [],
						unitLimitedList: [{}],
						trialType: 'DAILY',
						pricingPlan: 'FLAT_RATE',
						price: 0,
						cycleType: 'MONTHLY',
						freeType: 'DATE',
					},
				],
				addonList: [],
				setupFeeTaxList: [],
				pricingType: 'PREPAY',
				hasChangePrice: 'YES',
				hasRefund: 'NO',
				cancelDate: 'END_OF_PERIOD',
				activeDateType: 'UNLIMITED',
				updateSubscriptionDate: 'NOW',
				changePricingDate: 'NOW',
			});
		}
	}, []);

	const durationType = (
		<Item name="durationType" noStyle>
			<Select placeholder={tField('monthly')} disabled={disabled} style={{ width: 100 }}>
				{renderOptionsHighlight(selectDurationType, objectCheck.durationType)}
			</Select>
		</Item>
	);

	const RenderTitle = () => {
		if (Object.keys(data).length === 0) {
			return <p className="text-xl font-semibold my-3">{tMenu('opt_create', { field: 'servicePackage' })}</p>;
		}
		return null;
	};

	const onChangeActiveDateType = () => {
		setFieldsValue({ activeDate: null, durationType: 'DAY' });
	};

	const onSelectCurrency = (option) => {
		if (!option) return;
		setCurrencySelector(option.label);
	};

	const onFinishFailed = ({ errorFields }) => {
		const keyArr = [];
		errorFields.forEach((el) => {
			if (el.name.length > 2 && el.name[0] === 'pricingStrategies') keyArr.push(el.name[1]);
		});
		const unique = [...new Set(keyArr)];
		setTriggerErrorTitle([...unique]);
	};

	return (
		<>
			<RenderTitle />
			<div className="max-w-7xl mx-auto">
				<Form
					form={form}
					labelCol={{ span: 6 }}
					className="pt-10 pb-20"
					layout="horizontal"
					onFinish={onFinish}
					autoComplete="off"
					scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
					onValuesChange={(changeValues, values) => onChangeValuesForm(changeValues, values)}
					onFinishFailed={onFinishFailed}
				>
					{/* ---------------------------------------------------------------- */}
					{/* Form module 1: */}
					{/* Thông tin chung */}
					<Row>
						<Col
							span={6}
							className={`text-xl font-semibold mb-6 text-right pr-2 ${
								!isEmpty(pick(objectCheck, ['pricingName', 'pricingCode', 'description']))
									? 'bg-yellow-400'
									: ''
							}`}
						>
							{tField('generalInfo')}
						</Col>
						<Col span={18} className="text-right">
							{data?.id && pathname.indexOf('/history') === -1 && (
								<Tag color={SaasAdmin.tagStatus[data.approveStatus].color} className="m-0">
									{tFilterField(
										'approvalStatusOptions',
										SaasAdmin.tagStatus[data.approveStatus].text,
									)}
								</Tag>
							)}
						</Col>
					</Row>
					<Item
						name="pricingName"
						label={tField('packageName')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'packageName' })),
							validateMaxLengthStr(30, tValidation('opt_enterMaxLength', { field: '30' })),
						]}
					>
						<Input
							placeholder={tField('packageName')}
							maxLength={30}
							disabled={disabled}
							autoFocus
							suffix={
								objectCheck.pricingName && (
									<span>
										<Tooltip placement="topRight" title={objectCheck.pricingName}>
											<ExclamationCircleOutlined className="text-base text-yellow-500" />
										</Tooltip>
									</span>
								)
							}
						/>
					</Item>
					<Item
						name="pricingCode"
						label={tField('packageCode')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'packageCode' })),
							validateMaxLengthStr(30, tValidation('opt_enterMaxLength', { maxLength: '30' })),
							validateCustomPattern(/^[a-zA-Z0-9_]*$/, tValidation('customizeValidPackageCode')),
						]}
					>
						<Input
							className=""
							placeholder={tField('packageCode')}
							maxLength={30}
							disabled={disabled || data.hasApproved === 'YES'}
						/>
					</Item>
					<div className="relative">
						<Item name="description" label={tField('packageDes')}>
							<TextArea
								placeholder={tField('packageDes')}
								showCount
								maxLength={500}
								rows={3}
								disabled={disabled}
							/>
						</Item>
						{objectCheck.description && (
							<span className="absolute right-3 top-2">
								<Tooltip placement="topRight" title={objectCheck.description}>
									<ExclamationCircleOutlined className="text-base text-yellow-500" />
								</Tooltip>
							</span>
						)}
					</div>
					{/* ---------------------------------------------------------------- */}
					{/* Form module 2: */}
					{/* Chiến lược định giá */}
					<Row className="mt-16 mb-8">
						<Col
							span={6}
							className={`text-xl font-semibold text-right pr-2 ${
								!isEmpty(
									pick(objectCheck, [
										'pricingStrategies',
										'defaultCircle',
										// 'pricingPlan',
										// 'unitId',
										// 'currencyId',
										// 'price',
										// 'unitLimitedList',
										// 'setupFee',
										// 'freeQuantity',
									]),
								)
									? 'bg-yellow-400'
									: ''
							}`}
						>
							{tField('pricingStrategy')}
						</Col>
					</Row>
					<Item
						name="currencyId"
						label={tField('currency')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'currency' }))]}
					>
						<Select
							disabled={disabled}
							onChange={(value, option) => onSelectCurrency(option)}
							loading={loadingCurrency}
							defaultValue={currencyDefault}
						>
							{renderOptionsHighlight(selectCurrencyOption, objectCheck.currencyId)}
						</Select>
					</Item>

					<PricingStrategyForm
						form={form}
						disabled={disabled}
						selectUnitOption={selectUnitOption}
						loadingUnit={loadingUnit}
						currencySelector={currencySelector}
						objectCheck={objectCheck.pricingStrategies}
						portal={portal}
						selectDefaultCycle={selectDefaultCycle}
						pricingPlanItem={pricingPlanItem}
						setPricingPlanItem={setPricingPlanItem}
						dataRange={dataRange}
						setDataRange={setDataRange}
						onTriggerData={onTriggerData}
						triggerPaymentCycle={triggerPaymentCycle}
						setTriggerPaymentCycle={setTriggerPaymentCycle}
						convertHeaderPricing={convertHeaderPricing}
						triggerErrorTitle={triggerErrorTitle}
					/>

					{/* ---------------------------------------------------------------- */}
					{/* Form module 5: */}
					{/* Dịch vụ bổ sung chung */}
					<Col span={18} offset={6}>
						<Item name="addonList" className="text-right">
							<ChooseAddon
								className="mt-10 mb-6"
								disabled={disabled}
								portal={portal}
								form={form}
								commonAddon
							/>
						</Item>
					</Col>
					<Item
						name="defaultCircle"
						label="Chọn chu kỳ mặc định"
						tooltip="Thông tin chu kỳ gói cước sẽ hiển thị trên màn hình Gói dịch vụ bên SME"
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'defaultCycle' }))]}
					>
						<Select disabled={disabled}>
							{renderOptionsHighlight(
								selectDefaultCycle.filter((el) => el.show),
								objectCheck.defaultCircle,
							)}
						</Select>
					</Item>
					{/* ---------------------------------------------------------------- */}
					{/* Form module 3: */}
					{/* Thông tin thuế */}
					<CommonTaxRange
						disabled={disabled}
						selectTaxOption={selectTaxOption}
						loadingTax={loadingTax}
						portal={portal}
						objectCheck={objectCheck}
						form={form}
					/>
					{/* ---------------------------------------------------------------- */}
					{/* Form module 4: */}
					{/* Thông tin phí thiết lập */}
					<CommonTaxRange
						disabled={disabled}
						selectTaxOption={selectTaxOption}
						loadingTax={loadingTax}
						portal={portal}
						objectCheck={objectCheck}
						form={form}
						currencySelector={currencySelector}
						setupFeeInfo
						valueSetupFee={data.setupFee || 0}
						setupFeeTaxList={data.setupFeeTaxList}
					/>
					{/* ---------------------------------------------------------------- */}
					{/* Form module 6: */}
					{/* Danh sách tính năng */}
					<Row>
						<Col
							span={6}
							className={`text-xl font-semibold mb-6 mt-8 text-right pr-2 ${
								objectCheck.featureList ? 'bg-yellow-400' : ''
							}`}
						>
							{tField('featureList')}
						</Col>
					</Row>
					<Item
						name="featureList"
						label={tField('featureList')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'featureList' }))]}
					>
						<Select
							mode="multiple"
							allowClear
							disabled={disabled}
							options={selectFeatureOption}
							loading={loadingFeature}
							className="focus:pointer-events-none focus:outline-none"
							onInputKeyDown={(e) => {
								const regex = /^[a-zA-Z0-9.\s!@#$%&()'*,:;"<>+/\\=?^_`{|}[\]~-]*$/;
								if (
									(regex.test(e.key) && e.key.length === 1) ||
									e.key === 'đ' ||
									e.key.toLowerCase() === 'ư' ||
									e.key.toLowerCase() === 'ơ'
								) {
									e.preventDefault();
									e.stopPropagation();
								}
							}}
						/>
					</Item>
					{/* ---------------------------------------------------------------- */}
					{/* Form module 7: */}
					{/* Thông tin thiết lập */}
					<Row>
						<Col
							span={6}
							className={`text-xl font-semibold text-right pr-2 mb-6 mt-10  ${
								!isEmpty(
									pick(objectCheck, [
										'pricingType',
										'hasChangePrice',
										'hasChangeQuantity',
										'hasRefund',
										'cancelDate',
										'activeDateType',
										'activeDate',
										'durationType',
										'updateSubscriptionDate',
										'changePricingDate',
									]),
								)
									? 'bg-yellow-400'
									: ''
							}`}
						>
							{tField('settingInfo')}
						</Col>
					</Row>
					<Item
						name="pricingType"
						label={tField('paymentTime')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'paymentTime' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="PREPAY">{tFilterField('value', 'prepay')}</Radio>
							<Radio value="POSTPAID">{tFilterField('value', 'postpaid')}</Radio>
						</Radio.Group>
					</Item>
					<Item
						name="hasChangePrice"
						label={tField('allowPriceChange')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'allowPriceChange' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="YES">{tFilterField('value', 'yes')}</Radio>
							<Radio value="NO">{tFilterField('value', 'no')}</Radio>
						</Radio.Group>
					</Item>
					<Item name="hasChangeQuantity" label={tField('allowQuantityChange')}>
						<Checkbox.Group disabled={disabled}>
							<Checkbox value="INCREASE">{tField('allowIncrease')}</Checkbox>
							<Checkbox value="DECREASE">{tField('allowDecrease')}</Checkbox>
						</Checkbox.Group>
					</Item>
					<Item
						name="hasRefund"
						label={tField('allowRefund')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'allowRefund' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="YES">{tFilterField('value', 'yes')}</Radio>
							<Radio value="NO">{tFilterField('value', 'no')}</Radio>
						</Radio.Group>
					</Item>
					<Item
						name="cancelDate"
						label={tField('cancelDate')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'cancelDate' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="END_OF_PERIOD">{tFilterField('value', 'endPeriod')}</Radio>
							<Radio value="NOW">{tFilterField('value', 'now')}</Radio>
						</Radio.Group>
					</Item>
					<Item name="activeDateType" label={tField('timeIsActivedAfterCancel')} required>
						<Radio.Group disabled={disabled} onChange={onChangeActiveDateType}>
							<Space direction="vertical" className="mt-2">
								<Radio value="UNLIMITED">{tFilterField('value', 'forever')}</Radio>
								<Radio value="LIMITED" className="pt-2">
									{tFilterField('value', 'timeIsAllowed')}
								</Radio>
								<Item
									className="absolute top-9 left-44"
									shouldUpdate={(p, c) => c.activeDateType !== p.activeDateType}
								>
									{() =>
										getFieldValue('activeDateType') === 'LIMITED' && (
											<>
												<Item
													name="activeDate"
													normalize={(value) =>
														formatNormalizeNumberOtherZero(value, 'normal')
													}
													rules={[
														validateRequire(
															tValidation('opt_isRequired', {
																field: 'timeIsActivedAfterCancel',
															}),
														),
														validateNumberLength(
															3,
															tValidation('opt_enterMaxLength', {
																maxLength: '3',
															}),
														),
													]}
													className="w-96 mb-0"
												>
													<Input
														suffix={
															objectCheck.activeDate && (
																<span>
																	<Tooltip
																		placement="topRight"
																		title={objectCheck.activeDate}
																	>
																		<ExclamationCircleOutlined className="text-base text-yellow-500" />
																	</Tooltip>
																</span>
															)
														}
														maxLength={3}
														placeholder={tField('opt_enter', {
															field: 'time',
														})}
														disabled={disabled}
														addonAfter={durationType}
													/>
												</Item>
											</>
										)
									}
								</Item>
							</Space>
						</Radio.Group>
					</Item>

					<Item name="updateSubscriptionDate" label="Thời điểm áp dụng chỉnh sửa thuê bao" required>
						<Radio.Group disabled={disabled}>
							<Radio value="NOW">{tFilterField('value', 'now')}</Radio>
							<Radio value="END_OF_PERIOD">{tFilterField('value', 'endPeriod')}</Radio>
						</Radio.Group>
					</Item>
					<Item name="changePricingDate" label="Thời điểm áp dụng đổi gói" required>
						<Radio.Group disabled={disabled}>
							<Radio value="NOW">{tFilterField('value', 'now')}</Radio>
							<Radio value="END_OF_PERIOD">{tFilterField('value', 'endPeriod')}</Radio>
						</Radio.Group>
					</Item>
					{data.hasApproved === 'YES' && (
						<>
							<Row>
								<Col span={6} className="text-xl font-semibold mb-6 mt-8 text-right pr-2">
									{tField('updateReason')}
								</Col>
							</Row>
							<Item
								name="updateReason"
								label={tField('updateReason')}
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'updateReason' })),
									validateMaxLengthStr(200, tValidation('opt_enterMaxLength', { maxLength: '200' })),
								]}
							>
								<TextArea
									placeholder={tField('updateReason')}
									showCount
									maxLength={200}
									rows={2}
									disabled={disabled}
								/>
							</Item>
						</>
					)}
					{/* ---------------------------------------------------------------- */}
					{/* Các button */}
					<div className="text-right mt-12">
						<Button
							className="w-32"
							onClick={() => {
								if (data?.serviceId && data?.pricingIdDraft && pathname.indexOf('/history') > -1) {
									if (portal === 'admin') {
										history.push(
											DX.admin.createPath(
												`/saas/list/${data.serviceId}/${data.pricingIdDraft}?tab=3`,
											),
										);
										return;
									}
									history.push(
										DX.dev.createPath(
											`/service/list/${data.serviceId}/${data.pricingIdDraft}?tab=3`,
										),
									);
									return;
								}
								if (portal === 'admin') {
									history.push(DX.admin.createPath(`/saas/list/${id}?tab=3`));
									return;
								}
								history.push(DX.dev.createPath(`/service/list/${id}?tab=3`));
							}}
							disabled={loading}
						>
							{tButton('opt_cancel')}
						</Button>
						{!disabled && (
							<Button
								className="ml-4 w-32"
								type="primary"
								htmlType="submit"
								icon={data.id ? <SaveOutlined width="w-4" /> : <FileAddOutlined width="w-4" />}
								disabled={
									!isDirty ||
									(!!data.id && !DX.canAccessFuture2('dev/update-service-pack', user.permissions)) ||
									(!data.id && !DX.canAccessFuture2('dev/create-service-pack', user.permissions))
								}
								loading={loading}
							>
								{data.id ? 'Lưu' : tButton('opt_create', { field: 'package' })}
							</Button>
						)}
					</div>
				</Form>
			</div>
		</>
	);
}

PricingFormContent.propTypes = {
	data: PropTypes.objectOf(PropTypes.object),
	disabled: PropTypes.bool,
	selectTaxOption: PropTypes.arrayOf(PropTypes.object).isRequired,
	// selectCycleType: PropTypes.arrayOf(PropTypes.object).isRequired,
	onFinish: PropTypes.func,
};

PricingFormContent.defaultProps = {
	data: {},
	disabled: false,
	onFinish: noop,
};
