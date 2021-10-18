import { Tabs } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import React from 'react';
import { useLocation } from 'react-router-dom';
import RepresentativeInfo from './RepresentativeInfo';
import SmeCompanyProfile from './SmeCompanyProfile';
import SmePersonalProfile from './SmePersonalProfile';

const { TabPane } = Tabs;
function SmeDetailProfile(props) {
	const location = useLocation();
	const { tMenu } = useLng();
	const breadcrumbs = [
		{
			name: 'opt_manage/acc',
			url: 'sss',
		},
		{
			name: 'SME_list',
			url: '/admin-portal/account/sme',
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

			<Tabs>
				<TabPane tab={tMenu('enterpriseInfo')} key="1">
					<SmeCompanyProfile />
				</TabPane>
				<TabPane tab="Thông tin người đại diện" key="2">
					<RepresentativeInfo />
				</TabPane>
				<TabPane tab={tMenu('personalInfo')} key="3">
					<SmePersonalProfile />
				</TabPane>
			</Tabs>
		</div>
	);
}

export default SmeDetailProfile;
