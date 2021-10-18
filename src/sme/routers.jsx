import React from 'react';
import { DX } from 'app/models';
import { Redirect } from 'react-router-dom';

// import ManageAccount from './Account/index.jsx';
// import { Billing, BillingCombo } from './Billing';
// import HomePage from './HomePage';
// import ServiceDetail from './HomePage/ServiceDetail';
// import MyService from './MyService';
// import CustomerTicket from './DashBoard/CustomerTicket/CustomerSupportService';
// import SubBillService from './DashBoard/SubscriptionBilling/SubBillService';

// import AllService from './HomePage/AllService';
// import PaymentCallbackPage from '../app/pages/PaymentCallbackPage/index';
// import PaymentErrorPage from '../app/pages/PaymentErrorPage/index';
// import PaymentSuccessPage from '../app/pages/PaymentSuccessPage/index';
// import { ServicePackForm, SubscriptionTrial } from './Billing/components';
// import ComboDetail from './HomePage/ComboDetail';
// import AllCombo from './HomePage/AllCombo';
// import ComboPaymentForm from './Billing/Combo/ComboPaymentForm';

import PaymentSuccessPage from 'app/pages/PaymentSuccessPage';
import PaymentCallbackPage from 'app/pages/PaymentCallbackPage';
import PaymentErrorPage from 'app/pages/PaymentErrorPage';
import HomePage from './HomePage';
import ServiceDetail from './HomePage/ServiceDetail';
import AllService from './HomePage/AllService';

const ManageAccount = React.lazy(() => import('./Account/Route'));
const Billing = React.lazy(() => import('./Billing/Billing'));
const BillingCombo = React.lazy(() => import('./Billing/Combo/BillingCombo'));
const MyService = React.lazy(() => import('./MyService'));
// const CustomerTicket = React.lazy(() => import('./DashBoard/CustomerTicket/CustomerSupportService'));
// const SubBillService = React.lazy(() => import('./DashBoard/SubscriptionBilling/SubBillService'));
const ServicePackForm = React.lazy(() => import('./Billing/components/ServicePackForm'));
const SubscriptionTrial = React.lazy(() => import('./Billing/components/SubscriptionTrial'));
const ComboTrial = React.lazy(() => import('./Billing/Combo/ComboTrial'));
const ComboDetail = React.lazy(() => import('./HomePage/ComboDetail'));
const AllCombo = React.lazy(() => import('./HomePage/AllCombo'));
const ComboPaymentForm = React.lazy(() => import('./Billing/Combo/ComboPaymentForm'));
const RedirectToHomePage = () => <Redirect to={DX.sme.path} />;

const routers = ({ roles, permissions }) => [
	{
		path: '/account',
		Component: ManageAccount,
	},
	{
		path: '/service/pay/:serviceId/:planId',
		Component: Billing,
		hide: !DX.canAccessFuture2('sme/register-subscription-combo', permissions),
	},
	{
		path: '/service/trial/:serviceId/:planId',
		Component: SubscriptionTrial,
		hide: !DX.canAccessFuture2('sme/register-trial-subscription-combo', permissions),
	},
	{
		path: '/combo/trial/:comboId/:comboPlanId',
		Component: ComboTrial,
		hide: !DX.canAccessFuture2('sme/register-trial-subscription-combo', permissions),
	},
	{
		path: '/service/change-pack/:serviceId/:planId',
		Component: ServicePackForm,
		hide: !DX.canAccessFuture2('sme/change-combo-pack', permissions),
	},
	{
		path: '/combo/pay/:serviceId/:planId',
		Component: BillingCombo,
		hide: !DX.canAccessFuture2('sme/register-subscription-combo', permissions),
	},
	{
		path: '/combo/change-pack/:serviceId/:planId',
		Component: ComboPaymentForm,
		hide: !DX.canAccessFuture2('sme/change-combo-pack', permissions),
	},
	// {
	// 	path: '/service/search-result',
	// 	Component: SearchResults,
	// 	notPrivate: true,
	// },
	{
		path: '/products',
		Component: AllService,
		notPrivate: true,
	},
	{
		path: '/combos',
		Component: AllCombo,
		notPrivate: true,
	},

	{
		path: '/service/:id',
		Component: ServiceDetail,
		notPrivate: true,
		exact: true,
	},
	{
		path: '/combo/:id',
		Component: ComboDetail,
		notPrivate: true,
		exact: true,
	},
	{
		path: '/my-service',
		Component: MyService,
	},
	{
		path: '/payment-callback',
		Component: PaymentCallbackPage,
		notPrivate: true,
	},
	{
		path: '/payment-error',
		Component: PaymentErrorPage,
		notPrivate: true,
	},
	{
		path: '/payment-success',
		Component: PaymentSuccessPage,
		notPrivate: true,
	},
	// {
	// 	path: '/report/customer-ticket',
	// 	Component: CustomerTicket,
	// },
	// {
	// 	path: '/report/subscription-billing',
	// 	Component: SubBillService,
	// },
	{
		path: '',
		exact: true,
		Component: HomePage,
		notPrivate: true,
	},
	{
		path: '*',
		Component: RedirectToHomePage,
		notPrivate: true,
	},
];

export default routers;
