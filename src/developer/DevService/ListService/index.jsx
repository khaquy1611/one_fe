import CommonPricingHistoryDetail from 'app/CommonPricing/CommonPricingHistoryDetail';
import useUser from 'app/hooks/useUser';
import { DX } from 'app/models';
import { PageNotFound } from 'app/pages';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import EditService from '../components/EditService';
import PricingCreate from '../PricingModule/PricingCreate';
import ListService from './ListService';

export default function ListServiceRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<ListService />
			</Route>
			<Route path={`${path}/:id/pricing-create`} exact>
				{DX.canAccessFuture2('dev/create-service-pack', user.permissions) ? (
					<PricingCreate />
				) : (
					<PageNotFound />
				)}
			</Route>
			<Route path={`${path}/:id/history/:historyId`} exact>
				<CommonPricingHistoryDetail portal="dev" />
			</Route>
			{DX.canAccessFuture2('dev/view-service', user.permissions) && (
				<Route path={`${path}/:id/:pricingId?`}>
					<EditService />
				</Route>
			)}
		</Switch>
	);
}
