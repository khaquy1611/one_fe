import { Steps, Tag, Table, Avatar, Button, message, Modal } from 'antd';
import { useLng } from 'app/hooks';
import { BillingPortal, DX, SubscriptionDev } from 'app/models';
import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-query';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';

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

const BoxInfo = styled.div`
	background: #fffdfd;
	border: 1px solid #f6efee;
	border-radius: 10px;
	padding: 1rem;
	margin-bottom: 1.875rem;
	/* box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1); */
`;

function OrderServiceProcess({ orderServiceProcess, refetch, subId, typePortal }) {
	const {
		createAt,
		updateAt,
		timeLine,
		paymentStatus,
		orderReceiveId,
		serviceName,
		pricingName,
		icon,
		statusOrderId,
		embedURL,
	} = orderServiceProcess;
	const { tButton, tFilterField } = useLng();
	const currentStep = SubscriptionDev.orderServiceProcessStep.findIndex((x) => x.key === statusOrderId) || 0;
	const steps = SubscriptionDev.orderServiceProcessStep;
	const location = useLocation();
	const history = useHistory();
	const cancelMutate = useMutation(SubscriptionDev.cancelOrderServiceProcess, {
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
					content: 'Đơn hàng đang ở trạng thái "Đang triển khai"',
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
	const onCancel = () => {
		Modal.confirm({
			title: 'Bạn có chắc chắn muốn hủy đơn hàng?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => {
				cancelMutate.mutate({ id: subId, action: 'CANCEL', typePortal });
			},
			onCancel: () => {},
			confirmLoading: cancelMutate.isLoading,
		});
	};

	const columns = [
		{
			title: 'Thời gian',
			dataIndex: 'updateTime',
			render: (updateTime) => DX.formatDate(updateTime || createAt, 'DD/MM/YYYY'),
			sorter: (a, b) => moment(a.updateTime).unix() - moment(b.updateTime).unix(),
		},
		{
			title: 'Trạng thái của ĐHSX',
			dataIndex: 'status',
			render: (value) => SubscriptionDev.orderServiceProcessDHSX[value],
			// const tagInfo = tagStatus[record.status];
			// if (!tagInfo) return null;
			// return <Tag color={tagInfo?.color}>{tFilterField('orderServiceProcessOptions', tagInfo?.text)}</Tag>;
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

	const renderPaymentStatus = () => {
		const tagInfo = BillingPortal.tagStatus[paymentStatus];
		if (!tagInfo) return null;
		return <Tag color={tagInfo?.color}>{tFilterField('paymentStatusOptions', tagInfo?.text)}</Tag>;
	};
	const goToTab = () => {
		history.push(`${location.pathname}?tab=1`);
	};

	const renderBillInfo = () => (
		<div className="flex flex-1 gap-4">
			<Avatar shape="square" src={icon || embedURL} size={90} />
			<div className="info">
				<div className="font-bold mb-4 text-green-600">ID đơn hàng: {orderReceiveId}</div>
				<Button type="text" className="text-left pl-0" onClick={goToTab}>
					<div className="font-bold text-black">{serviceName || 'N/A'}</div>
					<div className="text-black">{pricingName || 'N/A'}</div>
				</Button>
			</div>
		</div>
	);
	return (
		<>
			<div className="process-step">
				<CustomSteps current={currentStep}>
					{steps.map((x, index) => {
						if (currentStep > 1 && currentStep !== 4 && index === 4) {
							return null;
						}
						if (
							timeLine &&
							timeLine.findIndex((y) => y.status.toString() === 6) < 0 &&
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
			<div className="process-detail mt-4">
				<BoxInfo>
					<div className="box-title mb-4 text-primary font-bold">Chi tiết đơn hàng</div>
					<div className="box-date">Cập nhật lúc: {DX.formatTime(updateAt || createAt)}</div>
					<Table className="mt-8" columns={columns} dataSource={timeLine} pagination={false} />
				</BoxInfo>
			</div>
			<div className="process-payment-status mt-4">
				<BoxInfo>
					<div className="box-title mb-4 text-primary font-bold">Trạng thái thanh toán</div>
					{renderPaymentStatus()}
				</BoxInfo>
			</div>
			<div className="process-order-info mt-4">
				<BoxInfo>
					<div className="box-title mb-4 text-primary font-bold">Thông tin đơn hàng</div>
					{renderBillInfo()}
				</BoxInfo>
			</div>
			{[0, 1].includes(statusOrderId) && (
				<div className="process-order-action">
					<Button type="default" className={`float-right border-217  `} onClick={onCancel}>
						{tButton('opt_cancel', { field: 'order' })}
					</Button>
				</div>
			)}
		</>
	);
}

export default OrderServiceProcess;
