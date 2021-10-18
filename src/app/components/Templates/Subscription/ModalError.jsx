import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'antd/lib/modal/Modal';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { uniqBy } from 'opLodash';

function checkAlertPopup(e, couponArr, id) {
	let arrFilter = '';

	const arr = e.message
		.replace(/\|/g, ',')
		.replace(' deleted.', '')
		.replace(' inactive.', '')
		.replace(' not found.', '')
		.replace(' invalid', '')
		.replace('Coupon ', '')
		.replace('Addon ', '')
		.replace('Duplicate ', '')
		.replace(' pricing not found.', '')
		.replace('Service ', '')
		.replace(' invalid.', '')
		.replace('[', '')
		.replace('] addon were duplicate')
		.replace('Addons with names ')
		.replace(' in used')
		.split(',');

	arr.forEach((el) => {
		arrFilter = couponArr.filter((value) => value[id] === parseInt(el, 10));
	});

	return arrFilter;
}

function ModalError({ e, couponArr, id }) {
	console.log(checkAlertPopup(e, couponArr, id));
	console.log('aaaaaaaaaa');

	// const couponListNotExist = () => {
	// 	const uniqCouponNotExists = uniqBy(dataCheckExist?.coupons, 'id');
	// 	return uniqCouponNotExists
	// 		.map((item) => {
	// 			if (item.isExisted === 'NO') {
	// 				if (item.promotionType === 'PRODUCT') {
	// 					return item?.pricings?.map((element) => ` ${element.serviceName} - ${element.pricingName}`);
	// 				}
	// 				if (item.discountType === 'PERCENT') {
	// 					return `giảm ${item.discountValue}%`;
	// 				}
	// 				return `giảm ${DX.formatNumberCurrency(item.discountValue)} ${billingInfo.currencyName}`;
	// 			}
	// 			return null;
	// 		})
	// 		.filter((item) => !!item)
	// 		.join(', ');
	// };
	return (
		<div>aaa</div>
		// <Modal visible closable={false} maskClosable={false} footer={null} width={480}>
		// 	<div>
		// 		<div className="flex flex-col justify-center items-center">
		// 			<span className="mb-3">
		// 				<CloseCircleOutlined className="mx-auto" style={{ color: '#ff4d4f', fontSize: '3.125rem' }} />
		// 			</span>
		// 			<div className="font-semibold text-xl mb-4">Đã có lỗi xảy ra</div>
		// 		</div>

		// 		{/* service */}

		// 		<>
		// 			<div className="flex flex-col">
		// 				<span className="text-base font-medium">
		// 					{/* Khuyến mại {couponListNotExist()} không hoạt động. */}
		// 				</span>
		// 			</div>
		// 		</>

		// 		<div className="mt-6 flex flex-row-reverse">
		// 			<Button
		// 				className="mx-auto"
		// 				type="primary"
		// 				// onClick={() => resetServicePackForm(dataCheckExist?.noPricing, dataCheckExist?.noComboPlan)}
		// 			>
		// 				Đồng ý
		// 			</Button>
		// 		</div>
		// 	</div>
		// </Modal>
	);
}

export default ModalError;
