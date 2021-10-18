import React, { useState } from 'react';
import { Button, Table, Tag } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { SaasAdmin, DX, ComboPricing } from 'app/models';
import { usePagination, useLng } from 'app/hooks';

export default function ComboPricingHistory({ portal, tabNumber, setActive }) {
	const { id, pricingId } = useParams();
	const history = useHistory();
	const { pathname } = useLocation();
	const [objMax, setObjMax] = useState({});
	const { tField, tButton, tFilterField } = useLng();

	const { configTable, getColumnSortDefault, sort, total } = usePagination(
		async (params) => {
			const res = await ComboPricing.getListHistoryByComboPlanId({ id: pricingId, query: params });
			const max = res.content.reduce(
				(prev, current) =>
					((current.objectId > prev.objectId && typeof prev.objectId === 'number') ||
						(current.objectId && !prev.objectId)) &&
					current.status === 'APPROVED'
						? current
						: prev,
				{},
			);
			setObjMax(max);
			return res;
		},
		[],
		{
			sort: 'createdAt,desc',
		},
		'getListHistoryByComboPlanId',
		{
			enabled: !!pricingId && tabNumber === '3',
		},
	);

	function handleClickHistory(value) {
		if (value.status !== SaasAdmin.tagStatus.APPROVED.value) {
			history.replace(`${pathname}?tab=1`);
			setActive('1');
		} else if (value.objectId === objMax.objectId) {
			history.replace(`${pathname}?tab=2`);
			setActive('2');
		} else if (portal === 'admin') {
			history.push(DX.admin.createPath(`/combo/${id}/history-plan/${value.objectId}`));
		} else history.push(DX.dev.createPath(`/combo/${id}/history-plan/${value.objectId}`));
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
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (value, record) => record.status === 'APPROVED' && value,
			sorter: {},
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			key: 'status',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				return <Tag color={tagInfo?.color}>{tFilterField('approvalStatusOptions', tagInfo?.text)}</Tag>;
			},
		},
	];

	return (
		<div>
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
						history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
						return;
					}
					history.push(DX.dev.createPath(`/combo/${id}?tab=3`));
				}}
			>
				{tButton('opt_cancel')}
			</Button>
		</div>
	);
}
