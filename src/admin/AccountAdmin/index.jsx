import React from 'react';
import { Switch, useRouteMatch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUser } from 'app/hooks';
import { DX } from 'app/models';
import WrapAccount from './WrapAccount';
import DevelopProfile from './components/DevelopProfile';
import SmeDetailProfile from './components/SmeDetailProfile';

function renderSwitch(param) {
	switch (param) {
		case DX.sme.role:
			return <SmeDetailProfile type={param} />;
		case DX.dev.role:
			return <DevelopProfile type={param} />;
		default:
			return '';
	}
}

export default function AccountAdminRoute({ type }) {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={path} exact>
				<WrapAccount type={type} />
			</Route>

			<Route path={`${path}/:id`} exact>
				{renderSwitch(type)}
			</Route>
		</Switch>
	);
}
AccountAdminRoute.propTypes = {
	type: PropTypes.number.isRequired,
};
