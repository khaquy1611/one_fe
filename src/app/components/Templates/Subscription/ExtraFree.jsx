import { Button, Col, Form, Input, Modal, Radio, Row } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { SubscriptionDev } from 'app/models';
import { convertToNumber, formatNormalizeCurrency, validateRequireInput } from 'app/validator';
import React, { useState } from 'react';
import { useMutation } from 'react-query';

function ExtraFree({ dataDetail = {}, ...argss }) {
	const [isModalVisible, setIsModalVisible] = useState(false);

	const { value = [], onChange } = argss;
	const insertService = useMutation(SubscriptionDev.addExtraFee, {});
	async function onFinish(values) {
		const dataIn = { ...values, feeAmount: convertToNumber(values.feeAmount) };
		const id = await insertService.mutateAsync(dataIn);
		onChange([{ ...dataIn, id }]);
		setIsModalVisible(false);
	}
	const layout = {
		labelCol: {
			span: 7,
		},
		wrapperCol: {
			span: 12,
		},
	};
	return (
		<div>
			{dataDetail?.subscriptionStatus !== 'CANCELED' && (
				<Button className="ml-3 items-center" type="default" onClick={() => setIsModalVisible(true)}>
					Thêm phí
				</Button>
			)}
			{isModalVisible && (
				<Modal
					title="Thêm phí áp dụng một lần"
					visible={isModalVisible}
					okText="Chọn"
					onCancel={() => setIsModalVisible(false)}
					closable
					maskClosable={false}
					centered
					width="1000px"
					footer={false}
				>
					<Form
						name="basic"
						onFinish={onFinish}
						{...layout}
						initialValues={{
							paymentType: 'NOW',
						}}
					>
						<Form.Item
							label="Tên phí"
							name="name"
							rules={[
								{
									pattern: /^[^!@#$%&()'*,:;"<>+/\\=?^_`{|}[\]~-]*$/,
									message: 'Không cho nhập khác số, chữ và dấu cách',
								},
								validateRequireInput('Vui lòng không để trống mục này.'),
							]}
						>
							<Input maxLength={50} />
						</Form.Item>
						<Form.Item
							label="Số tiền"
							name="feeAmount"
							normalize={(valueMoney) => formatNormalizeCurrency(valueMoney)}
							rules={[validateRequireInput('Vui lòng không để trống mục này.')]}
						>
							<Input maxLength={12} addonAfter={<span>VND</span>} />
						</Form.Item>
						<Form.Item label="Mô tả" name="description">
							<TextArea maxLength={300} />
						</Form.Item>
						{/* <Form.Item label=" " name="paymentType" colon={false}>
							<Radio.Group>
								<Radio value="NOW" className="w-full mb-2">
									Thanh toán ngay
								</Radio>
								<Radio value="LATER">Thanh toán hóa đơn sau</Radio>
							</Radio.Group>
						</Form.Item> */}
						<Row>
							<Col span={24} className="mt-5">
								<div>
									<div>
										<Button
											type="primary"
											htmlType="submit"
											loading={insertService.isLoading}
											className="float-right ml-2"
										>
											Thêm
										</Button>
										<Button
											className={`float-right border-217 `}
											onClick={() => setIsModalVisible(false)}
										>
											Hủy
										</Button>
									</div>
								</div>
							</Col>
						</Row>
					</Form>
				</Modal>
			)}
		</div>
	);
}

export default ExtraFree;
