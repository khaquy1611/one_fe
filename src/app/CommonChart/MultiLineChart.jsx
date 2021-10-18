import { Line } from '@antv/g2plot';
import { uniqBy as _uniqBy } from 'opLodash';

export function MultiLineChart(xFieldName, yFieldName, chartName, data, change, chart, setChart, ...props) {
	const colors10 = [
		'#369CFB',
		'#4CC971',
		'#F8D136',
		'#9FB40F',
		'#76523B',
		'#DAD5B5',
		'#0E8E89',
		'#E19348',
		'#F383A2',
		'#247FEA',
	];
	const currentLineConfig = {
		data,
		xField: xFieldName,
		yField: yFieldName,
		padding: 'auto',
		color: colors10,

		legend: {
			position: 'bottom',

			items: _uniqBy(data, 'type').map((obj, index) => ({
				name: obj.type,
				value: obj.value,

				marker: {
					marker(x, y, r, ctx) {
						ctx.lineWidth = 1;
						ctx.strokeStyle = ctx.fillStyle;
						ctx.moveTo(x - r - 3, y);
						ctx.lineTo(x + r + 3, y);
						ctx.stroke();
						ctx.arc(x, y, r, 0, Math.PI * 2, false);
						ctx.fill();
					},
					style: {
						r: 7,
						fill: colors10[index],
					},
				},
			})),
		},
		point: {
			shape: 'circle',
		},
		meta: {
			date: {
				range: [0, 1],
			},
		},
		yAxis: {
			grid: {
				line: { style: { lineDash: [4, 4], stroke: '#ddd' } },
			},
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
						if (id === 1 || id === data.length / _uniqBy(data, 'type').length) return `${id}`;
						return '';
					}
					return `${v}`;
				},
			},
		},
		seriesField: 'type',
	};
	if (!chart) {
		const dualInstance = new Line(chartName, currentLineConfig);
		dualInstance.render();
		setChart(dualInstance);
	} else {
		chart.update({ ...currentLineConfig, data });
	}
}
