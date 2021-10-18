import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import ListCategory from './ListCategory';

export default function CategoryPageRoute() {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<ListCategory />
			</Route>
		</Switch>
	);
}
