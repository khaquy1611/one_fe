import { Column } from '@antv/g2plot';
import { DX } from 'app/models';

export function VerticalColumnChart(
	xFieldName,
	yFieldName,
	chartName,
	data,
	change,
	chart,
	setChart,
	color,
	date,
	unit,
	...props
) {
	const currentColumnConfig = {
		data,
		xField: xFieldName,
		yField: yFieldName,
		color: `${color}`,
		columnWidthRatio: 0.5,
		yAxis: {
			label: {
				autoHide: true,
				autoRotate: false,
				formatter: (v) => {
					if (chartName === 'revenueServiceId') {
						return `${DX.formatNumberCurrency(v / 1000000)}`;
					}
					return `${v}`;
				},
			},
			grid: {
				line: { style: { lineDash: [4, 4], stroke: '#ddd' } },
			},
		},
		xAxis: {
			label: {
				autoHide: true,
				autoRotate: false,
				formatter: (v) => {
					v = v.replaceAll(' ', '\n');
					if (change === 'month') {
						const id = parseInt(v, 10);
						if (id % 5 === 0 && id < 26) {
							return `${id}/1`;
						}
						if (id === 1 || id === data.length) return `${id}/1`;
						return '';
					}
					return `${v}`;
				},
			},
		},
		tooltip: {
			// eslint-disable-next-line no-shadow
			formatter: (data) => ({
				name: `${date} ${data[`${xFieldName}`]}`,
				value: `${
					chartName === 'revenueServiceId'
						? DX.formatNumberCurrency(`${data[`${yFieldName}`]}` / 1000000)
						: `${data[`${yFieldName}`]}`
				}${unit}`,
			}),
			showTitle: false,
		},
	};
	if (!chart) {
		const barInstance = new Column(chartName, currentColumnConfig);
		barInstance.render();
		setChart(barInstance);
	} else {
		chart.update({ ...currentColumnConfig, data });
	}
}
