import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useMutation } from 'react-query';
import { SaasAdmin } from 'app/models';
import { useLng } from 'app/hooks';
import { trim } from 'opLodash';
import { DrawerApproval } from 'app/components/Atoms';

export default function SaasApprove({ form, idValue, closeForm, visible, refetch, refetchDrawer }) {
	const [approve, setApproveStatus] = useState('');
	const [typeLoading, setTypeLoading] = useState('');
	const { tMessage, tValidation, tField, tButton, tOthers, tLowerField } = useLng();
	const updateApproveStatus = useMutation(SaasAdmin.updateApproveStatus, {
		onSuccess: () => {
			if (approve === SaasAdmin.tagStatus.APPROVED.value) message.success('Phê duyệt dịch vụ thành công!');
			else if (approve === SaasAdmin.tagStatus.UNAPPROVED.value)
				message.warning('Đã yêu cầu nhà phát triển cập nhật lại!');
			else message.error('Đã từ chối phê duyệt dịch vụ!');
			refetchDrawer && refetchDrawer();
			closeForm();
			form.resetFields();
			refetch();
		},
	});

	useEffect(() => {
		if (approve) {
			updateApproveStatus.mutate({
				id: idValue,
				body: {
					approveStatus: approve,
					cause: form.getFieldValue('comment') || 'approve',
				},
			});
		}
	}, [approve]);

	function handleClickApprove() {
		setTypeLoading(SaasAdmin.tagStatus.APPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.APPROVED.value);
	}

	function handleClickUnApprove() {
		const data = form.getFieldValue('comment');
		if (!trim(data)) {
			form.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.UNAPPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.UNAPPROVED.value);
	}

	function handleClickReject() {
		const data = form.getFieldValue('comment');
		if (!trim(data)) {
			form.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.REJECTED.value);
		setApproveStatus(SaasAdmin.tagStatus.REJECTED.value);
	}

	return (
		<>
			<DrawerApproval
				closeForm={closeForm}
				visible={visible}
				form={form}
				handleClickApprove={handleClickApprove}
				handleClickUnApprove={handleClickUnApprove}
				handleClickReject={handleClickReject}
				loading={updateApproveStatus.isLoading}
				typeLoading={typeLoading}
				title={tField('opt_approve', { field: 'service' })}
				textAcceptBtn={tButton('accept', { field: 'service' })}
				content={
					<p>
						{tOthers('inCase')} <b>{tOthers('reject')} </b> {tLowerField('or')}{' '}
						<b>{tOthers('updateRequest')}</b> {tLowerField('giveDevReason')}
					</p>
				}
				approved={SaasAdmin.tagStatus.APPROVED.value}
				unApproved={SaasAdmin.tagStatus.UNAPPROVED.value}
				rejected={SaasAdmin.tagStatus.REJECTED.value}
			/>
		</>
	);
}

SaasApprove.propTypes = {};
