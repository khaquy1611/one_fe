import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { DX } from 'app/models';
import ListBilling from './ListBilling';
import DetailBilling from './DetailBilling';
import useUser from '../../app/hooks/useUser';

export default function BillingPageRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<ListBilling />
			</Route>
			{DX.canAccessFuture2('admin/view-invoice', user.permissions) && (
				<Route path={`${path}/:id`}>
					<DetailBilling />
				</Route>
			)}
		</Switch>
	);
}
