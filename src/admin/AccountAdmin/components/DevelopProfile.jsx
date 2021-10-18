import React from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { Tabs } from 'antd';
import { useLng } from 'app/hooks';
import { useLocation } from 'react-router-dom';
import DevBusinessForm from './DevBusinessForm';
import DevPersonalForm from './DevPersonalForm';
import RepresentativeInfo from './RepresentativeInfo';

function DevelopProfile() {
	const { TabPane } = Tabs;
	const location = useLocation();
	const { tMenu } = useLng();
	const breadcrumbs = [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'DEV_list',
			url: '/admin-portal/account/dev',
		},
		{
			isName: true,
			name: location.state ? location.state.devProfileProps.name : '',
			url: '',
		},
	];

	return (
		<div>
			<UrlBreadcrumb breadcrumbs={breadcrumbs} />

			<Tabs defaultActiveKey="1" className="mt-2">
				<TabPane tab={tMenu('enterpriseInfo')} key="1">
					<DevBusinessForm />
				</TabPane>
				<TabPane tab="Thông tin người đại diện" key="2">
					<RepresentativeInfo />
				</TabPane>
				<TabPane tab={tMenu('personalInfo')} key="3">
					<DevPersonalForm />
				</TabPane>
			</Tabs>
		</div>
	);
}

export default DevelopProfile;
