import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import { QuestionIcon } from 'app/icons';
import { useLng } from 'app/hooks';
import { noop } from 'opLodash';

function PopupModal({ visibleModal, setVisibleModal, isLoading, onClickSuccess, subscriptionTrial }) {
	const { tOthers, tButton } = useLng();
	return (
		<>
			{/* Pop-up xác nhận thanh toán */}
			<Modal
				visible={visibleModal}
				onCancel={() => setVisibleModal(false)}
				footer={null}
				closable={false}
				bodyStyle={{ padding: '2rem 4.375rem' }}
				maskClosable={false}
			>
				<div className="justify-center flex mb-4">
					<QuestionIcon width="w-12" className="inline-block text-primary" />
				</div>
				<h4 className=" text-center text-base font-semibold mb-2.5">
					{subscriptionTrial ? 'Xác nhận' : tOthers('payment')}
				</h4>
				<p className="text-center text-sm mb-5">
					{subscriptionTrial ? 'Bạn có chắc muốn đăng ký dùng thử?' : tOthers('wanToPayThisService')}
				</p>
				<div className="flex gap-8">
					<Button
						className="uppercase flex justify-center items-center text-sm"
						onClick={() => {
							setVisibleModal(false);
						}}
						block
					>
						{tButton('opt_cancel')}
					</Button>
					<Button
						className="uppercase flex justify-center items-center text-sm"
						onClick={onClickSuccess}
						block
						type="primary"
						loading={isLoading}
					>
						{tButton('opt_confirm')}
					</Button>
				</div>
			</Modal>
		</>
	);
}
PopupModal.propTypes = {
	visibleModal: PropTypes.bool,
	isLoading: PropTypes.bool,
	setVisibleModal: PropTypes.func,
	onClickSuccess: PropTypes.func,
};
PopupModal.defaultProps = {
	visibleModal: false,
	isLoading: false,
	setVisibleModal: noop,
	onClickSuccess: noop,
};
export default PopupModal;
