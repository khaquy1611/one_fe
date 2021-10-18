import React from 'react';
import { Switch, useRouteMatch, Route, Redirect } from 'react-router-dom';
import { DX } from 'app/models';
import SaasList from './SaasList';
import NewServiceDetail from './components/NewServiceDetail';
import PricingHistoryDetailAdmin from '../PricingNew/PricingHistoryDetailAdmin';
import useUser from '../../../app/hooks/useUser';

export default function SassAdminRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	if (!DX.canAccessFuture2('admin/list-service', user.permissions)) {
		return <Redirect to={DX.admin.createPath('/account/profile/info')} />;
	}

	return (
		<Switch>
			<Route path={path} exact>
				<SaasList />
			</Route>
			<Route path={`${path}/:id/history/:historyId`} exact>
				<PricingHistoryDetailAdmin />
			</Route>
			{DX.canAccessFuture2('admin/view-service', user.permissions) && (
				<Route path={`${path}/:id/:pricingId?`}>
					<NewServiceDetail />
				</Route>
			)}
		</Switch>
	);
}
