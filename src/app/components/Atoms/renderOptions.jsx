import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const renderOptions = (prefix, options) =>
	options.map((option) => (
		<Option
			value={option.value}
			className="ant-prefix"
			key={option.value}
			disabled={option.disabled}
			label={option.label}
		>
			{prefix ? <span className="prefix">{`${prefix}: `}</span> : null}
			<span>{option.label}</span>
		</Option>
	));
export const filterOption = (input, option) => option.label?.toLowerCase().includes(input?.toLowerCase());

export default renderOptions;
