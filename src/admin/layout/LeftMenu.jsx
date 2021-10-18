import React from 'react';
import { DX } from 'app/models';
import { UserIcon, TicketIcon, BillingIcon, SettingIcon, CategoryIcon } from 'app/icons';
import { SiderMenu } from 'app/components/Molecules';
import { useUser } from 'app/hooks';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons';

const rootPath = DX.admin.path;

const menus = ({ roles, permissions }) => [
	{
		to: '/account',
		title: 'Quản lý tài khoản',
		Icon: UserOutlined,
		subMenus: [
			{
				to: '/account/department',
				title: 'Danh sách bộ phận',
				hide: !DX.canAccessFuture2('admin/list-department', permissions),
			},
			{
				to: '/account/admin',
				title: 'Danh sách quản trị viên',
				hide: !DX.canAccessFuture2('admin/list-admin-account', permissions),
			},
			{
				to: '/account/dev',
				title: 'Danh sách nhà cung cấp',
				hide: !DX.canAccessFuture2('admin/list-customer-account', permissions),
			},
			{
				to: '/account/sme',
				title: 'Danh sách khách hàng',
				hide: !DX.canAccessFuture2('admin/list-customer-account', permissions),
			},
			{
				to: '/account/profile/info',
				title: 'Thông tin tài khoản',
			},
		],
	},

	{
		to: '/permission',
		title: 'Quản lý Phân Quyền',
		Icon: UserOutlined,
		subMenus: [
			{
				to: '/permission/admin',
				title: 'Phân quyền quản trị viên',
				hide: !DX.canAccessFuture2('admin/list-admin-role', permissions),
			},
			{
				to: '/permission/develop',
				title: 'Phân quyền nhà cung cấp',
				hide: !DX.canAccessFuture2('admin/list-dev-role', permissions),
			},
			{
				to: '/permission/sme',
				title: 'Phân quyền khách hàng',
				hide: !DX.canAccessFuture2('admin/list-sme-role', permissions),
			},
		],
	},
	{
		to: '/saas',
		title: 'Quản lý dịch vụ',
		Icon: AppstoreOutlined,
		subMenus: [
			{
				to: '/promotion/coupon',
				title: 'Chương trình khuyến mại',
				hide: !DX.canAccessFuture2('admin/list-coupon', permissions),
			},
			// add route coupon-set
			{
				to: '/promotion/coupon-set',
				title: 'Mã khuyến mại',
				// hide: !DX.canAccessFuture2('dev/list-coupon-by-dev', permissions),
			},
			{
				to: '/combo',
				title: 'Danh sách Combo',
				hide: !DX.canAccessFuture2('admin/list-combo', permissions),
			},
			{
				to: '/saas/list',
				title: 'Danh sách dịch vụ',
				hide: !DX.canAccessFuture2('admin/list-service', permissions),
			},
			{
				to: '/promotion/addon',
				title: 'Dịch vụ bổ sung',
				hide: !DX.canAccessFuture2('admin/list-addon', permissions),
			},
		],
	},
	{
		to: '/subscription',
		title: 'Quản lý thuê bao',
		Icon: UserOutlined,
		subMenus: [
			{
				to: '/subscription/service',
				title: 'Danh sách đơn hàng',
				hide: !DX.canAccessFuture2('admin/list-subscription', permissions),
			},
			{
				to: '/econtract/list',
				title: 'Danh sách hợp đồng',
				hide: !DX.canAccessFuture2('admin/list-econtract', permissions),
			},
		],
	},
	// {
	// 	to: '/pricing',
	// 	title: 'Quản lý Gói dịch vụ',
	// 	Icon: PricingIcon,
	// 	subMenus: [{ to: '/pricing/list', title: 'Danh sách Gói dịch vụ' }],
	// },
	{
		to: '/billing',
		title: 'Quản lý hóa đơn',
		Icon: BillingIcon,
		subMenus: [
			{
				to: '/billing/list',
				title: 'Danh sách hóa đơn',
				hide: !DX.canAccessFuture2('admin/list-invoice', permissions),
			},
		],
	},
	{
		to: '/ticket',
		title: 'Quản lý HTKH',
		Icon: TicketIcon,
		subMenus: [
			{
				to: '/ticket/list',
				title: 'Danh sách phiếu hỗ trợ',
				hide: !DX.canAccessFuture2('admin/list-ticket', permissions),
			},
		],
	},
	// {
	// 	to: "/contract",
	// 	title: "app.categories.contract",
	// 	Icon: ContractIcon,
	// 	subMenus: [
	// 		{ to: "/contract/list", title: "app.categories.contractList" },
	// 	],
	// },
	{
		to: '/report',
		title: 'Báo cáo - Thống kê',
		Icon: UserIcon,
		subMenus: [
			// {
			// 	to: '/report/ServicePricing',
			// 	title: 'app.categories.reportServicePricing',
			// },
			// {
			// 	to: '/report/Customer',
			// 	title: 'app.categories.reportCustomer',
			// },
			// {
			// 	to: '/report/account',
			// 	title: 'app.categories.reportAccount',
			// },
			// {
			// 	to: '/report/SubBill',
			// 	title: 'app.categories.reportSubBill',
			// },
			// {
			// 	to: '/report/service-summary',
			// 	title: 'BC tổng hợp dịch vụ',
			// },
			{
				to: '/report/subscriber-detail',
				title: 'BC chi tiết thuê bao',
				hide: !DX.canAccessFuture2('admin/report-subscription-detail', permissions),
			},
			// {
			// 	to: '/report/revenue-summary',
			// 	title: 'BC tổng hợp doanh thu',
			// },
			// {
			// 	to: '/report/promotion-summary',
			// 	title: 'BC tổng hợp khuyến mại',
			// },
			// {
			// 	to: '/report/promotion-detail',
			// 	title: 'BC chi tiết khuyến mại',
			// },
			// {
			// 	to: '/report/trial-summary',
			// 	title: 'BC tổng hợp dùng thử',
			// },
			// {
			// 	to: '/report/user-summary',
			// 	title: 'BC tổng hợp user',
			// },
		],
	},
	{
		to: '/general-management',
		title: 'Quản lý cấu hình',
		Icon: SettingIcon,
		subMenus: [
			{
				to: '/general-management/config',
				title: 'Cấu hình thông báo',
				hide: !DX.canAccessFuture2('admin/view-notification-config', permissions),
			},
			{
				to: '/general-management/system-config',
				title: 'Cấu hình hệ thống',
				hide: !DX.canAccessFuture2('admin/view-system-config', permissions),
			},
			{
				to: '/category/list',
				title: 'app.categories.categoryList',
				hide: !DX.canAccessFuture2('admin/list-service-category', permissions),
			},
			{
				to: '/category/tax',
				title: 'app.categories.categoryTax',
				hide: !DX.canAccessFuture2('admin/list-tax-category', permissions),
			},

			{
				to: '/category/currency',
				title: 'app.categories.categoryCurrency',
				hide: !DX.canAccessFuture2('admin/list-currency-category', permissions),
			},
			// {
			// 	to: '/category/roles/admin',
			// 	title: 'Phân quyền quản trị viên',
			// 	hide: !DX.canAccessFuture2('admin/list-admin-role', permissions),
			// },
			// {
			// 	to: '/category/roles/develop',
			// 	title: 'Phân quyền nhà cung cấp',
			// 	hide: !DX.canAccessFuture2('admin/list-dev-role', permissions),
			// },
			// {
			// 	to: '/category/roles/sme',
			// 	title: 'Phân quyền khách hàng',
			// 	hide: !DX.canAccessFuture2('admin/list-sme-role', permissions),
			// },
			{
				to: '/category/unit',
				title: 'app.categories.unit',
				hide: !DX.canAccessFuture2('admin/list-unit-category', permissions),
			},
		],
	},
];

export default React.memo(() => {
	const { user } = useUser();
	return <SiderMenu menus={menus(user)} rootPath={rootPath} />;
});
