import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { noop, trim } from 'opLodash';

const { Search } = Input;

function SearchCommon({ onSearch, defaultValue, ...props }) {
	const [valueSearch, setValueSearch] = useState(defaultValue);

	useEffect(() => {
		if (defaultValue !== valueSearch) setValueSearch(defaultValue);
	}, [defaultValue]);

	return (
		<Search
			onSearch={(value) => {
				onSearch(trim(value));
				setValueSearch(trim(value));
			}}
			onChange={(event) => {
				setValueSearch(event.target.value);
			}}
			value={valueSearch}
			onBlur={() => {
				defaultValue !== valueSearch && setValueSearch(defaultValue);
			}}
			onPressEnter={({ target: { value } }) => {
				onSearch(trim(value) || undefined);
				setValueSearch(trim(value));
			}}
			{...props}
			enterButton={false}
		/>
	);
}

SearchCommon.propTypes = {
	onSearch: PropTypes.func,
	defaultValue: PropTypes.string,
};

SearchCommon.defaultProps = {
	onSearch: noop,
	defaultValue: '',
};

export default SearchCommon;
