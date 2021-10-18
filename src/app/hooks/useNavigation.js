import { DX } from 'app/models';
import { useHistory, useLocation } from 'react-router-dom';

export default function useNavigation() {
	const history = useHistory();
	const location = useLocation();
	const { from } = location.state || {};

	const goto = history.push;

	const goBack = (defaultPage) => {
		if (history.length > 2) {
			history.goBack();
		} else {
			history.replace(defaultPage);
		}
	};

	const getHomePage = () => {
		if (from?.pathname) {
			return from.pathname + from.search;
		}
		const portal = DX.getPortalByPath(location.pathname);
		// just go to home
		return portal.createPath('');
	};

	const gotoPageOriginAfterLogin = () => {
		history.replace(getHomePage());
	};

	return {
		gotoPageOriginAfterLogin,
		goto,
		goBack,
	};
}
