import { useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useQueryUrl, useSelectLocation } from '.';

const getExtraParams = (query, extra) => {
	const extraParams = {};
	extra.forEach((key) => {
		const value = query.get(key);
		if (value && value !== 'null') {
			extraParams[key] = value;
		}
	});
	return extraParams;
};
const DEFAULT_DATA = {
	content: [],
	total: 0,
};
const DEFAULT_PAGE = 1;
export default function useLoadMore({ fnCall, extraParams = [], pageSize = 12, keyQuery }) {
	const query = useQueryUrl();
	const history = useHistory();

	const [data, setData] = useState([]);
	const page = parseInt(query.get('page'), 10) || DEFAULT_PAGE;

	const { pathname } = useSelectLocation();
	const params = getExtraParams(query, extraParams);
	function onChangeParams(newParams) {
		query.delete('page');
		Object.keys(newParams).forEach((key) => {
			if (newParams[key] === undefined) {
				query.delete(key);
			} else {
				query.set(key, newParams[key]);
			}
		});
		history.push({
			pathname,
			search: query.toString(),
		});
	}
	const onChangeOneParam = (param) => (value) => onChangeParams({ [param]: value });
	const {
		data: { total },
		isFetching,
	} = useQuery(
		[keyQuery, page, params],
		() => {
			if (page > DEFAULT_PAGE && !data.length) {
				onChangeOneParam('page')(DEFAULT_PAGE);
				return DEFAULT_DATA;
			}
			return fnCall({
				page: page - 1,
				size: pageSize,
				...getExtraParams(query, extraParams),
			});
		},
		{
			onSuccess: (res) => {
				if (page === 1) {
					setData([...res.content]);
				} else {
					setData([...data, ...res.content]);
				}
			},
			initialData: DEFAULT_DATA,
		},
	);

	return {
		data,
		page,
		isFetching,
		loadMore: () => onChangeOneParam('page')(page + 1),
		canLoadMore: total > data.length,
		onChangeParams,
		onChangeOneParam,
	};
}
