import { Button, message, Modal, Spin } from 'antd';
import { useLng } from 'app/hooks';
import SmeSubscription from 'app/models/SmeSubscription';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';

const PreOrderItem = ({ value, onChange, serviceId }) => {
	const { tMessage } = useLng();
	const { path } = useRouteMatch();

	const { preOrderId, urlPreOrder, isValid, confirmed } = value || {};
	const [showEdit, setShowEdit] = useState();

	useQuery(['SmeSubscription.reqCreatePreOder'], SmeSubscription.reqCreatePreOder, {
		onSuccess: (data) => {
			onChange({ ...value, preOrderId: data.preOrderId });
			// setIsModalVisible(true);
		},
		onError: () => {
			message.error(tMessage('retryError'));
		},
		enabled: !!urlPreOrder && !preOrderId,
	});

	const checkPreOrder = useMutation(SmeSubscription.reqCheckPreOder, {
		onSuccess: (data) => {
			if (data.status === 'YES') {
				onChange({ ...value, isValid: data.status === 'YES' });
			} else {
				message.error('Bạn chưa hoàn thành thông tin pre order, vui lòng thử lại.');
			}
		},
		onError: () => {
			message.error(tMessage('retryError'));
		},
		retry: 2,
	});

	const handleOk = () => {
		// setIsModalVisible(false);
		// checkPreOrder.mutate({ preOrderId });
		setShowEdit();
	};

	const closeConfirm = () => onChange({ ...value, confirmed: true });

	if (!urlPreOrder) {
		return null;
	}

	if (!preOrderId) {
		return (
			<div className="text-center">
				<Spin />
			</div>
		);
	}

	return (
		<>
			<Button onClick={() => setShowEdit(true)}>Chỉnh sửa Pre Order</Button>
			<Modal
				visible={!confirmed && path.indexOf('pay') !== -1}
				cancelText="Bỏ qua"
				okText="Đồng ý"
				onCancel={closeConfirm}
				maskClosable={false}
				onOk={() => {
					closeConfirm();
					setShowEdit(true);
				}}
			>
				<div className="py-6 text-lg">
					<span>
						{serviceId !== 1 &&
							serviceId !== 5 &&
							'Vui lòng cập nhật thông tin pre order trước khi đăng ký dịch vụ.'}
						{serviceId === 5 &&
							'Vui lòng bổ sung số BHXH trước khi đăng ký dịch vụ, bạn có thể bỏ qua nếu đã cập nhật số BHXH trong hồ sơ doanh nghiệp.'}
						{serviceId === 1 &&
							'Vui lòng cập nhật thông tin người đại diện trước khi đăng ký dịch vụ, bạn có thể bỏ qua nếu đã cập nhật thông tin người đại diện trong hồ sơ doanh nghiệp.'}
					</span>
				</div>
			</Modal>
			<Modal
				title={<span className="font-bold">Pre Order</span>}
				visible={showEdit}
				width="80%"
				footer={null}
				closable={false}
			>
				<div className="border border-gray-500 border-solid">
					<iframe
						src={`${urlPreOrder}?preOrderId=${preOrderId}`}
						title="Pre-Order"
						className="w-full border-none p-2"
						style={{ height: '60vh' }}
					/>
				</div>

				<div className=" text-right mt-6">
					<Button onClick={handleOk} type="primary" className="px-6" loading={checkPreOrder.isLoading}>
						Tiếp tục
					</Button>
				</div>
			</Modal>
		</>
	);
};

export default PreOrderItem;
