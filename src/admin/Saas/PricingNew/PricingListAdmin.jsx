import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { DX, SaasAdmin, Pricing } from 'app/models';
import { Button, Radio, Space, Table, Tag } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { useQuery } from 'react-query';

export default function PricingListAdmin() {
	const { id } = useParams();
	const history = useHistory();
	const { tField, tButton, tFilterField } = useLng();
	const { user } = useUser();
	const CAN_VIEW_SERVICE_PACKAGE = DX.canAccessFuture2('admin/view-service-pack', user.permissions);
	const CAN_APPROVED_PACK =
		CAN_VIEW_SERVICE_PACKAGE && DX.canAccessFuture2('admin/approved-service-pack', user.permissions);

	const { data, refetch } = useQuery(
		['getSubscription', id],
		async () => {
			try {
				const res = await Pricing.getListPricingForAdmin(id);
				return res;
			} catch (e) {
				return {};
			}
		},
		{ initialData: [] },
	);

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, record, index) => index + 1,
			width: 60,
		},
		{
			title: tField('packageName'),
			dataIndex: 'pricingName',
			key: 'pricingName',
			render: (value, record) => (
				<Space size="middle">
					{CAN_VIEW_SERVICE_PACKAGE ? (
						<Link to={DX.admin.createPath(`/saas/list/${id}/${record.id}`)}>{value}</Link>
					) : (
						value
					)}

					{record.isSold === 'NOT_SOLD_YET' && <Tag color="success">{tFilterField('value', 'selling')}</Tag>}
				</Space>
			),
			width: '20rem',
			ellipsis: true,
			sorter: {},
		},
		{
			title: tField('display'),
			dataIndex: 'status',
			key: 'status',
			render: (value) => {
				const useInfo = SaasAdmin.tagDisplay[value] || {};
				return <Tag color={useInfo?.color}>{tFilterField('displayStatusOptions', useInfo?.text)}</Tag>;
			},
			sorter: {},
		},
		{
			title: tField('approvalStatus'),
			dataIndex: 'approve',
			key: 'approve',
			render: (value) => {
				const tagInfo = SaasAdmin.tagStatus[value] || {};
				const { icon: Icon } = tagInfo;
				return (
					<Tag color={tagInfo?.color} icon={<Icon />}>
						{tFilterField('approvalStatusOptions', tagInfo?.text)}
					</Tag>
				);
			},
			sorter: {},
		},
		{
			title: tField('updateTime'),
			dataIndex: 'modifiedAt',
			key: 'modifiedAt',
			sorter: {},
		},
		{
			align: 'center',
			title: tField('recommendation'),
			dataIndex: 'recommendedStatus',
			key: 'recommendedStatus',
			render: (value) => <Radio disabled checked={value === 'RECOMMENDED'} />,
			width: '9rem',
		},
		{
			align: 'center',
			render: (text, record) =>
				CAN_APPROVED_PACK &&
				record.approve === 'AWAITING_APPROVAL' && (
					<Button
						type="link"
						className="m-0 p-0 h-3"
						onClick={() => history.push(DX.admin.createPath(`/saas/list/${id}/${record.id}`))}
					>
						{tButton('opt_approve', { field: 'package' })}
					</Button>
				),
			width: '8rem',
		},
	];

	return (
		<div>
			<Table
				className="mt-8 beauty-scroll-table"
				columns={columns}
				dataSource={data}
				pagination={{ position: ['none'], pageSize: 1000000000 }}
				scroll={{ x: 810, y: 585 }}
			/>
			<Link to={DX.admin.createPath('/saas/list')}>
				<Button
					className="w-20 float-right border-217 mt-5"
					onClick={() => history.push(DX.admin.createPath('/saas/list'))}
				>
					{tButton('opt_cancel')}
				</Button>
			</Link>
		</div>
	);
}
