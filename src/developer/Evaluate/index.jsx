import { Rate, Select, Tag, Table } from 'antd';
import { renderOptions, SelectDebounce } from 'app/components/Atoms';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { usePagination, useUser } from 'app/hooks';
import { DX, SaasDev } from 'app/models';
import DevEvaluate from 'app/models/DevEvaluate';
import { isInt } from 'app/validator';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uniqBy as _uniqBy } from 'opLodash';
import AvatarWithText from 'app/components/Atoms/AvatarWithText';

export default function ServiceList() {
	const { user } = useUser();
	const CAN_VIEW =
		DX.canAccessFuture2('dev/view-evaluate', user.permissions) ||
		DX.canAccessFuture2('dev/view-evaluate-combo', user.permissions);
	const { t } = useTranslation('evaluate');
	const [count, setCount] = useState(0);
	const {
		configTable,
		page,
		pageSize,
		query,
		onChangeOneParam,
		getColumnSortDefault,
	} = usePagination(DevEvaluate.getAllPagination, ['search', 'displayed', 'serviceId', 'name']);
	const displayOptions = [
		{
			value: '',
			label: 'Tất cả',
		},
		{
			value: 'VISIBLE',
			label: 'Hiện',
		},
		{
			value: 'INVISIBLE',
			label: 'Ẩn',
		},
	];

	const [displayed, serviceId] = [query.get('displayed') || '', parseInt(query.get('serviceId'), 10) || null];

	const optionService = async (text) => {
		try {
			const valueStatus = 'APPROVED';
			const { content: res } = await SaasDev.getAllPagination({
				sort: 'name,asc',
				page: 0,
				size: 10,
				displayed: 'UNSET',
				status: valueStatus,
				name: text,
			});

			if (count === 0 && serviceId && !res.find((el) => el.id === serviceId)) {
				setCount(1);
				const serviceDetail = await SaasDev.getDetail(serviceId);
				if (serviceDetail) {
					res.unshift({
						id: serviceDetail.id,
						name: serviceDetail.name,
					});
				} else {
					onChangeOneParam('serviceId')(undefined);
				}
			}

			const temp = res.map((e) => ({
				label: e.name,
				value: e.id,
			}));

			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: '10%',
		},
		{
			title: t('evaluate.serviceName'),
			dataIndex: 'name',
			key: 'name',
			render: (value, record) => (
				<AvatarWithText
					name={value}
					icon={record.icon}
					linkTo={CAN_VIEW && `/dev-portal/ticket/evaluate/${record.id}`}
				/>
			),
			sorter: {},
			width: '30%',
			ellipsis: true,
		},
		{
			title: t('evaluate.display'),
			dataIndex: 'displayed',
			key: 'displayed',
			render: (value) => {
				const tagInfo = DevEvaluate.tagDisplay[value] || {};
				const { icon: Icon } = tagInfo;
				if (!Icon) return null;
				return (
					<Tag color={tagInfo?.color} icon={<Icon />}>
						{t(tagInfo?.text)}
					</Tag>
				);
			},
			sorter: {},
		},
		{
			title: t('evaluate.newComment'),
			dataIndex: 'totalComment',
			sorter: {},
		},
		{
			title: t('evaluate.pendingComment'),
			dataIndex: 'commentNotReply',
			sorter: {},
		},
		{
			title: t('evaluate.averageRating'),
			dataIndex: 'ratingQuantity',
			render: (value, record) => (
				<div className="flex items-center gap-3">
					<Rate
						disabled
						allowHalf
						value={isInt(record.avgRating)}
						className="text-base"
						style={{ color: '#F4BF1B' }}
					/>
					<span>({record.ratingQuantity})</span>
				</div>
			),
			sorter: {},
			width: 200,
		},
	];

	return (
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb type="commentRating" />
			</div>
			<div className="flex mt-5">
				<SelectDebounce
					showSearch
					allowClear
					className="w-60 mr-6"
					placeholder="Tên dịch vụ: Tất cả"
					onClear={() => onChangeOneParam('serviceId')(undefined)}
					fetchOptions={optionService}
					onSelect={onChangeOneParam('serviceId')}
					value={serviceId}
					maxLength={50}
				/>
				<Select className="w-60 mr-6" value={displayed} onSelect={onChangeOneParam('displayed')}>
					{renderOptions('Trạng thái', displayOptions)}
				</Select>
			</div>
			<Table className="mt-8" columns={getColumnSortDefault(columns)} {...configTable} />
		</div>
	);
}
