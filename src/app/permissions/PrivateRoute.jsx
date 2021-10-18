import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
import { DX, Users } from 'app/models';
import { useUser } from 'app/hooks';
import { intersection } from 'opLodash';
import { createGlobalStyle } from 'styled-components';
import ConvertRoleForm from './ConvertRoleForm';

const NotAllowStyle = createGlobalStyle`
	body {
		overflow: hidden;
	}
`;

const PrivateRoute = ({ role, roles, notPrivate, Component, ...router }) => {
	const { user, clearUser, changeStatus } = useUser();
	const history = useHistory();
	const [visible, setVisible] = useState(true);

	const getMyPage = () => {
		if (DX.dev.canAccessPortal(user)) {
			return DX.dev.createPath('');
		}
		if (DX.admin.canAccessPortal(user)) {
			return DX.admin.createPath('');
		}
		if (DX.sme.canAccessPortal(user)) {
			return DX.sme.createPath('');
		}
		clearUser();
		return '';
	};

	const isSMEAdminOrDevAdmin = () => ({
		isSme: user.roles.some((el) => el === DX.sme.role),
		isDev: user.roles.some((el) => el === DX.dev.role),
	});

	// const onCancel = () => {
	// 	const myPage = getMyPage();
	// 	myPage && history.push(myPage);
	// };
	return (
		<Route
			{...router}
			render={({ location }) => {
				if (user.loading) {
					return <span />;
				}
				const access = intersection(user.roles, roles).length > 0;
				if (access) {
					return <Component />;
				}
				if (notPrivate && !user.id) {
					return <Component />;
				}
				if (user.id) {
					const { isSme, isDev } = isSMEAdminOrDevAdmin();
					if (user.parentId === -1 && ((isSme && role === DX.dev.role) || (isDev && role === DX.sme.role))) {
						return (
							<Redirect
								to={{
									pathname: DX.createPath(role)('/login'),
									state: { from: location },
								}}
							/>
						);
					}
					return (
						<div className="static">
							<NotAllowStyle />

							<div className="absolute z-2max h-full top-0 left-0 right-0 bg-white">
								<div className="w-full h-30 flex pt-12 justify-center ">
									<span>
										<span>Bạn chưa được phân quyền sử dụng hệ thống, </span>
										<button
											className="text-primary"
											onClick={() => {
												const myPage = getMyPage();
												myPage && history.push(myPage);
											}}
										>
											quay về trang của tôi
										</button>
									</span>
								</div>
							</div>
						</div>
					);
				}
				return (
					<Redirect
						to={{
							pathname: DX.createPath(role)('/login'),
							state: { from: location },
						}}
					/>
				);
			}}
		/>
	);
};

PrivateRoute.defaultProps = {
	notPrivate: false,
};

PrivateRoute.propTypes = {
	roles: PropTypes.array.isRequired,
	notPrivate: PropTypes.bool,
	role: PropTypes.number.isRequired,
	Component: PropTypes.any.isRequired,
};

const createPrivateRoute = (role, roles) => ({ ...rest }) => <PrivateRoute role={role} roles={roles} {...rest} />;
const DevRoute = createPrivateRoute(DX.dev.role, [
	// ...DX.sme.roles,
	...DX.dev.roles,
]);
const SMERoute = createPrivateRoute(DX.sme.role, [
	...DX.sme.roles,
	// ...DX.dev.roles,
]);
const AdminRoute = createPrivateRoute(DX.admin.role, DX.admin.roles);

export { DevRoute, SMERoute, AdminRoute };
