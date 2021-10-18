/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
import React from 'react';
import { ComboSME, SMESubscription } from 'app/models';
import { useQuery } from 'react-query';
import { isArray as _isArray, isEmpty } from 'opLodash';
import { Button, Spin } from 'antd';
import Flicking from '@egjs/react-flicking';
import { useFlicking } from 'app/hooks';
import { useSelector } from 'react-redux';
import { appSelects } from 'actions';
import clsx from 'clsx';
import SmeSubscription from 'app/models/SmeSubscription';
import OptionPrice from './OptionPrice';

const Arrow = () => (
	<svg width="16" height="16" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M5.17205 6.99999L0.222046 2.04999L1.63605 0.635986L8.00005 6.99999L1.63605 13.364L0.222046 11.95L5.17205 6.99999Z"
			fill="currentColor"
		/>
	</svg>
);
const ServicePack = ({ onBuyNow, funcTrialNow, bought, idURL, idBought, typeScreen, isOrderService }) => {
	const MAX_ELE = typeScreen === 'COMBO' ? 3 : 5;
	const { settings, renderPagination, next, prev } = useFlicking();

	const { data: dataPackage, isFetching } = useQuery(
		['getServicePack', idURL],
		async () => {
			const res = await SMESubscription.customizeGetServicePackage(idURL);
			if (!_isArray(res.language)) {
				res.language = [res.language || '0'];
			}
			let loadMoreFeature = false;
			let loadMoreCoupon = false;

			res.forEach((el) => {
				el.defaultCircle = el.id;
				if (!loadMoreFeature && el.featureList?.length > MAX_ELE) loadMoreFeature = true;
				if (!loadMoreCoupon && el.couponList?.length > 0) loadMoreCoupon = true;
				if (!isEmpty(el.pricingMultiplePeriods))
					el.pricingMultiplePeriods.forEach((e) => {
						if (e.defaultCircle === 'YES') el.defaultCircle = e.idPricingPeriod;
					});
			});

			return {
				data: [...res],
				loadMoreFeature,
				loadMoreCoupon,
			};
		},
		{
			initialData: { data: [] },
			enabled: !!idURL && typeScreen !== 'COMBO',
		},
	);
	const { data: dataPackageCombo, isFetching: comboIsFetching } = useQuery(
		['getServicePackCombo', idURL],
		async () => {
			const { data } = await ComboSME.getServicePackCombo(idURL);
			let loadMoreFeature = false;
			let loadMoreCoupon = false;
			const res = data.map((el) => {
				el.couponList = el.coupons;
				delete el.coupons;
				el.currency = { name: 'VND' };
				el.unit = { name: el.unitName };
				el.featureList = el.features;
				delete el.features;
				el.cycleType = el.periodType;
				delete el.periodType;
				el.paymentCycle = el.periodValue;
				delete el.periodValue;
				el.pricingPlan = 'COMBO';
				el.defaultCircle = el.id;
				if (!loadMoreFeature && el.featureList?.length > MAX_ELE) loadMoreFeature = true;
				if (!loadMoreCoupon && el.couponList?.length > 0) loadMoreCoupon = true;

				return el;
			});

			return {
				data: [...res],
				loadMoreFeature,
				loadMoreCoupon,
			};
		},
		{
			initialData: { data: [] },
			enabled: !!idURL && typeScreen === 'COMBO',
		},
	);
	const { isMobile, isTablet } = useSelector(appSelects.selectSetting);

	const packages = (typeScreen === 'COMBO' ? dataPackageCombo.data : dataPackage.data).filter(
		(item) => item.id !== idBought,
	);
	if (!packages.length) {
		return null;
	}
	const loadMoreFeature = typeScreen === 'COMBO' ? dataPackageCombo.loadMoreFeature : dataPackage.loadMoreFeature;
	const loadMoreCoupon = typeScreen === 'COMBO' ? dataPackageCombo.loadMoreCoupon : dataPackage.loadMoreCoupon;
	const haveTrial = packages.some((item) => item.versionSubscription === SmeSubscription.trialIsAllowed);
	const canNotMove =
		packages.length === 1 ||
		(packages.length === 2 && isTablet) ||
		(packages.length <= 3 && !isMobile && !isTablet);

	if (isFetching || comboIsFetching) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	if (canNotMove) {
		return (
			<div className="flex justify-center">
				{packages.map((item, index) => (
					<div className="w-1/3 tablet:w-1/2 mobile:w-full pt-4 px-4 mobile:px-2" key={`${index + 1}`}>
						<OptionPrice
							options={item}
							className="p-8 relative my-6 text-base"
							funcBuyNow={onBuyNow}
							funcTrialNow={funcTrialNow}
							bought={bought}
							idBought={idBought}
							key={`${item.id}${index + 1}`}
							haveTrial={haveTrial}
							loadMoreFeature={loadMoreFeature}
							loadMoreCoupon={loadMoreCoupon}
							MAX_ELE={MAX_ELE}
							isOrderService={isOrderService}
						/>
					</div>
				))}
			</div>
		);
	}

	return (
		<>
			<div className="max-w-7xl mx-auto relative w-full">
				<div className="absolute top-1/2 -translate-y-1/2 mobile:hidden -left-6">
					<span className="transform rotate-180 inline-block">
						<Button className="px-0" type="text" onClick={prev}>
							<Arrow />
						</Button>
					</span>
				</div>
				<Flicking {...settings} circular align="prev" className="w-full">
					{packages.map((item, index) => (
						<div className="w-1-3 tablet:w-1/2 mobile:w-full pt-4 px-4 mobile:px-2" key={item.id}>
							<OptionPrice
								options={item}
								className="p-8 relative my-6 text-base"
								funcBuyNow={onBuyNow}
								funcTrialNow={funcTrialNow}
								bought={bought}
								idBought={idBought}
								key={`${item.id}${index + 1}`}
								haveTrial={haveTrial}
								loadMoreFeature={loadMoreFeature}
								loadMoreCoupon={loadMoreCoupon}
								MAX_ELE={MAX_ELE}
								isOrderService={isOrderService}
							/>
						</div>
					))}
				</Flicking>
				<div className="absolute -right-7 top-1/2 -translate-y-1/2 mobile:hidden">
					<Button type="text" className="px-0" onClick={next}>
						<Arrow />
					</Button>
				</div>
			</div>
			{((isMobile && packages.length > 1) || (isTablet && packages.length > 2) || packages.length > 3) && (
				<div className="text-center">{renderPagination(packages.length)}</div>
			)}
		</>
	);
};

export default ServicePack;
