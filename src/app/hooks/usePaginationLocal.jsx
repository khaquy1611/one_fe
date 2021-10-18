import EmptyContentTable from 'app/components/Atoms/EmptyContentTable';
import { pick } from 'opLodash';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

const DEFAULT_DATA = {
	content: [],
	total: 0,
};

const DEFAULT_PAGE_SIZE = 10;

const getExtraParams = (filterLocal, extra) => pick(filterLocal, extra);

export default function usePaginationLocal(callFn, extra = [], defaultParams = {}, keyQuery = '', queryConfig = {}) {
	const [filterLocal, setFilterLocal] = useState({
		...defaultParams,
		page: 1,
		size: defaultParams.pageSize || DEFAULT_PAGE_SIZE,
		count: 0,
	});
	const { page, size, sort } = filterLocal;
	const { data, error, isLoading, isFetching, refetch: refetchList } = useQuery(
		[`usePagination.${keyQuery}`, filterLocal.count],
		async () => {
			try {
				const res = await callFn({
					...filterLocal,
					page: page - 1,
					size,
					sort: sort || null,
					...getExtraParams(filterLocal, extra),
					count: null,
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
		if (resetPage) {
			filterLocal.page = 1;
		}
		Object.keys(params).forEach((key) => {
			if (params[key] === undefined) {
				filterLocal[key] = null;
			} else {
				filterLocal[key] = params[key];
			}
		});
		setFilterLocal({ ...filterLocal, count: filterLocal.count + 1 });
	}

	const onChangeOneParam = (param, resetPage = true) => (value) => onChangeParams({ [param]: value }, resetPage);

	function onPageChange(newPage, newPageSize) {
		onChangeParams({
			page: newPage,
			size: newPageSize,
		});
	}

	function onChangeTable(pagination, filters, sorter, { action }) {
		if (action === 'paginate') {
			onChangeParams({
				page: pagination.current,
				size: pagination.pageSize,
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

	const { content, total } = data;
	const refetch = async () => {
		const { data: dataRs } = await refetchList();
		if ((!dataRs || !dataRs.content || !dataRs.content.length) && page > 1) {
			onChangeParams({
				page: page - 1,
			});
		}
	};

	return {
		data,
		error,
		isLoading,
		isFetching,
		onChangeParams,
		onPageChange,
		page,
		pageSize: size,
		content,
		total,
		sort,
		filterLocal,
		refetch,
		onChangeOneParam,
		configTable: {
			scroll: { x: 800 },
			dataSource: content,
			loading: isFetching,
			rowKey: (record) => record.id,
			pagination: {
				current: page,
				pageSize: size,
				total,
				onChange: onPageChange,
				showSizeChanger: total > 0 && !defaultParams.pageSize,
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
