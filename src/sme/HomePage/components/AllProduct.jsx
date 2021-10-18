import React, { useState } from 'react';
import { Rate, Select, Breadcrumb, Drawer, Button, Spin } from 'antd';
import { useQueryUrl, useLng } from 'app/hooks';
import { DX } from 'app/models';
import { trim } from 'opLodash';
import { Link } from 'react-router-dom';
import { SearchCommon } from 'app/components/Atoms';
import { useSelector } from 'react-redux';
import { appSelects } from 'app/appReducer';
import useLoadMore from 'app/hooks/useLoadMore';
import clsx from 'clsx';
import { FilterIcon, SortIcon } from 'app/icons';
import { MenuItem } from 'sme/components';
import ScrollToTop from './ScrollToTop';
import { CardService } from '.';

const AllProduct = ({ fnCall, textAllProduct, isCombo }) => {
	const queryUrl = useQueryUrl();
	const [isShowCate, setIsShowCate] = useState(false);
	const [isShowSort, setIsShowSort] = useState(false);
	const { isMobile } = useSelector(appSelects.selectSetting);
	const searchResult = queryUrl.get('search') || '';
	const sortActive = queryUrl.get('sort') || '';
	const starActive = parseInt(queryUrl.get('star'), 10);
	const categoryActive = parseInt(queryUrl.get('category'), 10) || 0;
	const sort = queryUrl.get('sort');
	const { tOthers, tFilterField, tMenu, tField } = useLng();
	const { data: content, isFetching, onChangeOneParam, canLoadMore, loadMore, page } = useLoadMore({
		fnCall,
		extraParams: ['category', 'search', 'sort', 'star'],
		keyQuery: isCombo ? 'allCombo' : 'allService',
	});

	const { categoryList } = useSelector(appSelects.selectCategoryState);

	const dataStar = [5, 4, 3, 2, 1].map((start) => ({
		label: (
			<>
				<Rate disabled value={start} />
				&nbsp; {start} {tOthers('star')}
			</>
		),
		value: start,
	}));
	const dataStarDrawer = [5, 4, 3, 2, 1].map((start) => ({
		label: (
			<>
				{start} {tOthers('star')}
			</>
		),
		value: start,
	}));

	const categorySelect = [
		{ label: tFilterField('value', 'bestseller'), value: 'bestseller' },
		{ label: tFilterField('value', 'latest'), value: 'latest' },
		{ label: tFilterField('value', 'trend'), value: 'trend' },
	];

	const handleClick = (category) => {
		onChangeOneParam('category')(category.id);
		setIsShowCate(false);
	};
	const handleSort = (sortType) => {
		setIsShowSort(false);
		return onChangeOneParam(sortType);
	};

	const label = searchResult ? tMenu('searchValue') : tMenu(textAllProduct);
	return (
		<>
			<div className="w-full">
				<Breadcrumb className="mb-5">
					<Breadcrumb.Item>
						<Link to={DX.sme.path}>{tMenu('homePage')}</Link>
					</Breadcrumb.Item>
					<Breadcrumb.Item>{label}</Breadcrumb.Item>
				</Breadcrumb>
				<h1 className="flex-1 font-bold text-4xl mobile:text-2xl mb-5 text-primary uppercase">{label}</h1>
			</div>
			<div className="flex gap-8">
				<div className="w-1/4 transform mobile:hidden tablet:w-1/3">
					<MenuItem
						className="mb-8 rounded-2xl p-4 pb-8"
						menu={[{ label: tMenu('all'), value: 0 }, ...categoryList]}
						keyMenu={categoryActive}
						title={tMenu('category')}
						handleClick={handleClick}
						style={{ background: '#f8f8f8' }}
					/>

					<MenuItem
						className="mb-8 rounded-2xl p-4 pb-8"
						menu={dataStar}
						keyMenu={starActive}
						handleClick={(dataMenu) => onChangeOneParam('star')(trim(dataMenu.value))}
						title={tMenu('rating')}
						style={{ background: '#f8f8f8' }}
					/>
				</div>

				<div className="w-3/4 tablet:w-4/6 mobile:w-full">
					<div className="grid grid-cols-3 tablet:grid-cols-2 mobile:w-full mobile:block gap-7 tablet:gap-4">
						<div
							className={clsx(
								'col-span-2 ',
								!isCombo ? 'tablet:col-span-1' : 'col-start-2 tablet:col-start-1',
							)}
						>
							<SearchCommon
								placeholder={tField('opt_enter', { field: 'searchContent' })}
								onSearch={(value) => {
									onChangeOneParam('search')(trim(value));
								}}
								defaultValue={searchResult}
								className="mb-8 mobile:mb-4"
								maxLength={200}
							/>
						</div>
						{!isCombo && (
							<div className="mobile:hidden">
								<Select
									value={sort}
									onSelect={onChangeOneParam('sort')}
									className="text-base font-medium w-full border-0"
									allowClear
									filterOption
									onClear={() => onChangeOneParam('sort')(undefined)}
									placeholder={tField('all')}
									options={categorySelect}
								/>
							</div>
						)}
					</div>
					<div className="mobile:flex mb-6 hidden">
						<Button className="flex-1 mr-4 text-lg" onClick={() => setIsShowCate(true)}>
							{tMenu('category')} <FilterIcon width="w-5" className="pt-1" />
						</Button>
						<Button className="flex-1 text-lg" onClick={() => setIsShowSort(true)}>
							{tMenu('sortBy')} <SortIcon width="w-5" className="pt-1" />
						</Button>
					</div>
					<div className="w-full">
						{content.length !== 0 ? (
							<div
								className="w-full grid tablet:grid-cols-2 grid-cols-3 gap-8 tablet:gap-4"
								key={content.id}
							>
								{content?.map((item) => (
									<div
										key={item.id}
										// style={stylesList}
										className="h-full animate-card"
									>
										<CardService
											banner={isCombo ? item.icon : item.banner || item.externalLinkBanner}
											id={item.id}
											icon={isCombo ? null : item.icon || item.externalLink}
											name={item.name}
											to={DX.sme.createPath(
												isCombo ? `/combo/${item.id}` : `/service/${item.id}`,
											)}
											category={item.categoryName}
											serviceOwner={item.serviceOwner}
										/>
									</div>
								))}
							</div>
						) : (
							<div className="text-center font-semibold">{!isFetching && tOthers('notFoundService')}</div>
						)}
						<div className="justify-center flex">
							<Spin spinning={isFetching} />
						</div>
						{canLoadMore && (
							<div className="text-center">
								<Button size="small" onClick={loadMore} className="mt-8 ">
									Xem thêm
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
			<ScrollToTop />

			{isMobile && (
				<>
					<Drawer
						title={<div className="text-center">{tMenu('category')}</div>}
						placement="left"
						onClose={() => setIsShowCate(false)}
						visible={isShowCate}
						width="100%"
					>
						<MenuItem
							className="mb-8"
							menu={[{ label: tMenu('all'), value: 0 }, ...categoryList]}
							keyMenu={categoryActive}
							handleClick={handleClick}
						/>
					</Drawer>
					<Drawer
						title={<div className="text-center">{tMenu('sort')}</div>}
						placement="left"
						onClose={() => setIsShowSort(false)}
						visible={isShowSort}
						width="100%"
					>
						{!isCombo && (
							<MenuItem
								className="mb-8"
								menu={categorySelect}
								keyMenu={sortActive}
								addOnHeader={tMenu('sortBy')}
								handleClick={(dataMenu) => handleSort('sort')(trim(dataMenu.value))}
							/>
						)}
						<MenuItem
							className="mb-8"
							menu={dataStarDrawer}
							keyMenu={starActive}
							addOnHeader={tMenu('rating')}
							handleClick={(dataMenu) => handleSort('star')(trim(dataMenu.value))}
						/>
					</Drawer>
				</>
			)}
		</>
	);
};

export default AllProduct;
