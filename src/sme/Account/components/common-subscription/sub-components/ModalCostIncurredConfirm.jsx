import { Button, Modal } from 'antd';
import { InfoIcon } from 'app/icons';
import { DX } from 'app/models';
import React from 'react';

const END_CYCLE = 'END_CYCLE';

function ModalCostIncurredConfirm({
	showPopupCostIncurred,
	changeSubscription,
	currencyName,
	previewCost,
	mutationChangePack,
	onCancelEditCost,
	onConfirmEditCost,
}) {
	return (
		<Modal centered visible={showPopupCostIncurred} footer={null} closable={false} maskClosable={false}>
			<div className="flex justify-center mb-4">
				<InfoIcon width="w-12" className="block text-primary" />
			</div>
			<div className="text-center font-bold  mb-7">
				Chỉnh sửa thuê bao phát sinh số tiền cần thanh toán như sau, quý khách vui lòng xác nhận
			</div>

			{changeSubscription === END_CYCLE && (
				<div className="text-center italic mb-7">(Nội dung thay đổi sẽ được áp dụng vào kỳ tới)</div>
			)}

			{previewCost.costIncurred?.costIncurred.map((el, index) => (
				<div className="flex justify-between mb-3" key={`${index + 1}`}>
					<div>{el.itemName}:</div>
					<div>
						{DX.formatNumberCurrency(el.finalAmountPreTax)} {currencyName || 'VND'}
					</div>
				</div>
			))}

			<div className="flex justify-between pt-3 border-0 border-t border-solid border-gray-100">
				<div>Tổng phát sinh:</div>
				<div className="font-bold">
					{DX.formatNumberCurrency(previewCost.costIncurred?.totalFinalAmountPreTax)} {currencyName || 'VND'}
				</div>
			</div>

			<div className="flex justify-center gap-4 mt-12">
				<Button onClick={onCancelEditCost} disabled={mutationChangePack.isLoading} className="block">
					Hủy
				</Button>
				<Button
					onClick={onConfirmEditCost}
					type="primary"
					loading={mutationChangePack.isLoading}
					className="block"
				>
					Đồng ý
				</Button>
			</div>
		</Modal>
	);
}

export default ModalCostIncurredConfirm;
