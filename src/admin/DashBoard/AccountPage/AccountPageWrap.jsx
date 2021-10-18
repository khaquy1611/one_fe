import React, { useEffect, useState } from 'react';
import ChartCommon from 'app/CommonChart/ChartCommon';
import AccountPage from './AccountPage';
import { totalAccounts } from '../dashboard-data/Account/account';
import ListCard from './ListCard';
import DecisionBubbles from '../../../app/CommonChart/DecisionBubbles';

function AccountPageWrap(props) {
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
			name: 'Tổng số tài khoản',
			count: 4230,
			totalAdmin: 5,
			totalDev: 995,
			totalSME: 3230,
		},
		{
			name: 'Đăng ký mới trong tháng',
			percent: '33,33',
			totalRegister: 880,
			number: 6,
		},
	];

	// total acount
	const dataLegendFixed = [
		{
			name: 'Tổng account SME',
			type: 'sme',
		},
		{
			name: 'Tổng account Dev',
			type: 'sme',
		},
		{
			name: 'Tổng account đăng ký mới',
			type: 'count',
		},
	];
	const [groupColumLineChart, setGroupColumLineChart] = useState();
	const [totalAccountChange, setTotalAccountChange] = useState('month');
	const renderGroupColumnWithLineChart = (data, transformData) => {
		ChartCommon.renderGroupColumnWithLineChart(
			'serviceTotalAccount',
			data,
			transformData,
			totalAccountChange,
			groupColumLineChart,
			setGroupColumLineChart,
			dataLegendFixed,
		);
	};

	useEffect(() => {
		renderGroupColumnWithLineChart(
			totalAccounts.all[totalAccountChange].data,
			totalAccounts.all[totalAccountChange].transformData,
		);
	}, [totalAccountChange]);

	// daily active user
	const [dual, setDual] = useState();
	const [changeDual, setChangeDual] = useState('month');
	function handleChangeDual(value) {
		setChangeDual(value);
	}
	const renderDual = (data) => {
		ChartCommon.renderMultiLineChart('date', 'value', 'dualLine', data, changeDual, dual, setDual);
	};
	useEffect(() => {
		renderDual(totalAccounts.dailyActive[changeDual][1].data);
	}, [changeDual]);

	// ti le doanh nghiep dang ky dich vu
	const [registerServiceEnterprise, setRegisterServiceEnterprise] = useState();
	const renderSerivceStatus = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'registerServiceEnterprise',
			data,
			registerServiceEnterprise,
			setRegisterServiceEnterprise,
			'Tổng số doanh nghiệp',
			'',
		);
	};

	const [registerServiceEnterpriseChange, setRegisterServiceEnterpriseChange] = useState('total');

	function handleChangeRec(value) {
		setRegisterServiceEnterpriseChange(value);
	}
	useEffect(() => {
		renderSerivceStatus(totalAccounts.registerService.data);
	}, [registerServiceEnterpriseChange]);

	// total account sme employee cua tung doanh nghiep
	const [totalSmeEmployeeChange, setTotalSmeEmployeeChange] = useState('all');
	const [totalServiceByDev, setTotalServiceByDev] = useState();
	useEffect(() => {
		setTotalServiceByDev(
			DecisionBubbles('containerService', totalAccounts.smeEmployee[totalSmeEmployeeChange], totalServiceByDev),
		);
	}, [totalSmeEmployeeChange]);

	// ti le doanh nghiep cung cap dich vu
	const [enterpriseProvisionService, setEnterpriseProvisionService] = useState();

	const renderEnterpriseProvisionService = (data) => {
		ChartCommon.renderPieChart(
			'value',
			'type',
			'enterpriseProvisionService',
			data,
			enterpriseProvisionService,
			setEnterpriseProvisionService,
			'Tổng số doanh nghiệp',
			'',
		);
	};

	const [enterpriseProvisionServiceChange, setEnterpriseProvisionServiceChange] = useState(1);

	useEffect(() => {
		renderEnterpriseProvisionService(totalAccounts.provisionService.data);
	}, [enterpriseProvisionServiceChange]);
	return (
		<div>
			<ListCard options={options} />
			<AccountPage
				breadcrumbs={breadcrumbs}
				changeDual={changeDual}
				handleChangeDual={handleChangeDual}
				totalAccountChange={totalAccountChange}
				setTotalAccountChange={setTotalAccountChange}
				registerServiceEnterpriseChange={registerServiceEnterpriseChange}
				setRegisterServiceEnterpriseChange={setRegisterServiceEnterpriseChange}
				totalSmeEmployeeChange={totalSmeEmployeeChange}
				setTotalSmeEmployeeChange={setTotalSmeEmployeeChange}
				enterpriseProvisionServiceChange={enterpriseProvisionServiceChange}
				setEnterpriseProvisionServiceChange={setEnterpriseProvisionServiceChange}
			/>
		</div>
	);
}

export default AccountPageWrap;
