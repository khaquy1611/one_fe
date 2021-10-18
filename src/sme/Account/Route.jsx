import React from 'react';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router-dom';
import { useUser } from 'app/hooks';
import CanNotAccessRoute from 'app/permissions/CanNotAccessRoute';
import routers from './router';
import LeftMenu from './components/LeftMenu';

export default function ManageAccount() {
	const { path } = useRouteMatch();
	const { pathname } = useLocation();
	const { user } = useUser();
	const checkRoute = pathname.includes('detail') && !pathname.includes('ticket/detail');

	return (
		<div className="flex -mx-4">
			<div className="px-4 min-h-screen" style={{ width: '17rem', display: checkRoute && 'none' }}>
				<LeftMenu />
			</div>
			<div
				className="px-4"
				style={{
					width: !checkRoute ? 'calc(100% - 17rem)' : '100%',
				}}
			>
				<Switch>
					{routers(user)
						.filter((el) => !el.hide)
						.map((router, i) => {
							if (!router.hide) {
								return <Route key={router.key || i} {...router} path={path + router.path} />;
							}
							return (
								<Route
									key={router.key || i}
									{...router}
									path={path + router.path}
									component={CanNotAccessRoute}
								/>
							);
						})}
				</Switch>
			</div>
		</div>
	);
}
