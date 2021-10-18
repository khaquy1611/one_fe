/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Button } from 'antd';
import { useFlicking, useLng, usePaginationLocal } from 'app/hooks';
import { ComboSME, DX } from 'app/models';
import { Link, useHistory } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/web';
import { useSelector } from 'react-redux';
import { appSelects } from 'actions';
import Flicking from '@egjs/react-flicking';
import LazyLoad from 'react-lazy-load';
import { queryCache } from 'app/helpers';

const queryKey = 'Home.GetListCombo';

const { getData, setData } = queryCache(queryKey);

const getListCombo = async (...params) => {
	const dataCache = getData();
	if (dataCache) {
		return dataCache;
	}
	const res = await ComboSME.getListCombo(...params);
	setData(res);
	return res;
};

export default function ComboBlock() {
	const history = useHistory();
	const { isMobile, isTablet } = useSelector(appSelects.selectSetting);
	const {
		data: { content },
	} = usePaginationLocal(getListCombo, [], { pageSize: 12 }, queryKey);
	const { settings, renderPagination } = useFlicking();

	const { ref, inView } = useInView({
		threshold: isTablet ? 0.1 : 0.2,
	});
	const x = isTablet ? 70 : 150;
	const styles = useSpring({ y: inView ? 0 : x, opacity: inView ? 1 : 0 });

	const { tMenu, tOthers, tButton } = useLng();

	if (!content?.length) {
		return null;
	}
	return (
		<div ref={ref} className="mb-24 ">
			<div className="w-full text-center mb-0">
				<animated.h1 style={styles} className="font-bold text-4xl text-primary mb-5 uppercase">
					{tMenu('outstandingCombo')}
				</animated.h1>
				<animated.h3 style={styles}>
					{tOthers('list')}&nbsp;
					<span className="font-bold">{tOthers('outstandingProductCombo')}</span>
					&nbsp;{tOthers('bestOneSME')}
				</animated.h3>
			</div>
			<animated.div style={styles} className="w-full mb-8">
				<Flicking {...settings} align="prev" circular renderOnlyVisible>
					{content.map((item, index) => (
						<div className="w-1/3 mobile:w-full mobile:p-6 p-14" key={index + 1}>
							<CardCombo item={item} />
						</div>
					))}
				</Flicking>
				<div className="text-center">{renderPagination(content.length)}</div>
				<div className="text-center mt-8">
					<Button type="button" onClick={() => history.push(DX.sme.createPath('/combos'))}>
						{tButton('watchMore')}
					</Button>
				</div>
			</animated.div>
		</div>
	);
}

function CardCombo({ item }) {
	const { isTablet } = useSelector(appSelects.selectSetting);

	return (
		<div className="w-full  py-6 tablet:py-4">
			<Link to={DX.sme.createPath(`/combo/${item.id}`)} className="pointer-events-auto" title={item.name}>
				<div
					className="shadow-card mobile:shadow-card-sm hover:shadow-card-sm rounded-2xl pb-8 w-full bg-white transform duration-500  hover:scale-125"
					style={{ transform: isTablet ? 'none' : '' }}
				>
					<span className="w-full pt-full relative block mb-8 tablet:mb-2">
						<LazyLoad debounce={false} offsetVertical={700} className="w-full-h-full">
							<img
								src={item.icon || '/images/NoImageNew.svg'}
								alt="serviceName"
								title={item.name}
								className="object-cover w-full h-full absolute -top-2 left-0 rounded-2xl"
							/>
						</LazyLoad>
					</span>
					<div className="font-bold text-xl text-primary text-center h-16 px-4 tablet:h-10">{item.name}</div>
				</div>
			</Link>
		</div>
	);
}
