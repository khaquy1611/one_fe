import { DX } from 'app/models';
import PersonProfile from './PersonProfile';
import CompanyProfile from './CompanyProfile';
import ChangePassword from './ChangePassword';
import EmployeeRouter from './Employee/EmployeeRouter';
import Subscription from './Subscription';
import Invoice from './Invoice';
import Ticket from './Ticket';
import Department from './Department';
import ComboDetail from './Subscription/Combo/ComboDetail';
import SubscriptionDetail from './Subscription/Pricing/SubscriptionDetail';
import EContract from './EContract';

const routers = ({ roles, permissions }) => [
	{
		path: '/profile',
		component: PersonProfile,
	},
	{
		path: '/company-profile',
		component: CompanyProfile,
	},
	{
		path: '/security-setting',
		component: ChangePassword,
	},
	{
		path: '/employee',
		component: EmployeeRouter,
		hide: !DX.canAccessFuture2('sme/list-sub-sme-account', permissions),
	},
	{
		path: '/subscription/:id/detail',
		component: SubscriptionDetail,
		hide: !DX.canAccessFuture2('sme/view-subscription', permissions),
	},
	{
		path: '/combo/:id/detail',
		component: ComboDetail,
		hide: !DX.canAccessFuture2('sme/view-subscription', permissions),
	},
	{
		path: '/subscription',
		component: Subscription,
		hide: !DX.canAccessFuture2('sme/list-subscription', permissions),
	},
	{
		path: '/invoice',
		component: Invoice,
		hide: !DX.canAccessFuture2('sme/list-invoice', permissions),
	},
	{
		path: '/ticket',
		component: Ticket,
		hide: !DX.canAccessFuture2('sme/list-ticket', permissions),
	},
	{
		path: '/department',
		component: Department,
		hide: !DX.canAccessFuture2('sme/list-department', permissions),
	},
	{
		path: '/econtract',
		component: EContract,
		hide: !DX.canAccessFuture2('sme/list-econtract', permissions),
	},
];

export default routers;
