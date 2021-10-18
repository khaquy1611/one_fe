import React from 'react';
import { Switch, useRouteMatch, Route } from 'react-router-dom';
import ComboList from './ComboList';
import ComboDetail from './ComboDetail';

export default function SassAdminRoute() {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<ComboList />
			</Route>
			<Route path={`${path}/:id/detail`}>
				<ComboDetail />
			</Route>
		</Switch>
	);
}
