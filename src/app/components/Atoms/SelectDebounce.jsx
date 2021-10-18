import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Select } from 'antd';
import debounce from 'lodash/debounce';

const SelectDebounce = ({ fetchOptions, debounceTimeout = 800, children, maxLength, ...props }) => {
	const [fetching, setFetching] = useState(true);
	const [options, setOptions] = useState([]);
	const { onSelect } = { ...props };
	const [countRefresh, setCountRefresh] = useState(0);
	const [searchText, setSearchText] = useState();

	const fetchRef = useRef(0);

	useEffect(() => {
		fetchOptions().then((newOptions) => {
			setOptions(newOptions);
			setFetching(false);
		});
	}, [countRefresh]);

	const debounceFetcher = useMemo(() => {
		const loadOptions = (value) => {
			fetchRef.current += 1;
			const fetchId = fetchRef.current;
			setOptions([]);
			fetchOptions(value).then((newOptions) => {
				if (fetchId !== fetchRef.current) {
					// for fetch callback order
					return;
				}

				setOptions(newOptions);
				setFetching(false);
			});
		};

		return debounce(loadOptions, debounceTimeout);
	}, [fetchOptions, debounceTimeout]);

	return (
		<Select
			filterOption={false}
			{...props}
			onSelect={(...args) => {
				setCountRefresh(countRefresh + 1);
				if (onSelect) onSelect(...args);
			}}
			onSearch={(value) => {
				if (!maxLength || value.length <= maxLength) {
					debounceFetcher(value);
					setSearchText(value);
				}
			}}
			options={children && !searchText ? undefined : options}
			loading={fetching}
			searchValue={searchText}
		>
			{children}
		</Select>
	);
};

export default SelectDebounce;
