import React from 'react';
import { Menu } from 'antd';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import { useUser } from 'app/hooks';

const CustomItemGroup = styled(Menu.ItemGroup)`
	.ant-menu-item-group-title {
		text-transform: uppercase;
		font-weight: bold;
		color: var(--color-primary);
		font-size: 1.25rem;
		padding: 0.5rem 0;
	}

	margin-bottom: 2rem;
	/*
	&.ant-menu-inline .ant-menu-item::after {
		border-right: none !important;
	} */
`;

function SiderSme({ menu, rootPath }) {
	const history = useHistory();
	const location = useLocation();
	const currentPage = location.pathname.replace(rootPath, '');
	const { user } = useUser();

	const isTechId = user?.techId;

	function onRouterSubMenu(toSub) {
		history.push(rootPath + toSub);
	}
	return (
		<Menu mode="inline" selectedKeys={[currentPage]} className="border-none bg-main">
			{menu.map((item, index) => (
				<CustomItemGroup title={item.title} key={item.title} keys={index}>
					{item.subMenus?.map((subItem, indexSub) => {
						if (subItem.hide || (isTechId && subItem.to === '/security-setting')) {
							return null;
						}
						return (
							<Menu.Item
								style={{ paddingLeft: '15px' }}
								onClick={() => {
									onRouterSubMenu(subItem.to);
								}}
								key={subItem.to}
								icon={subItem.icon}
								keys={indexSub}
							>
								{subItem.title}
							</Menu.Item>
						);
					})}
				</CustomItemGroup>
			))}
		</Menu>
	);
}

export default React.memo(SiderSme);
