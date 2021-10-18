import { Column } from '@antv/g2plot';
import { revenueCate } from 'admin/DashBoard/dashboard-data/SubBill/revenueCate';
import { revenueServiceChangeTime } from 'admin/DashBoard/dashboard-data/SubBill/revenueService';
import ChartCommon from 'app/CommonChart/ChartCommon';
import React, { useEffect, useState } from 'react';
import { newSupService } from '../../../admin/DashBoard/dashboard-data/SubBill/newSupService';
import { statusBill } from '../../../admin/DashBoard/dashboard-data/SubBill/statusBill';
import { totalCusSup } from '../../../admin/DashBoard/dashboard-data/SubBill/totalCusSup';
import { totalCustomerUnSup } from '../../../admin/DashBoard/dashboard-data/SubBill/totalCustomerUnSup';
import SubBill from './SubBill';

function SubBillSerivce() {
	const [unSup, setUnSup] = useState();
	const month = 'month';
	const [changeUnsup, setChangeUnsup] = useState(1);
	function handleChangeUnsup(value) {
		setChangeUnsup(value);
	}

	const renderUnSup = (data) => {
		ChartCommon.renderVerticalColumnChart(
			'name',
			'account',
			'unsupcription',
			data,
			month,
			unSup,
			setUnSup,
			'#369CFB',
			'Ngày',
			'',
		);
	};
	useEffect(() => {
		renderUnSup(totalCustomerUnSup.month[changeUnsup]);
	}, [changeUnsup]);
	const [bar, setBar] = useState();

	const [change, setChange] = useState(1);
	function handleChange(value) {
		setChange(value);
	}
	const renderBar = (data) => {
		ChartCommon.renderVerticalColumnChart(
			'name',
			'account',
			'111',
			data,
			month,
			bar,
			setBar,
			'#32C7C7',
			'Ngày',
			'',
		);
	};
	useEffect(() => {
		renderBar(totalCusSup.month[change]);
	}, [change]);

	const [dual, setDual] = useState();
	const [changeDual, setChangeDual] = useState(1);
	function handleChangeDual(value) {
		setChangeDual(value);
	}
	const renderDual = (data) => {
		ChartCommon.renderMultiLineChart('date', 'value', 'dual', data, month, dual, setDual);
	};
	useEffect(() => {
		renderDual(newSupService.month[changeDual]);
	}, [changeDual]);

	const [rec, setRec] = useState();
	const [changeRec, setChangeRec] = useState(1);

	function handleChangeRec(value) {
		setChangeRec(value);
	}

	const renderRec = (data) => {
		ChartCommon.renderPieChart('value', 'type', 'container', data, rec, setRec, 'Tổng số hóa đơn', '');
	};

	useEffect(() => {
		renderRec(statusBill.month[changeRec]);
	}, [changeRec]);

	const options = [
		{
			name: 'Số lượt đăng ký dịch vụ trong tháng',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Số khách hàng đăng ký mới hàng đầu',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng số hóa đơn chưa thanh toán/Tổng hóa đơn',
			percent: '33,33',
			count: 15000,
			billSucess: 50,
			sumBill: 100,
		},
		{
			name: 'Tổng số hóa đơn thất bại trong tháng',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng số hóa đơn thanh toán thành công/Tổng hóa đơn',
			percent: '33,33',
			count: 15000,
			billSucess: 50,
			sumBill: 100,
		},
		{
			name: 'Tổng doanh thu của tháng hiện tại',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng doanh thu đã nhận trong tháng',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng nợ trong tháng',

			money: 10000,
		},
	];

	const [turnoverValueOverTime, setTurnoverValueOverTime] = useState('ALL');
	const handleChangeRevenueTime = (value) => {
		setTurnoverValueOverTime(value);
	};
	const [chartRevenue, setChartRevenue] = useState();
	const renderChartRevenueService = (data) => {
		ChartCommon.renderVerticalColumnChart(
			'name',
			'value',
			'revenueServiceId',
			data,
			'',
			chartRevenue,
			setChartRevenue,
			'#389EFE',
			'',
			'triệu',
		);
	};
	useEffect(() => {
		renderChartRevenueService(revenueServiceChangeTime[turnoverValueOverTime]);
	}, [turnoverValueOverTime]);

	const [recRevenue, setRecRevenue] = useState();
	const [changeRecRevenue, setChangeRecRevenue] = useState(1);

	function handleChangeRecRevenue(value) {
		setChangeRecRevenue(value);
	}

	const renderRecRevenue = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'revenue',
			data,
			recRevenue,
			setRecRevenue,
			'Tổng doanh thu',
			'triệu',
		);
	};
	useEffect(() => {
		renderRecRevenue(revenueCate.month[changeRecRevenue]);
	}, [changeRecRevenue]);

	return (
		<SubBill
			handleChange={handleChange}
			change={change}
			handleChangeRec={handleChangeRec}
			changeRec={changeRec}
			handleChangeDual={handleChangeDual}
			changeDual={changeDual}
			handleChangeUnsup={handleChangeUnsup}
			changeUnsup={changeUnsup}
			options={options}
			turnoverValueOverTime={turnoverValueOverTime}
			handleChangeRevenueTime={handleChangeRevenueTime}
			handleChangeRecRevenue={handleChangeRecRevenue}
			changeRecRevenue={changeRecRevenue}
		/>
	);
}

export default SubBillSerivce;
