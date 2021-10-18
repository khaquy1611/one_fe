import React from 'react';

import { DX } from 'app/models';
import { SiderMenu } from 'app/components/Molecules';
import { useUser } from 'app/hooks';
import {
	AppstoreOutlined,
	CustomerServiceOutlined,
	DollarCircleOutlined,
	LineChartOutlined,
	UserOutlined,
	SolutionOutlined,
} from '@ant-design/icons';

const rootPath = DX.dev.path;

const menus = ({ roles, permissions }) => [
	{
		to: '/account',
		title: 'Tài khoản',
		Icon: UserOutlined,
		subMenus: [
			{ to: '/account/change-password', title: 'Đổi mật khẩu' },
			{ to: '/account/profile', title: 'Thông tin tài khoản' },
		],
	},
	{
		to: '/account_manage',
		title: 'Quản lý tài khoản',
		Icon: UserOutlined,
		subMenus: [
			{
				to: '/account/department',
				title: 'Danh sách bộ phận',
				hide: !DX.canAccessFuture2('dev/list-department', permissions),
			},
			{
				to: '/account_manage',
				title: 'Danh sách tài khoản',
				hide: !DX.canAccessFuture2('dev/list-sub-dev-account', permissions),
			},
		],
	},
	{
		to: '/service',
		title: 'Quản lý dịch vụ',
		Icon: AppstoreOutlined,
		subMenus: [
			{
				to: '/promotion/coupon',
				title: 'Chương trình khuyến mại',
				hide: !DX.canAccessFuture2('dev/list-coupon-by-dev', permissions),
			},

			{
				to: '/combo',
				title: 'Danh sách combo',
				hide: !DX.canAccessFuture2('dev/list-combo', permissions),
			},
			{
				to: '/service/list',
				title: 'Danh sách dịch vụ',
				hide: !DX.canAccessFuture2('dev/list-service', permissions),
			},

			{
				to: '/promotion/addon',
				title: 'Dịch vụ bổ sung',
				hide: !DX.canAccessFuture2('dev/list-addon-by-dev', permissions),
			},
		],
	},
	{
		to: '/subscription',
		title: 'Quản lý thuê bao',
		Icon: SolutionOutlined,
		subMenus: [
			{
				to: '/subscription/service',
				title: 'Danh sách đơn hàng',
				hide: !DX.canAccessFuture2('dev/list-subscription', permissions),
			},
		],
	},
	// {
	// 	to: '/service-pack',
	// 	title: 'Gói dịch vụ',
	// 	Icon: CreditCardOutlined,
	// 	subMenus: [{ to: '/service-pack/list', title: 'Danh sách gói dịch vụ' }],
	// },
	{
		to: '/invoice',
		title: 'Quản lý hoá đơn',
		Icon: DollarCircleOutlined,
		subMenus: [
			{
				to: '/invoice/list',
				title: 'Danh sách hoá đơn',
				hide: !DX.canAccessFuture2('dev/list-invoice', permissions),
			},
		],
	},
	{
		to: '/ticket',
		title: 'Quản lý HTKH',
		Icon: CustomerServiceOutlined,
		subMenus: [
			{
				to: '/ticket/list',
				title: 'Danh sách phiếu hỗ trợ',
				hide: !DX.canAccessFuture2('dev/list-ticket', permissions),
			},
			{
				to: '/ticket/evaluate',
				title: 'Đánh giá - Nhận xét',
				hide:
					!DX.canAccessFuture2('dev/list-evaluate', permissions) &&
					!DX.canAccessFuture2('dev/list-evaluate-combo', permissions),
			},
		],
	},
	// {
	// 	to: '/report',
	// 	title: 'Báo cáo - Thống kê',
	// 	Icon: LineChartOutlined,
	// 	subMenus: [
	// 		{
	// 			to: '/report/ServicePricing',
	// 			title: 'Service & Pricing',
	// 		},
	// 		{
	// 			to: '/report/SubBill',
	// 			title: 'Subscription & Billing',
	// 		},
	// 		{
	// 			to: '/report/Customer',
	// 			title: 'Customer Support',
	// 		},
	// 	],
	// },

	// {
	// 	to: '/combo-subscription',
	// 	title: 'Combo',
	// 	Icon: SolutionOutlined,
	// 	subMenus: [
	// 		{
	// 			to: '/combo-subscription',
	// 			title: 'Danh sách combo',
	// 		},
	// 	],
	// },
];

export default React.memo(() => {
	const { user } = useUser();
	return <SiderMenu menus={menus(user)} rootPath={rootPath} theme="dark" />;
});
