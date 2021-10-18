import { useUser } from 'app/hooks';
import { DX } from 'app/models';
import React from 'react';
import { Redirect } from 'react-router-dom';

export default function HomePage() {
	const { user } = useUser();
	const pathRedirect = DX.canAccessFuture2('dev/list-service', user.permissions)
		? '/service/list'
		: '/account/profile';
	return <Redirect to={DX.dev.createPath(pathRedirect)} />;
}
