import React, { Suspense, useEffect, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useMediaQuery } from 'react-responsive';

import authRoutersDev from 'developer/authRoutes';
import authRoutersSME from 'sme/authRoutes';
import authRoutersAdmin from 'admin/authRoutes';
import { useDispatch } from 'react-redux';
import { appActions } from 'actions';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { DevRoute, AdminRoute } from 'app/permissions/PrivateRoute';
import AuthRoute from 'app/permissions/AuthRoute';
import PermissionModal from 'app/permissions/PermissionModal';
import { PageNotFound, VerifyPage, ScreenCallBack } from 'app/pages';
import { ScrollToTop } from 'app/components/Atoms';
import { useUser } from 'app/hooks';
import ErrorBoundary from 'app/permissions/ErrorBoundary';
import { textScriptGTMHead, scriptChat } from 'config';
import '@egjs/react-flicking/dist/flicking.css';

import { DX } from 'app/models';
// import { DevTool } from 'app/components/Molecules';
import PreOrder from 'developer/PreOrder';

import GlobalStyleSME from './smeStyle';
import './App.less';
import './App.scss';

const SMEPortal = React.lazy(() => import('./sme'));
const AdminPortal = React.lazy(() => import('./admin'));
const DeveloperPortal = React.lazy(() => import('./developer'));

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchInterval: false,
			retry: 0,
		onError: (e) => {
				console.trace(e);
				// if (e.status === 404) {
				// 	console.error(e.status);
				// 	window.location.href = `${window.location.origin}/page-not-found`;
				// }
			},
		},
	},
});

function renderRouter(routes, role) {
	return routes.map(({ ...props }) => <AuthRoute {...props} key={props.path} role={role} />);
}
function App() {
	const isTablet = useMediaQuery({ query: '(max-width: 1023px)' });
	const isMobile = useMediaQuery({ query: '(max-width: 639px)' });
	const dispatch = useDispatch();
	const { pathname } = useLocation();
	const { user } = useUser();
	const isSME = useMemo(() => pathname.startsWith(DX.sme.path) || pathname.startsWith('/verify'), [pathname]);
	// const componentSize = useEffect(() => (document.body.clientWidth > 1336 ? null : 'small'), []);
	useEffect(() => {
		const idChat = 'script-live-chat';
		const idJquery = 'script-jquery';
		const idGTM = 'script-gtm-head';

		if (isSME) {
			const scriptJquery =
				document.getElementById(idJquery) || document.createElement('script', { id: idJquery });
			scriptJquery.src = 'https://code.jquery.com/jquery-3.5.0.js';

			const script = document.getElementById(idChat) || document.createElement('script', { id: idChat });
			script.setAttribute('data-skip-moving', true);
			script.innerText = scriptChat;
			document.body.appendChild(scriptJquery);
			document.body.appendChild(script);

			const scriptGTMHead = document.getElementById(idGTM) || document.createElement('script', { id: idGTM });
			scriptGTMHead.innerText = textScriptGTMHead;
			document.head.appendChild(scriptGTMHead);
		} else {
			const script = document.getElementById(idChat);
			if (script) script.innerText = '';
			const script2 = document.getElementById(idJquery);
			if (script2) script2.innerText = '';
			const script3 = document.getElementById(idGTM);
			if (script3) script3.innerText = '';
		}
	}, [isSME]);

	useEffect(() => {
		queryClient.clear();
	}, [user.id]);

	useEffect(() => {
		dispatch(appActions.updateSetting({ isTablet: !isMobile && isTablet, isMobile }));
	}, [isTablet, isMobile]);

	return (
		<QueryClientProvider client={queryClient}>
			<ConfigProvider locale={viVN} input={{ autoComplete: 'off' }}>
				{isSME && <GlobalStyleSME />}
				<PermissionModal />
				<ScrollToTop />
				<ErrorBoundary>
					<Suspense fallback={null}>
						<Switch>
							<Route path="/verify/:id/:activeKey" exact component={VerifyPage} />
							<Route path="/auth-server/sso/callback" exact component={ScreenCallBack} />
							<Route path="/sso/callback" exact component={ScreenCallBack} />
							<Route path="/" exact render={() => <Redirect to={DX.sme.createPath('')} />} />
							<Route path="/dev-portal/pre-order" exact component={PreOrder} />

							{renderRouter(authRoutersDev, DX.dev.role)}
							<DevRoute path={DX.dev.path} Component={DeveloperPortal} />
							{renderRouter(authRoutersSME, DX.sme.role)}
							<Route path={DX.sme.path} component={SMEPortal} />
							{renderRouter(authRoutersAdmin)}
							<AdminRoute path={DX.admin.path} Component={AdminPortal} />
							<Route path="*">
								<PageNotFound />
							</Route>
						</Switch>
					</Suspense>
				</ErrorBoundary>
			</ConfigProvider>
		</QueryClientProvider>
	);
}

export default App;
