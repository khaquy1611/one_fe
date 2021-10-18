import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import ListSubscription from './ListSubscription';
import SubscriptionDetail from './SubscriptionDetail/SubscriptionDetail';
import SubscriptionService from './SubscriptionService';

export default function Subscription({ type = 'DEV' }) {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<ListSubscription type={type} />
			</Route>
			<Route path={`${path}/register`} exact>
				<SubscriptionService typePortal={type} />
			</Route>
			<Route path={`${path}/:id`} exact>
				<SubscriptionDetail typePortal={type} renewType="PRICING" />
			</Route>
		</Switch>
	);
}
