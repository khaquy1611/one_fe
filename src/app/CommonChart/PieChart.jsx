/* eslint-disable no-shadow */
import { G2, Pie } from '@antv/g2plot';
import { DX } from 'app/models';

export function PieChart(angleFieldName, colorFieldName, chartName, data, chart, setChart, chartLabel, unit, ...props) {
	const { registerTheme } = G2;
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
		'',
	];
	const colors20 = [
		'#369CFB',
		'#4CC971',
		'#F8D136',
		'#9FB40F',
		'#76523B',
		'#DAD5B5',
		'#0E8E89',
		'#E19348',
		'#F383A2',
		'#18b399',
		'#7c0808',
		'#2391FF',
		'#FFC328',
		'#A0DC2C',
		'#946DFF',
		'#626681',
		'#EB4185',
		'#CD8150',
		'#36BCCB',
		'#327039',
		'#803488',
		'#83BC99',
	];
	registerTheme('custom-theme', {
		colors10,
		colors20,
	});

	const currentConfig = {
		appendPadding: 10,
		data,
		angleField: angleFieldName,
		colorField: colorFieldName,
		radius: 1,
		innerRadius: 0.7,
		theme: 'custom-theme',
		statistic: {
			title: {
				style: {
					fontSize: 17,
					lineHeight: 3,
				},
				customHtml: () => chartLabel,
			},
		},
		meta: {
			value: {
				formatter: (v) => {
					if (chartLabel === 'Tổng doanh thu') {
						const id = parseInt(v, 10);
						v = DX.formatNumberCurrency(id / 1000000);
						return `${v} triệu`;
					}
					return `${v}`;
				},
			},
		},
		tooltip: {
			formatter: (data) => ({
				name: data.type,
				value: `${
					chartLabel === 'Tổng doanh thu' ? DX.formatNumberCurrency(data.value / 1000000) : data.value
				} ${unit}`,
			}),
		},
		label: {
			type: 'inner',
			offset: '-50%',
			autoRotate: false,
			style: { textAlign: 'center' },
			formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
			spacing: 100,
		},
		interactions: [{ type: 'element-active' }, { type: 'element-selected' }],

		legend: {
			// offsetX: "-10%",
			itemHeight: 15,
			items: data.map((obj, index) => ({
				name: obj.type.replaceAll('Software', ''),
				value: obj.value,
				marker: {
					style: {
						r: 7,
						textAlign: 'center',
						fill: `${data.length >= 10 ? colors20[index] : colors10[index]}`,
					},
				},
			})),
		},
	};
	if (!chart) {
		const recInstance = new Pie(chartName, currentConfig);
		recInstance.chart.removeInteraction('legend-filter');
		recInstance.render();
		setChart(recInstance);
	} else {
		chart.update({ ...currentConfig, data });
	}
}
