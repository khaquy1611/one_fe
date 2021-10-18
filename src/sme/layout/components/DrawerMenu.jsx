import { Button, Drawer } from 'antd';
import { useLng } from 'app/hooks';
import { Vector } from 'app/icons';
import { DX } from 'app/models';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT = 'default';
export default function DrawerMenu({ menus, visible, onClose, noUser }) {
	const [menuActive, setMenuActive] = useState(DEFAULT);
	const { name, children } = menuActive === DEFAULT ? { children: menus, name: '' } : menus[menuActive];
	const { tButton } = useLng();
	function resetState() {
		setMenuActive(DEFAULT);
	}
	useEffect(() => {
		if (!visible) {
			resetState();
		}
	}, [visible, noUser]);
	return (
		<Drawer
			visible={visible}
			placement="left"
			onClose={onClose}
			width="100%"
			title={
				<div className="flex justify-between">
					<span
						className={clsx(
							' transform rotate-180 inline-block ',
							!name && 'opacity-0 pointer-events-none',
						)}
						onClickCapture={resetState}
					>
						<Vector />
					</span>
					<span>{name}</span>
					<span></span>
				</div>
			}
		>
			<div className="flex flex-col mb-8">
				{children
					// .filter((el) => !el.hide)
					.map((menu, index) => {
						if (menu.hide) {
							return null;
						}
						return (
							<div
								onClickCapture={() => {
									if (menu.onClick) {
										menu.onClick();
										onClose();
									} else {
										setMenuActive(index);
									}
								}}
								key={menu.key || menu.name}
								className="font-medium flex justify-between mb-8"
								// style={{ fontSize: 16 }}
							>
								{menu.node || menu.name}
								{menu.children && (
									<span>
										<svg
											width="8"
											height="14"
											viewBox="0 0 8 14"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M5.172 7.00072L0.222 2.05072L1.636 0.636719L8 7.00072L1.636 13.3647L0.222 11.9507L5.172 7.00072Z"
												fill="#333333"
											/>
										</svg>
									</span>
								)}
							</div>
						);
					})}
			</div>
			{noUser && (
				<div style={{ borderTop: '1px solid #F2F2F2' }} className="pt-14">
					<Link title="Đăng nhập" to={DX.sme.createPath('/login')}>
						<Button type="primary" block className="mb-6">
							{tButton('login')}
						</Button>
					</Link>
					<Link title="Đăng ký" to={DX.sme.createPath('/register')}>
						<Button block>{tButton('register')}</Button>
					</Link>
				</div>
			)}
		</Drawer>
	);
}
