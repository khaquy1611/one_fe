import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { DX } from 'app/models';
import ListTicket from './ListTicket';
import DetailTicket from './DetailTicket';
import useUser from '../../app/hooks/useUser';

export default function TicketPageRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<ListTicket />
			</Route>
			{DX.canAccessFuture2('admin/view-ticket', user.permissions) && (
				<Route path={`${path}/:id`}>
					<DetailTicket />
				</Route>
			)}
		</Switch>
	);
}
