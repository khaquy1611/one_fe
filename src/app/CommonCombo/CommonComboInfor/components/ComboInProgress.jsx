import React from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import confirm from 'antd/lib/modal/confirm';
import { message } from 'antd';
import { AdminCombo, DX } from 'app/models';
import { useLng, useUser } from 'app/hooks';
import InforBasic from '../InforBasic';

export default function ComboInProcess({
	portal,
	formEdit,
	data,
	selectServiceType,
	objectCheck,
	setDirtyProgess,
	goBack,
	dirtyInprogess,
	isOwnerProvince,
}) {
	const { user } = useUser();
	const history = useHistory();
	const { tMessage, tButton } = useLng();
	const CAN_UPDATE_COMBO =
		(portal === 'admin' && DX.canAccessFuture2('admin/update-combo', user.permissions)) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/update-combo', user.permissions));

	const updateComboMutation = useMutation(AdminCombo.updateCombo, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			setTimeout(() => {
				if (data.portalType === 'ADMIN') {
					history.push(DX.admin.createPath('/combo'));
				} else history.push(DX.dev.createPath('/combo'));
			}, 500);
			setDirtyProgess(false);
		},
		onError: (e) => {
			if (e.errorCode === 'error.duplicate') {
				formEdit.setFields([
					{
						name: 'name',
						errors: ['Tên Combo dịch vụ đã tồn tại'],
					},
				]);
			}
		},
	});
	function showPromiseUpdateConfirm(values) {
		confirm({
			title: tMessage('opt_wantToUpdate'),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				const dataEdit = {
					...values,
					icon: values.icon[0].uid,
					video: values.video[0]?.uid,
					snapshots: (values.snapshots || []).map((item, index) => ({
						id: item.uid,
						priority: index + 1,
					})),
				};
				updateComboMutation.mutate({
					id: data.id,
					body: dataEdit,
				});
			},
			onCancel() {},
			confirmLoading: updateComboMutation.isLoading,
		});
	}
	return (
		<>
			<InforBasic
				key="progress"
				data={data}
				objectCheck={objectCheck}
				onFinish={showPromiseUpdateConfirm}
				selectServiceType={selectServiceType}
				formEdit={formEdit}
				goBack={goBack}
				portal={portal}
				canLoadOption
				setDirtyProgess={setDirtyProgess}
				dirtyInprogess={dirtyInprogess}
				disabled={!CAN_UPDATE_COMBO || (data?.ownerDev === 'NO' && !isOwnerProvince)}
			/>
		</>
	);
}
