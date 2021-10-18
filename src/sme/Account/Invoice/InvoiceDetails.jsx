import React, { useState } from 'react';
import { InvoiceDetails } from 'app/components/Templates';
import { useParams, useHistory } from 'react-router-dom';
import { DX, BillingPortal } from 'app/models';
import { useLng } from 'app/hooks';
import { Breadcrumb, Button, message, Modal } from 'antd';
import { useMutation } from 'react-query';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { v4 } from 'uuid';
import useUser from '../../../app/hooks/useUser';

export default function InvoiceDetailWrap() {
	const { id } = useParams();
	const history = useHistory();
	const { user } = useUser();
	const CAN_EXPORT_EINVOICE = DX.canAccessFuture2('sme/export-einvoice', user.permissions);
	const CAN_PAY = DX.canAccessFuture2('sme/payment', user.permissions);
	const CAN_VIEW_EINVOICE = DX.canAccessFuture2('sme/view-einvoice', user.permissions);
	const CAN_DOWNLOAD_EINVOICE = DX.canAccessFuture2('sme/download-einvoice', user.permissions);
	const { tButton, tMessage, tMenu } = useLng();
	const backToList = () => {
		history.push(DX.sme.createPath('/account/invoice'));
	};
	const [key, setKey] = useState(1);
	const [ajust, setAjust] = useState(false);

	const payMutate = useMutation(BillingPortal.Payment, {
		onSuccess: ({ redirectURL }) => {
			if (redirectURL) {
				window.location.href = redirectURL;
			} else {
				history.push(DX.sme.createPath(`/payment-error?paymentFrom=BILLING`));
			}

			return null;
		},
		onError: () => {
			history.push(DX.sme.createPath(`/payment-error?paymentFrom=BILLING`));
		},
	});

	const publishMutate = useMutation(BillingPortal.PublishBill, {
		onSuccess: () => {
			message.success(tMessage('successfullyConfirmed'));
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

	const ajustMutate = useMutation(BillingPortal.AjustBill, {
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
	const publishOrder = () => {
		Modal.confirm({
			title: tMessage('opt_wantToIssueElectronicInvoice', { field: 'bill' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				publishMutate.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: publishMutate.isLoading,
		});
	};
	const payOrder = () => {
		Modal.confirm({
			title: tMessage('opt_wantToPay', { field: 'bill' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('payment'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				payMutate.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: payMutate.isLoading,
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
		if (serviceOwner === 'OTHER' || serviceOwner === 'NONE') {
			return null;
		}
		if (canPublish && status === BillingPortal.tagStatus.PAID.value && CAN_EXPORT_EINVOICE) {
			return (
				<Button
					className="float-right ml-auto"
					type="default"
					disabled={publishMutate.isLoading}
					loading={publishMutate.isLoading}
					onClick={publishOrder}
				>
					{tButton('issueElectronicInvoice')}
				</Button>
			);
		}
		if (status !== BillingPortal.tagStatus.PAID.value && status !== BillingPortal.tagStatus.INIT.value && CAN_PAY) {
			return (
				<Button
					className="float-right ml-auto"
					type="primary"
					disabled={payMutate.isLoading}
					loading={payMutate.isLoading}
					onClick={payOrder}
				>
					{tButton('payWithVNPTPAY')}
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
		<div className="box-sme">
			<Breadcrumb>
				<Breadcrumb.Item className="cursor-pointer" onClick={() => backToList()}>
					<span className="text-primary font-bold">{tMenu('opt_manage', { field: 'bill' })}</span>
				</Breadcrumb.Item>

				<Breadcrumb.Item>{tMenu('billDetail')}</Breadcrumb.Item>
			</Breadcrumb>
			<InvoiceDetails
				key={key}
				getByIdFn={BillingPortal.getOneById}
				downloadFkeyFn={BillingPortal.downloadEInvoice}
				downloadPDFFkeyFn={BillingPortal.downloadEInvoicePdf}
				viewFkeyFn={BillingPortal.viewEInvoice}
				tagStatus={BillingPortal.tagStatus}
				canViewEInvoice={CAN_VIEW_EINVOICE}
				canDownloadEInvoice={CAN_DOWNLOAD_EINVOICE}
				action={action}
				portal="sme"
				cancelAction={cancelAction}
				id={id}
				ajust={ajust}
				onAjust={onAjust}
				ajustLoading={ajustMutate.isLoading}
			/>
		</div>
	);
}
