import { Avatar, Button, message, Modal, Steps, Table } from 'antd';
import { useLng } from 'app/hooks';
import { DX, SMESubscription } from 'app/models';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const { Step } = Steps;
const CustomSteps = styled(Steps)`
	.ant-steps-item-finish .ant-steps-item-icon {
		background-color: #5bb98e;
	}
	.ant-steps-item-finish .ant-steps-item-icon {
		border-color: #5bb98e;
	}
	.ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-icon {
		background: #5bb98e;
	}
	.ant-steps-item-process .ant-steps-item-icon {
		border-color: #5bb98e;
	}
	.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
		background-color: #5bb98e;
	}
	.ant-steps-item.hidden-step {
		display: none;
	}
	.ant-steps-item.step-4 {
		&.ant-steps-item-finish .ant-steps-item-icon {
			background-color: red;
		}
		&.ant-steps-item-finish .ant-steps-item-icon {
			border-color: red;
		}
		&.ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-icon {
			background: red;
		}
		&.ant-steps-item-process .ant-steps-item-icon {
			border-color: red;
		}
		&.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
			background-color: red;
		}
		.ant-steps-icon {
			font-size: 0px;
			&::after {
				content: 'X';
				font-size: 1rem;
				font-family: monospace;
			}
		}
	}
`;

function ComboOrderServiceProcess({ orderServiceProcess, subId, refetch }) {
	// orderServiceProcess = {
	// 	status: 'FUTURE|ACTIVE',
	// 	createAt: '25/08/1994',
	// 	startAt: '25/08/1994',
	// 	paymentStatus: 'WAITING',
	// 	listService: [
	// 		{
	// 			serviceName: 'Dịch vụ 1',
	// 			statusId: 1,
	// 			statusName: 'Tiếp nhận',
	// 			updateAt: '25/08/1994',
	// 			timeline: [
	// 				{
	// 					updateTime: '25/08/1994',
	// 					status: 1,
	// 					department: 'DHSX',
	// 					picName: '',
	// 					picCode: '',
	// 					phoneNo: '0967267469',
	// 					content: '',
	// 				},
	// 			],
	// 			orderReceiveId: '3393',
	// 			pricingName: 'Gói 1',
	// 			icon: 'text',
	// 		},
	// 		{
	// 			serviceName: 'Dịch vụ 2',
	// 			statusId: 2,
	// 			statusName: 'Đang xử lý',
	// 			updateAt: '26/08/1994',
	// 			timeline: [
	// 				{
	// 					updateTime: '25/08/1994',
	// 					status: 2,
	// 					department: 'DHSX',
	// 					picName: '',
	// 					picCode: '',
	// 					phoneNo: '0967267469',
	// 					content: '',
	// 				},
	// 			],
	// 			orderReceiveId: '3393',
	// 			pricingName: 'Gói 21',
	// 			icon: 'text',
	// 		},
	// 	],
	// };
	const location = useLocation();
	const { tFilterField } = useLng();
	const currentS = orderServiceProcess?.listService?.length > 0 ? orderServiceProcess?.listService[0] : null;
	const [currentService, setService] = useState(currentS);
	const steps = SMESubscription.orderServiceProcessStep;
	const history = useHistory();
	const cancelMutate = useMutation(SMESubscription.cancelOrderServiceProcess, {
		onSuccess: () => {
			message.success('Hủy thành công!');
			refetch();
		},
		onError: (e) => {
			if (e?.errorCode === 'error.object.not.match') {
				Modal.error({
					title: 'Không thể hủy',
					content: 'orderReceiveId không phải của user đăng nhập!',
					onOk: () => refetch(),
				});
			} else if (e?.errorCode === 'error.object.in.progress') {
				Modal.error({
					title: 'Không thể hủy',
					content: 'Đơn hàng dang ở trạng thái "Đang triển khai"',
					onOk: () => refetch(),
				});
			} else if (e?.errorCode === 'error.object.was.cancelled') {
				Modal.error({
					title: 'Không thể hủy',
					content: 'Đơn hàng đã được bộ phận khác hủy',
					onOk: () => refetch(),
				});
			} else {
				Modal.error({
					title: 'Không thể hủy',
					content: 'Đơn hàng hủy không thành công',
					onOk: () => refetch(),
				});
			}
		},
	});
	const getCurrentService = () => {
		if (!currentService)
			return orderServiceProcess?.listService?.length > 0 ? orderServiceProcess?.listService[0] : null;
		return currentService;
	};
	const columns = [
		{
			title: 'Thời gian',
			dataIndex: 'updateTime',
			render: (updateTime) =>
				DX.formatDate(
					updateTime || getCurrentService()?.updateAt || orderServiceProcess.createAt,
					'DD/MM/YYYY',
				),
			sorter: (a, b) => moment(a.updateTime).unix() - moment(b.updateTime).unix(),
		},
		{
			title: 'Trạng thái của ĐHSX',
			dataIndex: 'status',
			render: (value) => SMESubscription.orderServiceProcessDHSX[value],
			// render: (value, record) => {

			// 	const tagInfo = tagStatus[record.status];
			// 	if (!tagInfo) return null;
			// 	return <Tag color={tagInfo?.color}>{tFilterField('orderServiceProcessOptions', tagInfo?.text)}</Tag>;
			// },
		},

		{
			title: 'Phòng bán hàng',
			dataIndex: 'department',
			render: (value) => <div className="truncate">{value}</div>,
			ellipsis: true,
		},
		{
			title: 'Người xử lý đơn hàng',
			dataIndex: 'picName',
			render: (value, record) => (
				<div>
					{record.picCode}&nbsp;-&nbsp;{record.picName}&nbsp;-&nbsp;{record.phoneNo}
				</div>
			),
		},
	];

	// const renderPaymentStatus = () => {
	// 	const tagInfo = BillingPortal.tagStatus[paymentStatus];
	// 	if (!tagInfo) return null;
	// 	return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
	// };

	const goToTab = () => {
		history.push(`${location.pathname}?tab=2`);
	};

	const renderBillInfo = () => (
		<div className="flex flex-1 gap-4">
			<Avatar shape="square" src={getCurrentService()?.icon || getCurrentService()?.embedURL} size={90} />
			<div className="info">
				<div className="font-bold mb-4 text-green-600">ID đơn hàng: {orderServiceProcess?.orderReceiveId}</div>
				<Button type="text" className="text-left pl-0" onClick={goToTab}>
					<div className="font-bold text-black">{getCurrentService()?.serviceName || 'N/A'}</div>
					<div className="text-black">{getCurrentService()?.pricingName || 'N/A'}</div>
				</Button>
			</div>
		</div>
	);

	return (
		<>
			<div className="process-step">
				{orderServiceProcess?.listService?.map((x) => (
					<Button
						type={x.serviceName === getCurrentService()?.serviceName ? 'primary' : 'default'}
						className="float-left border-217  mr-4 mb-8"
						onClick={() => {
							setService(x);
						}}
					>
						{x.serviceName}
					</Button>
				))}
				<br />
				<CustomSteps
					current={
						SMESubscription.orderServiceProcessStep.findIndex(
							(x) => x.key === getCurrentService()?.statusOrderId,
						) || 0
					}
				>
					{steps.map((x, index) => {
						const currentStep =
							SMESubscription.orderServiceProcessStep.findIndex(
								(y) => y.key === getCurrentService()?.statusOrderId,
							) || 0;
						if (currentStep > 1 && currentStep !== 4 && index === 4) {
							return null;
						}
						if (
							getCurrentService()?.timeLine &&
							getCurrentService()?.timeLine.findIndex((y) => y.status.toString() === 6) < 0 &&
							index === 3 &&
							currentStep === 4
						) {
							return (
								<Step
									className={`hidden-step step-${index}`}
									title={tFilterField('orderServiceProcessOptions', x.title)}
								/>
							);
						}
						return (
							<Step
								className={`step-${index}`}
								title={tFilterField('orderServiceProcessOptions', x.title)}
							/>
						);
					})}
				</CustomSteps>
			</div>

			<div className="box-detail mt-8">
				<div className="box-title mb-4 text-primary font-bold">Chi tiết đơn hàng</div>
				<div className="text-gray-80">
					Cập nhật lúc: {DX.formatTime(getCurrentService()?.updateAt || orderServiceProcess?.creatAt)}
				</div>
				<Table
					className="mt-4"
					columns={columns}
					dataSource={getCurrentService()?.timeLine}
					pagination={false}
				/>
			</div>

			{/* process-payment-status */}
			{/* <div className="box-detail">
					<div className="box-title mb-4 text-primary font-bold">Trạng thái thanh toán</div>
					{renderPaymentStatus()}
			</div> */}

			<div className="box-detail">
				<div className="box-title mb-4 text-primary font-bold">Thông tin đơn hàng</div>
				{renderBillInfo()}
			</div>

			{/* {[0, 1].includes(statusOrderId) && (
				<div className="process-order-action">
					<Button type="default" className={`float-right border-217  `} onClick={onCancel}>
						{tButton('opt_cancel', { field: 'order' })}
					</Button>
				</div>
			)} */}
		</>
	);
}

export default ComboOrderServiceProcess;
