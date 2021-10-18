import { CheckOutlined, CloseCircleOutlined, CloseOutlined, EditOutlined, MinusOutlined } from '@ant-design/icons';
import { Button, Drawer, Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import PropTypes from 'prop-types';
import { useLng } from 'app/hooks';
import React, { useEffect, useRef } from 'react';

function DrawerApproval({
	closeForm,
	visible,
	form,
	handleClickApprove,
	handleClickUnApprove,
	handleClickReject,
	loading,
	typeLoading,
	title,
	textAcceptBtn,
	content,
	approved,
	unApproved,
	rejected,
	hideBtnUnApproved,
}) {
	const nameRef = useRef();
	const { tButton, tField, tValidation } = useLng();
	useEffect(() => {
		if (visible) {
			setTimeout(() => {
				nameRef.current.focus();
			}, 100);
		}
	}, [visible]);
	return (
		<>
			<Drawer
				title={<div style={{ color: '#FFFFFF' }}>{title}</div>}
				width={600}
				headerStyle={{
					backgroundColor: '#2C3D94',
				}}
				closeIcon={<MinusOutlined style={{ color: '#FFFFFF' }} />}
				onClose={closeForm}
				visible={visible}
			>
				<Form form={form} layout="vertical" className="mb-6">
					<div className="text-center">
						<Button
							type="primary"
							loading={loading && typeLoading === approved}
							disabled={loading && typeLoading !== approved}
							icon={<CheckOutlined />}
							onClick={() => handleClickApprove()}
						>
							{textAcceptBtn}
						</Button>
					</div>

					<hr className="-mx-6 my-6" style={{ borderTop: '1px solid #f0f0f0' }} />
					<div className="mb-2">{content}</div>
					<Form.Item
						name="comment"
						label={`${hideBtnUnApproved === true ? tField('refusalReason') : tField('commentContent')}`}
						rules={[{ required: true, message: tValidation('plsEnterCommentContent') }]}
					>
						<TextArea disabled={loading} maxLength={200} rows={6} ref={nameRef} />
					</Form.Item>
					<hr className="-mx-6 mt-6 mb-2" style={{ borderTop: '1px solid #f0f0f0' }} />
					{!hideBtnUnApproved ? (
						<div className="flex justify-between">
							<Button
								type="dashed"
								danger
								icon={<CloseCircleOutlined />}
								loading={loading && typeLoading === rejected}
								disabled={loading && typeLoading !== rejected}
								onClick={() => handleClickReject()}
							>
								{tButton('reject')}
							</Button>

							<Button
								icon={<EditOutlined />}
								disabled={loading && typeLoading !== unApproved}
								loading={loading && typeLoading === unApproved}
								onClick={() => handleClickUnApprove()}
							>
								{tButton('updateApproval')}
							</Button>
						</div>
					) : (
						<div className="float-right">
							<Button
								type="default"
								icon={<CloseOutlined />}
								loading={loading && typeLoading === rejected}
								disabled={loading && typeLoading !== rejected}
								onClick={() => handleClickReject()}
							>
								{tButton('reject')}
							</Button>
						</div>
					)}
				</Form>
			</Drawer>
		</>
	);
}
DrawerApproval.propTypes = {
	title: PropTypes.string.isRequired,
	textAcceptBtn: PropTypes.string.isRequired,
	hideBtnUnApproved: PropTypes.bool,
};
DrawerApproval.defaultProps = {
	hideBtnUnApproved: false,
};

export default DrawerApproval;
