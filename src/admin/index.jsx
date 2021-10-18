import React from 'react';

import { LayoutDX } from 'app/components/Atoms';
import routers from './routers';
import { LeftMenu, Header } from './layout';

function SMEPortal() {
	return <LayoutDX Header={Header} LeftMenu={LeftMenu} routers={routers} />;
}

export default SMEPortal;
