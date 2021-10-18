import { Button, Col, Form, Input, Radio, Row, Select, Space } from 'antd';
import { useLng } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { ComboPricing, DX } from 'app/models';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import {
	formatNormalizeCurrency,
	formatNormalizeNumber,
	formatNormalizeNumberOtherZero,
	validateCustomPattern,
	validateMaxLengthStr,
	validateNumberLength,
	validateRequire,
	validateRequireInput,
} from 'app/validator';
import { cloneDeep, isEmpty, pick } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import CommonTaxRange from 'app/CommonPricing/CommonPricingForm/CommonTaxRange';
import ChooseAddon from './ChooseAddon';
import ChoosePricing from './ChoosePricing';
import ChoosePricingTable from './ChoosePricingTable';
import BtnSubmitForm from './subComponents/BtnSubmitForm';

const { TextArea } = Input;

function ComboPricingFormContent({
	data,
	disabled,
	selectPeriodType,
	selectFeatureOption,
	selectTaxOption,
	onFinish,
	form,
	currencyDefault,
	loadingFeature,
	loadingTax,
	loading,
	portal,
	objectCheck = {},
	onChangePriceFormValue,
	onChangeDiscount,
	selectDurationType,
	canLoadOption,
	getComboType,
	getComboOwner,
}) {
	const { pathname } = useLocation();
	const [visibleModalPricing, setVisibleModalPricing] = useState(false);
	const [visibleModalAddon, setVisibleModalAddon] = useState(false);
	const history = useHistory();
	const { id } = useParams();
	const dispatch = useDispatch();
	const { tValidation, tField, tFilterField } = useLng();
	const { setFieldsValue, getFieldValue } = { ...form };

	useEffect(() => {
		dispatch(comboPricingActions.initDirtyForm());
		if (data.id) {
			const dataDup = { ...cloneDeep(data) };
			if (!canLoadOption) {
				if (dataDup.taxList.length > 0) {
					dataDup.taxList.forEach((e) => {
						e.taxId = e.taxName;
					});
				}
				if (dataDup.featureList.length > 0) {
					dataDup.featureList = dataDup.featureListDup.map((e) => e.name);
				}
			}
			delete dataDup.amount;
			form.setFieldsValue({
				periodType: 'MONTHLY',
				trialType: 'DAILY',
				comboPlanType: 'PREPAY',
				hasChangePrice: 'YES',
				hasRefund: 'NO',
				cancelDate: 1,
				activeDateType: 'UNLIMITED',
				...dataDup,
			});
		} else {
			dispatch(comboPricingActions.reset());
			form.setFieldsValue({
				periodType: 'MONTHLY',
				trialType: 'DAILY',
				discountType: ComboPricing.selectDiscountType[0].value,
				comboPlanType: 'PREPAY',
				hasChangePrice: 'YES',
				hasRefund: 'NO',
				cancelDate: 1,
				activeDateType: 'UNLIMITED',
			});
		}
	}, [data.id, currencyDefault]);

	const RenderTitle = () => {
		if (Object.keys(data).length === 0) {
			return <p className="text-xl font-semibold my-3">Tạo gói Combo dịch vụ</p>;
		}
		return null;
	};

	const onChangeActiveDateType = () => {
		setFieldsValue({ activeDate: null, durationType: 'DAILY' });
	};

	return (
		<>
			<RenderTitle />
			<div className="max-w-7xl mx-auto">
				<Form
					form={form}
					labelCol={{ span: 6 }}
					// wrapperCol={{ span: 18 }}
					className="pt-10 pb-20"
					layout="horizontal"
					onFinish={onFinish}
					autoComplete="off"
					onValuesChange={() => dispatch(comboPricingActions.setDirtyForm())}
					style={{ width: '90%' }}
					scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
				>
					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 1: */}
					{/* Thông tin chung */}
					<Row>
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 float-right pr-2 ${
									!isEmpty(pick(objectCheck, ['name', 'code', 'description'])) ? 'bg-yellow-400' : ''
								}`}
							>
								Thông tin chung
							</p>
						</Col>
					</Row>
					<Form.Item
						name="name"
						label="Tên gói Combo"
						rules={[
							validateRequireInput(tValidation('mustRequire')),
							validateMaxLengthStr(30, 'Độ dài của tên gói vượt quá 30 ký tự'),
						]}
					>
						<Input placeholder="Tên gói Combo" maxLength={30} disabled={disabled} autoFocus />
					</Form.Item>

					<Form.Item
						name="code"
						label="Mã gói Combo"
						rules={[
							validateRequireInput(tValidation('mustRequire')),
							validateMaxLengthStr(30, 'Độ dài của mã gói vượt quá 30 ký tự'),
							validateCustomPattern(
								/^[a-zA-Z0-9_]*$/,
								'Định dạng mã gói Combo chỉ được gồm: Chữ cái hoa/thường không dấu, ký tự _ và chữ số',
							),
						]}
					>
						<Input
							placeholder="Mã gói Combo"
							maxLength={30}
							disabled={disabled || data.hasApproved === 'YES'}
						/>
					</Form.Item>
					<Form.Item name="description" label="Mô tả gói Combo">
						<TextArea
							placeholder={disabled ? '' : 'Mô tả gói Combo'}
							showCount
							maxLength={500}
							rows={3}
							disabled={disabled}
						/>
					</Form.Item>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 2: */}
					{/* Chu kỳ thanh toán */}
					<Row>
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									!isEmpty(pick(objectCheck, ['periodValue', 'periodType', 'numOfPeriod']))
										? 'bg-yellow-400'
										: ''
								}`}
							>
								Chu kỳ thanh toán
							</p>
						</Col>
					</Row>
					<Form.Item className="mb-0" label="Chu kỳ thanh toán" required labelCol={{ span: 6 }}>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Form.Item
									name="periodValue"
									normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
									rules={[
										validateRequire(tValidation('mustRequire')),
										validateNumberLength(3, 'Độ dài của chu kỳ thanh toán vượt quá 3 ký tự'),
									]}
									labelCol={{ span: 10 }}
									className="w-full"
								>
									<Input
										onChange={(e) => onChangePriceFormValue(e.target.value, 'periodValue')}
										maxLength={3}
										placeholder="Nhập chu kỳ"
										disabled={disabled}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item name="periodType" className="group">
									<Select
										options={selectPeriodType}
										onSelect={(value) => onChangePriceFormValue(value, 'periodType')}
										disabled={disabled}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
					<Form.Item
						name="numOfPeriod"
						label="Số chu kỳ"
						normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
						rules={[validateNumberLength(3, 'Độ dài của số chu kỳ vượt quá 3 ký tự')]}
					>
						<Input placeholder="Không giới hạn" maxLength={3} disabled={disabled} />
					</Form.Item>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 3: */}
					{/* Gói dịch vụ */}
					<Row justify="space-between" align="middle">
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									!isEmpty(
										pick(objectCheck, ['pricingCombo', 'discountType', 'discountValue', 'amount']),
									)
										? 'bg-yellow-400'
										: ''
								}`}
							>
								Gói dịch vụ
							</p>
						</Col>
						<Col span={6}>
							{!disabled && (
								<Button
									className="float-right"
									type="default"
									icon={<AddIcon width="w-4" />}
									onClick={() => {
										setVisibleModalPricing(true);
									}}
								>
									Thêm gói
								</Button>
							)}
						</Col>
					</Row>
					<Row gutter={[16, 16]}>
						<Col span={18} offset={6}>
							<Form.Item name="pricingCombo" className="relative h-0 " hidden>
								<ChoosePricing
									disabled={disabled}
									getComboType={getComboType}
									getComboOwner={getComboOwner}
									portal={portal}
									visible={visibleModalPricing}
									setVisible={setVisibleModalPricing}
									onChangePriceFormValue={onChangePriceFormValue}
								/>
							</Form.Item>

							<ChoosePricingTable
								disabled={disabled}
								portal={portal}
								form={form}
								nameForm="pricingCombo"
								onChangeDiscount={onChangeDiscount}
							/>
						</Col>
					</Row>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 4: */}
					{/* Phí thiết lập */}
					<Row>
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									!isEmpty(pick(objectCheck, ['setupFee'])) ? 'bg-yellow-400' : ''
								}`}
							>
								Phí thiết lập
							</p>
						</Col>
					</Row>
					<Form.Item className="mb-0" label="Phí thiết lập" labelCol={{ span: 6 }}>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Form.Item
									name="setupFee"
									normalize={(value) => formatNormalizeCurrency(value, 'null', 0)}
									rules={[validateNumberLength(13, 'Độ dài của phí thiết lập vượt quá 10 ký tự')]}
									labelCol={{ span: 10 }}
									className="w-full"
								>
									<Input
										className="text-right"
										maxLength={13}
										// placeholder="Nhập phí thiết lập"
										disabled={disabled}
										addonAfter={<span>VND</span>}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 5: */}
					{/* Thông tin dùng thử */}
					<Row>
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									!isEmpty(pick(objectCheck, ['numOfTrial', 'trialType'])) ? 'bg-yellow-400' : ''
								}`}
							>
								Thông tin dùng thử
							</p>
						</Col>
					</Row>
					<Form.Item className="mb-0" label="Thời gian dùng thử" labelCol={{ span: 6 }}>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Form.Item
									name="numOfTrial"
									normalize={formatNormalizeNumber}
									rules={[validateNumberLength(3, 'Độ dài của thời gian dùng thử vượt quá 3 ký tự')]}
									labelCol={{ span: 10 }}
									className="w-full"
								>
									<Input maxLength={3} placeholder="Nhập thời gian" disabled={disabled} />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item name="trialType">
									<Select options={selectPeriodType} disabled={disabled} />
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 6: */}
					{/* Thông tin thuế */}
					<CommonTaxRange
						disabled={disabled}
						selectTaxOption={selectTaxOption}
						loadingTax={loadingTax}
						portal={portal}
						objectCheck={objectCheck}
						form={form}
					/>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 7: */}
					{/* Dịch vụ bổ sung */}
					<Row justify="space-between" align="middle">
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									!isEmpty(pick(objectCheck, ['addonList'])) ? 'bg-yellow-400' : ''
								}`}
							>
								Dịch vụ bổ sung
							</p>
						</Col>
						<Col span={6}>
							{!disabled && (
								<Button
									className="float-right"
									type="default"
									icon={<AddIcon width="w-4" />}
									onClick={() => {
										setVisibleModalAddon(true);
									}}
								>
									Chọn
								</Button>
							)}
						</Col>
					</Row>
					<Row gutter={[16, 16]}>
						<Col span={18} offset={6}>
							<Form.Item name="addonList" className="relative">
								<ChooseAddon
									disabled={disabled}
									portal={portal}
									visible={visibleModalAddon}
									setVisible={setVisibleModalAddon}
									form={form}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 8: */}
					{/* Danh sách tính năng */}
					<Row>
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									objectCheck.featureList ? 'bg-yellow-400' : ''
								}`}
							>
								Danh sách tính năng
							</p>
						</Col>
					</Row>
					<Form.Item name="featureList" label="Danh sách tính năng">
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
					</Form.Item>

					{/* --------------------------------------------------------------------------------------- */}
					{/* Form module 9: */}
					{/* Thông tin thiết lập */}
					<Row>
						<Col span={6}>
							<p
								className={`text-xl font-semibold mb-6 mt-8 float-right pr-2 ${
									!isEmpty(
										pick(objectCheck, [
											'comboPlanType',
											'hasChangePrice',
											'hasRefund',
											'cancelDate',
											'activeDateType',
											'activeDate',
											'durationType',
										]),
									)
										? 'bg-yellow-400'
										: ''
								}`}
							>
								{tField('settingInfo')}
							</p>
						</Col>
					</Row>
					<Form.Item
						name="comboPlanType"
						label={tField('paymentTime')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'paymentTime' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="PREPAY">{tFilterField('value', 'prepay')}</Radio>
							<Radio value="POSTPAID">{tFilterField('value', 'postpaid')}</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item
						name="hasChangePrice"
						label={tField('allowPriceChange')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'allowPriceChange' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="YES">{tFilterField('value', 'yes')}</Radio>
							<Radio value="NO">{tFilterField('value', 'no')}</Radio>
						</Radio.Group>
					</Form.Item>

					<Form.Item
						name="hasRefund"
						label={tField('allowRefund')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'allowRefund' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value="YES">{tFilterField('value', 'yes')}</Radio>
							<Radio value="NO">{tFilterField('value', 'no')}</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item
						name="cancelDate"
						label={tField('cancelDate')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'cancelDate' }))]}
					>
						<Radio.Group disabled={disabled}>
							<Radio value={1}>{tFilterField('value', 'endPeriod')}</Radio>
							<Radio value={0}>{tFilterField('value', 'now')}</Radio>
						</Radio.Group>
					</Form.Item>

					<Form.Item
						label={tField('timeIsActivedAfterCancel')}
						className="mb-0"
						required
						labelCol={{ span: 6 }}
					>
						<Form.Item name="activeDateType">
							<Radio.Group disabled={disabled} onChange={onChangeActiveDateType} className="w-full">
								<Space direction="vertical" className="mt-2 w-full">
									<Radio value="UNLIMITED">{tFilterField('value', 'unlimited')}</Radio>
									<div className="flex">
										<Radio value="LIMITED" className="flex-none pt-2">
											{tFilterField('value', 'timeIsAllowed')}
										</Radio>
										<Form.Item
											className="flex-1 m-0 p-0"
											shouldUpdate={(p, c) => c.activeDateType !== p.activeDateType}
										>
											{() =>
												getFieldValue('activeDateType') === 'LIMITED' && (
													<>
														<Row gutter={[16, 16]}>
															<Col span={12}>
																<Form.Item
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
																	className="w-full"
																>
																	<Input
																		maxLength={3}
																		placeholder={tField('opt_enter', {
																			field: 'time',
																		})}
																		disabled={disabled}
																	/>
																</Form.Item>
															</Col>
															<Col span={12}>
																<Form.Item name="durationType" className="group">
																	<Select
																		options={selectDurationType}
																		placeholder={tField('monthly')}
																		disabled={disabled}
																	/>
																</Form.Item>
															</Col>
														</Row>
													</>
												)
											}
										</Form.Item>
									</div>
								</Space>
							</Radio.Group>
						</Form.Item>
					</Form.Item>

					{(data.hasApproved === 'YES' || data.approve === 'REJECTED' || data.updateReason) && (
						<>
							<Row>
								<Col span={6}>
									<p className="text-xl font-semibold mb-6 mt-8 float-right pr-2">Lý do cập nhật</p>
								</Col>
							</Row>
							<Form.Item
								name="updateReason"
								label="Lý do cập nhật"
								rules={[
									validateRequireInput(tValidation('mustRequire')),
									validateMaxLengthStr(200, 'Độ dài của mã gói vượt quá 100 ký tự'),
								]}
							>
								<TextArea
									placeholder={disabled ? '' : 'Mô tả lý do cập nhật gói'}
									showCount
									maxLength={200}
									rows={2}
									disabled={disabled}
								/>
							</Form.Item>
						</>
					)}

					{/* --------------------------------------------------------------------------------------- */}
					{/* Các button */}
					{/* trong form */}
					<Row>
						<Col span={24} style={{ textAlign: 'right' }}>
							<Button
								style={{ width: '4rem' }}
								onClick={() => {
									if (
										data?.comboDraftId &&
										data?.comboPlanDraftId &&
										pathname.indexOf('/history') > -1
									) {
										if (portal === 'admin') {
											history.push(
												DX.admin.createPath(
													`/combo/${data.comboDraftId}/${data.comboPlanDraftId}?tab=3`,
												),
											);
										} else
											history.push(
												DX.dev.createPath(
													`/combo/${data.comboDraftId}/${data.comboPlanDraftId}?tab=3`,
												),
											);
										return;
									}
									if (portal === 'admin') {
										history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
									} else history.push(DX.dev.createPath(`/combo/${id}?tab=3`));
								}}
							>
								Hủy
							</Button>
							<BtnSubmitForm data={data} loading={loading} disabled={disabled} />
						</Col>
					</Row>
				</Form>
			</div>
		</>
	);
}

export default ComboPricingFormContent;
