import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { DX } from 'app/models';
import Invoice from './Invoice';
import InvoiceDetails from './InvoiceDetails';
import useUser from '../../../app/hooks/useUser';

export default function ShowInvoiceDetails() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<Invoice />
			</Route>
			{DX.canAccessFuture2('sme/view-invoice', user.permissions) && (
				<Route path={`${path}/:id`}>
					<InvoiceDetails />
				</Route>
			)}
		</Switch>
	);
}
