import { Button } from 'antd';
import { DX, SmeService } from 'app/models';
import React, { useRef } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { queryCache } from 'app/helpers';
import { useLng } from 'app/hooks';
import PopularCard from './PopularCard';

const queryKey = 'Home.getListContact';
const { getData, setData } = queryCache(queryKey);

const getListServiceTop = async () => {
	const dataCache = getData();
	if (dataCache) {
		return dataCache;
	}
	const res = await SmeService.getAllPaginationByType({ sort: 'bestseller' });
	setData(res);
	return res;
};

const PopularService = () => {
	const history = useHistory();
	const currentYear = useRef(new Date().getFullYear());
	const { tButton, tLowerField, tOthers, tMenu } = useLng();
	const onViewMore = () => {
		history.push(DX.sme.createPath('/products?sort=bestseller'));
	};

	const redirectDetail = (id) => {
		history.push(DX.sme.createPath(`/service/${id}`));
	};
	const { data } = useQuery([queryKey], getListServiceTop, {
		initialData: [],
	});
	const { content: topSelling, total } = data || {};
	if (!total) {
		return null;
	}
	return (
		<div className="mb-24">
			<h1 className="font-bold uppercase text-4xl mb-5 text-primary">{tMenu('popularProduct')}</h1>
			<h3 className="mb-6">
				{tOthers('list')} {tLowerField('product')}{' '}
				<span className="font-bold">{tLowerField('bestseller')}</span> {currentYear.current}
			</h3>
			<div className="grid grid-cols-2 mobile:grid-cols-1 gap-8 mb-8">
				{topSelling.slice(0, 4).map((item, index) => (
					<PopularCard
						key={item.id}
						infoService={item}
						keys={index}
						onClick={() => redirectDetail(item.id)}
					/>
				))}
			</div>

			<div className="text-center mb-8 mt-4">
				<Button type="button" onClick={() => onViewMore()}>
					{tButton('watchMore')}
				</Button>
			</div>
		</div>
	);
};

export default PopularService;
