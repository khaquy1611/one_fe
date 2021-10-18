import React from 'react';
import { usePagination, useLng } from 'app/hooks';
import { Table, Tag, Select } from 'antd';
import { renderOptions, SearchCommon, UrlBreadcrumb } from 'app/components/Atoms';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { noop } from 'opLodash';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';
import { SaasAdmin, Categories, DX } from 'app/models';
import useUser from '../../../app/hooks/useUser';

export default function SaasList() {
	const { tField, tFilterField } = useLng();
	const { user } = useUser();
	const { configTable, page, pageSize, query, onChangeOneParam, getColumnSortDefault } = usePagination(
		SaasAdmin.getAllPagination,
		['status', 'displayed', 'categoriesId', 'searchText'],
		{
			sort: 'updatedTime,desc',
			status: 'UNSET',
			displayed: 'UNSET',
		},
	);
	const [status, displayed, categoriesId, searchText] = [
		query.get('status') || 'UNSET',
		query.get('displayed') || 'UNSET',
		parseInt(query.get('categoriesId'), 10) || null,
		query.get('searchText') || '',
	];
	const { data: categorySelect } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await Categories.getAllForDropdownList();
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

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 90,
		},
		{
			title: tField('serviceName'),
			dataIndex: 'name',
			render: (value, record) => (
				<AvatarWithText
					name={value}
					icon={record.icon || record.externalLink}
					linkTo={
						DX.canAccessFuture2('admin/view-service', user.permissions) &&
						DX.admin.createPath(`/saas/list/${record.id}`)
					}
				/>
			),
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('developer'),
			dataIndex: 'developer',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('updateTime'),
			dataIndex: 'updatedTime',
			sorter: {},
		},
		{
			title: tField('category'),
			dataIndex: 'categoryName',
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('approvalStatus'),
			dataIndex: 'status',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				const { icon: Icon } = tagInfo;
				if (!Icon) return null;
				return (
					<Tag color={tagInfo?.color} icon={<Icon />}>
						{tFilterField('approvalStatusOptions', tagInfo?.text)}
					</Tag>
				);
			},
			sorter: {},
		},
		{
			title: tField('display'),
			dataIndex: 'displayed',
			render: (value) => {
				const useInfo = SaasAdmin.tagDisplay[value] || {};
				const { icon: Icon } = useInfo;
				if (!Icon) return null;
				return (
					<Tag color={useInfo?.color} icon={<Icon />}>
						{tFilterField('displayStatusOptions', useInfo?.text)}
					</Tag>
				);
			},
			width: '8rem',
			sorter: {},
		},
	];

	const statusOptions = [
		{
			value: 'UNSET',
			label: tFilterField('approvalStatusOptions', 'all'),
		},
		{
			value: 'UNAPPROVED',
			label: tFilterField('approvalStatusOptions', 'notApprovedYet'),
		},
		{
			value: 'AWAITING_APPROVAL',
			label: tFilterField('approvalStatusOptions', 'pending'),
		},
		{
			value: 'APPROVED',
			label: tFilterField('approvalStatusOptions', 'approved'),
		},
		{
			value: 'REJECTED',
			label: tFilterField('approvalStatusOptions', 'reject'),
		},
	];

	const displayOptions = [
		{
			value: 'UNSET',
			label: tFilterField('displayStatusOptions', 'all'),
		},
		{
			value: 'VISIBLE',
			label: tFilterField('displayStatusOptions', 'show'),
		},
		{
			value: 'INVISIBLE',
			label: tFilterField('displayStatusOptions', 'hide'),
		},
	];

	const onSearch = (value) => {
		onChangeOneParam('searchText')(value);
	};

	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb type="listSaas" />
				<SearchCommon
					autoFocus
					className="w-64"
					placeholder={tField('opt_search')}
					onSearch={onSearch}
					defaultValue={searchText}
					maxLength={50}
				/>
			</div>
			<div className="flex mt-5">
				<div>
					<Select className="w-60 mr-6" value={categoriesId} onSelect={onChangeOneParam('categoriesId')}>
						{renderOptions(tFilterField('prefix', 'category'), [
							{ label: tFilterField('categoryOptions', 'all'), value: null },
							...categorySelect,
						])}
					</Select>
					<Select className="w-60 mr-6" value={status} onSelect={onChangeOneParam('status')}>
						{renderOptions(tFilterField('prefix', 'approvalStatus'), statusOptions)}
					</Select>
					<Select className="w-60 mr-6" value={displayed} onSelect={onChangeOneParam('displayed')}>
						{renderOptions(tFilterField('prefix', 'displayStatus'), displayOptions)}
					</Select>
				</div>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}

SaasList.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object),
	columns: PropTypes.arrayOf(PropTypes.object),
	page: PropTypes.number,
	pageSize: PropTypes.number,
	onChangePage: PropTypes.func,
	onChangeTable: PropTypes.func,
};

SaasList.defaultProps = {
	data: [],
	columns: [],
	page: 1,
	pageSize: 10,
	onChangePage: noop,
	onChangeTable: noop,
};
