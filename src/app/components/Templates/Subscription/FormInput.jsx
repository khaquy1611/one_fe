/* eslint-disable react-hooks/rules-of-hooks */
import { Button, DatePicker, Form, Input } from 'antd';
import { formatNormalizeNumberOtherZero, validateMaxValue, validateRequireInput } from 'app/validator';
import moment from 'moment';
import React from 'react';

function FormInput({
	isTrial,
	serviceId,
	dataDetail,
	typeSupscrip,
	setShowPreviewCost,
	formValue,
	disableTimeTrial,
	selectAfter,
	pricingInfo,
	CAN_UPDATE,
	checkAdmin,
	isDisplayTime,
	typeChange,
	disableStartAt,
	checkVisible,
	checkChangeSub,
	serviceIdIn,
	isOrderService,
}) {
	return (
		<>
			{!isTrial &&
				serviceId &&
				typeSupscrip !== 'create' &&
				dataDetail.regType !== 'TRIAL' &&
				dataDetail.subscriptionStatus === 'ACTIVE' && (
					<div className="mt-11 p-6 text-right" style={{ backgroundColor: '#FAFAFA' }}>
						<Button type="primary" onClick={() => setShowPreviewCost(true)}>
							Xem trước chi phí
						</Button>
					</div>
				)}
			{((isTrial && serviceId && formValue.trialType) || dataDetail?.regType === 'TRIAL') && (
				<Form.Item
					name="numberOfTrial"
					label="Thời gian dùng thử: "
					normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
					rules={[validateRequireInput('Vui lòng không để trống mục này')]}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 12 }}
					className="mt-10"
				>
					<Input disabled={disableTimeTrial} addonAfter={selectAfter} className="w-3/4-i" maxLength={4} />
				</Form.Item>
			)}
			{!isTrial && serviceId && dataDetail.regType !== 'TRIAL' && (
				<>
					<Form.Item
						name="paymentCycleText"
						label="Chu kỳ thanh toán"
						rules={[validateRequireInput()]}
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 12 }}
						className="mt-10 "
					>
						<Input disabled className="w-3/4-i" />
					</Form.Item>

					<Form.Item
						name="numberOfCycles"
						label="Số chu kỳ thanh toán"
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 12 }}
						rules={
							typeSupscrip !== 'create'
								? [
										validateMaxValue(
											pricingInfo.currentCycle,
											'Số chu kỳ phải lớn hơn số chu kỳ đã sử dụng',
										),
								  ]
								: []
						}
						normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
					>
						<Input
							placeholder="Không giới hạn"
							className="w-3/4-i"
							maxLength={3}
							disabled={
								dataDetail.subscriptionStatus === 'CANCELLED' ||
								dataDetail.subscriptionStatus === 'NON_RENEWING' ||
								!checkAdmin ||
								!CAN_UPDATE ||
								(dataDetail.subscriptionStatus === 'FUTURE' && isOrderService)
							}
						/>
					</Form.Item>
				</>
			)}
			{dataDetail.smeId &&
				((!isDisplayTime && !dataDetail) ||
					(isDisplayTime && dataDetail) ||
					dataDetail?.subscriptionStatus === 'IN_TRIAL') &&
				dataDetail?.subscriptionStatus !== 'FUTURE' &&
				typeChange !== 'changeSubscription' && (
					<Form.Item
						name="startedAtModInput"
						label="Thời gian bắt đầu sử dụng"
						rules={[validateRequireInput()]}
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 12 }}
						hidden={!serviceId}
					>
						<Input disabled className="w-3/4-i" />
					</Form.Item>
				)}
			{((!dataDetail.smeId && !!serviceId) || dataDetail?.subscriptionStatus === 'FUTURE') &&
				!checkChangeSub &&
				!serviceIdIn && (
					<Form.Item
						name="startedAt"
						label="Thời gian bắt đầu sử dụng"
						rules={[validateRequireInput('Vui lòng không để trống mục này')]}
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 12 }}
					>
						<DatePicker
							disabled={
								(disableStartAt && dataDetail.subscriptionStatus !== 'IN_TRIAL') ||
								!CAN_UPDATE ||
								!checkAdmin ||
								isOrderService
							}
							placeholder="Chọn ngày"
							format="DD/MM/YYYY"
							defaultValue={moment()}
							className="w-3/4-i"
							disabledDate={(value) => moment().subtract(1, 'days').isAfter(value)}
						/>
					</Form.Item>
				)}
			{((dataDetail?.subscriptionStatus !== 'IN_TRIAL' && !isTrial) || checkVisible) &&
				dataDetail.regType !== 'TRIAL' && (
					<Form.Item
						name="startChargeAt"
						label="Ngày yêu cầu thanh toán"
						rules={[validateRequireInput()]}
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 12 }}
						hidden={!serviceId}
					>
						<Input disabled className="w-3/4-i" />
					</Form.Item>
				)}
		</>
	);
}

export default FormInput;
