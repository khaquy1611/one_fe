import { Tabs } from 'antd';
import React from 'react';
import { useLng } from 'app/hooks';
import CompanyInfo from './CompanyInfo';
import RepresentativeProfile from './RepresentativeProfile';

function CompanyProfile() {
	const { tMenu } = useLng();
	const { TabPane } = Tabs;
	function callback(key) {
		console.log(key);
	}
	return (
		<Tabs defaultActiveKey="1" onChange={callback}>
			<TabPane tab={tMenu('enterpriseInfo')} key="enterprise">
				<CompanyInfo />
			</TabPane>
			<TabPane tab={tMenu('representativeInfo')} key="representative">
				<RepresentativeProfile />
			</TabPane>
		</Tabs>
	);
}

export default CompanyProfile;
