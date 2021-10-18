import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import WrapEmployee from './index';
import EmployeeDetail from './EmployeeDetail';
import useUser from '../../../app/hooks/useUser';

function EmployeeRouter() {
	const { path } = useRouteMatch();
	const { user } = useUser();

	return (
		<div className="box-sme">
			<Switch>
				<Route path={path} exact>
					<WrapEmployee />
				</Route>
				{DX.canAccessFuture2('sme/list-sub-sme-account', user.permissions) && (
					<Route path={`${path}/:id`}>
						<EmployeeDetail />
					</Route>
				)}
			</Switch>
		</div>
	);
}
export default EmployeeRouter;
