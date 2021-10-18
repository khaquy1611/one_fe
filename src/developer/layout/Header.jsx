import React, { useState } from 'react';
import { UserIcon, ChangePasswordIcon, LogoutIcon, CovertIcon, LogoDevIcon } from 'app/icons';
import { Menu, Dropdown, Avatar, Modal, Select } from 'antd';
import { CustomerServiceOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom';
import { DX, Users } from 'app/models';
import { useMutation } from 'react-query';
import { useUser, useLng } from 'app/hooks';
import { WrapNotification } from 'app/components/Templates/index';
import ConvertRoleForm from 'app/permissions/ConvertRoleForm';
import { useDispatch, useSelector } from 'react-redux';
import { appActions, appSelects } from 'actions';
import { onClickDocs } from 'app/helpers';

export default function Header() {
	const dispatch = useDispatch();
	const { user, clearUser, tokenNotify } = useUser();
	const history = useHistory();
	const [visible, setVisible] = useState(false);
	const lng = useSelector(appSelects.selectLanguage);
	const { tButton, tMessage, tMenu } = useLng();

	const isTechId = user?.techId;

	const handleChangeLanguage = (newLng) => {
		dispatch(appActions.changeLanguage(newLng));
	};
	const mutation = useMutation(Users.logout, {
		onSuccess: () => {
			clearUser();
			history.push(DX.dev.createPath('/login'));
		},
	});

	const logoutClick = () =>
		Modal.confirm({
			title: tMessage('wantToLogout'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => mutation.mutateAsync({ deviceToken: tokenNotify, user }),
		});

	const isSMEAdminOrDevAdmin = () => ({
		isSme: user.roles.some((el) => el === DX.sme.role),
		isDev: user.roles.some((el) => el === DX.dev.role),
	});

	const handleNextPortal = () => {
		const { isSme, isDev } = isSMEAdminOrDevAdmin();
		if (user.parentId === -1 && isDev && !isSme) {
			setVisible(true);
		} else {
			window.location.href = '/sme-portal';
			// history.push('/sme-portal');
		}
	};

	const DropdownMenu = (
		<Menu className="top-3">
			<Menu.Item key="1" icon={<UserIcon width="w-3" className="inline-block" />}>
				<Link to={`${DX.dev.path}/account/profile`} className="inline-block">
					{tMenu('accDetail')}
				</Link>
			</Menu.Item>
			{!isTechId && (
				<Menu.Item key="2" icon={<ChangePasswordIcon width="w-3" className="inline-block" />}>
					<Link to={`${DX.dev.path}/account/change-password`} className="inline-block">
						{tMenu('changePass')}
					</Link>
				</Menu.Item>
			)}
			<Menu.Item key="helper" icon={<CustomerServiceOutlined width="w-3" className="inline-block" />}>
				<span onClickCapture={() => onClickDocs('dev')} target="blank" className="inline-block">
					{tMenu('help')}
				</span>
			</Menu.Item>
			{/* {((user.parentId === -1 && DX.canAccessFuture('dev/show_convert_role', user.roles)) ||
				DX.sme.canAccessPortal(user)) && (
				<Menu.Item
					key="3"
					icon={<CovertIcon width="w-3" className="inline-block" />}
					onClick={() => handleNextPortal()}
				>
					<span className="inline-block">{tMenu('redirectSME')}</span>
				</Menu.Item>
			)} */}
			<Menu.Item key="4" icon={<LogoutIcon width="w-3" className="inline-block" />} onClick={logoutClick}>
				<span className="inline-block">{tMenu('logout')}</span>
			</Menu.Item>
		</Menu>
	);

	return (
		<div
			id="headerId"
			style={{ backgroundColor: '#2C3D94' }}
			className="flex bg-white items-center px-12 text-white h-16 fixed w-full z-max"
		>
			<LogoDevIcon className="mr-2 text-white" width="w-10" />
			<span className="text-xl text-white font-bold">oneSME</span>
			<div className="ml-auto flex gap-2 items-center relative">
				<WrapNotification />
				<span className="text-white ml-2">{user.name}</span>
				<Dropdown
					overlay={DropdownMenu}
					trigger={['click']}
					getPopupContainer={() => document.getElementById('headerId')}
					className="cursor-pointer"
				>
					<Avatar src={user.avatar} className="flex items-center justify-center h-10 w-10">
						<UserIcon className="text-black" width="w-4" />
					</Avatar>
				</Dropdown>
				{/* <div className="ml-4">
					<Select
						value={lng}
						onChange={handleChangeLanguage}
						className={{ minWidth: '2rem' }}
						bordered={false}
					>
						<Select.Option value="en-EN">EN</Select.Option>
						<Select.Option value="vi-VN">VN</Select.Option>
					</Select>
				</div> */}
			</div>
			{visible && <ConvertRoleForm visible={visible} setVisible={setVisible} />}
		</div>
	);
}
