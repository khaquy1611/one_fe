import { Tabs } from 'antd';
import { useQueryUrl, useLng } from 'app/hooks';
import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import ComboList from './Combo/ComboList';
import OrderServiceList from './OrderServiceList';
import SubscriptionList from './Pricing/SubscriptionList';

const { TabPane } = Tabs;

function Subscription() {
	const { pathname } = useLocation();
	const history = useHistory();

	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');

	const { tMenu } = useLng();

	return (
		<div className="box-sme">
			<div className="uppercase font-bold mb-4 text-gray-60">{tMenu('subscriberList')}</div>
			<Tabs
				activeKey={getTab || 'service'}
				onChange={(activeTab) => {
					history.replace(`${pathname}?tab=${activeTab}`);
				}}
				className="custom-tab sub"
			>
				<TabPane tab={<span className="uppercase font-semibold">Thuê bao dịch vụ</span>} key="service">
					<SubscriptionList />
				</TabPane>
				<TabPane tab={<span className="uppercase font-semibold">Thuê bao combo</span>} key="combo">
					<ComboList />
				</TabPane>
				<TabPane tab={<span className="uppercase font-semibold">Thuê bao order</span>} key="orderService">
					<OrderServiceList />
				</TabPane>
			</Tabs>
		</div>
	);
}

export default Subscription;
