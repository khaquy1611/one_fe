import { Bar } from '@antv/g2plot';

export function HorizontalColumnChart(
	xFieldName,
	yFieldName,
	chartName,
	data,
	chart,
	setChart,
	maxValue,
	columnHeight,
	...props
) {
	const currentConfig = {
		data,
		xField: xFieldName,
		yField: yFieldName,
		height: columnHeight,
		appendPadding: 15,

		barWidthRatio: 0.6,
		legend: {
			position: 'top-left',
		},
		xAxis: {
			tickInterval: 1,
			max: maxValue,
			label: { formatter: (v) => `${v} sao` },
		},
		label: { position: 'right' },
	};
	if (!chart) {
		const chartColumn = new Bar(chartName, currentConfig);

		chartColumn.render();
		setChart(chartColumn);
	} else {
		chart.update({ ...currentConfig, data });
	}
}
