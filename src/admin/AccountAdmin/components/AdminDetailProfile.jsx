import React from 'react';
import { Tabs } from 'antd';
import { useLng } from 'app/hooks';
import { useHistory, useParams } from 'react-router-dom';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { DX } from 'app/models';
import AdminProfile from './AdminProfile';
import ChangePassword from './ChangePassword';

const { TabPane } = Tabs;

function AdminDetailProfile() {
	const { tMenu } = useLng();
	const { key } = useParams();
	const history = useHistory();
	const breadcumb = [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'accInfo',
			url: '',
		},
	];
	return (
		<div>
			<UrlBreadcrumb breadcrumbs={breadcumb} />
			<Tabs
				activeKey={key}
				onChange={(newKey) => history.push(DX.admin.createPath(`/account/profile/${newKey}`))}
			>
				<TabPane tab={tMenu('opt_edit', { field: 'accInfo' })} key="info">
					<AdminProfile />
				</TabPane>
				<TabPane tab={tMenu('changePass')} key="password">
					<ChangePassword />
				</TabPane>
			</Tabs>
		</div>
	);
}

export default AdminDetailProfile;
