import React from 'react';
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { DX } from 'app/models';

import { useHistory, useLocation } from 'react-router-dom';

const CanNotAccessRoute = React.memo(() => {
	const history = useHistory();
	const { pathname } = useLocation();

	return (
		<Modal visible closable={false} maskClosable={false} footer={null} width={416}>
			<div>
				<div>
					<span className="mr-4">
						<ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '22px' }} />
					</span>
					<span className="text-base font-medium">Bạn không có quyền truy cập trang này!</span>
				</div>
				<div className="mt-6 flex flex-row-reverse">
					<div>
						<Button type="primary" onClick={() => history.replace(DX.getPortalByPath(pathname).path)}>
							OK
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
});

export default CanNotAccessRoute;
