import EmptyContentTable from 'app/components/Atoms/EmptyContentTable';
import { isEmpty, pick } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

const DEFAULT_DATA = {
	content: [],
	total: 0,
};

const DEFAULT_PAGE_SIZE = 50;
const SIZE_TO_GET_MORE = 15;

const getExtraParams = (filterLocal, extra) => pick(filterLocal, extra);

export default function usePickInfinity({
	callFn,
	initItemsPick = [],
	keyQuery,
	defaultParams,
	extra,
	indexRecord,
	ignorekey,
}) {
	const [itemsPick, setItemsPick] = useState([...initItemsPick]);
	const [cacheIgnoredId, setCacheIgnoredId] = useState([]);

	const [total, setTotal] = useState(0);
	const [filterLocal, setFilterLocal] = useState({
		page: 0,
		countQuery: 0,
		...defaultParams,
	});
	const [dataSourceOrigin, setDataSource] = useState([]);
	const { data, error, isLoading, isFetching, refetch } = useQuery(
		[`usePagination.${keyQuery}`, JSON.stringify(filterLocal)],
		async () => {
			try {
				let ignoreId = null;
				let request = {
					...defaultParams,
					page: filterLocal.page,
					size: DEFAULT_PAGE_SIZE,
					sort: filterLocal.sort || null,
					...getExtraParams(filterLocal, extra),
				};
				if (filterLocal.page === 0) {
					if (ignorekey === 'pricingIds-comboPlanIds') {
						const idPicks = [
							...itemsPick.map((el) => el[indexRecord]),
							...(defaultParams?.pricingIds || []),
						];
						const pricingIds = [];
						const comboPlanIds = [];
						idPicks.forEach((e) => {
							const types = e.split('-');
							if (types[1] === 'comboPlanIds') comboPlanIds.push(parseInt(types[0], 10));
							else pricingIds.push(parseInt(types[0], 10));
						});
						ignoreId = { pricingIds, comboPlanIds };
						request = { ...request, pricingIds, comboPlanIds };
					} else if (ignorekey === 'periodId') {
						ignoreId = [...itemsPick.map((el) => el[ignorekey]), ...(defaultParams?.pricingIds || [])];
						const pricingIdRemove = [];
						pricingIdRemove.push(...itemsPick.map((el) => el[indexRecord]));
						request = { ...request, [ignorekey]: ignoreId.length ? ignoreId : null, pricingIdRemove };
					} else {
						ignoreId = [...itemsPick.map((el) => el[indexRecord]), ...(defaultParams?.pricingIds || [])];
						request = { ...request, [ignorekey]: ignoreId.length ? ignoreId : null };
					}
				} else if (ignorekey === 'pricingIds-comboPlanIds') {
					const pricingIds = !isEmpty(cacheIgnoredId?.pricingIds) ? cacheIgnoredId?.pricingIds : null;
					const comboPlanIds = !isEmpty(cacheIgnoredId?.comboPlanIds) ? cacheIgnoredId?.comboPlanIds : null;
					request = { ...request, pricingIds, comboPlanIds };
				} else {
					request = { ...request, [ignorekey]: cacheIgnoredId.length ? cacheIgnoredId : null };
				}

				const res = await callFn(request);
				if (filterLocal.page === 0) {
					setTotal(res.total);
					setDataSource(res.content);
					setCacheIgnoredId(ignoreId);
				} else {
					setDataSource([...dataSourceOrigin, ...res.content]);
				}
				return res;
			} catch (e) {
				console.log(e);
				return DEFAULT_DATA;
			}
		},
		{
			initialData: DEFAULT_DATA,
			keepPreviousData: true,
		},
	);

	// data.total = total;

	function onChangeParams(params, resetPage = true) {
		if (resetPage) {
			filterLocal.page = 0;
		}
		Object.keys(params).forEach((key) => {
			if (params[key] === undefined) {
				filterLocal[key] = null;
			} else {
				filterLocal[key] = params[key];
			}
		});
		setFilterLocal({ ...filterLocal });
	}

	const onChangeOneParam = (param, resetPage = true) => (value) => onChangeParams({ [param]: value }, resetPage);

	const chooseItem = (itemId, periodId) => {
		let index = '';
		if (periodId) {
			index = dataSourceOrigin.findIndex((el) => el[indexRecord] === itemId && (el.periodId || -1) === periodId);
		} else index = dataSourceOrigin.findIndex((el) => el[indexRecord] === itemId);
		const newData = dataSourceOrigin[index];
		if (index !== -1) {
			setTotal(total - 1);
			setItemsPick([...itemsPick, newData]);
			setDataSource([...dataSourceOrigin.slice(0, index), ...dataSourceOrigin.slice(index + 1)]);
		}
	};

	const removeChooseItem = (itemId) => {
		const index = itemsPick.findIndex((el) => el[indexRecord] === itemId);
		if (index !== -1) {
			setTotal(total + 1);
			// setDataSource([]);
			setItemsPick([...itemsPick.slice(0, index), ...itemsPick.slice(index + 1)]);
			setFilterLocal({
				page: 0,
				countQuery: filterLocal.countQuery + 1,
				...defaultParams,
			});
		}
	};
	const haveNextPage = filterLocal.page + 1 < Math.ceil(data.total / DEFAULT_PAGE_SIZE);
	const nextPage = () => {
		if (!isFetching && (!total || haveNextPage)) {
			onChangeOneParam('page')(filterLocal.page + 1);
		}
	};
	const isItemLoaded = (index) => !haveNextPage || index < dataSourceOrigin.length;
	const itemCount = haveNextPage ? dataSourceOrigin.length + 1 : dataSourceOrigin.length;

	function onChangeTable(pagination, filters, sorter, { action }) {
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
	useEffect(() => {
		if (
			!isFetching &&
			dataSourceOrigin.length &&
			dataSourceOrigin.length < Math.min(DEFAULT_PAGE_SIZE, SIZE_TO_GET_MORE) &&
			haveNextPage
		) {
			onChangeParams({ countQuery: filterLocal.countQuery + 1 });
		}
	}, [dataSourceOrigin.length]);

	return {
		error,
		isLoading,
		isFetching,
		onChangeParams,
		chooseItem,
		content: dataSourceOrigin,
		itemsPick,
		total,
		filterLocal,
		refetch,
		onChangeOneParam,
		removeChooseItem,
		nextPage,
		dataSource: dataSourceOrigin,
		isItemLoaded,
		itemCount,
		emptyText: <EmptyContentTable />,
		configTable: {
			isItemLoaded,
			indexRecord,
			itemCount,
			haveNextPage,
			total,
			rowKey: indexRecord,
			scroll: {
				y: 540,
			},
			isFetching,
			onChange: onChangeTable,
			loadMoreItems: nextPage,
			dataSource: dataSourceOrigin,
		},
	};
}
