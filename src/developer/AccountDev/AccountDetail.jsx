import React from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { Tabs } from 'antd';
import { useLng } from 'app/hooks';
import AccountDetailForm from './Components/AccountDetailForm';
import PersonalAccountForm from './Components/PersonalAccountForm';
import RepresentativeProfile from './Components/RepresentativeProfile';

function AccountDetail() {
	const { TabPane } = Tabs;
	const { tMenu } = useLng();

	return (
		<div>
			<UrlBreadcrumb type="devInfoEdit" />
			<Tabs defaultActiveKey="company" className="mt-2">
				<TabPane tab={tMenu('opt_edit', { field: 'enterpriseInfo' })} key="company">
					<AccountDetailForm />
				</TabPane>
				<TabPane tab={tMenu('opt_edit', { field: 'representativeInfo' })} key="representative">
					<RepresentativeProfile />
				</TabPane>

				<TabPane tab={tMenu('opt_edit', { field: 'personalInfo' })} key="personal">
					<PersonalAccountForm />
				</TabPane>
			</Tabs>
		</div>
	);
}

export default AccountDetail;
