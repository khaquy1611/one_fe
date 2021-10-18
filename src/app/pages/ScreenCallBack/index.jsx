import React, { useEffect, useState } from 'react';
import superagent from 'superagent';
import { useHistory } from 'react-router-dom';
import { Spin } from 'antd';
import { Users, DX, RoleAdmin } from 'app/models';
import { clearToken, getTokenByUsernamePassword } from 'app/models/Base';
import { useMutation } from 'react-query';
import { useUser } from 'app/hooks';
import ConvertRoleForm from 'app/permissions/ConvertRoleForm';

import store from 'store';
import { appActions } from 'actions';
import { setVnptToken } from '../../models/Base';

const OAUTH_ROOT = process.env.REACT_APP_SERVER_OAUTH;

export default function ScreenCallBack() {
	const myStorage = window.localStorage;
	const strData = window.location.search.substring(6);
	const { updateUser, changeStatus, user } = useUser();
	const [visible, setVisible] = useState(false);
	const [newUserConvert, setNewUserConvert] = useState({});
	const history = useHistory();

	const handleLoginSuccess = async () => {
		try {
			const newUser = await Users.getMyProfile();
			if (DX.sme.canAccessPortal(newUser)) {
				updateUser(newUser);
			} else if (newUser.parentId === -1 && newUser.roles.some((el) => el === DX.dev.role)) {
				setVisible(true);
				setNewUserConvert(newUser);
			} else {
				changeStatus(Users.ACC_STATUS.DENIED_FROM_LOGIN);
				clearToken();
			}
		} catch (e) {
			// setError('app.loginScreen.loginFail');
		}
	};
	const mutation = useMutation(getTokenByUsernamePassword, {
		onSuccess: () => handleLoginSuccess(),
		onError: (e) => {
			if (!e.dontCatchError) {
				// setError('app.loginScreen.loginFail');
			}
		},
	});

	const handleLoginVnpt = async () => {
		let statusACCOUNT = '';
		await superagent
			.post(`${OAUTH_ROOT}/sso/callback`)
			.send({ code: strData })
			.end((err, res) => {
				if (res && res.body?.statusCodeValue === 401) {
					setVnptToken(res?.body?.body?.vnptidToken, res?.body?.body?.oneSmeToken?.expires_in);
					statusACCOUNT = 'INACTIVE';
					store.dispatch(
						appActions.updateUser({
							statusACCOUNT,
						}),
					);
					history.push('/sme-portal/login');
				} else if (res && res.body?.body?.oneSmeToken) {
					setVnptToken(res?.body?.body?.vnptidToken, res?.body?.body?.oneSmeToken?.expires_in);
					mutation.mutate(res?.body?.body?.oneSmeToken);
					// history.push('/sme-portal');
					window.location.href = '/sme-portal';
				} else if (res && res.body?.body?.oneSmeToken === undefined) {
					setVnptToken(res?.body?.body?.vnptidToken, res?.body?.body?.oneSmeToken?.expires_in);
					history.push({
						pathname: '/sme-portal/register',
						dataVnpt: { isLoginVnpt: true, body: res?.body?.body },
					});
				} else if (err) {
					setVnptToken(null);
					console.log('err', err);
				}
			});
	};

	useEffect(() => {
		handleLoginVnpt();
	}, []);

	return (
		<>
			<div className="text-center mt-10">
				<Spin tip="Vui lòng chờ..." />
			</div>
			<ConvertRoleForm visible={visible} setVisible={setVisible} newUserConvert={newUserConvert} />
		</>
	);
}
