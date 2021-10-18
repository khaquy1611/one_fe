import { CroupColumnChart } from './GroupColumnChart';
import { HorizontalColumnChart } from './HorizontalColumnChart';
import { PieChart } from './PieChart';
import { VerticalColumnChart } from './VerticalColumnChart';
import { MultiLineChart } from './MultiLineChart';
import { GroupColumnWithLineChart } from './GroupColumnWithLineChart';

class ChartCommon {
	renderGroupColumnChart = (xFieldName, yFieldName, seriesFieldName, chartName, data, chart, setChart) => {
		CroupColumnChart(xFieldName, yFieldName, seriesFieldName, chartName, data, chart, setChart);
	};

	renderPieChart = (angleFieldName, colorFieldName, chartName, data, chart, setChart, chartLabel, unit) => {
		PieChart(angleFieldName, colorFieldName, chartName, data, chart, setChart, chartLabel, unit);
	};

	renderHorizontalChart = (xFieldName, yFieldName, chartName, data, chart, setChart, maxValue, columnHeight) => {
		HorizontalColumnChart(xFieldName, yFieldName, chartName, data, chart, setChart, maxValue, columnHeight);
	};

	renderVerticalColumnChart = (
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
	) => {
		VerticalColumnChart(xFieldName, yFieldName, chartName, data, change, chart, setChart, color, date, unit);
	};

	renderMultiLineChart = (xFieldName, yFieldName, chartName, data, change, chart, setChart) => {
		MultiLineChart(xFieldName, yFieldName, chartName, data, change, chart, setChart);
	};

	renderGroupColumnWithLineChart = (chartName, data, transformData, change, chart, setChart, dataLegendFixed) => {
		GroupColumnWithLineChart(chartName, data, transformData, change, chart, setChart, dataLegendFixed);
	};
}

export default new ChartCommon();
