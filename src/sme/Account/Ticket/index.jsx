import React from 'react';
import { Switch, useRouteMatch, Route } from 'react-router-dom';
import { DX } from 'app/models';
import { useUser } from 'app/hooks';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';

export default function SmeAdminRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<TicketList />
			</Route>
			{DX.canAccessFuture2('sme/view-ticket', user.permissions) && (
				<Route path={`${path}/detail/:id`}>
					<TicketDetail />
				</Route>
			)}
		</Switch>
	);
}
