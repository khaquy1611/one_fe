import { Button, message, Modal, Spin, Tabs } from 'antd';
import { useLng } from 'app/hooks';
import { PreOrder } from 'app/icons';
import SmeSubscription from 'app/models/SmeSubscription';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';

const PreOrderItemCombo = ({ value, onChange }) => {
	const { tMessage } = useLng();
	const { path } = useRouteMatch();
	const { TabPane } = Tabs;

	const { urlPreOrder, confirmed } = value || {};
	const [showEdit, setShowEdit] = useState(false);
	const [activeTab, setActiveTab] = useState(0);

	useQuery(['SmeSubscription.reqCreatePreOder', activeTab], SmeSubscription.reqCreatePreOder, {
		onSuccess: (data) => {
			urlPreOrder[activeTab].preOrderId = data.preOrderId;
			onChange({ ...value, urlPreOrder });
		},
		onError: () => {
			message.error(tMessage('retryError'));
		},
		enabled: !!urlPreOrder && !!urlPreOrder[activeTab] && !urlPreOrder[activeTab]?.preOrderId,
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

	if (!urlPreOrder || !urlPreOrder.length) {
		return null;
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
					<span>Vui lòng cập nhật thông tin pre order trước khi đăng ký dịch vụ.</span>
				</div>
			</Modal>
			<Modal visible={showEdit} width="70%" footer={null} closable={false} className="custom-modal">
				<div className="flex flex-col justify-center items-center mb-8">
					<PreOrder width="w-16" />
					<div className="font-bold mt-2">Pre Order</div>
				</div>
				<div className="border border-gray-500 ">
					<Tabs onChange={setActiveTab} className="custom-tab sub -mx-4 px-4 pb-1">
						{urlPreOrder.map((item, index) => (
							<TabPane
								className="text-base"
								tab={<span className="uppercase font-semibold">{item.pricingName}</span>}
								key={`${index + 1}`}
							>
								<Spin spinning={!item.preOrderId}>
									<iframe
										src={`${item.url}?preOrderId=${item.preOrderId}`}
										title="Pre-Order"
										className="w-full border-none"
										style={{ height: '50vh' }}
									/>
								</Spin>
							</TabPane>
						))}
					</Tabs>
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

export default PreOrderItemCombo;
