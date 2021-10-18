import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, noop } from 'opLodash';
import PropTypes from 'prop-types';
import { Button, Dropdown, Menu, Tooltip, Select } from 'antd';
import styled from 'styled-components';
import { DX } from 'app/models';
import classNames from 'classnames';
import SmeSubscription from 'app/models/SmeSubscription';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { DropDownIcon, CheckIconAdmin } from 'app/icons';
import { useLng, useUser } from 'app/hooks';

const CYCLE_TYPE = {
	DAY: 'Ngày',
	WEEK: 'Tuần',
	MONTH: 'Tháng',
	YEAR: 'Năm',
	DAYLY: 'Ngày',
	WEEKLY: 'Tuần',
	MONTHLY: 'Tháng',
	YEARLY: 'Năm',
	DAILY: 'Ngày',
};

const ItemPrice = styled.div`
	box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
	&.recommend {
		position: relative;
		.recommend-title {
			position: absolute;
			top: -1.75rem;
			text-align: center;
			left: 0;
			width: 100%;
			color: white;
			background-color: #5bb98e;
			padding: 1rem;
			border-radius: 16px;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}
		.text-primary {
			color: #5bb98e !important;
		}
		.underline-primary {
			&::before {
				background-color: #5bb98e !important;
			}
		}
		.register-btn {
			background-color: #5bb98e !important;
			border-color: #5bb98e !important;
		}
	}
`;

const MenuItemDiv = styled(Menu.Item)`
	.text-primary {
		color: ${(props) => (props.recommended ? '#5bb98e !important' : '')};
	}
`;

const Title = styled.div`
	position: relative;
	&::before {
		position: absolute;
		background: var(--color-primary);
		border-radius: 16px;
		content: ' ';
		width: 3rem;
		height: 3px;
		bottom: 0;
	}
`;

const FeatureList = ({ features = [], loadMoreFeature, type, MAX_ELE }) => {
	const [showMore, setShowMore] = useState();
	const featureDisplay = showMore ? features : features.slice(0, MAX_ELE);
	const heightFeatures = 2.5 * MAX_ELE;
	const height = heightFeatures + 1;

	const renderTitle = (feature) => {
		if (feature.name) {
			return feature.name;
		}
		if (feature.quantity) {
			return `${feature.serviceName}:  ${feature.quantity} ${feature.unitName}`;
		}
		return feature.serviceName;
	};

	return (
		<div style={{ height: `${height}rem` }}>
			<div className="overflow-y-auto beauty-scroll small pr-0.5" style={{ height: `${heightFeatures}rem` }}>
				{featureDisplay.length > 0 &&
					featureDisplay.map((feature, index) => (
						<div key={`${index + 1}`} className="flex mb-4">
							<div>
								<CheckIconAdmin width="w-5" className="mr-2.5 text-primary" />
							</div>
							<div style={{ color: '#666666' }}>{renderTitle(feature)}</div>
						</div>
					))}
			</div>
			<div className="w-full text-center">
				{features.length > MAX_ELE && (
					<Button className="p-0 h-0" type="text" onClick={() => setShowMore(!showMore)}>
						<span className="font-semibold text-gray-900">{!showMore ? 'Xem thêm' : 'Rút gọn'}</span>&nbsp;
						{!showMore ? (
							<ArrowRightOutlined className="text-gray-900" />
						) : (
							<ArrowLeftOutlined className="text-gray-900" />
						)}
					</Button>
				)}
			</div>
		</div>
	);
};

const productCoupon = (coupons) => {
	const temp = [];
	coupons.map((el) => temp.push(el.serviceName));
	if (temp.length > 1) return temp.join(', ');
	return temp.join('');
};

function OptionPrice({
	className,
	funcBuyNow,
	funcTrialNow,
	options,
	idBought,
	key,
	haveTrial,
	loadMoreFeature,
	MAX_ELE,
	loadMoreCoupon,
	isOrderService,
}) {
	const { tLowerField } = useLng();
	const { user } = useUser();
	const [optionPaymentCycle, setOptionPaymentCycle] = useState([]);

	const CAN_REGISTER_TRIAL = DX.canAccessFuture2('sme/register-trial-subscription-combo', user.permissions);
	const CAN_REGISTER = DX.canAccessFuture2('sme/register-subscription-combo', user.permissions);

	const [itemPack, setItemPack] = useState(
		!isEmpty(options.pricingMultiplePeriods) ? options.pricingMultiplePeriods : options,
	);

	const getSelectPaymentCycle = (packMulti = []) => {
		const multiItem = [];
		packMulti.forEach((el) => {
			multiItem.push({
				value: el.idPricingPeriod,
				label: `${el.paymentCycle} ${CYCLE_TYPE[el.cycleType]}`,
			});
		});

		setOptionPaymentCycle([...multiItem]);
	};

	const {
		id,
		name,
		description,
		pricingMultiplePeriods,
		recommendStatus,
		featureList,
		comboPricings,
		allowSubscript,
		defaultCircle,
	} = options;

	const {
		price,
		pricingPlan,
		unit,
		currency,
		unitLimitedList,
		couponList,
		cycleType,
		paymentCycle,
		numberOfTrial,
		idPricingPeriod,
	} = { ...itemPack };

	const HandleSwitchPrice = ({ unitList = [] }) => {
		const LIMIT_ELE = 5;
		const [showUnit, setShowUnit] = useState();
		const unitDisplay = showUnit ? unitList : unitList.slice(0, LIMIT_ELE);

		switch (pricingPlan) {
			case 'FLAT_RATE':
			case 'UNIT':
				return (
					<div className="h-24 overflow-y-auto beauty-scroll small pr-0.5">
						<div className="font-bold text-lg leading-5">{currency.name}</div>
						<div
							className="font-semibold text-primary leading-10"
							style={{
								fontSize: '2.375rem',
							}}
						>
							{DX.formatNumberCurrency(price)}
						</div>
						<div
							className={classNames('font-bold', {
								hidden: pricingPlan === 'FLAT_RATE',
							})}
						>
							/{unit.name}
						</div>
					</div>
				);
			case 'TIER':
			case 'VOLUME':
			case 'STAIR_STEP':
				return (
					<>
						<div
							className="overflow-y-auto beauty-scroll small pr-0.5"
							style={{ height: unitLimitedList.length > LIMIT_ELE ? '4.5rem' : '6rem' }}
						>
							{unitDisplay.length > 0 &&
								unitDisplay.map((u, i) => (
									<div key={`${i + 1}`} className="flex justify-between">
										<span>
											{u.unitFrom} - {u.unitTo || 'Không giới hạn'}
										</span>
										<span className="font-semibold text-primary text-right">
											{DX.formatNumberCurrency(u.price)} {`${currency.name}/${unit.name}`}
										</span>
									</div>
								))}
						</div>

						<div className="w-full text-center">
							{unitLimitedList.length > LIMIT_ELE && (
								<Button className="p-0 h-0" type="text" onClick={() => setShowUnit(!showUnit)}>
									<span className="font-semibold text-gray-900">
										{!showUnit ? 'Xem thêm' : 'Rút gọn'}
									</span>
									&nbsp;
									{!showUnit ? (
										<ArrowRightOutlined className="text-gray-900" />
									) : (
										<ArrowLeftOutlined className="text-gray-900" />
									)}
								</Button>
							)}
						</div>
					</>
				);
			case 'COMBO':
				return (
					<div className="min-h-24 pr-0.5">
						<div className="font-bold text-lg leading-5">{currency.name}</div>
						<div
							className="font-semibold text-primary leading-10"
							style={{
								fontSize: '2.375rem',
							}}
						>
							{DX.formatNumberCurrency(price)}
						</div>
						{unit.name && <div className="font-bold">/{unit.name}</div>}
					</div>
				);
			default:
				return <div className="min-h-24">...</div>;
		}
	};

	const handleToolTip = (ele) => {
		const discount = ele.text;

		if (ele.promotionType !== 'PRODUCT') {
			if (ele.pricingType !== 'NONE' && ele.addonType === 'NONE') {
				return <span>{discount} trên gói dịch vụ</span>;
			}
			if (ele.addonType !== 'NONE' && ele.pricingType === 'NONE') {
				return <span>{discount} trên dịch vụ bổ sung</span>;
			}
			return <span>{discount} trên tổng hóa đơn</span>;
		}

		return (
			!isEmpty(ele.pricing) && (
				<span>
					Khuyến mại {productCoupon(ele.pricing)} thời gian từ {ele.startDate} đến{' '}
					{ele.endDate || 'Vô thời hạn'}
				</span>
			)
		);
	};

	useEffect(() => {
		if (!isEmpty(pricingMultiplePeriods)) {
			pricingMultiplePeriods.forEach((el) => {
				if (defaultCircle === el.idPricingPeriod) {
					setItemPack(el);
				}
			});
			getSelectPaymentCycle(pricingMultiplePeriods);
		} else setOptionPaymentCycle([{ value: id, label: `${paymentCycle} ${CYCLE_TYPE[cycleType]}` }]);
	}, []);

	const onSelectPaymentCycle = (value) => {
		if (!isEmpty(pricingMultiplePeriods))
			pricingMultiplePeriods.forEach((el) => {
				if (value === el.idPricingPeriod) setItemPack(el);
			});
	};

	const couponItems = useMemo(
		() =>
			couponList?.map((ele) => ({
				...ele,
				text: `${
					ele.promotionType !== 'PRODUCT' && ele.discountValue > 0
						? `Giảm ${
								ele.discountType === 'PERCENT'
									? `${ele.discountValue}%`
									: `${DX.formatNumberCurrency(ele.discountValue)} ${currency.name}`
						  }`
						: !isEmpty(ele.pricing) && productCoupon(ele.pricing)
				}`,
			})),
		[idPricingPeriod],
	);

	const menuCoupons = (
		<Menu className="max-h-96 beauty-scroll overflow-y-auto">
			{couponItems?.map((ele) => (
				<MenuItemDiv recommended={recommendStatus === 'YES'}>
					<Tooltip placement="topRight" title={handleToolTip(ele)}>
						<div
							className="whitespace-pre text-sm py-1 px-2 text-primary font-bold truncate"
							style={{ maxWidth: '16rem' }}
						>
							{ele.text}
						</div>
					</Tooltip>
				</MenuItemDiv>
			))}
		</Menu>
	);

	return (
		<ItemPrice
			className={`${className} ${
				recommendStatus === 'YES' ? 'recommend' : ''
			} flex flex-col rounded-2xl bg-white`}
			style={{ minHeight: '40rem' }}
			key={key}
		>
			{recommendStatus === 'YES' && (
				<div className="font-semibold text-sm uppercase absolute top-3 recommend-title">Khuyên dùng</div>
			)}
			<Title className="text-primary underline-primary w-full pb-3 font-bold text-lg uppercase mb-4 truncate">
				{name}
			</Title>
			<div className="mb-7 text-sm w-full min-h-24">{description}</div>

			{!!pricingPlan && <HandleSwitchPrice unitList={unitLimitedList} />}

			<div
				className="flex justify-between my-4 py-2 items-center"
				style={{
					borderTop: '1px solid rgba(0, 0, 0, 0.06)',
					borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
				}}
			>
				{price !== 0 ? (
					<>
						<div>Chu kỳ thanh toán:</div>
						<div className="text-primary font-bold">
							{!!cycleType &&
								!!paymentCycle &&
								(options?.numberOfCycles === 1 ? (
									<span>1 {tLowerField('times')}</span>
								) : (
									<Select
										className="text-primary text-base font-bold"
										defaultValue={defaultCircle}
										onChange={onSelectPaymentCycle}
										options={optionPaymentCycle}
										bordered={false}
										suffixIcon={
											!isEmpty(optionPaymentCycle) &&
											optionPaymentCycle.length > 1 && (
												<DropDownIcon className="w-4 text-primary leading-none" />
											)
										}
									/>
								))}
						</div>
					</>
				) : (
					<span>&nbsp;</span>
				)}
			</div>

			{couponItems?.length > 0 ? (
				<div className="flex justify-between h-10">
					<div className="w-5/12">
						<span>Khuyến mại</span>
					</div>
					<div className="w-7/12">
						<Dropdown overlay={menuCoupons} placement="bottomRight" trigger={['hover', 'click']}>
							<span className="text-primary font-bold w-full flex justify-end">
								<p className="truncate mb-0">{couponItems[0].text}</p>
								<DropDownIcon className="ml-2 w-4 text-xl leading-none" />
							</span>
						</Dropdown>
					</div>
				</div>
			) : (
				<>{loadMoreCoupon && <div className="h-10" />}</>
			)}

			<div className="flex gap-4 mb-6">
				{(CAN_REGISTER_TRIAL || !user.id) && !!numberOfTrial && !idBought && !isOrderService && (
					<Button
						type="default"
						block
						onClick={() => funcTrialNow(id, numberOfTrial)}
						disabled={allowSubscript === SmeSubscription.notAllowSubscript || haveTrial}
					>
						Dùng thử
					</Button>
				)}

				{(CAN_REGISTER || !user.id) && (
					<Button
						type={recommendStatus === 'YES' ? 'primary' : 'default'}
						block
						className="register-btn"
						onClick={() => funcBuyNow(id, idPricingPeriod)}
						disabled={idBought ? idBought === id : allowSubscript !== SmeSubscription.allowSubscript}
					>
						Đăng ký
					</Button>
				)}
			</div>
			<FeatureList features={featureList} loadMoreFeature={loadMoreFeature} MAX_ELE={MAX_ELE} />
			{!!comboPricings?.length && (
				<div>
					<div className="mb-3 mt-6">
						<span className="font-semibold text-base uppercase" style={{ color: '#546E7A' }}>
							Các gói trong combo
						</span>
					</div>
					<FeatureList features={comboPricings} type="pricing" MAX_ELE={MAX_ELE} />
				</div>
			)}
		</ItemPrice>
	);
}

OptionPrice.propTypes = {
	className: PropTypes.string,
	options: PropTypes.objectOf(PropTypes.object),
	funcBuyNow: PropTypes.func,
	funcTrialNow: PropTypes.func,
};
OptionPrice.defaultProps = {
	className: '',
	options: {},
	funcBuyNow: noop,
	funcTrialNow: noop,
};

export default OptionPrice;
