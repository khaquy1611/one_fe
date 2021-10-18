import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useUser } from 'app/hooks';

const { SubMenu, Item } = Menu;

const SiderMenu = ({ menus, rootPath, theme }) => {
	const { user } = useUser();
	const { t } = useTranslation('left_menu');
	const history = useHistory();
	const { pathname } = useLocation();
	function onRouterSubMenu(toSub) {
		history.push(rootPath + toSub);
	}
	const selectedKey = useMemo(() => pathname.replace(rootPath, ''), [pathname]);

	const isTechId = user?.techId;

	return (
		<Menu
			mode="inline"
			selectedKeys={[selectedKey]}
			defaultOpenKeys={[`/${selectedKey.split('/')[1]}`]}
			theme={theme}
			className="py-4"
		>
			{menus.map(({ to, Icon, title, subMenus, hide: hideMenu }) => {
				if (hideMenu || !subMenus || !subMenus.find((x) => !x.hide)) {
					return null;
				}

				if (subMenus) {
					return (
						<SubMenu key={to} icon={<Icon className="mr-3 inline-block" width="w-3" />} title={t(title)}>
							{subMenus.map(({ to: toSub, title: titleSub, hide }) => {
								if (hide || (isTechId && toSub === '/account/change-password')) {
									return null;
								}

								return (
									<Item
										onClick={() => {
											onRouterSubMenu(toSub);
										}}
										key={toSub}
									>
										{t(titleSub)}
									</Item>
								);
							})}
						</SubMenu>
					);
				}

				return (
					<Item
						onClick={() => {
							onRouterSubMenu(to);
						}}
						key={to}
						icon={<Icon className="mr-3 inline-block" width="w-3" />}
					>
						{t(title)}
					</Item>
				);
			})}
		</Menu>
	);
};

SiderMenu.propTypes = {
	rootPath: PropTypes.string.isRequired,
	menus: PropTypes.arrayOf(Object),
};

SiderMenu.defaultProps = {
	menus: [],
};

export default React.memo(SiderMenu);
