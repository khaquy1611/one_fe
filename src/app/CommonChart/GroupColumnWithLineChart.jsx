import { DualAxes } from '@antv/g2plot';
import { uniqBy as _uniqBy } from 'opLodash';

export function GroupColumnWithLineChart(
	container,
	data,
	transformData,
	change,
	chart,
	setChart,
	dataLegendFixed,
	...props
) {
	const colors10 = [
		'#389EFE',
		'#4CC971',
		'#FA8C16',
		'#9FB40F',
		'#76523B',
		'#DAD5B5',
		'#0E8E89',
		'#E19348',
		'#F383A2',
		'#247FEA',
	];

	const config = {
		data: [data, transformData],
		xField: 'time',
		yField: ['value', 'count'],
		color: colors10,
		geometryOptions: [
			{
				geometry: 'column',
				isGroup: true,
				seriesField: 'type',
			},
			{
				geometry: 'line',
				lineStyle: {
					lineWidth: 2,
				},
				color: '#FA8C16',
				point: {},
			},
		],
		legend: {
			custom: true,
			position: 'bottom',
			items: dataLegendFixed.map((obj, index) => ({
				name: obj.name,
				value: obj.type,
				marker: {
					symbol: 'circle',
					style: {
						r: 7,
						textAlign: 'center',
						fill: colors10[index],
					},
				},
			})),
		},
		xAxis: {
			label: {
				autoHide: true,
				autoRotate: false,
				formatter: (v) => {
					if (change === 'month') {
						const id = parseInt(v, 10);
						if (id % 5 === 0 && id < 26) {
							return `${id}`;
						}
						if (id === 1 || id === _uniqBy(data, 'time').length) return `${id}`;
						return '';
					}
					return `${v}`;
				},
			},
		},
	};
	if (!chart) {
		const dualAxes = new DualAxes(container, config);
		dualAxes.render();
		setChart(dualAxes);
	} else {
		chart.update({ ...config, data });
	}
}
