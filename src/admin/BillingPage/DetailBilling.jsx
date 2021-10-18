import React, { useState } from 'react';

import { UrlBreadcrumb } from 'app/components/Atoms';
import { useParams, useHistory } from 'react-router-dom';
import { DX, BillingAdmin } from 'app/models';
import { InvoiceDetails } from 'app/components/Templates';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation } from 'react-query';
import { v4 } from 'uuid';
import useUser from '../../app/hooks/useUser';

export default function DetailBilling() {
	const { id } = useParams();
	const history = useHistory();
	const { user } = useUser();
	const isRootAdmin = !user.departmentId || !user.department?.provinceId;
	const CAN_VIEW_EINVOICE = DX.canAccessFuture2('admin/view-einvoice', user.permissions);
	const CAN_DOWNLOAD_EINVOICE = DX.canAccessFuture2('admin/download-einvoice', user.permissions);
	const breadcrumbs = [
		{
			name: 'manageBill',
			url: '',
		},
		{
			name: 'billList',
			url: DX.admin.createPath('/billing/list'),
		},
		{
			name: 'billDetail',
			url: '',
		},
	];

	const [key, setKey] = useState(1);
	const [ajust, setAjust] = useState(false);

	const backToList = () => {
		history.push(DX.admin.createPath('/billing/list'));
	};

	const confirmMutate = useMutation(BillingAdmin.ConfirmBill, {
		onSuccess: () => {
			message.success('Xác nhận thành công!');
			setKey(v4());
		},
		onError: (e) => {
			if (e) message.error('Xác nhận không thành công!');
			// eslint-disable-next-line no-console
			console.log(e);
		},
	});

	const publishMutate = useMutation(BillingAdmin.PublishBill, {
		onSuccess: () => {
			message.success('Xuất hóa đơn thành công!');
			setKey(v4());
		},
		onError: (e) => {
			if (e?.errorCode === 'error.invoice.authen.invalid') {
				message.error('Sai tài khoản xuất hoá đơn');
			} else if (e?.errorCode === 'error.invoice.xml.invalid') {
				message.error('Nội dung xml xuất không đúng');
			} else if (e?.errorCode === 'error.invoice.not.found.company') {
				message.error('Không tìm thấy công ty');
			} else if (e?.errorCode === 'error.invoice.pattern.serial.invalid') {
				message.error('Sai thông tin pattern hoặc serial');
			} else if (e?.errorCode === 'error.invoice.not.publish') {
				message.error('Cannot publish invoice');
			} else if (e?.errorCode === 'error.einvoice.amount.zero') {
				message.error('Không xuất được hoá đơn có tổng thanh toán bằng 0');
			} else {
				message.error('Xuất hóa đơn không thành công!');
			}
		},
	});

	const ajustMutate = useMutation(BillingAdmin.AjustBill, {
		onSuccess: () => {
			message.success('Cập nhật thông tin thành công thành công!');
			setKey(v4());
			setAjust(false);
		},
		onError: (e) => {
			if (e?.errorCode === 'error.invoice.authen.invalid') {
				message.error('Sai tài khoản xuất hoá đơn');
			} else if (e?.errorCode === 'error.invoice.xml.invalid') {
				message.error('Nội dung xml xuất không đúng');
			} else if (e?.errorCode === 'error.invoice.not.found.company') {
				message.error('Không tìm thấy công ty');
			} else if (e?.errorCode === 'error.invoice.pattern.serial.invalid') {
				message.error('Sai thông tin pattern hoặc serial');
			} else if (e?.errorCode === 'error.invoice.not.publish') {
				message.error('Cannot publish invoice');
			} else if (e?.errorCode === 'error.einvoice.amount.zero') {
				message.error('Không xuất được hoá đơn có tổng thanh toán bằng 0');
			} else {
				message.error('Cập nhật thông tin thành công không thành công!');
			}
		},
	});

	const confirmOrder = () => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xác nhận thanh toán cho hóa đơn này?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				confirmMutate.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: confirmMutate.isLoading,
		});
	};
	const publishOrder = () => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn xuất hóa đơn điện tử cho hóa đơn này?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				publishMutate.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: publishMutate.isLoading,
		});
	};
	const adjustInv = () => {
		setAjust(true);
	};

	const onAjust = (formValue, isCancel) => {
		if (isCancel) {
			setAjust(false);
		} else {
			Modal.confirm({
				title: 'Bạn có đồng ý cập nhật vào thông tin profile?',
				icon: <ExclamationCircleOutlined />,
				okText: 'Xác nhận',
				cancelText: 'Hủy',
				onOk: () => {
					ajustMutate.mutate({ id, body: formValue });
				},
				onCancel: () => {},
				confirmLoading: ajustMutate.isLoading,
			});
		}
	};

	const action = (status, canPublish, serviceOwner, canAdjustInv) => {
		if (isRootAdmin) {
			return null;
		}
		if (
			canPublish &&
			status === BillingAdmin.tagStatus.PAID.value &&
			DX.canAccessFuture2('admin/export-einvoice', user.permissions)
		) {
			return (
				<Button
					className="float-right ml-auto"
					type="default"
					disabled={publishMutate.isLoading}
					loading={publishMutate.isLoading}
					onClick={publishOrder}
				>
					Xuất hóa đơn điện tử
				</Button>
			);
		}

		if (
			status !== BillingAdmin.tagStatus.PAID.value &&
			status !== BillingAdmin.tagStatus.INIT.value &&
			DX.canAccessFuture2('admin/confirm-payment', user.permissions)
		) {
			return (
				<Button
					className="float-right ml-auto"
					type="primary"
					disabled={confirmMutate.isLoading}
					loading={confirmMutate.isLoading}
					onClick={confirmOrder}
				>
					Xác nhận thanh toán
				</Button>
			);
		}
		// if (canAdjustInv) {
		// 	return (
		// 		<Button className="float-right ml-auto" type="default" onClick={adjustInv}>
		// 			Chỉnh sửa
		// 		</Button>
		// 	);
		// }
		return null;
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
				key={key}
				getByIdFn={BillingAdmin.getOneById}
				downloadFkeyFn={BillingAdmin.downloadEInvoice}
				downloadPDFFkeyFn={BillingAdmin.downloadEInvoicePdf}
				viewFkeyFn={BillingAdmin.viewEInvoice}
				tagStatus={BillingAdmin.tagStatus}
				action={action}
				cancelAction={cancelAction}
				id={id}
				portal="admin"
				canViewEInvoice={CAN_VIEW_EINVOICE}
				canDownloadEInvoice={CAN_DOWNLOAD_EINVOICE}
				className="max-w-7xl"
				ajust={ajust}
				onAjust={onAjust}
				ajustLoading={ajustMutate.isLoading}
			/>

			<br />
		</div>
	);
}
