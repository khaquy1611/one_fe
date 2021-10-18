import { Button, Modal } from 'antd';
import React, { useEffect } from 'react';

import { useLng, useNavigation, useUser } from 'app/hooks';
import { useQuery } from 'react-query';
import { Users, RoleAdmin } from 'app/models';
import { clearToken, parseAccess } from 'app/models/Base';

export default function PermissionModal() {
	const { user, changeStatus, updateUser } = useUser();
	const { tOthers } = useLng();
	const { gotoPageOriginAfterLogin } = useNavigation();
	const { data, refetch } = useQuery(
		['getProfileUserInApp'],
		async () => {
			try {
				if (user.loading || user.statusACCOUNT === Users.ACC_STATUS.DENIED) {
					const res = await Users.getMyProfile();
					updateUser(res);
				} else {
					const userStore = JSON.parse(localStorage.getItem('user'));
					if (userStore.time > user.time) {
						updateUser(userStore);
						parseAccess();
					} else {
						changeStatus();
					}
				}
			} catch (e) {
				if (!e.dontCatchError) {
					updateUser({});
					clearToken();
				}
			}
		},
		{
			refetchOnWindowFocus: true,
			retry: 0,
		},
	);

	useEffect(() => {
		if (user.statusACCOUNT === Users.ACC_STATUS.DENIED) {
			gotoPageOriginAfterLogin();
		}
	}, [user.statusACCOUNT]);

	return (
		<Modal maskClosable visible={user.statusACCOUNT} centered closable={false} footer={null}>
			<div className="text-center">
				<span className="font-medium text-xl">{tOthers(`ACC_STATUS.${user.statusACCOUNT}`)}</span>
			</div>

			<div className="w-full flex">
				<Button
					type="primary"
					className="mx-auto mt-6"
					size="middle"
					onClick={() => {
						if (user.statusACCOUNT.startsWith('NA/')) {
							gotoPageOriginAfterLogin();
						}
						refetch();
					}}
				>
					Đồng ý
				</Button>
			</div>
		</Modal>
	);
}
