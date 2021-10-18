import React from 'react';

import { DX } from 'app/models';
// import AccountPageWrap from './DashBoard/AccountPage/AccountPageWrap';
// import CustomerSupport from './DashBoard/CustomerSupport/CustomerSupportService';
// import SubscriptionBilling from './DashBoard/SubscriptionBilling/SubBillSerivce';
// import ServicePricingWrap from './DashBoard/ServicesPricing/ServicePricingWrap';

import HomePage from './HomePage';
import AccountAdmin from './AccountAdmin';

import { SaasList } from './Saas';
import AdminDetailProfile from './AccountAdmin/components/AdminDetailProfile';
import BillingPageRoute from './BillingPage';
import TicketPageRoute from './TicketPage';
import PageNotFound from '../app/pages/PageNotFound';
import { WrapConfigManage, SystemConfiguration, EmailConfiguration } from './GeneralManagement';
import Coupon from './Coupon-Addon/Coupon';
import CategoryPageRoute from './CategoryManagement';
import UnitApisPageRoute from './CategoryManagement/UnitApis';
import Department from './AccountAdmin/components/DepartmentAdmin';
import SubscriptionAdmin from './Subscription/SubscriptionAdmin';
import CurrencyPage from './CategoryManagement/Currency';
import CategoryTax from './CategoryManagement/Tax';
import Addon from './Coupon-Addon/Addon';
import Combo from './Combo';
import RolePageRoute from './RolePage';
import EcontractPageRoute from './EContract';
import DashBoardRoute from './DashBoard/AdminReport';
import CouponSet from './Coupon-Set';

const routers = ({ roles = [], permissions = [] }) => [
	{
		path: '',
		exact: true,
		component: HomePage,
	},
	{
		path: '/account/admin',
		render: () => <AccountAdmin type={DX.admin.role} />,
		hide: !DX.canAccessFuture2('admin/list-admin-account', permissions),
	},
	{
		path: '/account/dev',
		render: () => <AccountAdmin type={DX.dev.role} />,
		hide: !DX.canAccessFuture2('admin/list-customer-account', permissions),
	},
	{
		path: '/account/sme',
		render: () => <AccountAdmin type={DX.sme.role} />,
		hide: !DX.canAccessFuture2('admin/list-customer-account', permissions),
	},
	{
		path: '/account/department',
		component: Department,
		hide: !DX.canAccessFuture2('admin/list-department', permissions),
	},
	{
		path: '/saas/list',
		component: SaasList,
	},
	{
		path: '/subscription/list',
		component: AccountAdmin,
	},
	{
		path: '/account/change-password/:key',
		component: AdminDetailProfile,
	},
	{
		path: '/account/profile/:key',
		component: AdminDetailProfile,
	},
	{
		path: '/billing/list',
		component: BillingPageRoute,
		hide: !DX.canAccessFuture2('admin/list-invoice', permissions),
	},
	// {
	// 	path: '/report/account',
	// 	component: AccountPageWrap,
	// },
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
		path: '/ticket/list',
		component: TicketPageRoute,
		hide: !DX.canAccessFuture2('admin/list-ticket', permissions),
	},
	{
		path: '/page-not-found',
		component: PageNotFound,
	},
	{
		path: '/general-management/config',
		component: WrapConfigManage,
		hide: !DX.canAccessFuture2('admin/view-notification-config', permissions),
	},
	// stc feature
	{
		path: '/promotion/coupon-set',
		component: CouponSet,
		// hide:  !DX.canAccessFuture2('dev/list-coupon-by-dev', permissions),
	},
	{
		path: '/general-management/email-config/:code',
		component: EmailConfiguration,
		hide: !DX.canAccessFuture2('admin/view-notification-config', permissions),
	},
	{
		path: '/general-management/email-config/:code',
		component: EmailConfiguration,
		hide: !DX.canAccessFuture2('admin/view-email-template', permissions),
	},
	{
		path: '/promotion/coupon',
		component: Coupon,
		hide: !DX.canAccessFuture2('admin/list-coupon', permissions),
	},
	{
		path: '/promotion/addon',
		component: Addon,
		hide: !DX.canAccessFuture2('admin/list-addon', permissions),
	},
	{
		path: '/combo',
		component: Combo,
		hide: !DX.canAccessFuture2('admin/list-combo', permissions),
	},
	{
		path: '/category/list',
		component: CategoryPageRoute,
		hide: !DX.canAccessFuture2('admin/list-service-category', permissions),
	},
	{
		path: '/category/tax',
		component: CategoryTax,
		hide: !DX.canAccessFuture2('admin/list-tax-category', permissions),
	},
	{
		path: '/category/unit',
		component: UnitApisPageRoute,
		hide: !DX.canAccessFuture2('admin/list-unit-category', permissions),
	},
	{
		path: '/category/currency',
		component: CurrencyPage,
		hide: !DX.canAccessFuture2('admin/list-currency-category', permissions),
	},
	{
		path: '/general-management/system-config',
		component: SystemConfiguration,
		hide: !DX.canAccessFuture2('admin/view-system-config', permissions),
	},
	{
		path: '/subscription/:typeSub',
		component: SubscriptionAdmin,
		hide: !DX.canAccessFuture2('admin/list-subscription', permissions),
	},
	{
		path: '/econtract/list',
		component: EcontractPageRoute,
		hide: !DX.canAccessFuture2('admin/list-econtract', permissions),
	},
	{
		path: '/category/roles',
		component: RolePageRoute,
	},
	{
		path: '/report',
		component: DashBoardRoute,
	},

	{
		path: '*',
		component: PageNotFound,
	},
];

export default routers;
