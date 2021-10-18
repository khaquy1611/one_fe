import { Table, Tag } from 'antd';
import { usePagination, usePaginationLocal, useUser } from 'app/hooks';
import { BillingPortal, DX, SubscriptionDev } from 'app/models';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function ListInvoice({ dataDetail, subscriptionId, typePortal }) {
	const { t } = useTranslation('billing');

	const { page, pageSize, configTable } = usePaginationLocal(
		(params) => ComboSubscriptionDev.getBillSubCombo(subscriptionId, params),
		'getListSubscriptionInvoiceCombo',
		{
			initialData: [],
			enable: !!subscriptionId,
		},
	);
	const { user } = useUser();

	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			render: (_, item, index) => (page - 1) * pageSize + index + 1,
			width: 100,
		},
		{
			title: 'Mã hóa đơn3',
			dataIndex: 'billingCode',
			sorter: {},
			render: (value, record) =>
				DX.canAccessFuture2('admin/view-invoice', user.permissions) ? (
					<Link
						to={
							typePortal === 'ADMIN'
								? DX.admin.createPath(`/billing/list/${record.id}?type=SUB`)
								: DX.dev.createPath(`/invoice/list/${record.id}?type=SUB`)
						}
						className="text-blue-400"
					>
						{value}
					</Link>
				) : (
					value
				),
		},
		{
			title: 'Gói combo dịch vụ',
			dataIndex: 'comboName',
			sorter: {},
			ellipsis: true,
		},
		{
			title: <span>Tổng tiền (VND)</span>,
			dataIndex: 'totalAmount',
			render: (value) => DX.formatNumberCurrency(value),
			sorter: {},
			ellipsis: true,
		},
		{
			title: 'Ngày yêu cầu thanh toán',
			dataIndex: 'currentPaymentDate',
			//	render: (requirePaymentDate) => DX.formatDate(requirePaymentDate, 'YYYY-MM-DD', 'DD/MM/YYYY'),
			sorter: {},
		},
		{
			align: 'center',
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (value) => {
				const tagInfo = SubscriptionDev.tagStatusBill[value];
				return <Tag color={tagInfo?.color}>{t(tagInfo?.text)}</Tag>;
			},
			sorter: {},
		},
	];

	return (
		<div>
			{dataDetail.status !== 'IN_TRIAL' ? (
				<Table columns={columns} {...configTable} />
			) : (
				<div>Chưa có thông tin hóa đơn của thuê bao</div>
			)}
		</div>
	);
}

export default ListInvoice;
