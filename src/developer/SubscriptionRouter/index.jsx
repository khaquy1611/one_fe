import { Tabs } from 'antd';
import { DX } from 'app/models';
import React from 'react';
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom';
import SubscriptionCombo from 'developer/SubscriptionCombo';
import Subscription from 'developer/Subscription';
import SubscriptionOrderService from 'developer/Subscription/indexOrderService';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import styled from 'styled-components';
import { toLower } from 'opLodash';

const { TabPane } = Tabs;
const TabsStyle = styled(Tabs)`
	& > .ant-tabs-nav {
		display: ${(props) => (props.inList ? '' : 'none')};
	}
`;
function SubscriptionRouter({ type = 'DEV' }) {
	const history = useHistory();

	const { typeSub = 'service' } = useParams();
	const { pathname } = useLocation();
	const { path } = useRouteMatch();
	const inList = pathname === path.replace(':typeSub', typeSub);
	return (
		<div>
			{inList && (
				<div className="mb-4 ">
					<UrlBreadcrumb type="SubscriptionList" />
				</div>
			)}
			<TabsStyle
				inList={inList}
				activeKey={typeSub}
				onChange={(activeTab) => {
					history.replace(DX[toLower(type)].createPath(`/subscription/${activeTab}`));
				}}
			>
				<TabPane tab={<span className="uppercase font-semibold">Thuê bao dịch vụ</span>} key="service">
					<Subscription type={type} />
				</TabPane>
				<TabPane tab={<span className="uppercase font-semibold">Thuê bao combo</span>} key="combo">
					<SubscriptionCombo type={type} />
				</TabPane>
				<TabPane tab={<span className="uppercase font-semibold">Thuê bao order</span>} key="order-service">
					<SubscriptionOrderService type={type} />
				</TabPane>
			</TabsStyle>
		</div>
	);
}

export default SubscriptionRouter;
