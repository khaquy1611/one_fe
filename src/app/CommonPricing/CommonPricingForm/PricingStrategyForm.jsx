import { CaretRightOutlined, EllipsisOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ChoosePricingApplyPeriodic from 'admin/Coupon-Addon/Addon/components/ChoosePricingApplyPeriodic';
import { Button, Col, Collapse, Dropdown, Form, Input, Menu, Modal, Row, Select, Tooltip } from 'antd';
import { renderOptionsHighlight } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import { DX, SubcriptionPlanDev } from 'app/models';
import { servicePricingActions, servicePricingSelects } from 'app/redux/servicePricingReducer';
import {
	formatNormalizeCurrency,
	formatNormalizeNumber,
	formatNormalizeNumberOtherZero,
	validateNumberLength,
	validateRequire,
} from 'app/validator';
import { cloneDeep, trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ChooseAddon from './ChooseAddon';
import PricingPlanRange from './PricingPlanRange';

const { Item } = Form;
const { Panel } = Collapse;

export default function PricingStrategyForm({
	form,
	data,
	disabled,
	selectUnitOption,
	loadingUnit,
	currencySelector,
	objectCheck = {},
	portal,
	selectDefaultCycle,
	pricingPlanItem,
	setPricingPlanItem,
	dataRange,
	setDataRange,
	onTriggerData,
	triggerPaymentCycle,
	setTriggerPaymentCycle,
	convertHeaderPricing,
	triggerErrorTitle,
}) {
	const { tValidation, tField, tOthers, tLowerField } = useLng();
	const { pathname } = useLocation();
	const [totalPayment, setTotalPayment] = useState({ 0: 0 });
	const [estimateTotal, setEstimateTotal] = useState({ 0: 0 });

	const dispatch = useDispatch();
	const pricingInfo = useSelector(servicePricingSelects.selectPricingInfo);

	const { selectPricingPlan, selectCycleType } = SubcriptionPlanDev;
	const FLAT_RATE = SubcriptionPlanDev.selectPricingPlan[0].value;
	const UNIT = SubcriptionPlanDev.selectPricingPlan[1].value;

	useEffect(() => () => dispatch(servicePricingActions.reset()), []);

	const estimateTotalPayment = (value, type, key) => {
		value = parseInt(trim(value), 10);
		if (Number.isNaN(value) || value === 0) {
			setTotalPayment({ ...totalPayment, [key]: 0 });
			return;
		}
		const arrPricingRange = [...cloneDeep(form.getFieldValue(['pricingStrategies', key, 'unitLimitedList']))];
		let priceInx = 0;
		let check = true;
		let stop = false;
		let totalTier = 0;
		arrPricingRange.forEach((e, i) => {
			e.price = e.price === 0 ? 0 : parseInt(e.price.toString().replaceAll(/\D/g, ''), 10);
			if (i === 0) {
				if (value >= 1 && value <= e.unitTo) {
					priceInx = i;
					stop = true;
					totalTier += value * e.price;
				} else totalTier += (trim(e.unitTo) ? e.unitTo : value) * e.price;
			} else if (i !== arrPricingRange.length - 1) {
				if (arrPricingRange[i - 1].unitTo >= arrPricingRange[i].unitTo) check = false;
				if (value >= arrPricingRange[i - 1].unitTo + 1 && value <= arrPricingRange[i].unitTo) {
					totalTier += (value - arrPricingRange[i - 1].unitTo) * e.price;
					priceInx = i;
					stop = true;
				} else totalTier += stop ? 0 : (e.unitTo - arrPricingRange[i - 1].unitTo) * e.price;
			} else if (value >= arrPricingRange[i - 1].unitTo + 1) {
				totalTier += stop ? 0 : (value - arrPricingRange[i - 1].unitTo) * e.price;
				priceInx = i;
			}
		});
		if (!check) {
			setTotalPayment({ ...totalPayment, [key]: 0 });
			return;
		}
		// eslint-disable-next-line default-case
		switch (type) {
			case SubcriptionPlanDev.selectPricingPlan[2].value: // Lũy kế
				setTotalPayment({ ...totalPayment, [key]: totalTier });
				break;
			case SubcriptionPlanDev.selectPricingPlan[3].value: // Khối lượng
				setTotalPayment({ ...totalPayment, [key]: value * arrPricingRange[priceInx].price });
				break;
			case SubcriptionPlanDev.selectPricingPlan[4].value: // Bậc thang
				setTotalPayment({ ...totalPayment, [key]: value > 0 ? arrPricingRange[priceInx].price : 0 });
				break;
		}
	};

	const onSelectPricingPlan = (value, key) => {
		if (!value) return;
		setPricingPlanItem({ ...pricingPlanItem, [key]: value });
		const val = form.getFieldValue(['pricingStrategies', key, 'estimatePayment']);
		if (val) {
			estimateTotalPayment(val, value, key);
		}
	};

	const onChangePayment = (value, key) => {
		setEstimateTotal({ ...estimateTotal, [key]: value });
		estimateTotalPayment(value, pricingPlanItem[key], key);
	};

	const onChangeInputRange = (key) => {
		if (estimateTotal[key] > 0) estimateTotalPayment(estimateTotal[key], pricingPlanItem[key], key);
	};

	// --------------------------------event collapse---------------------------------
	const onAddPricing = (func, fields = []) => {
		const temp = {
			cycleType: 'MONTHLY',
			unitLimitedList: [{}],
			price: 0,
			pricingPlan: FLAT_RATE,
			trialType: 'DAILY',
			multiPlanId: [],
		};
		func(temp, fields.length);
		onTriggerData(form.getFieldValue('pricingStrategies'));
		dispatch(servicePricingActions.getCurrentCycleType({ [fields.length]: 'MONTHLY' }));
	};

	const onDuplicate = (func, key, lastIndex) => {
		const item = form.getFieldValue('pricingStrategies')[key];

		const dataDuplicate = {
			...item,
			paymentCycle: null,
		};
		func(dataDuplicate, lastIndex);

		onTriggerData(form.getFieldValue('pricingStrategies'));
		dispatch(servicePricingActions.getCurrentCycleType({ [lastIndex]: 'MONTHLY' }));
	};

	const onRemove = (func, key) => {
		// e.stopPropagation();
		Modal.confirm({
			title: 'Bạn chắc chắn muốn xóa?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				func(key);
				onTriggerData(form.getFieldValue('pricingStrategies'));
				dispatch(servicePricingActions.removeCurrentPayment(key));
			},
		});
	};

	const genExtra = (add, remove, key, lastIndex) => (
		<Dropdown
			overlay={
				<Menu className="w-32">
					<Menu.Item key="1" className="px-4 font-semibold" onClick={() => onDuplicate(add, key, lastIndex)}>
						Nhân bản
					</Menu.Item>
					{/* {form.getFieldValue('pricingStrategies').length > 1 && ( */}
					<Menu.Item key="2" className=" px-4 font-semibold" onClick={() => onRemove(remove, key)}>
						Xóa
					</Menu.Item>
					{/* )} */}
				</Menu>
			}
			trigger={['hover']}
			className="cursor-pointer"
			placement="bottomRight"
		>
			<EllipsisOutlined onClick={(event) => event.stopPropagation()} className="text-xl" />
		</Dropdown>
	);

	const validateDuplicate = (arr = [], period, cycle, key) => {
		let isDuplicate = false;
		for (let i = 0; i < arr.length; i++) {
			for (let j = i + 1; j < arr.length; j++) {
				if (arr[i][period] && arr[i][period] === arr[j][period] && arr[i][cycle] === arr[j][cycle]) {
					isDuplicate = true;
				}
			}
		}

		if (isDuplicate) {
			form.setFields([
				{
					name: ['pricingStrategies', key, 'cycleType'],
					errors: ['Chu kỳ thanh toán phải là duy nhất'],
				},
			]);
		} else
			form.setFields([
				{
					name: ['pricingStrategies', key, 'cycleType'],
					errors: [],
				},
			]);
	};

	const onBlurPayment = (value, key) => {
		const getValuePaymentCycle = form.getFieldValue(['pricingStrategies', key, 'addonList']);
		const getCycleTypeError = form.getFieldError(['pricingStrategies', key, 'cycleType']);
		const getPaymentCycleError = form.getFieldError(['pricingStrategies', key, 'paymentCycle']);

		if (parseInt(value, 10) !== pricingInfo.paymentCycle[key] && getValuePaymentCycle?.length === 0)
			dispatch(servicePricingActions.getCurrentPayment({ [key]: value }));

		if (
			getValuePaymentCycle?.length > 0 &&
			parseInt(value, 10) !== pricingInfo.paymentCycle[key] &&
			pricingInfo.paymentCycle[key] !== 0 &&
			getCycleTypeError.length === 0 &&
			getPaymentCycleError.length === 0
		)
			Modal.confirm({
				title:
					'Thay đổi Chu kỳ thanh toán thì danh sách dịch vụ bổ sung sẽ phải chọn lại. Bạn có chắc chắn muốn thay đổi?',
				icon: <ExclamationCircleOutlined />,
				okText: 'Xác nhận',
				cancelText: 'Hủy',
				onOk: () => {
					if (value) {
						dispatch(servicePricingActions.getCurrentPayment({ [key]: value }));
						form.setFields([
							{
								name: ['pricingStrategies', key, 'addonList'],
								value: [],
							},
						]);
					}
				},
				onCancel: () => {
					form.setFields([
						{
							name: ['pricingStrategies', key, 'paymentCycle'],
							value: pricingInfo.paymentCycle[key],
						},
					]);
					convertHeaderPricing(form.getFieldValue('pricingStrategies'));
				},
			});
	};

	// TODO
	const onChangeCycle = (value, key, typeChange) => {
		const getValuePaymentCycle = form.getFieldValue(['pricingStrategies', key, 'addonList']);

		validateDuplicate(form.getFieldValue('pricingStrategies'), 'paymentCycle', 'cycleType', key);
		setTriggerPaymentCycle({ ...triggerPaymentCycle, [key]: value });

		if (value && typeChange === 'CYCLE_TYPE') dispatch(servicePricingActions.getCurrentCycleType({ [key]: value }));

		// set addonList = []
		if (getValuePaymentCycle?.length > 0 && typeChange === 'CYCLE_TYPE')
			Modal.confirm({
				title:
					'Thay đổi Chu kỳ thanh toán thì danh sách dịch vụ bổ sung sẽ phải chọn lại. Bạn có chắc chắn muốn thay đổi?',
				icon: <ExclamationCircleOutlined />,
				okText: 'Xác nhận',
				cancelText: 'Hủy',
				onOk: () => {
					if (value) {
						dispatch(servicePricingActions.getCurrentCycleType({ [key]: value }));
						form.setFields([
							{
								name: ['pricingStrategies', key, 'addonList'],
								value: [],
							},
						]);
					}
				},
				onCancel: () => {
					form.setFields([
						{
							name: ['pricingStrategies', key, 'cycleType'],
							value: pricingInfo.cycleType[key],
						},
					]);
					convertHeaderPricing(form.getFieldValue('pricingStrategies'));
				},
			});
	};

	return (
		<div className="relative">
			<Form.List name="pricingStrategies">
				{(fields, { add, remove }) => (
					<>
						{!disabled && (
							<Button
								type="primary"
								className="absolute right-0"
								onClick={() => onAddPricing(add, fields)}
								icon={<PlusOutlined />}
								style={{ top: pathname.indexOf('addon') !== -1 ? '-6rem' : '-8rem' }}
							>
								Thêm định giá theo chu kỳ thanh toán
							</Button>
						)}

						<Collapse
							defaultActiveKey={['collapse-1']}
							expandIcon={({ isActive }) => (
								<CaretRightOutlined className="text-xl" rotate={isActive ? 90 : 0} />
							)}
							expandIconPosition="right"
							className="site-collapse-custom-collapse"
						>
							{fields.map(({ key, name, fieldKey, ...restField }) => (
								<>
									<Panel
										header={
											<Col className="inline-block" offset={6}>
												<span
													className="font-semibold text-base"
													style={{
														color: triggerErrorTitle.indexOf(name) !== -1 && '#ff4d4f',
													}}
												>
													{selectDefaultCycle[name]?.label}
												</span>
											</Col>
										}
										key={`collapse-${key + 1}`}
										extra={!disabled && genExtra(add, remove, name, fields.length)}
										className="site-collapse-custom-panel"
										forceRender
									>
										<Row>
											<Col span={12}>
												<Item
													{...restField}
													name={[name, 'pricingPlan']}
													fieldKey={[fieldKey, 'pricingPlan']}
													label={tField('valuationPlan')}
													rules={[
														validateRequire(
															tValidation('opt_isRequired', { field: 'valuationPlan' }),
														),
													]}
													labelCol={{ span: 12 }}
												>
													<Select
														disabled={disabled}
														onSelect={(value) => onSelectPricingPlan(value, name)}
													>
														{renderOptionsHighlight(
															selectPricingPlan,
															objectCheck[name]?.pricingPlan,
														)}
													</Select>
												</Item>
											</Col>
											{/* chu kỳ thanh toán */}
											<Col span={12}>
												<Item
													{...restField}
													name={[name, 'paymentCycle']}
													fieldKey={[fieldKey, 'paymentCycle']}
													normalize={(value) =>
														formatNormalizeNumberOtherZero(value, 'normal')
													}
													rules={[
														validateRequire(
															tValidation('opt_isRequired', { field: 'paymentCycle' }),
														),
														validateNumberLength(
															3,
															tValidation('opt_enterMaxLength', { maxLength: '3' }),
														),
													]}
													label={tField('paymentCycle')}
													required
													labelCol={{ span: 10 }}
												>
													<Input
														onBlur={(e) => onBlurPayment(e.target.value, name)}
														onChange={(e) => onChangeCycle(e.target.value, name)}
														suffix={
															objectCheck[name]?.paymentCycle && (
																<span>
																	<Tooltip
																		placement="topRight"
																		title={objectCheck[name]?.paymentCycle}
																	>
																		<ExclamationCircleOutlined className="text-yellow-500" />
																	</Tooltip>
																</span>
															)
														}
														maxLength={3}
														placeholder={tField('opt_enter', { field: 'paymentCycle' })}
														disabled={disabled}
														addonAfter={
															<Item
																{...restField}
																name={[name, 'cycleType']}
																fieldKey={[fieldKey, 'cycleType']}
																noStyle
															>
																<Select
																	disabled={disabled}
																	style={{ width: 100 }}
																	onChange={(value) =>
																		onChangeCycle(value, name, 'CYCLE_TYPE')
																	}
																>
																	{renderOptionsHighlight(
																		selectCycleType,
																		objectCheck[name]?.cycleType,
																	)}
																</Select>
															</Item>
														}
													/>
												</Item>
											</Col>
										</Row>
										{/* số chu kỳ */}
										{pathname.indexOf('addon') === -1 && (
											<Item
												{...restField}
												name={[name, 'numberOfCycles']}
												fieldKey={[fieldKey, 'numberOfCycles']}
												label={tField('numberOfCycles')}
												normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
												rules={[
													validateNumberLength(
														3,
														tValidation('opt_enterMaxLength', { maxLength: '3' }),
													),
												]}
											>
												<Input
													suffix={
														objectCheck[name]?.numberOfCycles && (
															<span>
																<Tooltip
																	placement="topRight"
																	title={objectCheck[name]?.numberOfCycles}
																>
																	<ExclamationCircleOutlined className="text-yellow-500" />
																</Tooltip>
															</span>
														)
													}
													placeholder={tField('unlimited')}
													maxLength={3}
													disabled={disabled}
												/>
											</Item>
										)}

										{pricingPlanItem[name] !== FLAT_RATE && (
											<Item
												{...restField}
												name={[name, 'unitId']}
												fieldKey={[fieldKey, 'unitId']}
												label={tField('unit')}
												rules={[
													validateRequire(tValidation('opt_isRequired', { field: 'unit' })),
												]}
											>
												<Select disabled={disabled} loading={loadingUnit}>
													{renderOptionsHighlight(
														selectUnitOption,
														objectCheck[name]?.unitId,
													)}
												</Select>
											</Item>
										)}
										{(pricingPlanItem[name] === FLAT_RATE || pricingPlanItem[name] === UNIT) && (
											<Item
												{...restField}
												name={[name, 'price']}
												fieldKey={[fieldKey, 'price']}
												label={
													pricingPlanItem[name] === FLAT_RATE
														? tField('price')
														: tField('unitPrice')
												}
												normalize={(value) => formatNormalizeCurrency(value)}
												rules={[
													validateRequire(
														tValidation('opt_isRequired', {
															field:
																pricingPlanItem[name] === FLAT_RATE
																	? 'price'
																	: 'unitPrice',
														}),
													),
													validateNumberLength(
														10,
														tValidation('opt_enterMaxLength', { maxLength: '10' }),
													),
												]}
											>
												<Input
													suffix={
														objectCheck[name]?.price && (
															<span>
																<Tooltip
																	placement="topRight"
																	title={objectCheck[name]?.price}
																>
																	<ExclamationCircleOutlined className="text-yellow-500" />
																</Tooltip>
															</span>
														)
													}
													placeholder={tField('opt_enter', { field: 'price' })}
													maxLength={13}
													addonAfter={currencySelector}
													disabled={disabled}
												/>
											</Item>
										)}
										{pricingPlanItem[name] !== FLAT_RATE && pricingPlanItem[name] !== UNIT && (
											<PricingPlanRange
												form={form}
												disabled={disabled}
												dataRangeItem={dataRange[name]}
												dataRange={dataRange}
												setDataRange={setDataRange}
												prefixSelector={currencySelector}
												onChangeInputRange={() => onChangeInputRange(name)}
												objectCheck={objectCheck[name]?.unitLimitedList}
												nameRange={name}
												fieldKeyRange={fieldKey}
											/>
										)}
										{pricingPlanItem[name] === UNIT && (
											<Item
												{...restField}
												name={[name, 'freeQuantity']}
												fieldKey={[fieldKey, 'freeQuantity']}
												label={tField('freeQuantity')}
												normalize={formatNormalizeNumber}
											>
												<Input
													suffix={
														objectCheck[name]?.freeQuantity && (
															<span>
																<Tooltip
																	placement="topRight"
																	title={objectCheck[name]?.freeQuantity}
																>
																	<ExclamationCircleOutlined className="text-yellow-500" />
																</Tooltip>
															</span>
														)
													}
													placeholder={tField('freeQuantity')}
													maxLength={10}
													disabled={disabled}
												/>
											</Item>
										)}
										{pathname.indexOf('addon') === -1 && (
											<Item
												{...restField}
												name={[name, 'numberOfTrial']}
												fieldKey={[fieldKey, 'numberOfTrial']}
												normalize={formatNormalizeNumber}
												rules={[
													validateNumberLength(
														3,
														tValidation('opt_enterMaxLength', { maxLength: '3' }),
													),
												]}
												className="w-full"
												label={tField('trialTime')}
												labelCol={{ span: 6 }}
											>
												<Input
													suffix={
														objectCheck[name]?.numberOfTrial && (
															<span>
																<Tooltip
																	placement="topRight"
																	title={objectCheck[name]?.numberOfTrial}
																>
																	<ExclamationCircleOutlined className="text-yellow-500" />
																</Tooltip>
															</span>
														)
													}
													maxLength={3}
													placeholder={tField('opt_enter', { field: 'time' })}
													disabled={disabled}
													addonAfter={
														<Item
															{...restField}
															name={[name, 'trialType']}
															fieldKey={[fieldKey, 'trialType']}
															noStyle
														>
															<Select disabled={disabled} style={{ width: 100 }}>
																{renderOptionsHighlight(
																	selectCycleType,
																	objectCheck[name]?.trialType,
																)}
															</Select>
														</Item>
													}
												/>
											</Item>
										)}

										{/* Dịch vụ bổ sung */}
										<Col span={18} offset={6} className="text-right">
											{pathname.indexOf('addon') === -1 ? (
												<Item
													{...restField}
													name={[name, 'addonList']}
													fieldKey={[fieldKey, 'addonList']}
												>
													<ChooseAddon
														className="mb-6"
														disabled={disabled}
														portal={portal}
														triggerPaymentCycle={triggerPaymentCycle}
														keyName={name}
														periodicType={{
															paymentCycle: form.getFieldValue([
																'pricingStrategies',
																name,
																'paymentCycle',
															]),
															cycleType: form.getFieldValue([
																'pricingStrategies',
																name,
																'cycleType',
															]),
														}}
													/>
												</Item>
											) : (
												<Item
													{...restField}
													name={[name, 'multiPlanId']}
													fieldKey={[fieldKey, 'multiPlanId']}
												>
													<ChoosePricingApplyPeriodic
														disabled={disabled}
														addonInFor={data}
														paramPopup={name}
														form={form}
													/>
												</Item>
											)}
										</Col>
										{pricingPlanItem[name] !== FLAT_RATE && pricingPlanItem[name] !== UNIT && (
											<Col span={18} offset={6} className="bg-blue-50 p-4 mb-6">
												<p className="font-semibold mb-2">{tOthers('estimatePaymentAmount')}</p>
												<div className="flex items-center text-base">
													<span>{tOthers('ifCustomerBuy')}</span>
													<Item
														{...restField}
														name={[name, 'estimatePayment']}
														fieldKey={[fieldKey, 'estimatePayment']}
														normalize={formatNormalizeNumber}
														className="w-32 mx-4 mb-0"
													>
														<Input
															maxLength={10}
															onChange={(event) =>
																onChangePayment(event.target.value, name)
															}
														/>
													</Item>
													<span>
														{tLowerField('totalPaymentAmount')}{' '}
														<b>{DX.formatNumberCurrency(totalPayment[name])}</b>{' '}
														{currencySelector}
													</span>
												</div>
											</Col>
										)}
									</Panel>
									<Row>
										<Col
											span={18}
											offset={6}
											className="border-0 border-b-2 border-solid border-gray-100"
										/>
									</Row>
								</>
							))}
						</Collapse>
					</>
				)}
			</Form.List>
		</div>
	);
}
