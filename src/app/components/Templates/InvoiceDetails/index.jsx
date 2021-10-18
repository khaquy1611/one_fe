import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Tooltip, message, Modal, Form, Input } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { DX, BillingAdmin } from 'app/models';
import classnames from 'classnames';
import moment from 'moment';
import { ContainerOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLng, useQueryUrl, useNavigation } from 'app/hooks';
import { CurrencyIcon, SaveIcon, VnptIcon } from 'app/icons';
import { validateRequireInput } from 'app/validator';
import { useHistory } from 'react-router-dom';
import BillingDetails from '../Subscription/BillingDetails';

const CustomCard = styled(Card)`
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;
	border: none;
	.total-row {
		background-color: #fafafa;
	}
`;

const CustomCardBox = styled.div`
	.border.border-solid {
		box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		border: none;
	}
`;

export default function InvoiceDetails({
	id,
	className,
	action,
	cancelAction,
	portal,
	tagStatus = BillingAdmin.tagStatus,
	getByIdFn = BillingAdmin.getOneById,
	downloadFkeyFn = BillingAdmin.downloadEInvoice,
	downloadPDFFkeyFn = BillingAdmin.downloadEInvoicePdf,
	viewFkeyFn = BillingAdmin.viewEInvoice,
	canViewEInvoice,
	canDownloadEInvoice,
	ajust,
	onAjust,
	ajustLoading,
}) {
	const history = useHistory();
	const [form] = Form.useForm();
	const { goBack } = useNavigation();
	const { tFilterField } = useLng();
	const { data } = useQuery(['getOneById', id], () => getByIdFn(id), {
		initialData: {},
		onError: (e) => {
			if (e.errorCode === 'error.object.not.found') {
				Modal.error({
					content: 'Thuê bao không tồn tại hoặc đã bị xóa',
					onOk: () => {
						if (portal === 'admin') {
							history.push(DX.admin.createPath('/billing/list'));
						} else if (portal === 'dev') {
							history.push(DX.dev.createPath('/invoice/list'));
						} else if (portal === 'dev') {
							history.push(DX.sme.createPath('/account/invoice'));
						} else {
							goBack();
						}
					},
				});
			} else {
				Modal.error({
					content: 'Hệ thống không thể lấy thông tin hóa đơn',
					onOk: () => {
						if (portal === 'admin') {
							history.push(DX.admin.createPath('/billing/list'));
						} else if (portal === 'dev') {
							history.push(DX.dev.createPath('/invoice/list'));
						} else if (portal === 'dev') {
							history.push(DX.sme.createPath('/account/invoice'));
						} else {
							goBack();
						}
					},
				});
			}
		},
	});
	const { tButton } = useLng();

	const [eInvoiceName, setEInvoiceName] = useState('');
	const [loadingItem, setLoadingItem] = useState(null);
	const [isDirty, setDirty] = useState(false);
	const queryUrl = useQueryUrl();
	const getType = queryUrl.get('type');

	useEffect(() => {
		const body = document.querySelector('#root');
		body.scrollIntoView(
			{
				behavior: 'smooth',
			},
			500,
		);
	}, []);
	const downloadFkeyMutate = useMutation(downloadFkeyFn, {
		onSuccess: (res) => {
			const filename = `${eInvoiceName || 'eInvoice'}.xml`;
			DX.exportFile(res, filename, 'application/xml');
		},
		onError: (e) => {
			if (e) message.error('Xác nhận không thành công!');
			// eslint-disable-next-line no-console
			console.log(e);
		},
	});

	const downloadPDFFkeyMutate = useMutation(downloadPDFFkeyFn, {
		onSuccess: (res) => {
			const filename = `${eInvoiceName || 'eInvoice'}.pdf`;
			DX.exportFile(res, filename, 'application/pdf');
		},
		onError: (e) => {
			if (e) message.error('Xác nhận không thành công!');
			// eslint-disable-next-line no-console
			console.log(e);
		},
	});

	const viewFkeyMutate = useMutation(viewFkeyFn, {
		onSuccess: ({ content }) => {
			// message.success('Xem hóa đơn thành công!');
			const newWindow = window.open('', 'PRINT', 'height=900,width=950');
			newWindow.document.documentElement.innerHTML = content;
			newWindow.document.documentElement.style.overflow = 'auto';
			newWindow.document.body.style.overflow = 'auto';
			newWindow.focus();
			const check = () => {
				if (newWindow.document) {
					// if loaded
					newWindow.document.title = eInvoiceName; // set title
				} else {
					// if not loaded yet
					setTimeout(check, 10); // check in another 10ms
				}
			};
			check();
			// newWindow.print();
			// newWindow.close();

			return true;
		},
		onError: (e) => {
			if (e) message.error('Xác nhận không thành công!');
			// eslint-disable-next-line no-console
			console.log(e);
		},
	});

	const downloadFkey = ({ fKey, code }) => {
		const filename = `e-invoice${code}_${moment().format('DD/MM/YYYY')}`;
		setEInvoiceName(filename);
		setLoadingItem(fKey);
		downloadFkeyMutate.mutate(fKey);
	};

	const downloadPDFFkey = ({ fKey, code }) => {
		const filename = `e-invoice${code}_${moment().format('DD/MM/YYYY')}`;
		setEInvoiceName(filename);
		setLoadingItem(fKey);
		downloadPDFFkeyMutate.mutate(fKey);
	};

	const viewFkey = ({ fKey, code }) => {
		const filename = `e-invoice${code}_${moment().format('DD/MM/YYYY')}`;
		setEInvoiceName(filename);
		setLoadingItem(fKey);
		viewFkeyMutate.mutate(fKey);
	};

	const tableServiceData = [];
	if (data?.details) {
		data?.details?.forEach((x, index) => {
			tableServiceData.push({
				index,
				serviceName: x.name,
				totalAmount: x.amount,
			});
		});
	}

	const tableService = {
		columns: [
			{
				title: 'STT',
				dataIndex: 'index',
				key: 'index',
				render: (value) => value + 1,
				sorter: false,
				width: 50,
			},
			{
				title: 'Dịch vụ',
				dataIndex: 'serviceName',
				key: 'serviceName',
				sorter: false,
			},
			{
				title: 'Số tiền (VND)',
				dataIndex: 'totalAmount',
				key: 'totalAmount',
				render: (value) => DX.formatNumberCurrency(value),
				sorter: false,
				width: 150,
				className: 'text-right text-right-important',
			},
		],

		dataSource: tableServiceData,
		pagination: false,
	};

	const tableEInvoiceData = [];
	if (data?.einvoices) {
		data?.einvoices?.forEach((x, index) => {
			tableEInvoiceData.push({
				index,
				...x,
			});
		});
	}

	const padLeadingZeros = (num, size) => {
		let s = `${num}`;
		while (s.length < size) s = `0${s}`;
		return s;
	};

	const tableEInvoice = {
		columns: [
			{
				title: 'STT',
				dataIndex: 'index',
				key: 'index',
				render: (value) => value + 1,
				sorter: false,
				width: 50,
			},
			{
				title: 'Số hóa đơn',
				dataIndex: 'code',
				key: 'code',
				render: (value) => <>{padLeadingZeros(value, 7)}</>,
				sorter: false,
				width: 150,
			},
			{
				title: 'Ngày hóa đơn',
				dataIndex: 'einvoiceDate',
				key: 'einvoiceDate',
				render: (value) => DX.formatDate(value, 'DD/MM/YYYY'),
				sorter: false,
				width: 150,
			},
			{
				title: 'Mã tra cứu',
				dataIndex: 'fKey',
				key: 'fKey',
				sorter: false,
				width: 250,
			},
			{
				title: 'Số tiền (VND)',
				dataIndex: 'totalAmount',
				key: 'totalAmount',
				sorter: false,
				minWidth: 150,
				render: (value) => DX.formatNumberCurrency(value),
				className: 'text-right text-right-important',
			},

			{
				title: '',
				dataIndex: 'id',
				key: 'id',
				render: (value, record) => (
					<>
						{canViewEInvoice && (
							<>
								<Tooltip placement="topLeft" title="Xem chi tiết" arrowPointAtCenter>
									<Button
										disabled={
											viewFkeyMutate.isLoading ||
											downloadFkeyMutate.isLoading ||
											downloadPDFFkeyMutate.isLoading
										}
										loading={viewFkeyMutate.isLoading && loadingItem === record.fKey}
										onClick={() => viewFkey(record)}
										type="text"
										icon={<ContainerOutlined />}
									/>
								</Tooltip>
								&nbsp;&nbsp;
							</>
						)}
						{/* <Tooltip placement="topLeft" title="Tải về" arrowPointAtCenter>
							<Button
								disabled={
									viewFkeyMutate.isLoading ||
									downloadFkeyMutate.isLoading ||
									downloadPDFFkeyMutate.isLoading
								}
								loading={downloadFkeyMutate.isLoading && loadingItem === record.fKey}
								onClick={() => downloadFkey(record)}
								type="text"
								icon={<DownloadOutlined />}
							/>
						</Tooltip> &nbsp;&nbsp; */}
						{canDownloadEInvoice && (
							<>
								<Tooltip placement="topLeft" title="Tải về" arrowPointAtCenter>
									<Button
										disabled={
											viewFkeyMutate.isLoading ||
											downloadFkeyMutate.isLoading ||
											downloadPDFFkeyMutate.isLoading
										}
										loading={downloadPDFFkeyMutate.isLoading && loadingItem === record.fKey}
										onClick={() => downloadPDFFkey(record)}
										type="text"
										icon={<DownloadOutlined />}
									/>
								</Tooltip>
							</>
						)}
					</>
				),
				sorter: false,
				with: 80,
			},
		],

		dataSource: tableEInvoiceData,
		pagination: false,
	};

	const tableCalculateData = [];
	if (data?.summary) {
		data?.summary?.taxes.forEach((tax) => {
			tableCalculateData.push({
				name: tax.name,
				value: tax.value,
				amount: tax.amount,
			});
		});
		tableCalculateData.push({
			name: 'Tổng cộng',
			value: data?.summary?.totalAmount,
			amount: data?.summary?.amountAfterTax,
		});
	}

	const tableCalculate = {
		columns: [
			{
				title: '',
				dataIndex: 'name',
				key: 'name',
				sorter: false,
				className: 'font-bold',
				width: 250,
			},
			{
				title: '',
				dataIndex: 'amount',
				key: 'amount',
				className: 'text-right text-right-important',
				render: (value) => DX.formatNumberCurrency(value),
				sorter: false,
				width: 150,
			},
		],
		rowClassName: (record) => {
			if (record.name === 'Tổng cộng') {
				return 'total-row';
			}
			return '';
		},
		dataSource: tableCalculateData,
		showHeader: false,
		pagination: false,
	};

	const renderStatus = (value) => {
		const tagInfo = tagStatus[value];
		return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
	};

	const renderPaymentStatus = (paymentMethod) => {
		switch (paymentMethod) {
			case 'BY_CASH':
				return (
					<div className="flex items-center">
						<CurrencyIcon className="mr-2 flex" width="w-8" /> &nbsp; <span>Tiền mặt</span>
					</div>
				);
			// case 'P2P':
			// 	return (
			// 		<div className="flex items-center">
			// 			<BankIcon className="mr-2 flex" width="w-8" /> &nbsp; <span>Chuyển khoản qua ngân hàng</span>
			// 		</div>
			// 	);
			case 'VNPTPAY':
				return (
					<div className="flex items-center">
						<VnptIcon className="mr-2 flex" width="w-20" /> &nbsp; <span> </span>
					</div>
				);
			default:
				return null;
		}
	};
	const onFinishAjust = (formValue) => {
		onAjust(formValue);
	};
	const onCancelAjust = (formValue) => {
		form.resetFields();
		setDirty(false);
		onAjust(formValue, true);
	};
	const onFormChange = () => {
		let dirty;
		if (
			!DX.checkEqualsObject(
				{
					smeName: data?.customer?.smeName,
					taxNo: data?.customer?.taxNo,
					address: data?.customer?.address,
				},
				form.getFieldValue(),
			)
		)
			dirty = true;
		else dirty = false;
		setDirty(dirty);
	};
	if (ajust) {
		return (
			<CustomCard className="mt-8 border-gray-100">
				<Form
					className="ml-8"
					form={form}
					layout="horizontal"
					onFinish={onFinishAjust}
					onValuesChange={onFormChange}
					autoComplete="off"
					initialValues={{
						smeName: data?.customer?.smeName,
						taxNo: data?.customer?.taxNo,
						address: data?.customer?.address,
					}}
				>
					<h3 className="font-bold text-primary">Thông tin khách hàng</h3>

					<Form.Item
						className="mb-4"
						labelCol={{ span: 6 }}
						colon={false}
						name="smeName"
						label="Tên công ty:"
						rules={[validateRequireInput('Tên công ty không được bỏ trống')]}
					>
						<Input placeholder="Tên công ty" maxLength={200} />
					</Form.Item>
					<Form.Item
						className="mb-4"
						labelCol={{ span: 6 }}
						colon={false}
						name="taxNo"
						label="Mã số thuế:"
						rules={[validateRequireInput('Mã số thuế không được bỏ trống')]}
					>
						<Input placeholder="Mã số thuế" maxLength={20} />
					</Form.Item>
					<Form.Item
						className="mb-4"
						labelCol={{ span: 6 }}
						colon={false}
						name="address"
						label="Địa chỉ:"
						rules={[validateRequireInput('Địa chỉ không được bỏ trống')]}
					>
						<Input placeholder="Địa chỉ" maxLength={200} />
					</Form.Item>
					<div className="text-right">
						<Button type="default" onClick={onCancelAjust} htmlType="button" loading={ajustLoading}>
							{tButton('opt_cancel')}
						</Button>
						<Button
							type="primary"
							className="ml-5"
							htmlType="submit"
							icon={<SaveIcon width="w-4" />}
							loading={ajustLoading}
							disabled={!isDirty}
						>
							{tButton('opt_save')}
						</Button>
					</div>
				</Form>
			</CustomCard>
		);
	}

	const renderNote = () => {
		if (data?.type === 'OTHER' || data?.type === 'NONE') {
			return (
				data?.billing?.currentCycle &&
				data?.billing?.billingDate &&
				data?.billing?.endDate && (
					<span>
						Thanh toán cho chu kỳ {data?.billing?.currentCycle} (từ {data?.billing?.billingDate} đến{' '}
						{data?.billing?.endDate})
					</span>
				)
			);
		}
		return <span>Thanh toán phát sinh thay đổi ngày {data?.billing?.billingDate} )</span>;
	};

	return (
		<div className={classnames(className, 'pb-10 rounded-lg')}>
			{/* <Avatar shape="square" size={64} src={data?.icon ?? '/images/NoImageNew.svg'} /> */}
			{action ? (
				<div>
					{action(
						data?.billing?.status,
						!(
							(
								data?.einvoices?.length > 0 ||
								data?.calculationDetail?.allBill?.totalFinalAmountAfterTax === 0
							) // tổng tiền = 0 ko thể xuất hoá đơn điện tử
						),
						data?.billing?.serviceOwner,
						data?.einvoices?.length > 0,
					)}
					<br />
					<br />
				</div>
			) : null}

			<div className="grid tablet:grid-cols-1 grid-cols-2 gap-4 mt-5">
				<CustomCard className="border-gray-100">
					<h3 className="font-bold text-primary">Thông tin nhà cung cấp</h3>
					<div className="tablet:w-full ">
						<table className="w-full">
							<tbody>
								<tr>
									<td className="pb-2 align-top w-32 font-bold">Tên công ty</td>
									<td className="pb-2 align-top break-all">{data?.developer?.developerName}</td>
								</tr>
								<tr>
									<td className="pb-2 align-top w-32 font-bold">Mã số thuế</td>
									<td className="pb-2 align-top break-all">{data?.developer?.taxNo}</td>
								</tr>
								<tr>
									<td className="pb-2 align-top w-32 font-bold">Địa chỉ</td>
									<td className="pb-2 align-top break-all">{data?.developer?.address}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CustomCard>
				<CustomCard className="border-gray-100">
					<h3 className="font-bold text-primary">Thông tin khách hàng</h3>
					<div className="tablet:w-full ">
						<table className="w-full">
							<tbody>
								<tr>
									<td className="pb-2 align-top w-32 font-bold">Tên công ty</td>
									<td className="pb-2 align-top break-all">{data?.customer?.smeName}</td>
								</tr>
								<tr>
									<td className="pb-2 align-top w-32 font-bold">Mã số thuế</td>
									<td className="pb-2 align-top break-all">{data?.customer?.taxNo}</td>
								</tr>
								<tr>
									<td className="pb-2 align-top w-32 font-bold">Địa chỉ</td>
									<td className="pb-2 align-top break-all">{data?.customer?.address}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CustomCard>
			</div>
			<br />
			<div className="w-full">
				<CustomCard className="border-gray-100">
					<h3 className="font-bold text-primary">Thông tin thanh toán</h3>
					<div className="flex justify-between">
						<div className="w-1/2 pr-8">
							<div className="tablet:w-full ">
								<table className="w-full">
									<tbody>
										<tr>
											<td className="pb-2 align-top w-48 font-bold">Mã hóa đơn</td>
											<td className="pb-2 align-top break-all">{data?.billing?.code}</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-48 font-bold">Mã đăng ký</td>
											<td className="pb-2 align-top break-all">
												{data?.billing?.subscriptionCode}
											</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-48 font-bold">Trạng thái</td>
											<td className="pb-2 align-top break-all">
												{renderStatus(data?.billing?.status)}
											</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-48 font-bold">Phương thức thanh toán</td>
											<td className="pb-2 align-top break-all">
												{renderPaymentStatus(data?.billing?.paymentMethod)}
											</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-48 font-bold">Kỳ thanh toán tiếp theo</td>
											<td className="pb-2 align-top break-all">
												{data?.billing?.nextPaymentDate}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div className="w-1/2 pl-8">
							<div className="tablet:w-full ">
								<table className="w-full">
									<tbody>
										<tr>
											<td className="pb-2 align-top w-52 font-bold">Ngày yêu cầu thanh toán</td>
											<td className="pb-2 align-top break-all">
												{data?.billing?.requirePaymentDate}
											</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-52 font-bold">Hạn thanh toán cuối cùng</td>
											<td className="pb-2 align-top break-all">
												{data?.billing?.deadlinePayment}
											</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-52 font-bold">Ngày thanh toán</td>
											<td className="pb-2 align-top break-all">{data?.billing?.paymentDate}</td>
										</tr>
										<tr>
											<td className="pb-2 align-top w-52 font-bold">Ghi chú</td>
											<td className="pb-2 align-top break-all">{renderNote()}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</CustomCard>
			</div>
			<br />
			{data?.billing?.currentCycle !== 1 && (
				<div className="w-full">
					<CustomCard className="border-gray-100">
						<h3 className="font-bold text-primary">Thông tin dịch vụ</h3>
						<Table {...tableService} />
						<div className="float-right w-50">
							{tableCalculateData.length > 0 ? <Table {...tableCalculate} /> : null}
						</div>
					</CustomCard>
				</div>
			)}

			<CustomCardBox className="mt-8">
				<BillingDetails isFirst={data?.billing?.currentCycle === 1} dataCost={data?.calculationDetail} />
			</CustomCardBox>

			{tableEInvoiceData.length > 0 ? (
				<div className="w-full">
					<br />
					<CustomCard className="border-gray-100">
						<h3 className="font-bold text-primary">Thông tin hóa đơn điện tử</h3>
						<Table {...tableEInvoice} />
					</CustomCard>
				</div>
			) : null}
			<br />

			{getType ? (
				<div className="text-right">
					<Button onClick={() => goBack()}>Hủy</Button>
				</div>
			) : (
				cancelAction
			)}
		</div>
	);
}
