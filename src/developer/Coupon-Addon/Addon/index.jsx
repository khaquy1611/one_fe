import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import AddonDetail from './AddonDetail';
import AddonList from './AddonList';
import AddonRegister from './AddonRegister';
import AddonEdit from './AddonEdit';
import useUser from '../../../app/hooks/useUser';

export default function AddonScreenRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('dev/view-addon-by-dev', user.permissions);
	const CAN_CREATE = DX.canAccessFuture2('dev/create-addon', user.permissions);
	const CAN_UPDATE_BY_ADMIN = DX.canAccessFuture2('dev/update-addon-by-dev', user.permissions);
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
					<AddonDetail />
				</Route>
			)}
			{CAN_UPDATE_BY_ADMIN && (
				<Route path={`${path}/:id/edit`} exact>
					<AddonEdit />
				</Route>
			)}
		</Switch>
	);
}
