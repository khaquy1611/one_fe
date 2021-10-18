import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import CurrencyPage from './CurrencyPage';

export default function CategoryPageRoute() {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path}>
				<CurrencyPage />
			</Route>
		</Switch>
	);
}
