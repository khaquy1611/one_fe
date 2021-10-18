import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { DX } from 'app/models';
import ListRoleAdmin from './ListRoleAdmin';
import ListRoleDev from './ListRoleDev';
import ListRoleSme from './ListRoleSme';
import useUser from '../../app/hooks/useUser';

export default function RolePageRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			{DX.canAccessFuture2('admin/list-admin-role', user.permissions) && (
				<Route path={`${path}/admin`} exact>
					<ListRoleAdmin />
				</Route>
			)}
			{DX.canAccessFuture2('admin/list-dev-role', user.permissions) && (
				<Route path={`${path}/develop`} exact>
					<ListRoleDev />
				</Route>
			)}
			{DX.canAccessFuture2('admin/list-sme-role', user.permissions) && (
				<Route path={`${path}/sme`} exact>
					<ListRoleSme />
				</Route>
			)}
		</Switch>
	);
}
