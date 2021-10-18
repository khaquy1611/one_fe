import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { PageNotFound } from 'app/pages';
import { DX } from 'app/models';
import CommonComboPricingHistoryDetail from 'app/CommonCombo/CommonPricing/DetailScreen/CommonComboPricingHistoryDetail';
import HistoryDetailsAdmin from 'app/CommonCombo/CommonComboInfor/components/HistoryDetailsAdmin';
import ComboList from './ComboList';
import ComboRegister from './ComboRegister';
import ComboDetail from './ComboDetail';
import ComboPricingCreate from './ComboPricing/ComboPricingCreate';
import useUser from '../../app/hooks/useUser';

export default function ListServiceRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('admin/view-combo', user.permissions);
	const CAN_CREATE_COMBO_PLAN = DX.canAccessFuture2('admin/create-combo-pack', user.permissions);
	return (
		<Switch>
			{DX.canAccessFuture2('admin/list-combo', user.permissions) && (
				<Route path={path} exact>
					<ComboList />
				</Route>
			)}
			<Route path={`${path}/create`} exact>
				{DX.canAccessFuture2('admin/create-combo', user.permissions) ? <ComboRegister /> : <PageNotFound />}
			</Route>
			<Route path={`${path}/:id/pricing-create`} exact>
				{CAN_CREATE_COMBO_PLAN ? <ComboPricingCreate /> : <PageNotFound />}
			</Route>
			<Route path={`${path}/:id/history-plan/:historyId`} exact>
				<CommonComboPricingHistoryDetail portal="admin" />
			</Route>
			<Route path={`${path}/:id/history/:historyId`} exact>
				<HistoryDetailsAdmin portal="admin" />
			</Route>
			{CAN_VIEW && (
				<Route path={`${path}/:id/:pricingId?`} exact>
					<ComboDetail />
				</Route>
			)}
		</Switch>
	);
}
