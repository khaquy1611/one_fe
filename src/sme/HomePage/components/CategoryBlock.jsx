/* eslint-disable no-extra-boolean-cast */
import { SearchCommon } from 'app/components/Atoms';
import { useQueryUrl, useLng } from 'app/hooks';
import { DX, SmeService } from 'app/models';
import React, { useState } from 'react';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { appSelects } from 'app/appReducer';
import { Button, Drawer } from 'antd';
import usePagination from 'app/hooks/usePagination';
import { useInView } from 'react-intersection-observer';
// import { useSpring, animated } from '@react-spring/web';
import { queryCache } from 'app/helpers';
import { FilterIcon } from 'app/icons';
import { MenuItem } from 'sme/components';
import CardService from './CardService';

const queryKey = 'Home.getListService';
const { getData, setData } = queryCache(queryKey);

const getListService = async (params) => {
	if (!params?.category) {
		const dataCache = getData();
		if (dataCache) {
			return dataCache;
		}
	}

	const res = await SmeService.getAllPagination(params);
	if (!params?.category) {
		setData(res);
	}

	return res;
};
export default function CategoryBlock() {
	const history = useHistory();
	const query = useQueryUrl();
	const categoryId = query.get('category');
	const { categoryList } = useSelector(appSelects.selectCategoryState);
	const { isTablet } = useSelector(appSelects.selectSetting);
	const { tMenu, tButton, tField } = useLng();
	const [showMenuCateMobile, setShowMenuCateMobile] = useState(false);

	const { content: services } = usePagination(getListService, ['category'], {}, queryKey);
	const { ref, inView } = useInView({
		threshold: isTablet ? 0.1 : 0.2,
	});
	// const styles = useSpring({
	// 	opacity: inView ? 1 : 0,
	// 	x: inView ? 0 : -40,
	// });
	// const stylesList = useSpring({
	// 	scale: inView ? 1 : 0.85,
	// 	opacity: inView ? 1 : 0,
	// });
	const handleClick = (category) => {
		if (category.id) {
			history.push(DX.sme.createPath(`?category=${category.id}`));
		} else {
			history.push(DX.sme.createPath(``));
		}
		setShowMenuCateMobile(false);
	};

	const onCloseMenuLeft = () => {
		setShowMenuCateMobile(false);
	};

	const onShowMenuLeft = () => {
		setShowMenuCateMobile(true);
	};

	return (
		<>
			<div className="flex mobile:flex-wrap justify-between items-center">
				<h1 className="font-bold text-4xl text-primary uppercase w-1/2 mobile:w-full mb-8">
					{tMenu('discovery')}
				</h1>
				<div className="flex gap-4 w-1/2 mobile:w-full mb-8">
					<SearchCommon
						placeholder={tField('opt_search')}
						onSearch={(value) => {
							history.push(`${DX.sme.createPath(`/products`)}?search=${value}&&category=${categoryId}`);
						}}
						maxLength={200}
						defaultValue=""
						className="tablet:w-full rounded-2xl"
					/>
					<Button className="hidden mobile:block rounded-2xl" onClick={onShowMenuLeft}>
						Danh mục <FilterIcon width="w-5" className="inline-block" />
					</Button>
				</div>
			</div>
			<div className="flex gap-8 tablet:gap-6">
				<div
					className={clsx(
						'w-3/12 tablet:w-1/3 transform mobile:hidden rounded-2xl p-4',
						inView ? ' translate-x-0 duration-300' : '-translate-x-10 tablet:-translate-x-0',
					)}
					style={{ background: '#f8f8f8' }}
				>
					<MenuItem
						className="mb-8"
						menu={[{ label: tMenu('all'), value: 0 }, ...categoryList]}
						keyMenu={parseInt(categoryId, 10) || 0}
						title={tMenu('category')}
						handleClick={handleClick}
					/>
				</div>
				<div className="w-9/12 tablet:w-2/3 mobile:w-full" ref={ref}>
					<div className="w-full grid grid-cols-3 gap-8 tablet:grid-cols-2 tablet:gap-6">
						{services.slice(0, 6).map((item, index) => (
							<div
								key={item.id}
								className={clsx(
									'transform duration-300',
									inView ? '' : 'translate-x-10 tablet:translate-x-0',
									!inView && index % 2 === 0 && 'mobile:-translate-x-2',
									!inView && index % 2 === 1 && 'mobile:translate-x-2',
								)}
							>
								<CardService
									banner={item.banner || item.externalLinkBanner}
									id={item.id}
									icon={item.icon || item.externalLink}
									name={item.name}
									to={DX.sme.createPath(`/service/${item.id}`)}
									category={item.categoryName}
									serviceOwner={item.serviceOwner}
								/>
							</div>
						))}
					</div>
					<div className="w-full mt-8 text-center">
						{services.length > 0 ? (
							<Button
								type="default"
								onClick={() =>
									history.push(DX.sme.createPath(`/products?category=${categoryId || ''}`))
								}
								className="rounded-2xl"
							>
								{tButton('watchMore')}
							</Button>
						) : (
							tButton('notServiceYet')
						)}
					</div>
				</div>
			</div>
			<Drawer
				title={<div className="text-center">{tMenu('category')}</div>}
				placement="left"
				onClose={onCloseMenuLeft}
				visible={showMenuCateMobile}
				width="100%"
			>
				<MenuItem
					className="mb-8"
					menu={[{ label: tMenu('all'), value: 0 }, ...categoryList]}
					keyMenu={parseInt(categoryId, 10) || 0}
					handleClick={handleClick}
				/>
			</Drawer>
		</>
	);
}
