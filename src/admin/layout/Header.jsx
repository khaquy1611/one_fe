import React from 'react';
import styled from 'styled-components';
import { VnptLogo, LogoutIcon, ChangePasswordIcon, UserIcon } from 'app/icons';

import { Menu, Dropdown, Avatar, Modal } from 'antd';
import { CustomerServiceOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom';
import { DX, Users } from 'app/models';
import { useMutation } from 'react-query';
import { useLng, useUser } from 'app/hooks';
import { WrapNotification } from 'app/components/Templates';
import { onClickDocs } from 'app/helpers';

const ModifyHeader = styled.header`
	box-shadow: 0 2px 8px #f0f1f2 !important;
`;

export default function Header() {
	const { user, clearUser, tokenNotify } = useUser();
	const history = useHistory();
	const { tMessage } = useLng();

	const mutation = useMutation(Users.logout, {
		onSuccess: () => {
			clearUser();
			history.push(DX.admin.createPath('/login'));
		},
	});

	const logoutClick = () => {
		Modal.confirm({
			title: tMessage('wantToLogout'),
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => mutation.mutateAsync({ deviceToken: tokenNotify, user }),
		});
	};

	const DropdownMenu = (
		<Menu className="top-3">
			<Menu.Item key="1" icon={<UserIcon width="w-3" className="inline-block" />}>
				<Link to={`${DX.admin.path}/account/profile/info`} className="inline-block w-full">
					Chi tiết tài khoản
				</Link>
			</Menu.Item>
			<Menu.Item key="2" icon={<ChangePasswordIcon width="w-3" className="inline-block" />}>
				<Link to={`${DX.admin.path}/account/profile/password`} className="inline-block w-full">
					Đổi mật khẩu
				</Link>
			</Menu.Item>
			<Menu.Item key="helper" icon={<CustomerServiceOutlined width="w-3" className="inline-block" />}>
				<span onClickCapture={() => onClickDocs('admin')} target="blank" className="inline-block">
					Trợ giúp
				</span>
			</Menu.Item>
			<Menu.Item onClick={logoutClick} key="3" icon={<LogoutIcon width="w-3" className="inline-block" />}>
				Đăng xuất
			</Menu.Item>
		</Menu>
	);

	return (
		<ModifyHeader id="headerId" className="flex bg-white items-center px-12 text-white h-16 fixed w-full z-max">
			<VnptLogo className="mr-4 text-primary" />
			<span className="text-xl text-primary font-bold">oneSME Admin Portal</span>
			<div className="ml-auto flex gap-2 items-center relative">
				<WrapNotification />
				<span className="text-black">{user.name}</span>
				<Dropdown overlay={DropdownMenu} trigger={['click']}>
					<Link to className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
						<Avatar src={user.avatar} className="flex items-center justify-center h-10 w-10">
							<UserIcon className="text-black flex my-auto" width="w-4" />
						</Avatar>
					</Link>
				</Dropdown>
			</div>
		</ModifyHeader>
	);
}
