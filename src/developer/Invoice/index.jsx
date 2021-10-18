import React from 'react';
import { Switch, useRouteMatch, Route } from 'react-router-dom';
import { DX } from 'app/models';
import InvoiceDetails from './InvoiceDetails';
import InvoiceList from './InvoiceList';
import useUser from '../../app/hooks/useUser';

export default function Invoice() {
	const { path } = useRouteMatch();
	const { user } = useUser();

	return (
		<Switch>
			<Route path={path} exact>
				<InvoiceList />
			</Route>
			{DX.canAccessFuture2('dev/view-invoice', user.permissions) && (
				<Route path={`${path}/:id`}>
					<InvoiceDetails />
				</Route>
			)}
		</Switch>
	);
}
