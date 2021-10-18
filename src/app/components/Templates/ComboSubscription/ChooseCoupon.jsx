import { Space, Button, message, Input } from 'antd';
import React, { useRef } from 'react';
import { useLng } from 'app/hooks';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';

function ChooseCoupon({
	typePortal = 'DEV',
	pricingDetail,
	type,
	changeCouponList,
	indexService,
	totalCoupon,
	typePop,
	totalAmountPreTax,
	addonsList,
	dataDetail = {},
	typeChange,
	CAN_UPDATE,
	checkAdmin,
	isOrderService,
	disabled,
	couponType,
	handelAddCoupon,
	smeInfo,
	price = 0,
	quantity,
	...args
}) {
	const { tField, tMessage } = useLng();
	const couponSetCodePri = useRef('');
	const TOTAL_SUBSCRIPTION = '5';

	function applyCoupon() {
		const code = couponSetCodePri.current?.input?.defaultValue;
		const companyId = smeInfo ? smeInfo[0].id : null;
		let addonIds = [];
		if (couponType === TOTAL_SUBSCRIPTION) {
			addonIds = addonsList.map((addon) => addon.id);
		}
		ComboSubscriptionDev.getCouponInfoByCouponCode(
			code,
			couponType,
			pricingDetail.id,
			companyId,
			price,
			quantity,
			typePortal,
			addonIds,
		)
			.then((response) => {
				if (response === null) {
					message.error(tMessage('err_check_coupon_code'));
					return;
				}

				handelAddCoupon(response);
			})
			.catch((err) => {
				console.log(err);
				message.error(tMessage('occurredErr'));
			});
	}

	return (
		<Space>
			<Input className="text-right" placeholder={tField('input_couponSet_code')} ref={couponSetCodePri} />
			<Button
				className="items-center primary"
				onClick={() => {
					applyCoupon();
				}}
				type="primary"
				disabled={disabled}
			>
				Áp dụng
			</Button>
		</Space>
	);
}

export default ChooseCoupon;
