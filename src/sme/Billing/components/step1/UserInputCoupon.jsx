import React from 'react';
import { Input, message, Spin, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import Proptypes from 'prop-types';
import { CouponSetItem, DX } from '../../../../app/models';
import { billingActions, billingSelects } from '../../redux/billingReducer';
import { useLng } from '../../../../app/hooks';
import { DISCOUNT_PERCENT, IN_PRICING, USER_TYPE_MODE } from '../../constant';

function UserInputCoupon({ couponType }) {
	const { tField, tOthers, tMessage } = useLng();
	const dispatch = useDispatch();
	const pricingId = useSelector(billingSelects.selectPricingId);
	const listCouponUserType = useSelector(billingSelects.selectListCouponUserType);

	let checkType = 1;
	if (couponType === IN_PRICING) {
		checkType = 1;
	} else {
		checkType = 2;
	}

	const [checkingCode, setStatusCheck] = React.useState(false);
	const [couponCode, setCouponCode] = React.useState('');
	const handleCheckCouponUserTyped = (couponCodeTyped, type) => {
		setStatusCheck(true);
		const checkCouponCodeExist = listCouponUserType
			.filter((item) => item.type === type)
			.some((item) => item.code === couponCodeTyped);
		if (checkCouponCodeExist) {
			message.warn(tMessage('existPromCode'));
			setStatusCheck(false);
		} else {
			CouponSetItem.checkCouponCode({ code: couponCodeTyped, pricingId, type: checkType })
				.then((response) => {
					setStatusCheck(false);
					console.log('data', response);
					if (!response) {
						message.error(tMessage('invalidPromCode'));
					} else {
						message.success(tMessage('validPromCode'));
						setCouponCode('');
						dispatch(
							billingActions.handleAddCouponUserTyped({
								...response,
								type: couponType,
								disabled: false,
								// checked: true,
								mode: USER_TYPE_MODE,
							}),
						);
						// dispatch(billingActions.handleCheckCouponOnPricing({ coupon: response, index: 100 }));
					}
				})
				.catch((e) => {
					setStatusCheck(false);
					console.log(e);
				});
		}
	};
	const handleRemoveCode = (coupon) => {
		dispatch(billingActions.handleRemoveCouponUserTyped(coupon));
	};
	return (
		<div>
			<div className="py-5 w-full flex justify-center justify-items-center align-middle items-center">
				<div className="flex-1 px-4 text-gray-80 font-medium">{tField('promCode')}</div>
				<div className="flex-1 px-4" />
				<div className="flex-1 px-4" />
				<Input className="flex-1 mr-8" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
				<Typography.Text
					className="flex-1 font-bold text-primary px-4 cursor-pointer"
					onClick={() => handleCheckCouponUserTyped(couponCode, couponType)}
				>
					{checkingCode ? <Spin /> : tMessage('apply')}
				</Typography.Text>
			</div>

			{/* Show các mã KM đã nhập */}
			{listCouponUserType.length !== 0 &&
				listCouponUserType
					.filter((x) => x.type === couponType)
					.map((item, index) => (
						<div className="py-5 w-full flex justify-center justify-items-center align-middle items-center">
							{index === 0 && <div className="flex-1 px-4 text-gray-80 font-bold">{tOthers('prom')}</div>}
							{index !== 0 && <div className="flex-1 px-4" />}
							<div className="flex-1 px-4" />
							<div className="flex-1 px-4" />
							<Typography.Text className="flex-1 font-bold text-primary px-4 text-right">
								{item?.couponSetName}
							</Typography.Text>
							<Typography.Text className="flex-1 font-bold px-4 text-red-600 text-right">
								{`Giảm ${
									// item.discountType === 0
									// 	? item?.discountValue
									// 	:
									DX.formatNumberCurrency(item?.discountValue)
								} ${item?.discountType === DISCOUNT_PERCENT ? ' %' : 'VND'}`}
							</Typography.Text>
							<div className="cursor-pointer">
								<DeleteOutlined onClick={() => handleRemoveCode(item)} />
							</div>
						</div>
					))}
		</div>
	);
}
UserInputCoupon.propTypes = {
	couponType: Proptypes.string.isRequired, // couponType : "in-pricing"|"in-addon-x"|"in-total"
};

export default UserInputCoupon;
