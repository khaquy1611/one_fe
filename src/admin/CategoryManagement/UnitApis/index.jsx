import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import ListUnitApis from './ListUnitApis';

export default function UnitApisPageRoute() {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<ListUnitApis />
			</Route>
		</Switch>
	);
}
