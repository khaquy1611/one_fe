import React from 'react';
import { Select, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const renderOptionsHighlight = (options = [], displayed) => {
	const renderTooltip = () => {
		const index = displayed.indexOf('Giá trị cũ: ');
		if (index === -1) return displayed;
		return `Giá trị cũ: ${options.filter((e) => e.value.toString() === displayed.slice(12))[0]?.label}`;
	};
	return options.map((option) => (
		<Option value={option.value} className="ant-prefix" key={option.label} label={option.label}>
			<span className="flex items-center justify-between">
				<span>{option.label}</span>
				<span>
					{displayed && (
						<span className="prefix">
							<Tooltip placement="topRight" title={() => renderTooltip()}>
								<ExclamationCircleOutlined className="text-yellow-500" />
							</Tooltip>
						</span>
					)}
				</span>
			</span>
		</Option>
	));
};

export default renderOptionsHighlight;
