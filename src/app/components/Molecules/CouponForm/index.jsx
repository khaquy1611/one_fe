import { FileAddOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Radio, Row, Space } from 'antd';
import {
	formatNormalizeCurrency,
	formatNormalizeNumberOtherZero,
	validateCode,
	validateRequireInput,
	validateRequireSelectItems,
} from 'app/validator';
import { DX } from 'app/models';
import moment from 'moment';
import React, { useState } from 'react';
import { useUser, useLng } from 'app/hooks';
import { useRouteMatch } from 'react-router-dom';
import { isEmpty as _isEmpty, trim } from 'opLodash';
import DiscountService from './components/DiscountService';
import ChoosePromotion from './components/ChoosePromotion';
import FreeService from './components/FreeService';
import PromotionType from './components/PromotionType';

const DISCOUNT = 'DISCOUNT';
const PRODUCT = 'PRODUCT';
const codeType = { AUTO: 'AUTO', USECODE: 'USECODE' };
const PERCENT = 'PERCENT';
const INACTIVE = 'INACTIVE';
const NONE = 'NONE';
const MONTH = 'MONTH';
const YES = 'YES';
const NO = 'NO';
const TIMES = 'TIMES';
const REGISTERFEE = 'REGISTERFEE';
const TIME_TYPE = {
	ONCE: 'ONCE',
	UNLIMITED: 'UNLIMITED',
	LIMITED: 'LIMITED',
};
const APPROVED = 'APPROVED';
const UNAPPROVED = 'UNAPPROVED';

const { RangePicker } = DatePicker;
const { Item } = Form;

export default function CouponForm({
	handleSubmit,
	form,
	isLoading,
	onlyView,
	couponInfo,
	setDirty,
	isDirty,
	goBack,
	className,
	onDeleteCoupon,
	checkStatus,
	checkApproved,
	updateDraftCoupon,
	rollbackCoupon,
	rollbackStatus,
	typeCoupon = '',
}) {
	const { tButton, tFilterField, tValidation, tField, tMessage } = useLng();
	const [reFresh, setReFresh] = useState(NO);
	const { path } = useRouteMatch();
	const { user } = useUser();
	const rootAdmin = !user.isAdminProvince;
	const { setFieldsValue, getFieldValue, setFields } = { ...form };
	const [disableRad, setDisableRad] = useState();
	const regex = /^[a-zA-Z0-9#!@$%&_-]+$/;

	const CAN_DELETE_ADMIN =
		DX.canAccessFuture2('admin/delete-coupon', user.permissions) &&
		(rootAdmin || couponInfo?.adminType === 'PROVINCE_ADMIN') &&
		couponInfo?.portalType !== 'DEV';

	const CAN_DELETE_DEV = DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions);

	const CAN_CHANGE_STATUS =
		(couponInfo?.portalType === 'ADMIN' &&
			DX.canAccessFuture2('admin/change-status-coupon-by-admin', user.permissions) &&
			(rootAdmin || (couponInfo.adminType === 'PROVINCE_ADMIN' && !rootAdmin))) ||
		(couponInfo?.portalType === 'DEV' && DX.canAccessFuture2('dev/change-status-coupon-by-dev', user.permissions));

	const initValue = {
		codeType: codeType.AUTO,
		promotionGroup: {
			type: DISCOUNT,
			list: [],
		},
		minimumAmount: '0',
		discountType: PERCENT,
		status: INACTIVE,
		enterpriseGroup: { list: [], type: NONE },
		pricingGroup: { list: [], type: NONE },
		supplierGroup: { list: [], type: NONE },
		addonGroup: { list: [], type: NONE },
		timesUsedType: TIME_TYPE.ONCE,
		maxCount: '',
		type: MONTH,
		totalBillType: NO,
		discountSupplierType: REGISTERFEE,
	};

	const checkCouponCount = () => {
		const getCountPromotion = getFieldValue('maxUsed');
		const getUseMaxPromotion = getFieldValue('maximumPromotion');

		const getCount = getCountPromotion?.replace(/\s/g, '');
		const getMax = getUseMaxPromotion?.replace(/\s/g, '');

		if (parseInt(getMax, 10) > parseInt(getCount, 10))
			setFields([
				{
					name: 'maximumPromotion',
					errors: [tValidation('maxProm')],
				},
			]);
		else {
			setFields([
				{
					name: 'maximumPromotion',
					errors: [],
				},
			]);
		}
	};

	// const onChangeCodeType = () => {
	// 	setFieldsValue({ promotionCode: '' });
	// };

	const checkValueChange = (valueChange) => {
		!isDirty && setDirty(true);

		if (valueChange.promotionGroup?.type === DISCOUNT)
			setFieldsValue({
				discountType: PERCENT,
				discountValue: null,
				totalBillType: NO,
				discountSupplierType: REGISTERFEE,
				discountAmount: null,
				timesUsedType: TIME_TYPE.ONCE,
				type: TIMES,
			});
		if (valueChange.promotionGroup?.type === PRODUCT && !(valueChange.promotionGroup?.list.length > 0)) {
			setFieldsValue({
				timesUsedType: TIME_TYPE.UNLIMITED,
				type: MONTH,
			});
		}

		if (valueChange.totalBillType === YES) {
			setDisableRad(YES);
		}
		if (valueChange.totalBillType === NO) {
			setDisableRad(NO);
		}
		if (valueChange.promotionGroup) {
			setDisableRad(NO);
		}
	};

	const disableDate = (current) => current && current < moment().startOf('day');

	const initialValues = () => {
		let values = {};
		if (!_isEmpty(couponInfo)) {
			values = {
				...couponInfo,
				rangeDate: [
					couponInfo.startDate ? moment(couponInfo?.startDate, 'DD/MM/YYYY') : undefined,
					couponInfo.endDate ? moment(couponInfo?.endDate, 'DD/MM/YYYY') : undefined,
				],
				promotionGroup: {
					type: couponInfo.promotionType,
					list: couponInfo.couponPricing,
				},
				enterpriseGroup: { list: couponInfo.couponEnterprise, type: couponInfo.enterpriseType },
				pricingGroup: { list: couponInfo.couponPricingApply, type: couponInfo.pricingType },
				supplierGroup: { list: couponInfo.suppliers, type: couponInfo.supplierType },
				addonGroup: { list: couponInfo.couponAddons, type: couponInfo.addonsType },
				discountValue: DX.formatNumberCurrency(couponInfo.discountValue, 'null'),
				minimumAmount: DX.formatNumberCurrency(couponInfo.minimumAmount),
				discountAmount: DX.formatNumberCurrency(couponInfo.discountAmount, 'null'),
				maximumPromotion: couponInfo.maximumPromotion?.toLocaleString('fr'),
				maxUsed: couponInfo.maxUsed?.toLocaleString('fr'),
				minimum: couponInfo.minimum?.toLocaleString('fr'),
				limitedQuantity: couponInfo.limitedQuantity?.toLocaleString('fr'),
			};
		} else {
			values = initValue;
		}
		return values;
	};
	return (
		<Form
			className={className}
			form={form}
			onFinish={handleSubmit}
			autoComplete="off"
			initialValues={initialValues()}
			onValuesChange={(valueChange) => checkValueChange(valueChange)}
			scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
		>
			{/* Thông tin chung */}
			<Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('generalInfo')}</span>}
			/>
			<Item
				label={tField('promName')}
				name="name"
				rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'promName' }))]}
				labelCol={{ span: 6 }}
			>
				<Input
					type="text"
					placeholder={tField('promName')}
					autoFocus
					maxLength={50}
					disabled={(!onlyView && !checkStatus) || !checkApproved}
				/>
			</Item>
			<Item
				name="code"
				label={tField('promCode')}
				normalize={trim}
				labelCol={{ span: 6 }}
				rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'promCode' }))]}
			>
				<Input type="text" maxLength={30} placeholder={tField('promCode')} disabled />
			</Item>

			{path.indexOf('create') === -1 && (
				<Item name="status" label={tField('activeStatus')} labelCol={{ span: 6 }}>
					<Radio.Group disabled={!onlyView || (!checkStatus && !checkApproved) || !CAN_CHANGE_STATUS}>
						<Radio value="ACTIVE">{tFilterField('value', 'on')}</Radio>
						<Radio value="INACTIVE">{tFilterField('value', 'off')}</Radio>
					</Radio.Group>
				</Item>
			)}

			{/* Hình thức khuyến mại */}
			<Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('promType')}</span>}
			/>
			<Item
				className="mt-4"
				name="promotionGroup"
				label=" "
				colon={false}
				labelCol={{ span: 6 }}
				validateTrigger="onSubmit"
				rules={[validateRequireSelectItems(tValidation('opt_isRequired', { field: 'promService' }))]}
			>
				<ChoosePromotion
					onlyView={onlyView}
					title={tMessage('opt_select', { field: 'promService' })}
					placeholder={tField('opt_select', { field: 'serviceName' })}
					form={form}
					checkStatus={checkStatus}
					typeModal="pricingType"
					setReFresh={setReFresh}
					typeCoupon={typeCoupon}
					couponInfo={couponInfo}
				/>
			</Item>

			<Item noStyle shouldUpdate={(p, c) => p.promotionGroup.type !== c.promotionGroup.type}>
				{() =>
					getFieldValue('promotionGroup').type === DISCOUNT && (
						<PromotionType form={form} onlyView={onlyView} couponInfo={couponInfo} />
					)
				}
			</Item>

			{/* Hiệu lực CTKM */}
			<Item
				className="my-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('effect')}</span>}
			/>
			{/* tField('numberOfUse') */}
			<Item
				name="maxUsed"
				label={tField('numberOfUse')}
				normalize={(value) => formatNormalizeNumberOtherZero(value)}
				labelCol={{ span: 6 }}
			>
				<Input
					maxLength={12}
					onChange={checkCouponCount}
					disabled={(!onlyView && !checkStatus) || !checkApproved}
					placeholder={tField('numberOfUse')}
				/>
			</Item>
			<Item name="rangeDate" label={tField('time')} labelCol={{ span: 6 }}>
				<RangePicker
					className="w-full"
					format="DD/MM/YYYY"
					allowEmpty={[true, true]}
					disabled={path.indexOf('detail') !== -1 ? onlyView : [onlyView && !checkStatus, false]}
					disabledDate={disableDate}
				/>
			</Item>

			{/* Điều kiện áp dụng */}
			<Item
				className="my-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('useCondition')}</span>}
			/>

			{/* <Item
				name="minimum"
				label={tField('minQuantity')}
				normalize={(value) => formatNormalizeNumberOtherZero(value)}
				labelCol={{ span: 6 }}
			>
				<Input maxLength={12} disabled={onlyView} placeholder={tField('minQuantity')} />
			</Item> */}
			<Item
				label={tField('minPrice')}
				labelCol={{ span: 6 }}
				name="minimumAmount"
				normalize={(value) => formatNormalizeCurrency(value)}
				className="w-full"
				placeholder="0"
			>
				<Input maxLength={12} addonAfter={<span>VND</span>} disabled={onlyView} />
			</Item>
			<Item
				name="maximumPromotion"
				label={tField('maxDiscount')}
				normalize={(value) => formatNormalizeNumberOtherZero(value)}
				labelCol={{ span: 6 }}
			>
				<Input
					maxLength={12}
					onChange={checkCouponCount}
					disabled={onlyView}
					placeholder={tField('maxDiscount')}
				/>
			</Item>
			{/* <Item label={tField('applyDiscountCode')} className="mb-0" labelCol={{ span: 6 }}>
				<Item name="codeType" labelCol={{ span: 6 }}>
					<Radio.Group disabled={onlyView} onChange={onChangeCodeType}>
						<Space direction="vertical" className="mt-2">
							<Radio value={codeType.AUTO}>{tFilterField('value', 'autoApply')}</Radio>
							<Radio value={codeType.USECODE}>{tFilterField('value', 'useCode')}</Radio>
						</Space>
					</Radio.Group>
				</Item>
				<Item className="absolute top-9 left-36 mb-0" shouldUpdate={(p, c) => c.codeType !== p.codeType}>
					{() =>
						getFieldValue('codeType') === codeType.USECODE && (
							<Item
								className="inline-block ml-4 w-68"
								name="promotionCode"
								normalize={trim}
								labelCol={{ span: 6 }}
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'promCode' })),
									validateCode(tValidation('plsEnterTrueFormat'), regex),
								]}
							>
								<Input
									maxLength={10}
									placeholder={tField('opt_enter', { field: 'promCode' })}
									disabled={onlyView}
								/>
							</Item>
						)
					}
				</Item>
			</Item> */}
			<Form.Item shouldUpdate={(p, c) => p.promotionGroup.type !== c.promotionGroup.type}>
				{() => (
					<>
						{getFieldValue('promotionGroup').type === DISCOUNT && (
							<DiscountService
								form={form}
								onlyView={onlyView}
								couponInfo={couponInfo}
								checkStatus={checkStatus}
								reFresh={reFresh}
								disableRad={disableRad}
								typeCoupon={typeCoupon}
							/>
						)}

						{getFieldValue('promotionGroup').type === PRODUCT && (
							<FreeService
								form={form}
								onlyView={onlyView}
								couponInfo={couponInfo}
								checkStatus={checkStatus}
								reFresh={reFresh}
								typeCoupon={typeCoupon}
							/>
						)}
					</>
				)}
			</Form.Item>

			{/* button */}
			<Item className="mt-10" label=" " colon={false} labelCol={{ span: 6 }}>
				<Row
					className={`flex ${
						path.indexOf('detail') !== -1 && (CAN_DELETE_ADMIN || CAN_DELETE_DEV)
							? 'justify-between'
							: 'justify-end'
					}`}
				>
					{path.indexOf('detail') !== -1 && (CAN_DELETE_ADMIN || CAN_DELETE_DEV) && (
						<Button type="dashed" danger onClick={onDeleteCoupon}>
							{tButton('delete')}
						</Button>
					)}
					<div>
						{path.indexOf('detail') !== -1 && couponInfo?.approve === APPROVED && rollbackStatus && (
							<Button className="mr-5" type="primary" onClick={rollbackCoupon}>
								{tButton('opt_back', { field: 'oldVersion' })}
							</Button>
						)}
						<Button onClick={goBack}>{tButton('opt_cancel')}</Button>
						{path.indexOf('create') !== -1 && (
							<Button
								className="ml-5"
								type="primary"
								htmlType="submit"
								icon={<FileAddOutlined width="w-4" />}
								loading={isLoading}
								disabled={!isDirty}
							>
								{tButton('opt_create', { field: 'prom' })}
							</Button>
						)}
						{couponInfo?.approve === APPROVED && path.indexOf('edit') !== -1 && (
							<Button
								className="ml-5"
								type="primary"
								icon={<SaveOutlined width="w-4" />}
								onClick={updateDraftCoupon}
							>
								{tButton('opt_save')}
							</Button>
						)}
						{couponInfo?.approve === UNAPPROVED && path.indexOf('edit') !== -1 && (
							<Button
								className="ml-5"
								type="primary"
								htmlType="submit"
								icon={<SaveOutlined width="w-4" />}
								loading={isLoading}
								disabled={!isDirty}
							>
								{tButton('opt_save')}
							</Button>
						)}
					</div>
				</Row>
			</Item>
		</Form>
	);
}
