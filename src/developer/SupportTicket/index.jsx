import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import AddSupportTicket from './component/AddSupportTicket';
import ListSupportTicket from './component/ListSupportTicket';
import useUser from '../../app/hooks/useUser';

export default function SupportTicketRouter() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			{DX.canAccessFuture2('dev/list-ticket', user.permissions) && (
				<Route path={path} exact>
					<ListSupportTicket />
				</Route>
			)}
			{DX.canAccessFuture2('dev/list-ticket', user.permissions) &&
				DX.canAccessFuture2('dev/view-ticket', user.permissions) && (
					<Route path={`${path}/:id`}>
						<AddSupportTicket />
					</Route>
				)}
		</Switch>
	);
}
