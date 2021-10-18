/* eslint-disable react-hooks/rules-of-hooks */
import { Form, Modal, Radio } from 'antd';
import { DX } from 'app/models';
import React from 'react';

function ConfirmModal({
	confirmModal,
	setConFirmModal,
	form,
	loading,
	checkPromotion,
	checkNumberCycle,
	checkLengthAddon,
	displayChange,
	totalChange,
	previewCost,
	paymentType,
	checkChangeSub,
	defaultValueRadio,
}) {
	return (
		<Modal
			title={`${!checkChangeSub ? 'Xác nhận cập nhật' : 'Xác nhận đổi gói'}`}
			visible={confirmModal}
			onCancel={() => setConFirmModal(false)}
			maskClosable={false}
			onOk={() => form.submit()}
			okButtonProps={{ loading }}
			okText="Xác nhận"
		>
			{checkPromotion && !checkChangeSub && !checkNumberCycle && !checkLengthAddon && (
				<div className="font-semibold">Các khuyến mại đã thêm sẽ được áp dụng cho chu kỳ tiếp theo.</div>
			)}
			{(!checkPromotion || checkLengthAddon) &&
				`
								${!checkChangeSub ? 'Thời điểm áp dụng chỉnh sửa thuê bao' : 'Thời điểm áp dụng đổi gói'}`}
			{(!checkPromotion || (checkPromotion && (checkNumberCycle || checkLengthAddon))) && (
				<Form.Item label=" " name="paymentType" colon={false} className="mt-3">
					<Radio.Group defaultValue={defaultValueRadio}>
						<Radio value="NOW" className="w-full mb-2">
							Ngay lập tức
						</Radio>
						<Radio value="END_OF_PERIOD">Kết thúc chu kỳ</Radio>
					</Radio.Group>
				</Form.Item>
			)}
			{displayChange &&
				(checkNumberCycle ||
					totalChange === 0 ||
					(checkLengthAddon && (!totalChange || totalChange === 0))) && (
					<p>Số tiền phát sinh cần thanh toán: 0 VND</p>
				)}
			{displayChange && totalChange > 0 && (
				<>
					<div className="font-semibold">Số tiền phát sinh cần thanh toán:</div>
					<br />
					{previewCost.costIncurred?.costIncurred
						?.filter((el) => el?.finalAmountPreTax > 0)
						?.map((data) => (
							<div className="flex justify-between ">
								<span className="text-gray-400">{data.itemName}: </span>
								<span className="font-semibold">
									{DX.formatNumberCurrency(data.finalAmountPreTax)} VND
								</span>
							</div>
						))}
					<hr />
					<div className="flex justify-between ">
						<span className="text-gray-400">Tổng phí phát sinh:</span>
						<span className="font-semibold">{DX.formatNumberCurrency(totalChange)} VND</span>
					</div>
				</>
			)}
			{!checkChangeSub && paymentType === 'END_OF_PERIOD' && !checkPromotion && ''}
		</Modal>
	);
}

export default ConfirmModal;
