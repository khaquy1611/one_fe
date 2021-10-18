import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import PromotionDetailReport from './PromotionDetailReport';
import PromotionSummaryReport from './PromotionSummaryReport';
import RevenueSummaryReport from './RevenueSummaryReport';
import ServiceSummaryReport from './ServiceSummaryReport';
import SubscriberDetailReport from './SubscriberDetailReport';
import TrialSummaryReport from './TrialSummaryReport';
import UserSummaryReport from './UserSummaryReport';

export default function DashBoardRoute() {
	const { path } = useRouteMatch();
	const routes = [
		{
			path: '/promotion-detail',
			component: PromotionDetailReport,
		},
		{
			path: '/promotion-summary',
			component: PromotionSummaryReport,
		},
		{
			path: '/revenue-summary',
			component: RevenueSummaryReport,
		},
		{
			path: '/service-summary',
			component: ServiceSummaryReport,
		},
		{
			path: '/subscriber-detail',
			component: SubscriberDetailReport,
		},
		{
			path: '/trial-summary',
			component: TrialSummaryReport,
		},
		{
			path: '/user-summary',
			component: UserSummaryReport,
		},
	];
	return (
		<Switch>
			{routes.map((router, i) => (
				<Route key={router.key || i} {...router} path={path + router.path} />
			))}
		</Switch>
	);
}
