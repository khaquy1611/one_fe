import { useState } from 'react';
import { useQuery } from 'react-query';

export default function usePaginateInfinity(fn, extraParams = []) {
	const [data, setData] = useState([]);
	const [size, setSize] = useState(10);

	const {
		data: { total },
		...props
	} = useQuery(
		['paginI', size, ...extraParams],
		() =>
			fn({
				page: 0,
				size,
			}),
		{
			onSuccess: (res) => {
				setData([...res.content]);
			},
			initialData: {
				content: [],
				total: 0,
			},
		},
	);

	return {
		data,
		loadMore: () => setSize(size + 10),
		canLoadMore: total > data.length,
		...props,
	};
}
