import React from 'react';
import { DX } from 'app/models';
import { useUser } from 'app/hooks';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { PageNotFound } from 'app/pages';
import CommonComboPricingHistoryDetail from 'app/CommonCombo/CommonPricing/DetailScreen/CommonComboPricingHistoryDetail';
import HistoryDetailsDev from 'app/CommonCombo/CommonComboInfor/components/HistoryDetailsDev';
import ComboList from './ComboList/ComboList';
import ComboDetail from './ComboDetail';
import ComboRegister from './ComboRegister';
import ComboPricingCreate from './ComboPricing/ComboPricingCreate';

export default function ServicePackPage() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('dev/view-combo', user.permissions);
	const CAN_CREATE_COMBO_PLAN = DX.canAccessFuture2('dev/create-combo-pack', user.permissions);
	return (
		<Switch>
			<Route path={path} exact>
				<ComboList />
			</Route>
			<Route path={`${path}/create`} exact>
				{DX.canAccessFuture2('admin/create-combo', user.permissions) ? <ComboRegister /> : <PageNotFound />}
			</Route>
			<Route path={`${path}/:id/pricing-create`} exact>
				{CAN_CREATE_COMBO_PLAN ? <ComboPricingCreate /> : <PageNotFound />}
			</Route>
			<Route path={`${path}/:id/history-plan/:historyId`} exact>
				<CommonComboPricingHistoryDetail portal="dev" />
			</Route>
			<Route path={`${path}/:id/history/:historyId`} exact>
				<HistoryDetailsDev portal="admin" />
			</Route>
			{CAN_VIEW && (
				<Route path={`${path}/:id/:pricingId?`} exact>
					<ComboDetail />
				</Route>
			)}
		</Switch>
	);
}
