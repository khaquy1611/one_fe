import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import CouponList from './CouponList';
import CreateCoupon from './CreateCoupon';
import DetailCoupon from './DetailCoupon';
import EditCoupon from './EditCoupon';
import useUser from '../../../app/hooks/useUser';

export default function ListServiceRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<CouponList />
			</Route>
			{DX.canAccessFuture2('dev/create-coupon', user.permissions) && (
				<Route path={`${path}/create`} exact>
					<CreateCoupon />
				</Route>
			)}
			{DX.canAccessFuture2('dev/update-coupon-by-dev', user.permissions) && (
				<Route path={`${path}/:id/edit`} exact>
					<EditCoupon />
				</Route>
			)}
			{DX.canAccessFuture2('dev/view-coupon-by-dev', user.permissions) && (
				<Route path={`${path}/:id/detail`} exact>
					<DetailCoupon />
				</Route>
			)}
		</Switch>
	);
}
