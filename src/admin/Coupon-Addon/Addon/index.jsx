import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { useUser } from 'app/hooks';
import { PageNotFound } from 'app/pages';
import { DX } from 'app/models';
import AddonList from './AddonList/AddonList';
import AddonRegister from './AddonRegister';
import AddonDetails from './AddonDetails';
import AddonEdit from './AddonEdit';

export default function ListServiceRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('admin/view-addon', user.permissions);
	const CAN_CREATE = DX.canAccessFuture2('admin/create-addon', user.permissions);
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('admin/update-addon-by-admin', user.permissions);
	return (
		<Switch>
			<Route path={path} exact>
				<AddonList />
			</Route>
			{CAN_CREATE && (
				<Route path={`${path}/create`} exact>
					<AddonRegister />
				</Route>
			)}
			{CAN_VIEW && (
				<Route path={`${path}/:id/detail`} exact>
					<AddonDetails />
				</Route>
			)}
			{CAN_UPDATE_BY_ADMIN && (
				<Route path={`${path}/:id/edit`} exact>
					<AddonEdit />
				</Route>
			)}
			<Route path={`${path}/*`}>
				<PageNotFound />
			</Route>
		</Switch>
	);
}
