import React from 'react';
import { Breadcrumb } from 'antd';
import { DX } from 'app/models';
import { Link } from 'react-router-dom';
import { useLng } from 'app/hooks';

const BREADCRUMBS = {
	[DX.admin.role]: [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'ADMIN_list',
			url: '',
		},
	],
	[DX.dev.role]: [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'DEV_list',
			url: '',
		},
	],
	[DX.sme.role]: [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'SME_list',
			url: '',
		},
	],
	'invoice-dev': [
		{
			name: 'bill',
			url: '',
		},
		{
			name: 'billList',
			url: '',
		},
	],
	listService: [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'serviceList',
			url: '',
		},
	],
	devInfo: [
		{
			name: 'acc',
			url: '',
		},
		{
			name: 'accInfo',
			url: '',
		},
	],
	changePass: [
		{
			name: 'acc',
			url: '',
		},
		{
			name: 'changePass',
			url: '',
		},
	],
	listServicePack: [
		{
			name: 'opt_manage/servicePackage',
			url: '',
		},
		{
			name: 'servicePackageList',
			url: '',
		},
	],
	listSaas: [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'serviceList',
			url: '',
		},
	],
	registerService: [
		{
			name: 'service',
			url: '',
		},
		{
			name: 'registerNewService',
			url: '',
		},
	],
	servicePack: [
		{
			name: 'servicePackage',
			url: '',
		},
		{
			name: 'servicePackageList',
			url: '',
		},
	],
	listBilling: [
		{
			name: 'manageBill',
			url: '',
		},
		{
			name: 'billList',
			url: '',
		},
	],
	listEContract: [
		{
			name: 'opt_manage/subscriber',
			url: '',
		},
		{
			name: 'econtractList',
			url: '',
		},
	],
	detailEcontract: [
		{
			name: 'opt_manage/subscriber',
			url: '',
		},
		{
			name: 'econtractDetail',
			url: '',
		},
	],

	listTicket: [
		{
			isName: true,
			name: 'Quản lý HTKH',
			url: '',
		},
		{
			name: 'supTicketList',
			url: '',
		},
	],
	devInfoEdit: [
		{
			name: 'acc',
			url: '',
		},
		{
			name: 'accInfo',
			url: '',
		},
	],
	listTicketDev: [
		{
			isName: true,
			name: 'Quản lý HTKH',
			url: '',
		},
		{
			name: 'supTicketList',
			url: '',
		},
	],
	AccountDevManage: [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'accList',
			url: '',
		},
	],
	SubBill: [
		{
			name: 'report',
			url: '',
		},
		{
			name: 'acc',
			url: '',
		},
	],
	Combo: [
		{
			name: 'combo',
			url: '',
		},
		{
			name: 'comboList',
			url: '',
		},
	],
	RegisterCombo: [
		{
			name: 'combo',
			url: '',
		},
		{
			name: 'opt_create/department',
			url: '',
		},
	],
	generalManage: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'notiConfiguration',
			url: '',
		},
	],
	systemConfig: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'systemConfiguration',
			url: '',
		},
	],
	emailConfig: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'notiConfiguration',
			url: DX.admin.createPath('/general-management/config'),
		},
		{
			name: 'emailConfiguration',
			url: '',
		},
	],
	CouponList: [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'prom',
			url: '',
		},
	],
	commentRating: [
		{
			isName: true,
			name: 'Quản lý HTKH',
			url: '',
		},
		{
			name: 'rating_review',
			url: '',
		},
	],
	addonList: [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'extraService',
			url: '',
		},
	],
	CategoryList: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'serviceCategory',
			url: '',
		},
	],
	unitApisList: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'unitList',
			url: '',
		},
	],

	DepartmentList: [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'departmentList',
			url: '',
		},
	],
	CategoryTax: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'taxCategory',
			url: '',
		},
	],
	CategoryCurrency: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'currencyCategory',
			url: '',
		},
	],
	SubscriptionList: [
		{
			name: 'opt_manage/subscriber',
			url: '',
		},
		{
			name: 'subscriberListDev',
			url: '',
		},
	],
	listRoleAdmin: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'ADMIN_roles',
			url: '',
		},
	],
	listRoleDev: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'DEV_roles',
			url: '',
		},
	],
	listRoleSme: [
		{
			name: 'opt_manage/configuration',
			url: '',
		},
		{
			name: 'SME_roles',
			url: '',
		},
	],
};
export default function UrlBreadcrumb({ breadcrumbs, type }) {
	const { tMenu } = useLng();
	const items = breadcrumbs || BREADCRUMBS[type] || [];
	function getNameMenu(item) {
		const [key, field] = item.name?.split('/');
		return tMenu(key, { field });
	}
	function render(item) {
		if (item.url) {
			return <Link to={item.url}>{!item.isName ? getNameMenu(item) : item.name}</Link>;
		}
		return !item.isName ? getNameMenu(item) : item.name;
	}

	return (
		<>
			<Breadcrumb className="truncate">
				{items !== null
					? items.map((e, index) => <Breadcrumb.Item key={`${index + 1}`}>{render(e)}</Breadcrumb.Item>)
					: ''}
			</Breadcrumb>
		</>
	);
}
