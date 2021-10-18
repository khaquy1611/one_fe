import { revenueServiceChangeTime } from 'admin/DashBoard/dashboard-data/SubBill/revenueService';
import { dataTotalRevenueDeveloper } from 'admin/DashBoard/dashboard-data/SubBill/totalRevenueDeveloper';
import ChartCommon from 'app/CommonChart/ChartCommon';
import React, { useEffect, useState } from 'react';
import DecisionBubbles from '../../../app/CommonChart/DecisionBubbles';
import { newSupService } from '../dashboard-data/SubBill/newSupService';
import { revenueCate } from '../dashboard-data/SubBill/revenueCate';
import { statusBill } from '../dashboard-data/SubBill/statusBill';
import { totalCusSup } from '../dashboard-data/SubBill/totalCusSup';
import { totalCustomerUnSup } from '../dashboard-data/SubBill/totalCustomerUnSup';
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
			count: 10000,
			number: 10,
		},
		{
			name: 'Số khách hàng đăng ký mới hàng đầu',
			percent: '30,33',
			count: 5000,
			number: 10,
		},
		{
			name: 'Tổng số hóa đơn chưa thanh toán/Tổng hóa đơn',
			percent: '63,33',
			count: 15000,
			billSucess: 50,
			sumBill: 100,
		},
		{
			name: 'Tổng số hóa đơn thất bại trong tháng',
			percent: '70',
			count: 15000,
			number: 60,
		},
		{
			name: 'Tổng số hóa đơn thanh toán thành công/Tổng hóa đơn',
			percent: '40',
			count: 15000,
			billSucess: 50,
			sumBill: 100,
		},
		{
			name: 'Tổng doanh thu của tháng hiện tại',
			percent: '33,33',
			count: 2000,
			number: 50,
		},
		{
			name: 'Tổng doanh thu đã nhận trong tháng',
			percent: '13,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng nợ trong tháng',

			money: 70000,
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
			'#369CFB',
			'',
			'triệu',
		);
	};
	useEffect(() => {
		renderChartRevenueService(revenueServiceChangeTime[turnoverValueOverTime]);
	}, [turnoverValueOverTime]);

	const [valueDeveloper, setValueDeveloper] = useState('ALL');
	const [valueTimeReDeveloper, setValueTimeReDeveloper] = useState('ALL');
	const [graph, setGraph] = useState();
	useEffect(() => {
		setGraph(DecisionBubbles('totalRevenueDeveloper', dataTotalRevenueDeveloper[valueTimeReDeveloper], graph));
	}, [valueTimeReDeveloper]);

	function handleChangeTimeRevenuedev(value) {
		setValueTimeReDeveloper(value);
	}

	const [recRevenueCate, setRecRevenueCate] = useState();
	const [RevenueCate, setRevenueCate] = useState(1);

	function handleRevenueCate(value) {
		setRevenueCate(value);
	}

	const renderRevenueCate = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'paymentRate',
			data,
			recRevenueCate,
			setRecRevenueCate,
			'Tổng doanh thu',
			'triệu',
		);
	};

	useEffect(() => {
		renderRevenueCate(revenueCate.month[RevenueCate]);
	}, [RevenueCate]);

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
			valueTimeReDeveloper={valueTimeReDeveloper}
			handleChangeTimeRevenuedev={handleChangeTimeRevenuedev}
			valueDeveloper={valueDeveloper}
			handleRevenueCate={handleRevenueCate}
			RevenueCate={RevenueCate}
		/>
	);
}

export default SubBillSerivce;
