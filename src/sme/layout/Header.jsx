import { appActions, appSelects } from 'actions';
import { Avatar, Button, Dropdown, Menu } from 'antd';
import { WrapNotification } from 'app/components/Templates';
import { onClickDocs } from 'app/helpers';
import { useLng, useUser } from 'app/hooks';
import {
	BusinessIcon,
	// VietNamFlag,
	// EnglishFlag,
	CategoryMbIcon,
	CovertIcon,
	DepartmentIcon,
	GroupEmployeeIcon,
	InvoiceIcon,
	LockIcon,
	LogoSME,
	LogoutIcon,
	PersonIcon,
	SubscribeIcon,
	SupportIcon,
	QuestionIcon,
	EcontractIcon,
} from 'app/icons';
import { DX, Users } from 'app/models';
import ConvertRoleForm from 'app/permissions/ConvertRoleForm';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { ModalConfirm } from '../components';
import CategoryMenu from './components/CategoryMenu';
import DrawerMenu from './components/DrawerMenu';
import useOverY from './components/useOverY';
import DXMenu from './css/DXMenu';
import IconMenu from './css/IconMenu';

const { Item } = Menu;

export default function Header() {
	// const dispatch = useDispatch();
	const { user, clearUser, tokenNotify } = useUser();
	// const lng = useSelector(appSelects.selectLanguage);
	const { pathname } = useLocation();
	const keySelected = `/${pathname.split('/')[2] || ''}`;
	const [visibleModal, setVisibleModal] = useState(false);
	const [visible, setVisible] = useState(false);
	const history = useHistory();
	const [visibleCategory, setVisibleCategory] = useState(false);
	const { tMessage, tButton, tMenu } = useLng();
	const [overHeader] = useOverY();
	const { isMobile, isTablet } = useSelector(appSelects.selectSetting);

	const isTechId = user?.techId;

	const dataMenuManagement = ({ roles, permissions }) => [
		{
			icon: <DepartmentIcon width="w-4" className="inline-block mr-2" />,
			to: 'department',
			title: tMenu('opt_manage', { field: 'department' }),
			hide: !DX.canAccessFuture2('sme/list-department', permissions),
		},
		{
			icon: <GroupEmployeeIcon width="w-4" className="inline-block mr-2" />,
			to: 'employee',
			title: tMenu('opt_manage', { field: 'employee' }),
			hide: !DX.canAccessFuture2('sme/list-sub-sme-account', permissions),
		},
		{
			icon: <SubscribeIcon width="w-4" className="inline-block mr-2" />,
			to: 'subscription',
			title: tMenu('opt_manage', { field: 'subscriber' }),
			hide: !DX.canAccessFuture2('sme/list-subscription', permissions),
		},
		{
			icon: <EcontractIcon width="w-4" className="inline-block mr-2" />,
			to: 'econtract',
			title: tMenu('opt_manage', { field: 'econtract' }),
			hide: !DX.canAccessFuture2('sme/list-econtract', permissions),
		},
		{
			icon: <InvoiceIcon width="w-4" className="inline-block mr-2" />,
			to: 'invoice',
			title: tMenu('opt_manage', { field: 'bill' }),
			hide: !DX.canAccessFuture2('sme/list-invoice', permissions),
		},
		{
			icon: <SupportIcon width="w-4" className="inline-block mr-2" />,
			to: 'ticket',
			title: tMenu('opt_manage', { field: 'supTicket' }),
			hide: !DX.canAccessFuture2('sme/list-ticket', permissions),
		},
	];
	const dataMenuAccount = () => [
		{
			icon: <PersonIcon width="w-4" className="inline-block mr-2" />,
			to: DX.sme.createPath(`/account/profile`),
			title: tMenu('profile'),
		},
		{
			icon: <BusinessIcon width="w-4" className="inline-block mr-2" />,
			to: DX.sme.createPath('/account/company-profile'),
			title: tMenu('businessProfile'),
		},
		{
			icon: <LockIcon width="w-4" className="inline-block mr-2" />,
			to: DX.sme.createPath('/account/security-setting'),
			title: tMenu('securitySetting'),
		},
	];

	const dataMenuReport = () => [
		{
			icon: <PersonIcon width="w-4" className="inline-block mr-2" />,
			to: 'report/subscription-billing',
			title: tMenu('bill_subscriberReport'),
		},
		{
			icon: <SupportIcon width="w-4" className="inline-block mr-2" />,
			to: 'report/customer-ticket',
			title: tMenu('supTicketReport'),
		},
	];

	// const handleChangeLanguage = (newLng) => {
	// 	dispatch(appActions.changeLanguage(newLng));
	// };

	const mutation = useMutation(Users.logout, {
		onSuccess: () => {
			setVisibleModal(false);
			clearUser();
		},
	});

	const logoutClick = () => setVisibleModal(true);

	const isSMEAdminOrDevAdmin = () => ({
		isSme: user.roles.some((el) => el === DX.sme.role),
		isDev: user.roles.some((el) => el === DX.dev.role),
	});

	const handleNextPortal = () => {
		const { isSme, isDev } = isSMEAdminOrDevAdmin();
		if (user.parentId === -1 && isSme && !isDev) {
			setVisible(true);
		} else {
			window.location.href = '/dev-portal';
		}
	};

	const menuManagement = (
		<Menu className="p-2 top-5 ">
			{dataMenuManagement(user)
				.filter((el) => !el.hide)
				.map((item) => (
					<Item key={item.to} className="py-2 font-semibold">
						<Link
							title={item.title}
							to={DX.sme.createPath(`/account/${item.to}`)}
							className="font-semibold text-black"
						>
							{item.icon}
							{item.title}
						</Link>
					</Item>
				))}
		</Menu>
	);
	const menuAccount = (
		<Menu className="p-2" selectedKeys={[pathname]}>
			{dataMenuAccount(user)
				.filter((el) => !el.hide)
				.map((item) => {
					if (isTechId && item.to === '/sme-portal/account/security-setting') {
						return null;
					}
					return (
						<Item key={item.to} className="py-2">
							<Link title={item.title} to={item.to} className="text-black">
								{item.icon}
								{item.title}
							</Link>
						</Item>
					);
				})}
			{/* {((user.parentId === -1 && DX.canAccessFuture('sme/show_convert_role', user.roles)) ||
				DX.dev.canAccessPortal(user)) && (
				<Item key="changeToDev" className="py-2 text-base text-black" onClick={() => handleNextPortal()}>
					<CovertIcon width="w-4" className="inline-block mr-2" />
					{tMenu('redirectDEV')}
				</Item>
			)} */}

			<Item key="to-doc" className="py-2 text-base text-black" onClick={() => onClickDocs('sme')}>
				<QuestionIcon width="w-4" className="inline-block mr-2" />
				{tMenu('help')}
			</Item>

			<Item key="logout" className="py-2 text-base text-black" onClick={logoutClick}>
				<LogoutIcon width="w-4" className="inline-block mr-2 " />
				{tMenu('logout')}
			</Item>
		</Menu>
	);

	const menuReport = (
		<Menu className="p-2 top-5">
			{dataMenuReport(user)
				.filter((el) => !el.hide)
				.map((item) => (
					<Item key={item.to} className="py-2">
						<Link
							title={item.title}
							to={DX.sme.createPath(`/${item.to}`)}
							className="font-semibold text-black "
						>
							{item.icon}
							{item.title}
						</Link>
					</Item>
				))}
		</Menu>
	);

	// const MenuMultiLng = () => (
	// 	<Menu className=" p-2" selectedKeys={[lng]}>
	// 		<Item key="vi-VN" onClick={() => handleChangeLanguage('vi-VN')}>
	// 			{tMenu('vietnamese')}
	// 		</Item>
	// 		<Item key="en-EN" onClick={() => handleChangeLanguage('en-EN')}>
	// 			{tMenu('english')}
	// 		</Item>
	// 	</Menu>
	// );
	const { categoryList } = useSelector(appSelects.selectCategoryState);
	if (isTablet || isMobile) {
		const noUser = !user || !user.id;
		return (
			<header
				id="headerId"
				className={clsx(
					'py-3 fixed w-full z-max bg-main  h-auto ',
					(visibleCategory || overHeader) && 'shadow-header',
				)}
				onMouseLeave={() => setVisibleCategory(false)}
			>
				<div className="flex items-center relative text-center w-full justify-between container mx-auto">
					<button
						className="border-none bg-transparent p-0 cursor-pointer leading-none"
						onClick={() => setVisibleCategory(true)}
					>
						<CategoryMbIcon />
					</button>
					<Link title="logon SME" to={DX.sme.createPath('')} className="cursor-pointer ">
						<LogoSME width="w-auto" />
					</Link>
					<div>{user && !!user.id && <WrapNotification />}</div>
				</div>
				<DrawerMenu
					visible={visibleCategory}
					onClose={() => setVisibleCategory(false)}
					noUser={noUser}
					menus={[
						{
							name: 'Dịch vụ của tôi',
							onClick: () => history.push(DX.sme.createPath('/my-service')),
							hide: noUser,
						},

						{
							name: 'Tài khoản',
							children: [
								{
									to: DX.sme.createPath(`/account/profile`),
									onClick: () => history.push(DX.sme.createPath('/account/profile')),
									name: tMenu('profile'),
								},
								{
									to: DX.sme.createPath('/account/company-profile'),
									name: tMenu('businessProfile'),
									onClick: () => history.push(DX.sme.createPath('/account/company-profile')),
								},
								{
									name: tMenu('redirectDEV'),
									onClick: () => handleNextPortal(),
								},
								{
									to: DX.sme.createPath('/account/security-setting'),
									onClick: () => history.push(DX.sme.createPath('/account/security-setting')),
									name: tMenu('securitySetting'),
								},
								{
									name: tMenu('logout'),
									onClick: () => logoutClick(),
								},
							],
							hide: noUser,
						},
						{
							name: 'Quản lý',
							children: [
								{
									to: 'department',
									onClick: () => history.push(DX.sme.createPath('/account/department')),
									name: tMenu('opt_manage', { field: 'department' }),
									hide: !DX.canAccessFuture2('sme/list-department', user.permissions),
								},
								{
									to: 'employee',
									name: tMenu('opt_manage', { field: 'employeeAcc' }),
									onClick: () => history.push(DX.sme.createPath('/account/employee')),
								},
								{
									to: 'subscription',
									onClick: () => history.push(DX.sme.createPath('/account/subscription')),
									name: tMenu('opt_manage', { field: 'subscriber' }),
									hide: !DX.canAccessFuture2('sme/list-subscription', user.permissions),
								},
								{
									to: 'econtract',
									onClick: () => history.push(DX.sme.createPath('/account/econtract')),
									name: tMenu('opt_manage', { field: 'econtract' }),
									hide: !DX.canAccessFuture2('sme/list-econtract', user.permissions),
								},

								{
									to: 'invoice',
									onClick: () => history.push(DX.sme.createPath('/account/invoice')),
									name: tMenu('opt_manage', { field: 'bill' }),
									hide: !DX.canAccessFuture2('sme/list-invoice', user.permissions),
								},
								{
									to: 'ticket',
									onClick: () => history.push(DX.sme.createPath('/account/ticket')),
									hide: !DX.canAccessFuture2('sme/list-ticket', user.permissions),
								},
							],
							hide: noUser,
						},
						// {
						// 	name: 'Báo cáo',
						// 	children: [
						// 		{
						// 			onClick: () => history.push(DX.sme.createPath('/report/subscription-billing')),
						// 			name: tMenu('bill_subscriberReport'),
						// 		},
						// 		{
						// 			onClick: () => history.push(DX.sme.createPath('/report/customer-ticket')),
						// 			name: tMenu('supTicketReport'),
						// 		},
						// 	],
						// 	hide: noUser,
						// },
						{
							name: 'Danh mục',
							children: categoryList.map((c) => ({
								...c,
								onClick: () => history.push(DX.sme.createPath(`/products?category=${c.id}`)),
							})),
						},
						{
							name: (
								<a href="https://onesme.vn/blog/" target="blank" className="text-black">
									Tin tức - Khuyến mại
								</a>
							),
							key: 'blog',
							onClick: () => {},
						},
						// {
						// 	name: (
						// 		<a href="http://vnpt.dev.masoffer.tech" target="blank" className="text-black">
						// 			Kiếm tiền online
						// 		</a>
						// 	),
						// 	key: 'masoffer',
						// 	onClick: () => {},
						// },
						{
							name: (
								<span
									onClickCapture={() => onClickDocs('sme')}
									className=" font-medium text-black"
									// style={{ fontSize: 16 }}
								>
									<span>Hỗ trợ</span>
								</span>
							),
							key: 'support',
							onClick: () => {},
						},
					]}
				/>
				<ModalConfirm
					showModal={visibleModal}
					setShowModal={setVisibleModal}
					mutation={() => mutation.mutateAsync({ deviceToken: tokenNotify, user })}
					isLoading={mutation.isLoading}
					mainTitle={tMessage('logout')}
					subTitle={tMessage('wantToLogout')}
				/>
			</header>
		);
	}
	return (
		<header
			id="headerId"
			className={clsx(
				'pt-6 fixed w-full z-max bg-main  h-auto',
				(visibleCategory || overHeader) && 'shadow-header',
			)}
			onMouseLeave={() => setVisibleCategory(false)}
		>
			<div className="flex container mx-auto mb-3">
				<div className="flex-none">
					<Link title="logoSME" to={DX.sme.createPath('')} className="cursor-pointer">
						<LogoSME width="w-auto" />
					</Link>
				</div>
				<div className="flex-1 flex justify-end items-center relative">
					{/* <Dropdown
							overlay={MenuMultiLng}
							className="cursor-pointer"
							placement="bottomRight"
							getPopupContainer={() => document.getElementById('headerId')}
						>
							<Space>
								{lng === 'vi-VN' ? (
									<VietNamFlag width="w-auto" className="animate-flower" />
								) : (
									<EnglishFlag width="w-auto" className="animate-flower" />
								)}
							</Space>
						</Dropdown> */}
					{user && !!user.id && <WrapNotification className="ml-8" />}
					{user && !!user.id && (
						<>
							{/* <span className="text-black mr-4">{user?.name}</span> */}
							<Dropdown
								overlay={menuAccount}
								className="cursor-pointer ml-4"
								placement="bottomRight"
								getPopupContainer={() => document.getElementById('headerId')}
							>
								<Avatar src={user.avatar} className="bg-primary">
									U
								</Avatar>
							</Dropdown>
						</>
					)}
					{(!user || !user.id) && (
						<>
							<Link title="Đăng nhập" to={DX.sme.createPath('/login')}>
								<span type="text" className=" text-primary  font-semibold ml-8">
									{tButton('login')}
								</span>
							</Link>
							<Link title="Đăng ký" to={DX.sme.createPath('/register')}>
								<span type="text" className="text-primary  font-semibold ml-8">
									{tButton('register')}
								</span>
							</Link>
						</>
					)}
				</div>
			</div>
			<div className="flex container mx-auto">
				<div className=" flex-none flex items-center">
					<button
						className="border-none bg-transparent px-0 cursor-pointer w-10"
						onClick={() => setVisibleCategory(!visibleCategory)}
						onMouseEnter={() => !visibleCategory && setVisibleCategory(true)}
					>
						<IconMenu className={visibleCategory && 'active'}>
							<span />
							<span />
							<span />
						</IconMenu>
					</button>

					<Link
						title="Tất cả danh mục"
						to={DX.sme.createPath('/products')}
						className="text-black"
						onMouseEnter={() => !visibleCategory && setVisibleCategory(true)}
					>
						{tMenu('allCategory')}
					</Link>
				</div>

				<div className="flex-1 flex justify-end">
					<DXMenu className="flex gap-8">
						<div className={clsx('text-black dx-menu', keySelected === '/' && 'dx-menu-active')}>
							<Link title="Trang chủ" to={DX.sme.createPath('')} className="font-semibold text-black">
								{tMenu('homePage')}
							</Link>
						</div>
						{user && !!user.id && (
							<>
								<div
									className={clsx(
										'text-black dx-menu',
										keySelected === '/my-service' && 'dx-menu-active',
									)}
								>
									<Link
										title="Dịch vụ của tôi"
										to={DX.sme.createPath('/my-service')}
										className="font-semibold text-black"
									>
										{tMenu('myService')}
									</Link>
								</div>

								<div
									className={clsx(
										'text-black dx-menu',
										keySelected === '/account' && 'dx-menu-active',
									)}
								>
									<Dropdown
										overlay={menuManagement}
										placement="bottomCenter"
										getPopupContainer={() => document.getElementById('headerId')}
									>
										<Link
											title="Quản lý"
											to={DX.sme.createPath('/account/invoice')}
											className="ant-dropdown-link font-semibold text-black"
											onClick={(e) => e.preventDefault()}
										>
											{tMenu('opt_manage', { field: '' })}
										</Link>
									</Dropdown>
								</div>
								{/* <div className={clsx('text-black dx-menu', keySelected === '/report' && 'dx-menu-active')}>
								<Dropdown
									overlay={menuReport}
									placement="bottomCenter"
									getPopupContainer={() => document.getElementById('headerId')}
								>
									<Link
										title="Báo cáo"
										to={DX.sme.createPath('/account/invoice')}
										className="ant-dropdown-link font-semibold text-black"
										onClick={(e) => e.preventDefault()}
									>
										{tMenu('report')}
									</Link>
								</Dropdown>
							</div> */}
								{visible && <ConvertRoleForm visible={visible} setVisible={setVisible} />}
							</>
						)}
						<div className="dx-menu">
							<a
								href="https://onesme.vn/blog/"
								target="_blank"
								className="font-semibold text-black"
								rel="noreferrer"
							>
								Tin tức - Khuyến mại
							</a>
						</div>
						{/* <div className="dx-menu">
							<a
								href="http://vnpt.dev.masoffer.tech/"
								target="_blank"
								className="font-semibold text-black"
								rel="noreferrer"
							>
								Kiếm tiền online
							</a>
						</div> */}
						<div
							className="dx-menu font-semibold text-black cursor-pointer hover:text-primary"
							onClickCapture={() => onClickDocs('sme')}
						>
							{tButton('help')}
						</div>
					</DXMenu>
				</div>
			</div>
			<CategoryMenu visibleCategory={visibleCategory} onChooseCategory={() => setVisibleCategory(false)} />

			<ModalConfirm
				showModal={visibleModal}
				setShowModal={setVisibleModal}
				mutation={() => mutation.mutateAsync({ deviceToken: tokenNotify, user })}
				isLoading={mutation.isLoading}
				mainTitle={tMessage('logout')}
				subTitle={tMessage('wantToLogout')}
			/>
		</header>
	);
}
