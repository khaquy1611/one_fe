import React, { useEffect, useState } from 'react';
import ChartCommon from 'app/CommonChart/ChartCommon';
import ServicePricingDetail from './ServicePricingDetail';
import { totalServicesByStatusApprove } from '../dashboard-data/ServiceAndPricing/totalServiceByStatusApprove';
import { totalPricingByStatusApprove } from '../dashboard-data/ServiceAndPricing/PricingStatusApprove';
import { totalSubcriptionByPricing } from '../dashboard-data/ServiceAndPricing/TotalSubcriptionByPricing';
import { topRatedService } from '../dashboard-data/ServiceAndPricing/TopRatedService';
import ListCard from './ListCard';
import DecisionBubbles from '../../../app/CommonChart/DecisionBubbles';
import { services } from '../dashboard-data/ServiceAndPricing/services';
import { newServiceRate } from '../dashboard-data/ServiceAndPricing/newServiceRate';
import { totalServicesByTime } from '../dashboard-data/ServiceAndPricing/totalServicesByTime';
import { serviceAverageRateData } from '../dashboard-data/ServiceAndPricing/serviceAverageRateData';
import { topTenServiceData } from '../dashboard-data/ServiceAndPricing/topTenServiceData';

function ServicePricingWrap({ serviceStatusData }) {
	const breadcrumbs = [
		{
			name: 'app.categories.report',
			url: '',
		},
		{
			name: 'app.categories.reportServicePricing',
			url: '',
		},
	];
	const options = [
		{
			count: 20,
			footer: [
				{ name: 'Chờ duyệt', value: 5 },
				{ name: 'Đã duyệt', value: 5 },
				{ name: 'Chưa duyệt', value: 5 },
				{ name: 'Từ chối', value: 5 },
			],
		},
		{
			count: 20,
			footer: [
				{ name: 'Đang bán', value: 5 },
				{ name: 'Chưa bán', value: 15 },
			],
		},
		{
			count: 20,
			footer: [
				{ name: 'Chờ duyệt', value: 5 },
				{ name: 'Đã duyệt', value: 5 },
				{ name: 'Chưa duyệt', value: 5 },
				{ name: 'Từ chối', value: 5 },
			],
		},
		{
			count: 4.5,
			footer: [],
		},
	];
	const [serivceStatus, setServiceStatus] = useState();
	const renderSerivceStatus = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'serviceStatusChart',
			data,
			serivceStatus,
			setServiceStatus,
			'Tổng số dịch vụ',
			'',
		);
	};

	const [serviceStatusChange, setServiceStatusChange] = useState('total');

	useEffect(() => {
		renderSerivceStatus(totalServicesByStatusApprove[serviceStatusChange]);
	}, [serviceStatusChange]);

	// subcription
	const [pricingStatus, setPricingStatus] = useState();

	const renderPricingStatus = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'pricingStatusChart',
			data,
			pricingStatus,
			setPricingStatus,
			'Tổng số gói dịch vụ',
			'',
		);
	};

	const [pricingStatusChange, setPricingStatusChange] = useState('total');
	useEffect(() => {
		renderPricingStatus(totalPricingByStatusApprove[pricingStatusChange]);
	}, [pricingStatusChange]);

	// Total subcription by pricing
	const [subPricing, setSubPricing] = useState();

	const renderSubcriptionByPricing = (data) => {
		ChartCommon.renderGroupColumnChart(
			'type',
			'value',
			'pricing',
			'subcriptionByPricing',
			data,
			subPricing,
			setSubPricing,
		);
	};

	const [subPricingChange, setSubPricingChange] = useState(1);

	useEffect(() => {
		renderSubcriptionByPricing(totalSubcriptionByPricing.month[subPricingChange]);
	}, [subPricingChange]);

	// Top Rated service
	const [rateServiceState, setRateService] = useState();

	const renderTopRatedService = (data) => {
		ChartCommon.renderHorizontalChart(
			'value',
			'type',
			'topRatedServiceChart',
			data,
			rateServiceState,
			setRateService,
			5,
			600,
		);
	};

	const [rateServiceStateChange, setRateServiceChange] = useState(1);

	useEffect(() => {
		renderTopRatedService(topRatedService.month[rateServiceStateChange]);
	}, [rateServiceStateChange]);

	const [totalServiceByDevChange, setTotalServiceByDevChange] = useState('all');
	const [totalServiceByDev, setTotalServiceByDev] = useState();
	useEffect(() => {
		setTotalServiceByDev(DecisionBubbles('containerService', services[totalServiceByDevChange], totalServiceByDev));
	}, [totalServiceByDevChange]);

	//  Average rate service
	const [newServicePercentage, setNewServicePercentage] = useState();

	const renderNewServicePercentage = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'newServicePercentage',
			data,
			newServicePercentage,
			setNewServicePercentage,
			'Tổng số dịch vụ được tạo mới',
			'',
		);
	};

	const [newServicePercentageChange, setNewServicePercentageChange] = useState(1);

	useEffect(() => {
		renderNewServicePercentage(newServiceRate.month[newServicePercentageChange]);
	}, [newServicePercentageChange]);

	// Top Rated service
	const [serviceAverageRate, setServiceAverageRate] = useState();

	const renderServiceAverageRate = (data) => {
		ChartCommon.renderHorizontalChart(
			'value',
			'type',
			'serviceAverageRateChart',
			data,
			serviceAverageRate,
			setServiceAverageRate,
			5,
			1280,
		);
	};

	const [serviceAverageRateChange, setServiceAverageRateChange] = useState(1);

	useEffect(() => {
		renderServiceAverageRate(serviceAverageRateData.month[serviceAverageRateChange]);
	}, [serviceAverageRateChange]);

	// Top Rated service
	const [topTenService, setTopTenService] = useState();

	const renderTopTenService = (data) => {
		ChartCommon.renderHorizontalChart(
			'value',
			'type',
			'topTenService',
			data,
			topTenService,
			setTopTenService,
			5,
			600,
		);
	};

	const [topTenServiceChange, setTopTenServiceChage] = useState(1);

	useEffect(() => {
		renderTopTenService(topTenServiceData.month[topTenServiceChange]);
	}, [topTenServiceChange]);

	// Top Rated service
	const [totalServiceByTime, setTotalServiceByTime] = useState();

	const renderTotalServiceByTime = (data) => {
		ChartCommon.renderVerticalColumnChart(
			'type',
			'value',
			'totalServiceByTime',
			data,
			'',
			totalServiceByTime,
			setTotalServiceByTime,
			'#389EFE',
			'',
			'',
		);
	};

	const [totalServiceByTimeChange, setTotalServiceByTimeChange] = useState(1);

	useEffect(() => {
		renderTotalServiceByTime(totalServicesByTime.month[totalServiceByTimeChange]);
	}, [totalServiceByTimeChange]);

	return (
		<div>
			<ListCard options={options} />
			<ServicePricingDetail
				breadcrumbs={breadcrumbs}
				serviceStatusChange={serviceStatusChange}
				setServiceStatusChange={setServiceStatusChange}
				pricingStatusChange={pricingStatusChange}
				setPricingStatusChange={setPricingStatusChange}
				subPricingChange={subPricingChange}
				setSubPricingChange={setSubPricingChange}
				rateServiceStateChange={rateServiceStateChange}
				setRateServiceChange={setRateServiceChange}
				totalServiceByDevChange={totalServiceByDevChange}
				setTotalServiceByDevChange={setTotalServiceByDevChange}
				newServicePercentageChange={newServicePercentageChange}
				setNewServicePercentageChange={setNewServicePercentageChange}
				serviceAverageRateChange={serviceAverageRateChange}
				setServiceAverageRateChange={setServiceAverageRateChange}
				topTenServiceChange={topTenServiceChange}
				setTopTenServiceChage={setTopTenServiceChage}
				totalServiceByTimeChange={totalServiceByTimeChange}
				setTotalServiceByTimeChange={setTotalServiceByTimeChange}
			/>
		</div>
	);
}

export default ServicePricingWrap;
