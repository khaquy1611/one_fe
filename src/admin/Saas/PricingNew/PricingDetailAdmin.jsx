import React, { useEffect, useState } from 'react';
import { DrawerApproval } from 'app/components/Atoms';
import { DX, SaasAdmin, Pricing } from 'app/models';
import { useParams, useHistory } from 'react-router-dom';
import CommonPricingDetail from 'app/CommonPricing/CommonPricingDetail';
import { Button, Form, message } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import { useLng, useUser } from 'app/hooks';
import { trim } from 'opLodash';
import { useMutation } from 'react-query';

export default function PricingDetailAdmin({ setPricingName }) {
	const { id, pricingId } = useParams();
	const { user } = useUser();
	const [form] = Form.useForm();
	const [openForm, setOpenForm] = useState(false);
	const [approve, setApproveStatus] = useState('');
	const [typeLoading, setTypeLoading] = useState('');
	const [pricingInfo, setPricingInfo] = useState({});
	const history = useHistory();
	const CAN_APPROVED_SERVICE_PACK = DX.canAccessFuture2('admin/approved-service-pack', user.permissions);
	const { tMessage, tOthers, tField, tButton, tValidation, tLowerField } = useLng();
	function closeForm() {
		setOpenForm(false);
	}

	const updateApproveStatus = useMutation(Pricing.updateApproveStatus, {
		onSuccess: () => {
			if (approve === SaasAdmin.tagStatus.APPROVED.value)
				message.success(tMessage('opt_successfullyApproved', { field: 'servicePackage' }));
			else message.success(tMessage('opt_successfullyRejected', { field: 'servicePackage' }));
			closeForm();
			form.resetFields();
			setTimeout(() => {
				history.push(DX.admin.createPath(`/saas/list/${id}?tab=3`));
			}, 500);
		},
		onError: (e) => {
			if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
				message.error(tMessage('opt_isDeleted', { field: 'servicePackage' }));
			} else if (e.errorCode === 'error.pricing.not.be.awaiting.approval' && e.field === 'approve') {
				message.error(tMessage('opt_isApproved', { field: 'servicePackage' }));
			}
			setTimeout(() => {
				history.push(DX.admin.createPath(`/saas/list/${id}?tab=3`));
			}, 500);
		},
	});

	useEffect(() => {
		if (approve) {
			updateApproveStatus.mutate({
				id: pricingId,
				body: {
					status: approve,
					cause: form.getFieldValue('comment'),
				},
			});
		}
	}, [approve]);

	function handleClickApprove() {
		setTypeLoading(SaasAdmin.tagStatus.APPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.APPROVED.value);
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
		<div>
			<CommonPricingDetail portal="admin" setPricingName={setPricingName} setPricingInfo={setPricingInfo} />
			{pricingInfo.approveStatus === SaasAdmin.tagStatus.AWAITING_APPROVAL.value && CAN_APPROVED_SERVICE_PACK && (
				<>
					<Button
						onClick={() => {
							setOpenForm(true);
						}}
						style={{ backgroundColor: '#2C3D94' }}
						className="text-white fixed bottom-0 right-1 h-14 w-80 z-max"
					>
						<div className="flex justify-between">
							<div>{tButton('opt_approve', { field: 'package' })}</div>
							<div>
								<MinusOutlined />
							</div>
						</div>
					</Button>
					<DrawerApproval
						closeForm={closeForm}
						visible={openForm}
						form={form}
						handleClickApprove={handleClickApprove}
						handleClickReject={handleClickReject}
						loading={updateApproveStatus.isLoading}
						typeLoading={typeLoading}
						title={tField('opt_approve', { field: 'servicePackage' })}
						textAcceptBtn={tButton('accept')}
						content={
							<p>
								{tOthers('inCase')} <b>{tOthers('reject')}</b>, {tLowerField('giveDevReason')}
							</p>
						}
						approved={SaasAdmin.tagStatus.APPROVED.value}
						unApproved={SaasAdmin.tagStatus.REJECTED.value}
						rejected={SaasAdmin.tagStatus.UNAPPROVED.value}
						hideBtnUnApproved
					/>
				</>
			)}
		</div>
	);
}
