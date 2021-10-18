import { useLng, useUser } from 'app/hooks';
import {
	BusinessIcon,
	DepartmentIcon,
	EcontractIcon,
	GroupEmployeeIcon,
	InvoiceIcon,
	LockIcon,
	PersonIcon,
	SubscribeIcon,
	SupportIcon,
} from 'app/icons';
import { DX } from 'app/models';
import React from 'react';
import SiderSme from './SiderSme';

const rootPath = `${DX.sme.path}/account`;

export default React.memo(() => {
	const { user } = useUser();
	const { tMenu } = useLng();
	const menus = ({ permissions }) => [
		{
			title: tMenu('opt_manage', { field: 'acc' }),
			subMenus: [
				{
					icon: <PersonIcon width="w-4" className="inline-block mr-2" />,
					to: '/profile',
					title: tMenu('profile'),
				},
				{
					icon: <BusinessIcon width="w-4" className="inline-block mr-2" />,
					to: '/company-profile',
					title: tMenu('businessProfile'),
				},
				{
					icon: <LockIcon width="w-4" className="inline-block mr-2" />,
					to: '/security-setting',
					title: tMenu('changePass'),
				},
			],
		},
		{
			title: tMenu('managementTool'),
			subMenus: [
				{
					icon: <DepartmentIcon width="w-4" className="inline-block mr-2" />,
					to: '/department',
					title: tMenu('opt_manage', { field: 'department' }),
					hide: !DX.canAccessFuture2('sme/list-department', permissions),
				},
				{
					icon: <GroupEmployeeIcon width="w-4" className="inline-block mr-2" />,
					to: '/employee',
					title: tMenu('opt_manage', { field: 'employee' }),
					hide: !DX.canAccessFuture2('sme/list-sub-sme-account', permissions),
				},
				{
					icon: <SubscribeIcon width="w-4" className="inline-block mr-2" />,
					to: '/subscription',
					title: tMenu('opt_manage', { field: 'subscriber' }),
					hide: !DX.canAccessFuture2('sme/list-subscription', permissions),
				},
				{
					icon: <EcontractIcon width="w-4" className="inline-block mr-2" />,
					to: '/econtract',
					title: tMenu('opt_manage', { field: 'econtract' }),
					hide: !DX.canAccessFuture2('sme/list-econtract', permissions),
				},
				{
					icon: <InvoiceIcon width="w-4" className="inline-block mr-2" />,
					to: '/invoice',
					title: tMenu('opt_manage', { field: 'bill' }),
					hide: !DX.canAccessFuture2('sme/list-invoice', permissions),
				},
				{
					icon: <SupportIcon width="w-4" className="inline-block mr-2" />,
					to: '/ticket',
					title: tMenu('opt_manage', { field: 'supTicket' }),
					hide: !DX.canAccessFuture2('sme/list-ticket', permissions),
				},
			],
		},
	];

	return <SiderSme menu={menus(user)} rootPath={rootPath} />;
});
