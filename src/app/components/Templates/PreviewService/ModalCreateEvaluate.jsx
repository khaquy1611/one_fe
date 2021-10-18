import { Alert, Button, Form, Input, Modal, Rate } from 'antd';
import { useUser } from 'app/hooks';
import { StartIcon } from 'app/icons';
import { DX } from 'app/models';
import React from 'react';

function ModalCreateEvaluate({
	isModalShow,
	setModalShow,
	isDirty,
	setDirty,
	form,
	onFinish,
	isError,
	setError,
	dataUpdate,
	isLoading,
}) {
	console.log('dataUpdate', dataUpdate);
	const { user } = useUser();
	const CAN_COMMENT = DX.canAccessFuture2('sme/comment-service', user.permissions);
	const CAN_UPDATE_COMMENT = DX.canAccessFuture2('sme/update-comment-service', user.permissions);

	const CAN_EVALUATE = DX.canAccessFuture2('sme/evaluate-service', user.permissions);
	const CAN_UPDATE_EVALUATE = DX.canAccessFuture2('sme/update-evaluate-service', user.permissions);

	const changeValue = () => {
		if (
			(form?.getFieldValue('display') === 0 || (form?.getFieldValue('display') === undefined && !dataUpdate)) &&
			(form?.getFieldValue('request') === 0 || (form?.getFieldValue('request') === undefined && !dataUpdate)) &&
			(form?.getFieldValue('speed') === 0 || (form?.getFieldValue('speed') === undefined && !dataUpdate)) &&
			(form?.getFieldValue('support') === 0 || (form?.getFieldValue('support') === undefined && !dataUpdate))
		) {
			setDirty(false);
		} else setDirty(true);
	};

	return (
		<>
			{isModalShow && (
				<Modal
					bodyStyle={{ padding: '2.5rem 4.3rem' }}
					centered
					visible
					footer={null}
					closable={false}
					width={640}
					maskClosable={false}
				>
					<div className="justify-center flex pt-4">
						<StartIcon className="w-12 " />
					</div>

					<p className="text-center font-semibold mt-3.5">Đánh giá</p>
					<p className="text-center mt-3.5">Mời bạn đánh giá dịch vụ</p>
					{isError && (
						<Alert
							className="px-3 py-2 "
							description="Vui lòng nhập đầy đủ đánh giá"
							type="warning"
							showIcon
						/>
					)}
					<h3 className="text-base font-semibold uppercase mb-4 mt-5" style={{ color: ' #78909c' }}>
						ĐÁNH GIÁ CỦA BẠN
					</h3>
					<Form
						labelCol={{ span: 18 }}
						labelAlign="left"
						onFinish={onFinish}
						form={form}
						autoComplete="off"
						onValuesChange={changeValue}
					>
						<Form.Item
							name="request"
							label="Đáp ứng đầy đủ yêu cầu của Doanh nghiệp"
							className="mb-0"
							colon={false}
						>
							<Rate
								defaultValue={dataUpdate?.ratingDetail[0].ratingPoint}
								className="text-base"
								style={{ color: '#F4BF1B' }}
								disabled={!((CAN_EVALUATE && !dataUpdate) || (dataUpdate && CAN_UPDATE_EVALUATE))}
							/>
						</Form.Item>

						<Form.Item
							name="display"
							label="Giao diện thân thiện, dễ sử dụng"
							className="mb-0"
							colon={false}
						>
							<Rate
								defaultValue={dataUpdate?.ratingDetail[2].ratingPoint}
								className="text-base"
								style={{ color: '#F4BF1B' }}
								disabled={!((CAN_EVALUATE && !dataUpdate) || (dataUpdate && CAN_UPDATE_EVALUATE))}
							/>
						</Form.Item>
						<Form.Item name="speed" label="Tốc độ xử lý nhanh" className="mb-0" colon={false}>
							<Rate
								defaultValue={dataUpdate?.ratingDetail[1].ratingPoint}
								className="text-base"
								style={{ color: '#F4BF1B' }}
								disabled={!((CAN_EVALUATE && !dataUpdate) || (dataUpdate && CAN_UPDATE_EVALUATE))}
							/>
						</Form.Item>
						<Form.Item name="support" label="Hỗ trợ từ nhà cung cấp nhiệt tình chu đáo" colon={false}>
							<Rate
								defaultValue={dataUpdate?.ratingDetail[3].ratingPoint}
								className="text-base"
								style={{ color: '#F4BF1B' }}
								disabled={!((CAN_EVALUATE && !dataUpdate) || (dataUpdate && CAN_UPDATE_EVALUATE))}
							/>
						</Form.Item>
						<h3 className="text-base font-semibold uppercase mb-4 " style={{ color: ' #78909c' }}>
							VIẾT NHẬN XÉT
						</h3>
						<Form.Item name="comment">
							<Input.TextArea
								rows={4}
								maxLength={500}
								defaultValue={dataUpdate?.commentContent || ''}
								showCount
								autoFocus
								disabled={
									!(
										(CAN_COMMENT && !dataUpdate?.commentContent) ||
										(dataUpdate?.commentContent && CAN_UPDATE_COMMENT)
									)
								}
							/>
						</Form.Item>

						<div className="flex gap-8">
							<Button
								className="uppercase w-full"
								onClick={() => {
									form.resetFields();
									setModalShow(false);
									setDirty(false);
									setError(false);
								}}
							>
								Hủy
							</Button>
							<Button
								className="uppercase w-full"
								onClick={() => {
									form.submit();
								}}
								type="primary"
								disabled={!isDirty}
								loading={isLoading}
							>
								Xác nhận
							</Button>
						</div>
					</Form>
				</Modal>
			)}
		</>
	);
}

export default ModalCreateEvaluate;
