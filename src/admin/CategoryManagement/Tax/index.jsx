import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import TaxPage from './TaxPage';

export default function CategoryTax() {
	const { path } = useRouteMatch();

	return (
		<Switch>
			<Route path={path} exact>
				<TaxPage />
			</Route>
		</Switch>
	);
}
