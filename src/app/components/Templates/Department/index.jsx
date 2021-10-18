import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import DepartmentDetail from './DepartmentDetail';
import DepartmentRegister from './DepartmentRegister';
import ListDepartment from './ListDepartment';
import useUser from '../../../hooks/useUser';

export default function DepartmentScreenRoute({ ...props }) {
	const { path } = useRouteMatch();
	const { user } = useUser();
	const { type = 'dev' } = props;
	const CAN_UPDATE =
		(type === 'admin' && DX.canAccessFuture2('admin/update-department', user.permissions)) ||
		(type === 'dev' && DX.canAccessFuture2('dev/update-department', user.permissions)) ||
		(type === 'sme' && DX.canAccessFuture2('sme/update-department', user.permissions));
	const CAN_VIEW =
		(type === 'admin' && DX.canAccessFuture2('admin/view-department', user.permissions)) ||
		(type === 'dev' && DX.canAccessFuture2('dev/view-department', user.permissions)) ||
		(type === 'sme' && DX.canAccessFuture2('sme/view-department', user.permissions));

	return (
		<Switch>
			<Route path={path} exact>
				<ListDepartment {...props} />
			</Route>
			{CAN_UPDATE && (
				<Route path={`${path}/register`} exact>
					<DepartmentRegister {...props} />
				</Route>
			)}
			{(CAN_UPDATE || CAN_VIEW) && (
				<Route path={`${path}/:id`} exact>
					<DepartmentDetail {...props} />
				</Route>
			)}
		</Switch>
	);
}
