import { Column } from '@antv/g2plot';
import React from 'react';

export function CroupColumnChart(xFieldName, yFieldName, seriesFieldName, chartName, data, chart, setChart, ...props) {
	const currentConfig = {
		data,
		xField: xFieldName,
		yField: yFieldName,
		seriesField: seriesFieldName,
		isGroup: 'true',
		columnStyle: {},
		marginRatio: 0,
		legend: false,
	};
	if (!chart) {
		const columnPlot = new Column(chartName, currentConfig);
		columnPlot.render();
		setChart(columnPlot);
	} else {
		chart.update({ ...currentConfig, data });
	}
}
