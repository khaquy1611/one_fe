import EmptyContentTable from 'app/components/Atoms/EmptyContentTable';
import React from 'react';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import useQueryUrl from './useQueryUrl';

const DEFAULT_DATA = {
	content: [],
	total: 0,
};

const DEFAULT_PAGE_SIZE = 10;

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

export default function usePagination(callFn, extra = [], defaultParams = {}, keyQuery = '', queryConfig = {}) {
	const query = useQueryUrl();
	const history = useHistory();
	const { pathname } = useLocation();

	const page = parseInt(query.get('page'), 10) || 1;
	const pageSize =
		parseInt(query.get('pageSize'), 10) || defaultParams.pageSize || defaultParams.size || DEFAULT_PAGE_SIZE;
	let sort = query.get('sort') || defaultParams.sort;
	const { data, error, isLoading, isFetching, refetch: refetchList } = useQuery(
		[`usePagination.${keyQuery || pathname}`, query.toString()],
		async () => {
			if (!sort) {
				sort = null;
			}
			try {
				const res = await callFn({
					...defaultParams,
					page: page - 1,
					size: pageSize,
					sort,
					...getExtraParams(query, extra),
				});

				return res;
			} catch (e) {
				return DEFAULT_DATA;
			}
		},
		{
			initialData: DEFAULT_DATA,
			keepPreviousData: true,
			...queryConfig,
		},
	);

	function onChangeParams(params, resetPage = true) {
		console.log('onchangeparams', params);
		if (resetPage) {
			query.delete('page');
		}
		Object.keys(params).forEach((key) => {
			if (params[key] === undefined) {
				query.delete(key);
			} else {
				query.set(key, params[key]);
			}
		});
		history.push({
			pathname,
			search: query.toString(),
		});
	}

	const onChangeOneParam = (param, resetPage = true) => (value) => onChangeParams({ [param]: value }, resetPage);

	function onPageChange(newPage, newPageSize) {
		onChangeParams({
			page: newPage,
			pageSize: newPageSize,
		});
	}

	function onChangeTable(pagination, filters, sorter, { action }) {
		if (action === 'paginate') {
			onChangeParams({
				page: pagination.current,
				pageSize: pagination.pageSize,
			});
			return;
		}
		if (action === 'sort') {
			const params = {};
			if (!sorter.order) {
				params.sort = '';
			} else {
				params.sort = `${sorter.field},${sorter.order.slice(0, -3)}`;
			}
			onChangeParams(params);
		}
	}

	const { content, total, totalElements } = data;

	const refetch = async () => {
		const { data: dataRs } = await refetchList();
		if ((!dataRs || !dataRs.content || !dataRs.content.length) && page > 1) {
			onChangeParams({
				page: page - 1,
			});
		}
	};
	const getColumnSortDefault = (columns = []) => {
		if (query.get('sort')) {
			const sortArr = query.get('sort').split(',');
			return columns.map((e) => {
				if (e.dataIndex === sortArr[0]) {
					return {
						...e,
						sortOrder: sortArr[1] === 'asc' ? 'ascend' : 'descend',
					};
				}
				return e;
			});
		}
		return columns;
	};

	return {
		data,
		error,
		isLoading,
		isFetching,
		onChangeParams,
		onPageChange,
		page,
		pageSize,
		content,
		total: total || totalElements,
		sort,
		query,
		getParamNull: (key) => {
			const value = query.get(key);
			if (value === 'null') {
				return null;
			}
			return value;
		},
		refetch,
		onChangeOneParam,
		getColumnSortDefault,
		configTable: {
			scroll: { x: 800 },
			dataSource: content,
			loading: isFetching,
			rowKey: (record) => record.id,
			pagination: {
				current: page,
				pageSize,
				total: total || totalElements,
				onChange: onPageChange,
				showSizeChanger: (total || totalElements) > 0 && !defaultParams.pageSize,
				position: ['bottomCenter'],
				pageSizeOptions: [10, 20, 50],
			},
			onChange: onChangeTable,
			locale: {
				emptyText: <EmptyContentTable />,
			},
		},
	};
}
