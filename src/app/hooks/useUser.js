import { useSelector, useDispatch } from 'react-redux';
import { appActions, appSelects } from 'actions';
import { clearToken } from 'app/models/Base';

export default function useUser() {
	const dispatch = useDispatch();
	const user = useSelector(appSelects.selectUser);
	const tokenNotify = useSelector(appSelects.selectNotifyToken);

	const clearUser = (dontClearToken) => {
		document.title = 'Nền tảng chuyển đổi số - oneSME';
		dispatch(appActions.updateUser({}));
		if (!dontClearToken) {
			clearToken();
		}
	};

	const updateUser = (newUser) => {
		if (!newUser) {
			dispatch(appActions.updateUser({}));
		} else {
			dispatch(appActions.updateUser(newUser));
		}
	};

	const changeStatus = (status) => {
		dispatch(appActions.changeStatus(status));
	};
	const changeNotifyToken = (newToken) => {
		dispatch(appActions.updateNotifyToken(newToken));
	};

	return {
		user,
		updateUser,
		clearUser,
		changeStatus,
		changeNotifyToken,
		tokenNotify,
	};
}
