import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import OrderServiceList from './OrderServiceList';
import SubscriptionDetail from './SubscriptionDetail/SubscriptionDetail';
import SubscriptionService from './SubscriptionService';

export default function SubscriptionOrderService({ type = 'DEV' }) {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<OrderServiceList type={type} />
			</Route>
			<Route path={`${path}/register`} exact>
				<SubscriptionService typePortal={type} isOrderService />
			</Route>
			<Route path={`${path}/:id`} exact>
				<SubscriptionDetail typePortal={type} isOrderService renewType="PRICING" />
			</Route>
		</Switch>
	);
}
