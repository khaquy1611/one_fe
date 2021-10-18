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

export default function usePagination(callFn, extra = [], defaultParams = {}, keyQuery = '', queryConfig = {}) {
	const [filterLocal, setFilterLocal] = useState({
		...defaultParams,
		page: 1,
		size: defaultParams.pageSize || DEFAULT_PAGE_SIZE,
		countApply: 0,
	});
	const [currentQuery, setCurrentQuery] = useState({ ...defaultParams });
	const { page, size, sort, countApply } = filterLocal;

	const { data, error, isLoading, isFetching, refetch: refetchList } = useQuery(
		[`usePagination.${keyQuery}`, filterLocal.countApply],
		async () => {
			try {
				let query;
				if (countApply > 0) {
					query = {
						...filterLocal,
						page: page - 1,
						size,
						sort: sort || null,
						...getExtraParams(filterLocal, extra),
					};
					setCurrentQuery(query);
				} else {
					query = { ...currentQuery, page: page - 1, size, sort: sort || null };
				}
				const res = await callFn(query);
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

	function onChangeParams(params) {
		Object.keys(params).forEach((key) => {
			if (params[key] === undefined) {
				filterLocal[key] = null;
			} else {
				filterLocal[key] = params[key];
			}
		});
		setFilterLocal({ ...filterLocal });
	}

	const onChangeOneParam = (param, resetPage) => (value) => onChangeParams({ [param]: value }, resetPage);

	// function onPageChange(newPage, newPageSize) {
	// 	onChangeParams({
	// 		page: newPage,
	// 		size: newPageSize,
	// 	});
	// }

	function onChangeTable(pagination, filters, sorter, { action }) {
		if (action === 'paginate') {
			onChangeParams(
				{
					page: pagination.current,
					size: pagination.pageSize,
					countApply: Math.min(0, filterLocal.countApply) - 1,
				},
				true,
			);
			return;
		}
		if (action === 'sort') {
			const params = {
				countApply: Math.min(0, filterLocal.countApply) - 1,
				page: 1,
			};
			if (!sorter.order) {
				params.sort = '';
			} else {
				params.sort = `${sorter.field},${sorter.order.slice(0, -3)}`;
			}
			onChangeParams(params, true);
		}
	}

	const { content, total } = data;
	const refetch = async () => {
		const { data: dataRs } = await refetchList();
		if ((!dataRs || !dataRs.content || !dataRs.content.length) && page > 1) {
			onChangeParams({
				page: page - 1,
				countApply: Math.min(0, filterLocal.countApply) - 1,
			});
		}
	};
	const applyQuery = () =>
		onChangeParams({
			page: 1,
			countApply: Math.max(filterLocal.countApply, 0) + 1,
		});

	return {
		data,
		error,
		isLoading,
		isFetching,
		onChangeParams,
		// onPageChange,
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
				// onChange: onPageChange,
				showSizeChanger: total > 0 && !defaultParams.pageSize,
				position: ['bottomCenter'],
				pageSizeOptions: [10, 20, 50],
			},
			onChange: onChangeTable,
			locale: {
				emptyText: <EmptyContentTable />,
			},
		},
		applyQuery,
	};
}
