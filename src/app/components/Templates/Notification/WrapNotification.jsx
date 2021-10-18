import React, { useEffect, useReducer, useState } from 'react';
import Notice from 'app/models/Notification';
import { DX } from 'app/models';
import { useHistory, useLocation } from 'react-router-dom';

import { useQuery } from 'react-query';
import { Badge, Dropdown, notification } from 'antd';
import { CSKHNotifyIcon, RateNotifyIcon, ServiceNotifyIcon } from 'app/icons';
import { getToken, onMessageListener, initFirebase } from 'setupFirebase';
import { useUser } from 'app/hooks';
import { BellOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Notification from './Notification';

const PORTAL_NAME = {
	[DX.dev.role]: 'DEV_PORTAL',
	[DX.sme.role]: 'SME_PORTAL',
	[DX.admin.role]: 'ADMIN_PORTAL',
};

const getIconNotify = (screenId, isBell = true) => {
	if (screenId.startsWith('TK')) {
		return <CSKHNotifyIcon width={`${isBell ? 'w-12' : 'w-8'} `} />;
	}
	if (screenId.startsWith('EV')) {
		return <RateNotifyIcon width={`${isBell ? 'w-12' : ' w-8'} `} />;
	}
	if (screenId.startsWith('SC') || screenId.startsWith('CB') || screenId.startsWith('AO')) {
		return <ServiceNotifyIcon width={`${isBell ? 'w-12' : ' w-8'} `} />;
	}
	return <span />;
};

const getUrlForNotify = ({ objectId, screenId, id }, role, createPath, serviceId) => {
	let path = '';
	let screenIdFormat = '';
	if (screenId.indexOf('/') !== -1) {
		screenIdFormat = screenId.replace(/\/.*/g, '');
	} else {
		screenIdFormat = screenId;
	}
	if (screenId.startsWith('TK')) {
		if (role === DX.sme.role) {
			return createPath(`/account/ticket/detail/${objectId}?notif_id=${id}`);
		}
		return createPath(`/ticket/list/${objectId}?notif_id=${id}`);
	}
	switch (screenIdFormat) {
		case 'EV-02':
		case 'EV-04':
		case 'EV-10':
		case 'EV-12':
		case 'EV-08':
			path = `/ticket/evaluate/${objectId}?notif_id=${id}`;
			break;
		case 'EV-05':
		case 'EV-07':
		case 'EV-09':
		case 'EV-11':
		case 'EV-13':
			path = `/service/${objectId}?notif_id=${id}&tab=2`;
			break;
		case 'SV-01':
		case 'SV-02':
		case 'SV-03':
			if (role === DX.dev.role) {
				path = `/service/list/${objectId}?tab=1`;
				break;
			} else {
				path = `/saas/list/${objectId}?&tab=1`;
				break;
			}
		case 'SV-04':
			if (role === DX.dev.role) {
				path = `/service/list/${objectId}?tab=4`;
				break;
			} else {
				path = `/saas/list/${objectId}?&tab=4`;
				break;
			}
		case 'PC-01':
		case 'PC-02':
		case 'PC-03':
			if (role === DX.dev.role) {
				path = `/service/list/${serviceId.length > 0 && `${serviceId}/`}${objectId}?tab=1`;
				break;
			} else {
				path = `/saas/list/${serviceId.length > 0 && `${serviceId}/`}${objectId}?&tab=1`;
				break;
			}
		case 'PC-04':
			path = `/service/list/${serviceId.length > 0 && `${serviceId}`}?&tab=4`;
			break;
		case 'AO-01':
		case 'AO-02':
		case 'AO-03':
		case 'AO-04':
		case 'AO-05':
			path = `/promotion/addon/${objectId}/detail`;
			break;
		case 'CB-01':
		case 'CB-02':
		case 'CB-03':
			path = `/combo/${objectId}?tab=1`;
			break;
		case 'CB-04':
			path = `/combo/${objectId}`;
			break;
		case 'SC-05':
			path = `/account/subscription/${objectId}/detail`;
			break;
		case 'SC-11':
			if (serviceId.length > 0) {
				path = `/subscription/order-service/${objectId}`;
				break;
			} else {
				path = `/subscription/service/${objectId}`;
				break;
			}
		case 'SC-08':
		case 'SC-15':
			if (serviceId.length > 0) {
				path = `/subscription/order-service/${objectId}`;
				break;
			} else {
				path = `/subscription/service/${objectId}`;
				break;
			}

		default:
			break;
	}
	return createPath(path);
};
const initState = {
	noticeData: [],
	count: 0,
};
function reducer(state, action) {
	switch (action.type) {
		case 'addOneNotify':
			return {
				...state,
				noticeData: [action.noticeData, ...state.noticeData],
				count: state.count + 1,
			};
		case 'set':
			return { ...state, noticeData: [...action.noticeData] };
		case 'changeCount':
			return { ...state, count: action.count };
		default:
			throw new Error();
	}
}

function WrapNotification({ className }) {
	const [page, setPage] = useState(0);
	const [size] = useState(10);
	const [{ noticeData, count }, dispatch] = useReducer(reducer, initState);
	const [hasMore, setHasMore] = useState(true);
	const [visible, setVisible] = useState(false);
	const [canReceiveNotify, setCanReceiveNotify] = useState(true);
	const location = useLocation();
	const portal = DX.getPortalByPath(location.pathname);
	const { changeNotifyToken } = useUser();
	const history = useHistory();
	const { user } = useUser();

	// Lấy danh sách notification
	const { isFetching, refetch } = useQuery(
		['getNoticeDataToAdmin', page],
		async () => {
			const res = await Notice.getNoticeToAdmin(portal.role, {
				page,
				size,
			});
			// Dừng gọi api khi đến bản ghi cuối cùng
			if (res.length < size) {
				setHasMore(false);
			}
			if (page === 0) {
				dispatch({ type: 'set', noticeData: [...res] });
			} else {
				dispatch({ type: 'set', noticeData: [...noticeData, ...res] });
			}

			return res;
		},
		{
			initialData: [],
			cacheTime: 0,
			staleTime: 0,
			enabled: portal.canAccessPortal(user),
		},
	);

	// lấy số lượng thông báo mới trên chuông.
	useQuery(
		['getCountNoticeToAdmin'],
		async () => {
			const res = await Notice.getCountNoticeToAdmin(portal.role);
			dispatch({ type: 'changeCount', count: res.countNewNotify });
			return res;
		},
		{
			initialData: {},
			refetchOnWindowFocus: true,
			enabled: portal.canAccessPortal(user),
		},
	);

	const reqTokenNotify = async (token) => {
		try {
			const res = await Notice.reqToken(token);
			return res;
		} catch (error) {
			return null;
		}
	};

	// Xử lý chọn chuông thông báo
	const handleChangeBell = async () => {
		try {
			if (count) {
				dispatch({ type: 'changeCount', count: 0 });
				return await Notice.updatePortalTypeNotice(PORTAL_NAME[portal.role]);
			}
			return null;
		} catch (error) {
			return null;
		}
	};

	// Xử lý khi chọn 1 thông báo
	const handleNotification = async (idSelected) => {
		try {
			return Notice.updateUnreadStatus(idSelected);
		} catch (error) {
			return null;
		}
	};

	const addNotify = (payload) => {
		dispatch({
			type: 'addOneNotify',
			noticeData: {
				...payload.data,
				content: payload.data.body,
			},
		});
	};

	const changeNotice = (item) => {
		let serviceId = '';
		// nếu người dùng chưa đoc
		if (parseInt(item.status, 10) === 0) {
			handleNotification(item.id);
		}
		if (item.screenId.indexOf('/') !== -1) {
			// setServiceId(item.screenId.replace(/.+?\//g, ''));
			serviceId = item.screenId.replace(/.+?\//g, '');
		}
		history.push(getUrlForNotify(item, portal.role, portal.createPath, serviceId));
		notification.close('notifyFireBaseKey');
		setVisible(false);
		setPage(0);
	};

	useEffect(() => {
		if (window.location.href.startsWith('http://localhost') || window.location.protocol.startsWith('https')) {
			const messaging = initFirebase();
			getToken(messaging, (token) => {
				changeNotifyToken(token);
				reqTokenNotify(token);
				setCanReceiveNotify(!!token);
			});

			onMessageListener(messaging, (payload) => {
				notification.info({
					key: 'notifyFireBaseKey',
					message: payload.data?.title || 'Bạn có một thông báo !',
					description: payload.data?.body,
					onClick: () => changeNotice(payload.data),
					icon: getIconNotify(payload.data.screenId, false) || (
						<ExclamationCircleOutlined className="mt-1 text-primary" />
					),
				});
				addNotify(payload);
			});
		}
	}, []);

	useEffect(() => {
		if (!visible) {
			const dom = document.getElementById('notify-scrollableTarget');
			if (dom) dom.scrollTop = 0;
		}
	}, [visible]);

	useEffect(() => {
		if (count) {
			document.title = `(${count}) Nền tảng chuyển đổi số - oneSME`;
		} else {
			document.title = `Nền tảng chuyển đổi số - oneSME`;
		}
	}, [count]);

	return (
		<div className={className}>
			<Dropdown
				overlay={
					<Notification
						isFetching={isFetching}
						page={page}
						setPage={setPage}
						noticeData={noticeData}
						hasMore={hasMore}
						canReceiveNotify={canReceiveNotify}
						changeNotice={changeNotice}
						getIconNotify={getIconNotify}
					/>
				}
				className="cursor-pointer"
				getPopupContainer={() => document.getElementById('headerId')}
				onVisibleChange={(newVisible) => {
					if (newVisible) {
						handleChangeBell();
						setHasMore(true);
						refetch();
					} else {
						setPage(0);
					}
					setVisible(newVisible);
				}}
				visible={visible}
			>
				<Badge count={count} overflowCount={10}>
					<BellOutlined
						className={portal.path !== DX.dev.path ? 'text-black' : 'text-white'}
						style={{ fontSize: 20 }}
					/>
				</Badge>
			</Dropdown>
		</div>
	);
}

export default WrapNotification;
