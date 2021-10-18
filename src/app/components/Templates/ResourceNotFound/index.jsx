import React, { useState } from 'react';
import { useNavigation, useLng } from 'app/hooks';
import { Button, Modal } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

function Index({ defaultPage, msg, dynamicCallBack }) {
	const { goBack } = useNavigation();
	const [visible, setVisible] = useState(true);
	const history = useHistory();
	const { tButton } = useLng();
	const handleAccept = () => {
		if (dynamicCallBack) {
			return history.push(dynamicCallBack);
		}
		goBack(defaultPage);
		setVisible(false);
		return null;
	};

	return (
		<>
			<Modal visible={visible} closable={false} maskClosable={false} footer={null} width={416}>
				<div>
					<span className="mr-4">
						<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '22px' }} />
					</span>
					<span className="text-base font-medium">{msg}</span>
					<div className="mt-6 flex flex-row-reverse">
						<Button className="ml-2" type="primary" onClick={() => handleAccept()}>
							{tButton('agreement')}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
Index.propTypes = {};
Index.defaultProps = {};

export default Index;
