import React from 'react';
import { Button, Table } from 'antd';
import { DX } from 'app/models';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { isEmpty, isNil } from 'opLodash';
import { billingActions } from 'sme/Billing/redux/billingReducer';
import { useDispatch } from 'react-redux';
import { useLng, useQueryUrl } from 'app/hooks';
import { useRouteMatch } from 'react-router-dom';
import RenderCouponList from '../RenderCouponList';
import UserInputCoupon from './UserInputCoupon';

const PRICING_PLAN = {
	FLAT_RATE: 'FLAT_RATE',
	UNIT: 'UNIT',
};

const PRICING = 'PRICING';

const AmountColumns = ({ amount, className }) => (
	<div className={`${className} text-right px-4 text-primary my-auto break-words`}>{amount}</div>
);

const USER_TYPE_MODE = 'user_type';

function ServicePackInfo({
	columns,
	data,
	showModalCalculation,
	haveTax,
	CheckComponent,
	allowEdit,
	dataSource,
	typeSubscription,
}) {
	// console.log('props receive', data);
	const { tButton, tField, tOthers, tMessage } = useLng();
	const dispatch = useDispatch();
	const { path } = useRouteMatch();
	const handleCheckCouponOnPricing = (index, coupon) => {
		dispatch(billingActions.handleCheckCouponOnPricing({ index, coupon }));
	};

	/*	const pricingId = useSelector(billingSelects.selectPricingId);
	const listCouponUserType = useSelector(billingSelects.selectListCouponUserType); */

	/* const [checkingCode, setStatusCheck] = React.useState(false);
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
			CouponSetItem.checkCouponCode({ code: couponCodeTyped, pricingId, type: 1 })
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
								type,
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
	}; */

	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');

	const couponTotal = data?.pricing?.invoiceCoupon?.map((item, index) => {
		const couponCheck = data.coupons.find((element) => element.couponId === item.id);
		if (couponCheck) {
			return { ...couponCheck, price: item.price };
		}
		return {};
	});
	// const fakeCouponsList = [
	// 	{
	// 		name: 'Km 11.11',
	// 		description: 'Giam 20%',
	// 	},
	// 	{
	// 		name: 'Km 12.12',
	// 		description: 'Giam 30%',
	// 	},
	// 	{
	// 		name: 'Km 9.9',
	// 		description: 'Giam 40%',
	// 	},
	// ];

	return (
		<>
			<Table
				columns={columns.filter((item) => !item.hide)}
				dataSource={dataSource || [{ id: 'default' }]}
				scroll={{ x: 600 }}
				rowKey="id"
				pagination={{ position: ['none'] }}
				className="mb-4 table-title"
			/>
			{data.pricingPlan && data.pricingPlan !== PRICING_PLAN.FLAT_RATE && data.pricingPlan !== PRICING_PLAN.UNIT && (
				<div className="py-2">
					<Button
						type="link"
						className="font-semibold text-gray-500 cursor-pointer"
						icon={<ExclamationCircleOutlined />}
						onClick={() => showModalCalculation(data.pricingId, data.pricingPlan, { typeSub: PRICING })}
					>
						{tButton('howToCalculate')}
					</Button>
				</div>
			)}

			{/* Các dịch vụ của combo */}
			{typeSubscription &&
				!isEmpty(data.comboPricingList) &&
				data.comboPricingList.map((item, index) => (
					<div
						className="align-element w-full flex border-0 border-b border-solid border-gray-100 border-opacity-40 py-4"
						key={`${item.couponId}${index + 1}`}
					>
						{/* Tên gói */}
						<div className="flex-1 ml-8 px-4">{item.pricingName}</div>

						{/* cột - Hiện trạng sử dụng */}
						<div style={{ width: '10%' }} className="px-4">
							{item.currentUsed}
						</div>

						{/* Số lượng miễn phí */}
						<div style={{ width: '10%' }} className="px-4">
							{item.freeQuantity}
						</div>

						{/* Số lượng */}
						<div style={{ width: '10%' }} className="px-4 text-right">
							{item.quantity} {item.unitName}
						</div>

						<div style={{ width: '20%' }} className="px-4" />

						{haveTax && <div style={{ width: '20%' }} className=" px-4" />}
					</div>
				))}

			{/* Mã khuyến mãi - couponList */}
			<div className="beauty-scroll wrap-pricing" style={{ maxHeight: '18rem' }}>
				{!isEmpty(data.couponList) &&
					data.couponList
						.filter((el) => el.mode !== USER_TYPE_MODE)
						.map((item, index) => (
							<div
								className="align-element w-full flex border-0 border-b border-solid border-gray-100 border-opacity-40 py-4"
								key={`${item.couponId}${index + 1}`}
							>
								<div className="w-2/5 px-4">
									<CheckComponent
										onChange={() => handleCheckCouponOnPricing(index, item)}
										className="checkbox-custom"
										coupon={item}
										type="in-pricing"
										disabled={item.disabled || (item.checked && path.indexOf('detail') !== -1)}
									>
										<RenderCouponList
											className="flex flex-col"
											item={item}
											currency={data.currencyName}
										/>
									</CheckComponent>
								</div>
								<div className="flex-1 px-4" />

								{/* không hiển thị số tiền KM trong tab chi tiết */}
								{(path.indexOf('detail') === -1 || getTab === '3') && (
									<>
										{/* cột - trước thuế */}
										<AmountColumns
											amount={
												!haveTax || isNil(item.pricingInfo?.price)
													? ''
													: DX.formatNumberCurrency(item.pricingInfo?.price)
											}
											className="flex-1"
										/>

										{/* cột - số tiền */}
										<AmountColumns
											amount={
												!haveTax && !isNil(item.pricingInfo?.price)
													? DX.formatNumberCurrency(item.pricingInfo?.price)
													: ''
											}
											className="flex-1"
										/>
									</>
								)}
							</div>
						))}
			</div>

			{/* Mã khuyến mãi tổng hóa đơn - couponList */}
			<div className="beauty-scroll wrap-pricing" style={{ maxHeight: '18rem' }}>
				{!isEmpty(couponTotal) &&
					couponTotal.map((item, index) => (
						<div
							className="align-element w-full flex border-0 border-b border-solid border-gray-100 border-opacity-40 py-4"
							key={`${item.couponId}${index + 1}`}
						>
							<div className="w-2/5 px-4">
								<RenderCouponList className="flex flex-col " item={item} currency={data.currencyName} />
							</div>
							<div className="flex-1 px-4" />

							<AmountColumns
								amount={!haveTax || isNil(item.price) ? '' : DX.formatNumberCurrency(item.price)}
								className="flex-1 font-bold"
							/>

							<AmountColumns
								amount={!haveTax && !isNil(item.price) ? DX.formatNumberCurrency(item.price) : ''}
								className="flex-1 font-bold"
							/>
						</div>
					))}
			</div>

			{/* Input nhap ma KM */}
			{/* <div className="py-5 w-full flex justify-center justify-items-center align-middle items-center">
				<div className="flex-1 px-4 text-gray-80 font-medium">{tField('promCode')}</div>
				<div className="flex-1 px-4" />
				<div className="flex-1 px-4" />
				<Input className="flex-1 mr-8" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
				<Typography.Text
					className="flex-1 font-bold text-primary px-4 cursor-pointer"
					onClick={() => handleCheckCouponUserTyped(couponCode, 'in-pricing')}
				>
					{checkingCode ? <Spin /> : tMessage('apply')}
				</Typography.Text>
			</div> */}

			{/* Show các mã KM đã nhập */}
			{/* {listCouponUserType.length !== 0 &&
				listCouponUserType
					.filter((x) => x.type === 'in-pricing')
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
								{`Giảm ${item?.discountValue} ${item?.discountType === 1 ? ' %' : 'VND'}`}
							</Typography.Text>
							<div className="cursor-pointer">
								<DeleteOutlined onClick={() => handleRemoveCode(item)} />
							</div>
						</div>
					))} */}
			<UserInputCoupon couponType="in-pricing" />
			{/* Thành tiền */}
			{(path.indexOf('detail') === -1 || getTab === '3') && (
				<div className="py-5 w-full flex">
					<div className="flex-1 px-4 text-gray-80 font-medium">{tField('totalMoney')}</div>
					<div className="flex-1 px-4" />
					<div className="flex-1 px-4" />
					<AmountColumns
						amount={haveTax ? DX.formatNumberCurrency(data.pricing?.finalAmountPreTax) : ''}
						className="flex-1 font-bold"
					/>
					<AmountColumns
						amount={
							haveTax
								? DX.formatNumberCurrency(data.pricing?.finalAmountAfterTax)
								: DX.formatNumberCurrency(data.pricing?.finalAmountPreTax)
						}
						className="flex-1 font-bold"
					/>
				</div>
			)}
			{/* Phí thiết lập - Chỉ hiển thị khi có phí thiết lập > 0 */}
			{data.pricing?.setupFee?.price > 0 && (
				<div className="py-5 w-full flex flex-wrap">
					<div className="flex-1 px-4">
						<span className="text-gray-80 font-medium">{tField('capitalExpenditure')}</span>
						{/* tạm thời check thuế phí thiết lập cho màn subscription detail là taxList */}
						{data.price !== 0 &&
							!isEmpty(data.taxList) &&
							data.taxList.map((item) => (
								<p className="mb-0 text-sm text-gray-40" key={`tax-${item.taxName}`}>
									{/* {item.hasTax === 'YES' || item.hasTax === 1
										? `${tOthers('included')} ${item?.percent}% ${tLowerField('tax')} ${
												item.taxName
										  }`
										: `${tOthers('notIncluded')} ${item?.percent}% ${item.taxName}`} */}
									{tOthers('notIncluded')} {item?.percent}% {item.taxName}
								</p>
							))}
					</div>

					<div className="flex-1 px-4" />
					<div className="flex-1 px-4" />
					{!haveTax && <div className="flex-1 px-4" />}
					<AmountColumns
						amount={DX.formatNumberCurrency(data.pricing?.setupFee.finalAmountPreTax)}
						className="flex-1 px-4 font-bold"
					/>
					{haveTax && (
						<AmountColumns
							amount={
								!isEmpty(data.pricing?.setupFee.taxes)
									? DX.formatNumberCurrency(data.pricing?.setupFee.finalAmountAfterTax)
									: DX.formatNumberCurrency(data.pricing?.setupFee.finalAmountPreTax)
							}
							className="flex-1 px-4 font-bold"
						/>
					)}
				</div>
			)}
		</>
	);
}

export default ServicePackInfo;
