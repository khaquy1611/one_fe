import React from 'react';
import { Button, Modal } from 'antd';
import { useLng } from 'app/hooks';
import { QuestionIcon } from 'app/icons';

export default function ModalConfirm({ mainTitle, subTitle, showModal, setShowModal, mutation, isLoading, onCancel }) {
	const { tButton } = useLng();
	return (
		<Modal
			centered
			visible={showModal}
			onCancel={() => setShowModal(false)}
			footer={null}
			closable={false}
			bodyStyle={{ padding: '2.5rem' }}
			maskClosable={false}
		>
			<div className="justify-center flex mb-4">
				<QuestionIcon width="w-12" className="inline-block text-primary" />
			</div>
			<h4 className=" text-center text-xl font-semibold mb-2.5">{mainTitle}</h4>
			<p className="text-center text-sm mb-5">{subTitle}</p>
			<div className="flex gap-8 px-14">
				<Button
					className="flex justify-center items-center"
					onClick={() => {
						if (!isLoading) {
							setShowModal(false);
							// eslint-disable-next-line no-unused-expressions
							onCancel && onCancel();
						}
					}}
					disabled={isLoading}
					block
				>
					{tButton('opt_cancel')}
				</Button>
				<Button
					className="flex justify-center items-center"
					onClick={mutation}
					block
					type="primary"
					loading={isLoading}
				>
					{tButton('opt_confirm')}
				</Button>
			</div>
		</Modal>
	);
}
