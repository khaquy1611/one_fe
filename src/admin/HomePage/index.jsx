import { useUser } from 'app/hooks';
import { DX } from 'app/models';
import React from 'react';
import { Redirect } from 'react-router-dom';

export default function HomePage() {
	const { user } = useUser();
	if (!DX.canAccessFuture2('admin/list-service', user.permissions)) {
		return <Redirect to={DX.admin.createPath('/account/profile/info')} />;
	}
	return <Redirect to={DX.admin.createPath('/saas/list')} />;
}
