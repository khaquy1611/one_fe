import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { DX } from 'app/models';
import { useUser } from 'app/hooks';
import CouponList from './CouponList';
import CreateCoupon from './CreateCoupon';
import DetailCoupon from './DetailCoupon';
import EditCoupon from './EditCoupon';

export default function ListServiceRoute() {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Switch>
			<Route path={path} exact>
				<CouponList />
			</Route>
			{DX.canAccessFuture2('admin/create-coupon', user.permissions) && (
				<Route path={`${path}/create`} exact>
					<CreateCoupon />
				</Route>
			)}
			{DX.canAccessFuture2('admin/update-coupon-by-admin', user.permissions) && (
				<Route path={`${path}/:id/edit`} exact>
					<EditCoupon />
				</Route>
			)}
			{DX.canAccessFuture2('admin/view-coupon', user.permissions) && (
				<Route path={`${path}/:id/detail`} exact>
					<DetailCoupon />
				</Route>
			)}
		</Switch>
	);
}
