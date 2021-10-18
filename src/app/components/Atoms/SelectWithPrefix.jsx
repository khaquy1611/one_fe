import { Select } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import renderOptions from './renderOptions';

function SelectWithPrefix({ className, options, prefix, ...props }) {
	return (
		<Select {...props} className={className}>
			{renderOptions(prefix, options)}
		</Select>
	);
}

SelectWithPrefix.propTypes = {
	className: PropTypes.string,
	prefix: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(PropTypes.object),
};

SelectWithPrefix.defaultProps = {
	className: null,
	options: [],
};

export default SelectWithPrefix;
