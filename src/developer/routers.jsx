import { DX } from 'app/models';
import React from 'react';

// import Department from 'app/components/Templates/Department';
// import ListServiceRoute from './DevService/ListService';
// import SupportTicket from './SupportTicket';
import PageNotFound from 'app/pages/PageNotFound';
import AccountDetail from './AccountDev/AccountDetail';
// import Invoice from './Invoice';
import RegisterService from './DevService/RegisterService/RegisterService';
import ChangePasswordDev from './AccountDev/ChangePassswordDev';
// import CustomerSupport from './DashBoard/CustomerSupport/CustomerSupportService';
// import SubscriptionBilling from './DashBoard/SubscriptionBilling/SubBillSerivce';
// import AccountManageRoute from './AccountDev/AccountManagement/AccountManageRoute';
// import ServicePricingWrap from './DashBoard/ServicesPricing/ServicePricingWrap';
// import ListCombo from './Combo';
// import EvaluateRouter from './Evaluate/EvaluateRouter';
// import Coupon from './Coupon-Addon/Coupon';
// import Addon from './Coupon-Addon/Addon';
import HomePage from './HomePage';
// import Subscription from './Subscription/index';
// import SubscriptionRouter from './SubscriptionRouter/index';

const DepartmentDev = React.lazy(() => import('./Department'));
const ListServiceRoute = React.lazy(() => import('./DevService/ListService'));
const SupportTicket = React.lazy(() => import('./SupportTicket'));
const Invoice = React.lazy(() => import('./Invoice'));
// const CustomerSupport = React.lazy(() => import('./DashBoard/CustomerSupport/CustomerSupportService'));
// const SubscriptionBilling = React.lazy(() => import('./DashBoard/SubscriptionBilling/SubBillSerivce'));
const AccountManageRoute = React.lazy(() => import('./AccountDev/AccountManagement/AccountManageRoute'));
// const ServicePricingWrap = React.lazy(() => import('./DashBoard/ServicesPricing/ServicePricingWrap'));
const ListCombo = React.lazy(() => import('./Combo'));
const EvaluateRouter = React.lazy(() => import('./Evaluate/EvaluateRouter'));
const Coupon = React.lazy(() => import('./Coupon-Addon/Coupon'));
const Addon = React.lazy(() => import('./Coupon-Addon/Addon'));
const SubscriptionRouter = React.lazy(() => import('./SubscriptionRouter/index'));

const routers = ({ roles = [], permissions = [] }) => [
	{
		path: '/',
		exact: true,
		component: HomePage,
	},
	{
		path: '/invoice/list',
		component: Invoice,
		hide: !DX.canAccessFuture2('dev/list-invoice', permissions),
	},
	{
		path: '/service/list',
		component: ListServiceRoute,
		hide: !DX.canAccessFuture2('dev/list-service', permissions),
	},
	{
		path: '/service/register',
		component: RegisterService,
		hide: !DX.canAccessFuture2('dev/create-service', permissions),
	},
	{
		path: '/ticket/list',
		component: SupportTicket,
		hide: !DX.canAccessFuture2('dev/list-ticket', permissions),
	},
	{
		path: '/account/profile',
		component: AccountDetail,
	},
	{
		path: '/account/change-password',
		component: ChangePasswordDev,
	},
	{
		path: '/page-not-found',
		component: PageNotFound,
	},
	// {
	// 	path: '/report/ServicePricing',
	// 	component: ServicePricingWrap,
	// },
	// {
	// 	path: '/report/SubBill',
	// 	component: SubscriptionBilling,
	// },
	// {
	// 	path: '/report/Customer',
	// 	component: CustomerSupport,
	// },
	{
		path: '/account_manage',
		component: AccountManageRoute,
		hide: !DX.canAccessFuture2('dev/list-sub-dev-account', permissions),
	},
	{
		path: '/ticket/evaluate',
		component: EvaluateRouter,
		hide:
			!DX.canAccessFuture2('dev/list-evaluate', permissions) &&
			!DX.canAccessFuture2('dev/list-evaluate-combo', permissions),
	},
	{
		path: '/combo',
		component: ListCombo,
		hide: !DX.canAccessFuture2('dev/list-combo', permissions),
	},
	{
		path: '/promotion/coupon',
		component: Coupon,
		hide: !DX.canAccessFuture2('dev/list-coupon-by-dev', permissions),
	},

	// /*===============STC feature=========*/
	// {
	// 	path: '/promotion/coupon-set',
	// 	component: CouponSet,
	// 	// hide:  !DX.canAccessFuture2('dev/list-coupon-by-dev', permissions),
	// },

	{
		path: '/promotion/addon',
		component: Addon,
		hide: !DX.canAccessFuture2('dev/list-addon-by-dev', permissions),
	},
	{
		path: '/account/department',
		component: DepartmentDev,
		hide: !DX.canAccessFuture2('dev/list-department', permissions),
	},
	{
		path: '/subscription/:typeSub',
		component: SubscriptionRouter,
		hide: !DX.canAccessFuture2('dev/list-subscription', permissions),
	},
	{
		path: '/*',
		component: PageNotFound,
	},
];

export default routers;
