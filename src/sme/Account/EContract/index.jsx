import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { DX } from 'app/models';
import EContract from './EContract';
import EContractDetails from './EContractDetails';
import useUser from '../../../app/hooks/useUser';

export default function ShowEContractDetails() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<EContract />
			</Route>
			{DX.canAccessFuture2('sme/view-econtract', user.permissions) && (
				<Route path={`${path}/:id/detail`}>
					<EContractDetails />
				</Route>
			)}
		</Switch>
	);
}
