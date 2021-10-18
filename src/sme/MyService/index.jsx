import { Button, Drawer, Pagination, Select, Spin, Tabs } from 'antd';
import { appSelects } from 'app/appReducer';
import { filterOption, renderOptions, SearchCommon, SelectDebounce } from 'app/components/Atoms';
import { useLng, usePagination, useQueryUrl } from 'app/hooks';
import { FilterIcon } from 'app/icons';
import { CategoryPortal, SMESubscription } from 'app/models';
import { trim, uniqBy as _uniqBy } from 'opLodash';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { MenuItem } from 'sme/components';
import ServiceItem from './ServiceItem';

const { TabPane } = Tabs;

function MyService() {
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const devInfoActive = parseInt(queryUrl.get('devId'), 10) || 0;
	const [isShowFilter, setIsShowFilter] = useState(false);
	const [devInfo, setDevInfo] = useState([]);
	const { tMenu, tFilterField, tField, tOthers } = useLng();

	const { content, isFetching, onChangeOneParam, query, total, configTable } = usePagination(
		SMESubscription.getMyService,
		['categoryId', 'devId', 'name', 'tab'],
		{
			size: 12,
		},
	);
	const paginationConfig = {
		...configTable.pagination,
		showSizeChanger: false,
	};
	const [categoryId] = [parseInt(query.get('categoryId'), 10) || null];
	const { categoryList } = useSelector(appSelects.selectCategoryState);

	const { data: categorySelect } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			return [
				...res.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	const fetchDeveloper = async (text) => {
		try {
			const { content: res } = await SMESubscription.getListDeveloper({
				page: 0,
				size: 20,
				name: text,
			});
			const temp = res.map((item) => ({
				value: item.companyId,
				label: item.companyName,
			}));
			setDevInfo(_uniqBy(temp, 'value'));

			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};

	const handleCategoryClick = (category) => {
		onChangeOneParam('categoryId')(category.id);
	};

	return (
		<>
			<div className="w-full">
				<div className="mb-5 font-bold text-3xl text-primary uppercase">{tMenu('myService')}</div>
				<div className="mobile:block items-center justify-between gap-8 tablet:gap-5 mb-8">
					<div className="w-2/3 tablet:w-full flex gap-4">
						<SearchCommon
							placeholder={`${tField('opt_enter', { field: 'searchContent' })}`}
							onSearch={(value) => {
								onChangeOneParam('name')(value);
							}}
							maxLength={200}
							defaultValue={query.get('name')}
						/>
						<Button
							className="hidden mobile:block rounded-xl ant-btn-lg"
							onClick={() => setIsShowFilter(true)}
						>
							<FilterIcon width="w-5" className="inline-block" />
						</Button>
					</div>
					<div className="flex w-2/3 tablet:w-full gap-8 tablet:gap-5 mt-7 mobile:hidden">
						<div className="w-1/2">
							<Select
								value={categoryId}
								onSelect={onChangeOneParam('categoryId')}
								className="text-sm w-full border-0"
								showSearch
								allowClear
								filterOption={filterOption}
								onClear={() => onChangeOneParam('categoryId')(undefined)}
								placeholder={`${tFilterField('prefix', 'category')}: ${tField('all')}`}
							>
								{renderOptions(tFilterField('prefix', 'category'), [...categorySelect])}
							</Select>
						</div>
						<div className="w-1/2">
							<SelectDebounce
								className="text-sm w-full border-0"
								showSearch
								allowClear
								placeholder={`${tFilterField('prefix', 'dev')}: ${tField('all')}`}
								onClear={() => onChangeOneParam('devId')(undefined)}
								fetchOptions={fetchDeveloper}
								onSelect={onChangeOneParam('devId')}
							/>
						</div>
					</div>
				</div>

				<Tabs
					activeKey={getTab || 'service'}
					onChange={(activeTab) => {
						onChangeOneParam('tab')(activeTab);
					}}
					className="custom-tab sub"
				>
					<TabPane tab={<span className="uppercase font-semibold">Dịch vụ phần mềm</span>} key="service" />
					<TabPane tab={<span className="uppercase font-semibold">Dịch vụ order</span>} key="orderService" />
				</Tabs>

				<Spin spinning={isFetching}>
					{content.length !== 0 ? (
						<div className="w-full grid tablet:grid-cols-3 mobile:grid-cols-2 grid-cols-4 gap-10">
							{content.map((item) => (
								<ServiceItem key={item.id} {...item} tab={getTab} />
							))}
						</div>
					) : (
						<div className="text-center font-semibold">{tOthers('notFoundService')}</div>
					)}
					{total > 0 && (
						<div>
							<Pagination {...paginationConfig} className="mt-8 flex justify-center" />
						</div>
					)}
				</Spin>
			</div>

			<Drawer
				title={<div className="text-center">{tOthers('searchBy')}</div>}
				placement="left"
				onClose={() => setIsShowFilter(false)}
				visible={isShowFilter}
				width="100%"
			>
				<MenuItem
					className="mb-8"
					menu={[{ label: tMenu('all'), value: 0 }, ...categoryList]}
					keyMenu={categoryId}
					addOnHeader={tMenu('category')}
					handleClick={handleCategoryClick}
				/>
				<MenuItem
					className="mb-8"
					menu={devInfo}
					keyMenu={devInfoActive}
					addOnHeader={tMenu('dev')}
					handleClick={(data) => onChangeOneParam('devId')(trim(data.value))}
				/>
			</Drawer>
		</>
	);
}

export default MyService;
