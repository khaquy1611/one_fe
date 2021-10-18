import useUser from 'app/hooks/useUser';
import { DX } from 'app/models';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import AccountManageDetail from './AccountManageDetail';
import WrapAccountManage from './WrapAccountManage';

function AccountManageRouter() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<WrapAccountManage />
			</Route>
			{DX.canAccessFuture2('dev/list-sub-dev-account', user.permissions) && (
				<Route path={`${path}/:id`}>
					<AccountManageDetail />
				</Route>
			)}
		</Switch>
	);
}
export default AccountManageRouter;
