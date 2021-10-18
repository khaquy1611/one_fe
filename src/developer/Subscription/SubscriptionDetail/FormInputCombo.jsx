/* eslint-disable react-hooks/rules-of-hooks */
import { Button, DatePicker, Form, Input } from 'antd';
import { formatNormalizeNumberOtherZero, validateMaxValue, validateRequireInput } from 'app/validator';
import moment from 'moment';
import React from 'react';

const timeMod = {
	NOW: 'NOW',
	CHOOSE: 'CHOOSE',
};

function FormInputCombo({
	isTrial,
	serviceId,
	dataDetail,
	typeSupscrip,
	setShowPreviewCost,
	formValue,
	checkStatusDetail,
	selectAfter,
	pricingInfo,
	CAN_UPDATE,
	checkAdmin,
	isDisplayTime,
	checkDisplayStartAt,
	checkChangeSub,
	isOrderService,
}) {
	return (
		<>
			{!isTrial &&
				serviceId &&
				typeSupscrip !== 'create' &&
				dataDetail.regType !== 'TRIAL' &&
				dataDetail.status === 'ACTIVE' && (
					<div className="mt-11 p-6 text-right" style={{ backgroundColor: '#FAFAFA' }}>
						<Button type="primary" onClick={() => setShowPreviewCost(true)}>
							Xem trước chi phí
						</Button>
					</div>
				)}
			{((isTrial && serviceId && formValue.trialType) || dataDetail?.regType === 'TRIAL') && (
				<Form.Item
					name="numberOfTrial"
					label="Thời gian dùng thử"
					normalize={(value) => formatNormalizeNumberOtherZero(value, 'normal')}
					rules={[validateRequireInput('Vui lòng không để trống mục này')]}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 12 }}
					className="mt-10"
				>
					<Input
						disabled={
							(isDisplayTime && dataDetail.status === 'IN_TRIAL') ||
							(dataDetail?.regType === 'TRIAL' && checkStatusDetail) ||
							!checkAdmin ||
							isOrderService
						}
						addonAfter={selectAfter}
						className="w-3/4-i"
						maxLength={4}
					/>
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
						className="mt-10"
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
							maxLength={3}
							placeholder="Không giới hạn"
							disabled={
								!CAN_UPDATE ||
								dataDetail.status === 'NON_RENEWING' ||
								dataDetail.status === 'CANCELED' ||
								!checkAdmin ||
								isOrderService
							}
							className="w-3/4-i"
						/>
					</Form.Item>
				</>
			)}

			{(((dataDetail.smeId || dataDetail.id) && dataDetail?.status !== 'FUTURE' && isDisplayTime) ||
				dataDetail?.status === 'ACTIVE' ||
				dataDetail?.status === 'IN_TRIAL' ||
				(dataDetail?.regType === 'TRIAL' &&
					(dataDetail.status === 'NON_RENEWING' || dataDetail.status === 'CANCELED'))) &&
				!checkChangeSub && (
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
			{checkDisplayStartAt && (
				<Form.Item
					name="startedAt"
					label="Thời gian bắt đầu sử dụng"
					rules={[validateRequireInput('Vui lòng không để trống trường này')]}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 12 }}
				>
					<DatePicker
						disabled={
							dataDetail?.status === 'CANCELED' ||
							(!isDisplayTime && dataDetail?.status !== 'IN_TRIAL') ||
							(isDisplayTime && dataDetail?.status === 'IN_TRIAL') ||
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
			{dataDetail?.status !== 'IN_TRIAL' && !isTrial && dataDetail.regType !== 'TRIAL' && (
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

export default FormInputCombo;
