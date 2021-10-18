import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import ServiceList from '.';
import DescriptionEvaluateService from './DescriptionEvaluateService';
import useUser from '../../app/hooks/useUser';

function EmployeeRouter() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<ServiceList />
			</Route>
			{(DX.canAccessFuture2('dev/view-evaluate', user.permissions) ||
				DX.canAccessFuture2('dev/view-evaluate-combo', user.permissions)) && (
				<Route path={`${path}/:id`}>
					<DescriptionEvaluateService />
				</Route>
			)}
		</Switch>
	);
}
export default EmployeeRouter;
