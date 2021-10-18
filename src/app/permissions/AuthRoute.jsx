import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useNavigation, useQueryUrl, useUser } from 'app/hooks';
import { DX, SMESubscription } from 'app/models';
import { getAccessToken } from 'app/models/Base';

const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

async function redirectSaas(apiKey, url) {
	try {
		const getApiKey = await SMESubscription.getAll({
			apiKey,
		});
		const charac = url.indexOf('?') === -1 ? '?' : '&';
		if (getApiKey?.content.length > 0) {
			window.location.href = `${url}${charac}token=${getAccessToken()}`;
		} else {
			window.location.href = `${url}${charac}tokenError=${404}`;
		}

		return window.location.href;
	} catch (e) {
		window.location.href = `${url}?tokenError=${404}`;
		return window.location.href;
	}
}

const AuthContainer = ({ render, isSSO, role }) => {
	const { user } = useUser();
	const { gotoPageOriginAfterLogin, goto } = useNavigation();
	const query = useQueryUrl();

	const apiKey = query.get('apiKey');
	const url = query.get('callback');
	const urlDocs = query.get('callbackDocs');

	useEffect(() => {
		if (user.id && isSSO && apiKey && url) {
			if (!regex.test(url)) {
				goto(DX.sme.createPath('/page-not-found'));
			} else {
				redirectSaas(apiKey, url);
			}
		} else if (user.id && urlDocs) {
			window.location.href = `${process.env.REACT_APP_DOCS}${urlDocs}?token=${getAccessToken()}`;
		}

		const isSme = user.roles.some((el) => el === DX.sme.role);
		const isDev = user.roles.some((el) => el === DX.dev.role);

		if (
			user.id &&
			!(user.parentId === -1 && ((!isDev && role === DX.dev.role) || (!isSme && role === DX.sme.role)))
		) {
			gotoPageOriginAfterLogin();
		}
	}, [user.id, isSSO, apiKey, url]);
	if (user.loading) {
		return <span />;
	}
	return render();
};
const AuthRoute = ({ render, isSSO, role, permissions, ...router }) => (
	<Route {...router}>
		<AuthContainer isSSO={isSSO} render={render} role={role} permissions={permissions} />
	</Route>
);

export default AuthRoute;
