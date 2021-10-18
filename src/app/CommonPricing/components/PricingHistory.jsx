import React, { useState } from 'react';
import { Button, Table, Tag } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Pricing, SaasAdmin, DX } from 'app/models';
import { usePagination, useLng } from 'app/hooks';

export default function PricingHistory({ portal, tabNumber, setActive }) {
	const { id, pricingId } = useParams();
	const history = useHistory();
	const { pathname } = useLocation();
	const [objMax, setObjMax] = useState({});
	const { tField, tButton, tFilterField } = useLng();

	const { configTable, getColumnSortDefault, sort, total } = usePagination(
		async (params) => {
			const res = await Pricing.getListPricingHistory(portal, pricingId, params);
			const max = res.content.reduce(
				(prev, current) =>
					((current.id > prev.id && typeof prev.id === 'number') || (current.id && !prev.id)) &&
					current.approveStatus === 'APPROVED'
						? current
						: prev,
				{},
			);
			setObjMax(max);
			return res;
		},
		[],
		{
			sort: 'approvedTime,desc',
		},
		'getListPricingHistory',
		{
			enabled: !!pricingId && tabNumber === '3',
		},
	);

	function handleClickHistory(value) {
		if (value.approveStatus !== SaasAdmin.tagStatus.APPROVED.value) {
			history.replace(`${pathname}?tab=1`);
			setActive('1');
		} else if (value.id === objMax.id) {
			history.replace(`${pathname}?tab=2`);
			setActive('2');
		} else if (portal === 'admin') {
			history.push(DX.admin.createPath(`/saas/list/${id}/history/${value.id}`));
		} else history.push(DX.dev.createPath(`/service/list/${id}/history/${value.id}`));
	}

	const columns = [
		{
			title: tField('version'),
			dataIndex: 'id',
			key: 'id',
			render: (text, record, index) => (
				<Button type="link" className="m-0 p-0 h-3" onClick={() => handleClickHistory(record)}>
					{sort.indexOf('desc') > -1 ? total - index : index + 1}
				</Button>
			),
		},
		{
			title: tField('approvedTime'),
			dataIndex: 'approvedTime',
			key: 'approvedTime',
			sorter: {},
		},
		{
			title: tField('status'),
			dataIndex: 'approveStatus',
			key: 'approveStatus',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				const { icon: Icon } = tagInfo;
				return (
					<Tag color={tagInfo?.color} icon={<Icon />}>
						{tFilterField('approvalStatusOptions', tagInfo?.text)}
					</Tag>
				);
			},
		},
	];

	return (
		<>
			<Table
				className="mt-8"
				columns={getColumnSortDefault(columns)}
				{...configTable}
				pagination={{ position: ['none'], pageSize: 1000000000 }}
			/>
			<Button
				style={{ width: '4rem' }}
				className="float-right mt-10"
				onClick={() => {
					if (portal === 'admin') {
						history.push(DX.admin.createPath(`/saas/list/${id}?tab=3`));
						return;
					}
					history.push(DX.dev.createPath(`/service/list/${id}?tab=3`));
				}}
			>
				{tButton('opt_cancel')}
			</Button>
		</>
	);
}
