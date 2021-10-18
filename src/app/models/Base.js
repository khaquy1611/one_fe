import superagent from 'superagent';
import store from 'store';
import { appActions } from 'actions';
import { v4 } from 'uuid';
import { isObject, omit } from 'opLodash';
import qs from 'querystring';
import { notification } from 'antd';
import Cookie from 'js-cookie';
import publicIp from 'public-ip';
// env variables
// const API_ROOT = 'https://business.dev.onesme.vn';
// const OAUTH_ROOT = 'https://business.dev.onesme.vn/auth-server';
const API_ROOT = 'https://staging.onesme.vn';
const OAUTH_ROOT = 'https://staging.onesme.vn/auth-server';
// const API_ROOT = process.env.REACT_APP_SERVER_API;
// const OAUTH_ROOT = process.env.REACT_APP_SERVER_OAUTH;
const USERNAME = process.env.REACT_APP_SERVER_USERNAME;
const PASSWORD = process.env.REACT_APP_SERVER_PASSWORD;
const CLIENT_ID = process.env.REACT_APP_SERVER_CLIENT_ID;

// token defined
let accessInfo;
let refreshToken;
export const parseAccess = () => {
	try {
		accessInfo = JSON.parse(Cookie.get('access'));
		refreshToken = Cookie.get('refresh_token');
	} catch {
		accessInfo = null;
	}
};
parseAccess();

export const getAccessToken = () => {
	parseAccess();
	return accessInfo?.access_token || '';
};

export const setVnptToken = (token, ttl) => {
	if (token) {
		Cookie.set('vnptToken', JSON.stringify(token), {
			expires: ttl / (24 * 60 * 60),
			// secure: true,
			sameSite: 'Lax',
		});
	} else {
		Cookie.remove('vnptToken');
	}
};

const getVnptToken = () => Cookie.get('vnptToken');

const setToken = (access) => {
	if (access) {
		Cookie.set('access', JSON.stringify(access), {
			expires: access.expires_in / (24 * 60 * 60),
			// secure: true,
			sameSite: 'Lax',
		});
		Cookie.set('refresh_token', access.refresh_token || refreshToken, {
			expires: 30,
			// secure: true,
			sameSite: 'Lax',
		});
		accessInfo = access;
		refreshToken = access.refresh_token || refreshToken;
	} else {
		Cookie.remove('access');
		Cookie.remove('refresh_token');
		accessInfo = null;
		refreshToken = null;
		localStorage.removeItem('user');
	}
};
export const clearToken = () => setToken(null);

// http inject, parse
const responseBody = (res) => res.body;
const tokenPlugin = (req) => {
	// if (!accessInfo) {
	parseAccess();
	// }
	if (accessInfo) {
		req.set('Authorization', `Bearer ${accessInfo.access_token}`);
	}
};

// catch error
const catchError = (e) => {
	let error = e.response?.body?.error;
	if (!isObject(error)) {
		error = e.response.body || e.response || {};
	}
	error.status = e.status;
	let statusACCOUNT = '';
	if (error.error_description === 'User is not activated') {
		statusACCOUNT = 'NOT_ACTIVE';
		store.dispatch(
			appActions.updateUser({
				statusACCOUNT,
			}),
		);
		error.dontCatchError = true;
	} else if (
		error.errorCode === 'error.user.disable' ||
		error.error_code === 'error.user.inactive' ||
		error.error_description === 'User is disabled'
	) {
		statusACCOUNT = 'INACTIVE';
		store.dispatch(
			appActions.updateUser({
				statusACCOUNT,
			}),
		);
		error.dontCatchError = true;
		setToken();
	} else if (
		e.status === 403 ||
		error.errorCode === 'error.ticket.user.not.be.supporter' ||
		error.errorCode === 'error.ticket.sme.not.be.owner' ||
		error.errorCode === 'error.department.user.not.own' ||
		(error.errorCode === 'error.no.have.access' && error.object === 'customer_ticket')
	) {
		statusACCOUNT = 'DENIED';
		store.dispatch(appActions.changeStatus(statusACCOUNT));
		error.dontCatchError = true;
	} else if (e.status === 401) {
		store.dispatch(appActions.updateUser({}));
		error.dontCatchError = true;
	} else if ((error.status === 400 && error.error === 'invalid_grant') || error.errorCode === 'error.data.format') {
		// do
	} else if (e.status === 502) {
		notification.error({
			message: 'Server đang bảo trì, vui lòng thử lại sau',
		});
	} else if (!error.field && !error.fields) {
		notification.error({
			message: 'Đã có lỗi xảy ra, vui lòng thử lại sau ít phút.',
		});
	}
	throw error;
};
// auth http
export const getTokenByUsernamePassword = async (data) => {
	if (data.access_token) {
		setToken(data);
		return data;
	}
	const res = await superagent
		.post(`${OAUTH_ROOT}/oauth/token`, {
			...data,
			grant_type: 'password',
			client_id: CLIENT_ID,

			scope: accessInfo?.scope || v4(),
			// TODO : remove when deploy , only use when team stc dev
			// scope: 'dzcdc',
		})
		.type('form')
		.auth(USERNAME, PASSWORD)
		.then(responseBody)
		.catch(catchError);
	setToken(res);
	return res;
};

export const getNewToken = async (err) => {
	try {
		if (!err || err.status !== 401) {
			return false;
		}
		parseAccess();
		const scope = accessInfo?.scope;
		if (!refreshToken || !scope) {
			throw new Error('no-token');
		}
		const res = await superagent
			.post(`${OAUTH_ROOT}/oauth/token`, {
				refresh_token: refreshToken,
				grant_type: 'refresh_token',
				scope,
			})
			.type('form')
			.auth(USERNAME, PASSWORD)
			.then(responseBody);
		setToken({
			scope,
			...res,
		});
		return true;
	} catch (e) {
		clearToken();
		return false;
	}
};

export const logoutSSO = async () => {
	const tokenVnpt = getVnptToken() || '';
	if (!tokenVnpt) {
		clearToken();
	}
	const SANDBOX = process.env.REACT_APP_SANDBOX_VNPT;
	const logOutUrl = `${SANDBOX}/oidc/logout?post_logout_redirect_uri=${
		window.location.origin
	}/sme-portal/login&id_token_hint=${tokenVnpt.replaceAll('"', '')}`;
	window.location.href = logOutUrl;
};

export const logout = async ({ deviceToken, user }) => {
	try {
		if (user.techId) {
			return logoutSSO();
		}
		return await superagent
			.del(`${OAUTH_ROOT}/token/remove`)
			.send({ deviceToken })
			.use(tokenPlugin)
			.catch(catchError);
	} catch (e) {
		if (process.env.NODE_ENV === 'development') {
			console.error(e);
		}
		return {};
	} finally {
		clearToken();
	}
};

const requests = {
	del: (url, body) =>
		superagent.del(url, body).retry(1, getNewToken).use(tokenPlugin).then(responseBody).catch(catchError),
	get: (url, query) =>
		superagent.get(url, query).retry(1, getNewToken).use(tokenPlugin).then(responseBody).catch(catchError),
	put: (url, body) =>
		superagent.put(url, body).retry(1, getNewToken).use(tokenPlugin).then(responseBody).catch(catchError),
	post: (url, body) =>
		superagent.post(url, body).retry(1, getNewToken).use(tokenPlugin).then(responseBody).catch(catchError),
	download: (url, query) =>
		superagent
			.get(url, query)
			.retry(1, getNewToken)
			.responseType('blob')
			.use(tokenPlugin)
			.then(responseBody)
			.catch(catchError),
};

class Base {
	constructor(apiPrefix, isOauth) {
		this.apiPrefix = `${isOauth ? OAUTH_ROOT : API_ROOT}/api${apiPrefix}`;
		this.apiRoot = `${isOauth ? OAUTH_ROOT : API_ROOT}`;
	}

	apiGetWithoutPrefix = (url, query = {}) => requests.get(`${this.apiRoot}${url}`, this.normalizeQuery(query));

	apiPutWithoutPrefix = (url, body) => requests.put(`${this.apiRoot}${url}`, body);

	apiPostWithoutPrefix = (url, body) => requests.post(`${this.apiRoot}${url}`, body);

	apiDeleteWithoutPrefix = (url, body) => requests.del(`${this.apiRoot}${url}`, body);

	apiGet = (url, query = {}) => requests.get(`${this.apiPrefix}${url}`, this.normalizeQuery(query));

	apiPost = (url, body) => requests.post(`${this.apiPrefix}${url}`, body);

	apiDownload = (url, query = {}) => requests.download(`${this.apiPrefix}${url}`, this.normalizeQuery(query));

	apiPut = (url, body) => requests.put(`${this.apiPrefix}${url}`, body);

	apiDelete = (url) => requests.del(`${this.apiPrefix}${url}`);

	getOneById = (id) => this.apiGet(`/${id}`);

	getAll = (query) => this.apiGet('', query);

	getAllPagination = async (query) => {
		const res = await this.getAll(query);
		return this.formatResPagination(res);
	};

	insert = (data) => this.apiPost('', data);

	updateById = ({ id, data }) => this.apiPut(`/${id}`, data);

	deleteById = (id) => this.apiDelete(`/${id}`);

	formatResPagination = (res) => {
		if (res?.data?.content) {
			// console.log("total ", res);
			return {
				content: res.data.content,
				total: res.data.totalElements,
				...omit(res, ['data']),
			};
		}
		if (res?.content) {
			// console.log("total ", res);
			return {
				content: res.content,
				total: res.totalElements,
			};
		}
		if (res?.length > 0) {
			return {
				content: res,
				total: res.length,
			};
		}
		return {
			content: [],
			total: 0,
		};
	};

	formatResPaginationCoupon = (res) => {
		if (res?.data?.content) {
			// console.log("total ", res);
			return {
				content: res.data.content,
				total: res.data.numberOfElements,
				...omit(res, ['data']),
			};
		}
		if (res?.content) {
			// console.log("total ", res);
			return {
				content: res.content,
				total: res.numberOfElements,
			};
		}
		if (res?.length > 0) {
			return {
				content: res,
				total: res.length,
			};
		}
		return {
			content: [],
			total: 0,
		};
	};

	normalizeQuery = (query) => {
		const formatQuery = {};
		Object.keys(query).forEach((key) => {
			if (query[key] !== null && typeof query[key] === 'string') {
				formatQuery[key] = query[key].trim();
			} else if (query[key] !== null && !Number.isNaN(query[key])) {
				formatQuery[key] = query[key];
			}
		});
		return formatQuery;
	};

	getClientIp = async () => {
		let ip;
		try {
			ip = await publicIp.v4();
		} catch (error) {
			console.log('error', error);
		}

		return ip;
	};
}

export default Base;
