import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { useUser } from 'app/hooks';
import { DX } from 'app/models';
import CSList from './CSList';
import CSEdit from './CSEdit';
import CSDetail from './CSDetail';
import CSRegister from './CSRegister';
import { PageNotFound } from '../../app/pages';

export default function ListServiceRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<CSList />
			</Route>
			{/* <Route path={`${path}/create`} exact>
				{true || DX.canAccessFuture2('admin/create-combo', user.permissions) ? (
					<CSRegister />
				) : (
					<PageNotFound />
				)}
			</Route> */}
			<Route path={`${path}/create`} exact>
				<CSRegister />
			</Route>
			{(true || DX.canAccessFuture2('dev/update-coupon-by-dev', user.permissions)) && (
				<Route path={`${path}/:id/edit`} exact>
					<CSEdit />
				</Route>
			)}
			{(true || DX.canAccessFuture2('dev/view-coupon-by-dev', user.permissions)) && (
				<Route path={`${path}/:id/detail`} exact>
					<CSDetail />
				</Route>
			)}
		</Switch>
	);
}
