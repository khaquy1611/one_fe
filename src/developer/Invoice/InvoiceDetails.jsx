import React from 'react';
import { InvoiceDetails } from 'app/components/Templates';
import { useParams, useHistory } from 'react-router-dom';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { DX, BillingDev } from 'app/models';
import { Button } from 'antd';
import useUser from '../../app/hooks/useUser';

export default function InvoiceDetailWrap() {
	const { id } = useParams();
	const history = useHistory();
	const { user } = useUser();
	const CAN_VIEW_EINVOICE = DX.canAccessFuture2('dev/view-einvoice', user.permissions);
	const CAN_DOWNLOAD_EINVOICE = DX.canAccessFuture2('dev/download-einvoice', user.permissions);

	const breadcrumbs = [
		{
			name: 'manageBill',
			url: '',
		},
		{
			name: 'billList',
			url: DX.dev.createPath('/invoice/list'),
		},
		{
			name: 'billDetail',
			url: '',
		},
	];
	const backToList = () => {
		history.push(DX.dev.createPath('/invoice/list'));
	};

	const cancelAction = (
		<Button className="float-right ml-auto" type="default" onClick={backToList}>
			Hủy
		</Button>
	);
	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={breadcrumbs} />
			</div>
			<div className="font-bold text-xl pt-5">Thông tin hóa đơn</div>
			<InvoiceDetails
				getByIdFn={BillingDev.getOneById}
				downloadFkeyFn={BillingDev.downloadEInvoice}
				downloadPDFFkeyFn={BillingDev.downloadEInvoicePdf}
				viewFkeyFn={BillingDev.viewEInvoice}
				tagStatus={BillingDev.tagStatus}
				cancelAction={cancelAction}
				id={id}
				portal="dev"
				canViewEInvoice={CAN_VIEW_EINVOICE}
				canDownloadEInvoice={CAN_DOWNLOAD_EINVOICE}
				className="max-w-7xl"
			/>

			<br />
		</div>
	);
}
