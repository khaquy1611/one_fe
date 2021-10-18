import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { isEmpty, uniqBy } from 'opLodash';
import { DX } from 'app/models';
import { useHistory } from 'react-router-dom';

function ErrorPopupExists({
	billingInfo,
	setNumError,
	numError,
	serviceId,
	dataCheckExist,
	setShowPopupNotExist,
	visible,
	subscriptionData,
	setCurrent,
}) {
	const history = useHistory();

	// Show non-existent name of Addon
	const addonListNotExist = () => {
		const addonNotExist = dataCheckExist?.addons.filter((item) => item.isExisted === 'NO');
		return addonNotExist.map((item) => item.name).join(', ');
	};

	// Show non-existent name of Pricing
	const pricingListNotExist = () => {
		const pricingNotExist = dataCheckExist?.pricingsInCombo?.filter((item) => item.isExisted === 'NO');
		return pricingNotExist.map((item) => item.name).join(', ');
	};

	// Show non-existent name of Coupon
	const couponListNotExist = () => {
		const uniqCouponNotExists = uniqBy(dataCheckExist?.coupons, 'id');
		return uniqCouponNotExists
			.map((item) => {
				if (item.isExisted === 'NO') {
					if (item.promotionType === 'PRODUCT') {
						return item?.pricings?.map((element) => ` ${element.serviceName} - ${element.pricingName}`);
					}
					if (item.discountType === 'PERCENT') {
						return `giảm ${item.discountValue}%`;
					}
					return `giảm ${DX.formatNumberCurrency(item.discountValue)} ${billingInfo.currencyName}`;
				}
				return null;
			})
			.filter((item) => !!item)
			.join(', ');
	};

	// Handle when the error is accepted by the user
	const resetServicePackForm = (noPricing, noComboPlan) => {
		if (noPricing || noComboPlan) {
			// go back list pack service
			noPricing && history.push(DX.sme.createPath(`/service/${serviceId}?tab=3`));
			// go back list pack service
			noComboPlan && history.push(DX.sme.createPath(`/combo/${serviceId}?tab=3`));
		} else if ((!noPricing && isEmpty(subscriptionData)) || (!noComboPlan && isEmpty(subscriptionData))) {
			setShowPopupNotExist(false);
			// reset data
			setNumError(numError + 1);
		} else {
			// go back step 1
			setCurrent(0);
			setShowPopupNotExist(false);
			// reset data
			setNumError(numError + 1);
		}
	};

	return (
		<Modal visible={visible} closable={false} maskClosable={false} footer={null} width={480}>
			<div>
				<div className="flex flex-col justify-center items-center">
					<span className="mb-3">
						<CloseCircleOutlined className="mx-auto" style={{ color: '#ff4d4f', fontSize: '3.125rem' }} />
					</span>
					<div className="font-semibold text-xl mb-4">Đã có lỗi xảy ra</div>
				</div>

				{/* service */}
				{dataCheckExist?.noPricing || dataCheckExist?.noComboPlan ? (
					<span className="text-base font-medium">
						Gói {dataCheckExist?.noPricing ? 'dịch vụ' : 'combo dịch vụ'}{' '}
						{isEmpty(dataCheckExist.comboPlans) ? '' : dataCheckExist?.comboPlans[0]?.name}{' '}
						{isEmpty(dataCheckExist.pricings) ? '' : dataCheckExist?.pricings[0].name} không hoạt động.
					</span>
				) : (
					<>
						{(dataCheckExist?.noAddon || dataCheckExist?.noCoupon || dataCheckExist?.noPricingCombo) && (
							<div className="flex flex-col">
								{dataCheckExist?.noAddon && (
									<span className="text-base font-medium mb-2">
										Dịch vụ bổ sung: {addonListNotExist()} không hoạt động.
									</span>
								)}

								{dataCheckExist?.noPricingCombo && (
									<span className="text-base font-medium mb-2">
										Gói dịch vụ: {pricingListNotExist()} không hoạt động.
									</span>
								)}
								{dataCheckExist?.noCoupon && (
									<span className="text-base font-medium">
										Khuyến mại {couponListNotExist()} không hoạt động.
									</span>
								)}
							</div>
						)}
					</>
				)}

				<div className="mt-6 flex flex-row-reverse">
					<Button
						className="mx-auto"
						type="primary"
						onClick={() => resetServicePackForm(dataCheckExist?.noPricing, dataCheckExist?.noComboPlan)}
					>
						Đồng ý
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default ErrorPopupExists;
