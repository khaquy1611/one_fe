/* eslint-disable operator-assignment */
import React, { useEffect, useState } from 'react';
import { services } from 'admin/DashBoard/dashboard-data/ServiceAndPricing/services';
import { Select } from 'antd';
import DecisionBubbles from '../../../app/CommonChart/DecisionBubbles';

function Index(props) {
	const [change, setChange] = useState('all');
	const [graph, setGraph] = useState();
	useEffect(() => {
		setGraph(DecisionBubbles('containerService', services.totalServiceByDeveloper[change], graph));
	}, [change]);

	function handleChange(value) {
		setChange(value);
	}

	return (
		<div>
			<div id="containerService" className="mt-10" />
			<Select onChange={handleChange} placeholder="Chọn môt ô" value={change} className="m-5">
				<option value="all">Tất cả</option>
				<option value="erp">ERP</option>
			</Select>
		</div>
	);
}

export default Index;
