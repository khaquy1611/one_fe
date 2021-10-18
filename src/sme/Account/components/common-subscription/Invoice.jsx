import { Table, Tag } from 'antd';
import { useLng, usePaginationLocal } from 'app/hooks';
import { BillingPortal, DX, SubscriptionDev } from 'app/models';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const rootPath = `${DX.sme.createPath('/account')}`;

const COMBO = 'COMBO';

function Invoice({ typeSubscription }) {
	const { id } = useParams();
	const { tFilterField, tField, tOthers } = useLng();

	// getBillingOfSubscription
	const { page, pageSize, filterLocal, configTable, data } = usePaginationLocal(
		() => SubscriptionDev.getListBillingSubscription(id),
		[],
		{
			sort: '',
		},
		'getListSubscriptionInvoice',
	);

	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			render: (_, item, index) => (page - 1) * pageSize + index + 1,
			width: 100,
		},
		{
			title: tField('billCode'),
			dataIndex: 'billingCode',
			render: (value, record) => <Link to={`${rootPath}/invoice/${record.id}?type=SUB`}>{value}</Link>,
		},
		{
			title: typeSubscription === COMBO ? tField('comboPlan') : tField('servicePackage'),
			dataIndex: 'pricingName',
			ellipsis: true,
		},
		{
			title: <span> {tField('totalCost')} (VND)</span>,
			dataIndex: 'totalAmount',
			render: (value) => DX.formatNumberCurrency(value),
			ellipsis: true,
		},
		{
			title: tField('timeForPayment'),
			dataIndex: 'currentPaymentDate',
		},
		{
			align: 'center',
			title: tField('status'),
			dataIndex: 'status',
			render: (value, record) => {
				const tagInfo = BillingPortal.tagStatus[record.status];
				if (!tagInfo) return null;
				return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
			},
		},
	];

	if (data.content?.length === 0) return <div className="font-semibold">{tOthers('noInvoiceInfo')}</div>;

	return (
		<div className="box-detail">
			<Table columns={columns} {...configTable} />
		</div>
	);
}

export default Invoice;
