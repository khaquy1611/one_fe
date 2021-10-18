/* eslint-disable no-nested-ternary */
import React from 'react';
import { Button, Modal } from 'antd';
import { TickCheck, ErrorIcon, ExtraEmailIcon, StartIcon } from 'app/icons';
import { useLng } from 'app/hooks';
import { useHistory } from 'react-router-dom';

export default function ModalNotification({ visibleModal, setVisibleModal, infoModal }) {
	const history = useHistory();
	const { tButton, tMessage } = useLng();
	const { iconType, title, subTile, redirectPage, textButton, typeButton, extraSubTitle } = {
		...infoModal,
	};

	const closeModal = () => {
		setVisibleModal(false);
		history.replace(redirectPage);
	};

	return (
		<Modal
			centered
			visible={visibleModal}
			onCancel={() => setVisibleModal(false)}
			footer={null}
			closable={false}
			maskClosable={false}
			bodyStyle={{ padding: '2rem' }}
		>
			<div className="flex flex-col justify-items-center items-center gap-4">
				{iconType === 'SUCCESS' && <TickCheck width="w-12" className="inline-block" />}
				{iconType === 'ERROR' && <ErrorIcon width="w-12" className="inline-block" />}
				{iconType === 'SUCCESS_CMT' && <StartIcon width="w-12" className="inline-block" />}
				{iconType === 'EMAIL' && <ExtraEmailIcon width="w-12" className="inline-block" />}

				<div className="text-xl font-bold">{tMessage(title)}</div>
				<div className="text-center">{extraSubTitle || tMessage(subTile)}</div>
				<Button type={typeButton || 'primary'} onClick={closeModal} className="w-2/4">
					{tButton(textButton)}
				</Button>
			</div>
		</Modal>
	);
}
