import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import ListSubscriptionCombo from './ListSubscriptionCombo';
import SubscriptionComboService from './SubscriptionComboService';
import SubscriptionDetail from './SubscriptionDetail/SubscriptionDetail';

export default function Subscription({ type }) {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<ListSubscriptionCombo typePortal={type} />
			</Route>
			<Route path={`${path}/register`} exact>
				<SubscriptionComboService typePortal={type} />
			</Route>
			<Route path={`${path}/:id`} exact>
				<SubscriptionDetail typePortal={type} renewType="COMBO" />
			</Route>
		</Switch>
	);
}
