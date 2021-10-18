import ChartCommon from 'app/CommonChart/ChartCommon';
import React, { useEffect, useState } from 'react';
import { ticketProcessing } from '../../../admin/DashBoard/dashboard-data/CustomerSupport/ticketProcessing';
import { totalTicket } from '../../../admin/DashBoard/dashboard-data/CustomerSupport/totalTicket';
import CustomerSp from './CustomerSp';

function CustomerSupport() {
	const [bar, setBar] = useState();
	const [change, setChange] = useState('month');
	function handleChange(value) {
		setChange(value);
	}

	const renderBar = (data) => {
		ChartCommon.renderVerticalColumnChart('name', 'amount', '111', data, '', bar, setBar, '#369CFB', '', '');
	};

	useEffect(() => {
		renderBar(totalTicket.year[1]);
	}, []);

	const [dual, setDual] = useState();
	const renderDual = (data) => {
		ChartCommon.renderMultiLineChart('date', 'value', 'dual', data, 'month', dual, setDual);
	};
	const [changeDual, setChangeDual] = useState('qoty');
	function handleChangeDual(value) {
		setChangeDual(value);
	}

	useEffect(() => {
		renderDual(ticketProcessing.month[1]);
	}, []);

	return (
		<CustomerSp
			handleChange={handleChange}
			change={change}
			handleChangeDual={handleChangeDual}
			changeDual={changeDual}
		/>
	);
}

export default CustomerSupport;
