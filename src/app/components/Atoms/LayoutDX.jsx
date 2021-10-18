import React, { Suspense } from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUser } from 'app/hooks';
import CanNotAccessRoute from 'app/permissions/CanNotAccessRoute';

const { Sider, Content } = Layout;

const LayoutCustom = styled(Layout)`
	padding-top: 4rem;
	.modify-sider {
		overflow: auto;
		position: fixed;
		left: 0;
		top: 0;
		.ant-menu-root {
			padding-top: 5rem;
			height: 100vh;
			overflow-x: hidden;
			overflow-y: hidden;
			&:hover {
				overflow-y: auto;
				&::-webkit-scrollbar-track {
					background-color: transparent;
				}
				&::-webkit-scrollbar {
					width: 6px;
					background-color: transparent;
				}
				&::-webkit-scrollbar-thumb {
					border-radius: 10px;
					background-color: #babac0;
				}
			}
			@media only screen and (max-width: 1024px) {
				overflow-y: auto;
			}
		}
		.ant-menu-item {
			padding-left: 1.5rem !important;
		}
		.ant-menu-item-only-child {
			padding-left: 3rem !important;
		}
	}
`;

function LayoutDX({ Header, LeftMenu, routers }) {
	const { path } = useRouteMatch();
	const { user } = useUser();
	return (
		<Layout className="dev-portal relative">
			<Header />
			<LayoutCustom>
				<Sider width="16rem" className="bg-white modify-sider">
					<LeftMenu />
				</Sider>
				<Content className="px-8 pt-8 ml-64 min-h-screen pb-8 bg-white">
					<Suspense fallback={null}>
						<Switch>
							{routers(user).map((router, i) => {
								if (!router.hide) {
									return <Route key={router.key || i} {...router} path={path + router.path} />;
								}
								return (
									<Route
										key={router.key || i}
										{...router}
										path={path + router.path}
										component={CanNotAccessRoute}
									/>
								);
							})}
						</Switch>
					</Suspense>
				</Content>
			</LayoutCustom>
		</Layout>
	);
}

export default LayoutDX;
