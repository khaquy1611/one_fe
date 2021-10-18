import React, { useEffect, useState } from 'react';
import { DrawerApproval } from 'app/components/Atoms';
import { DX, SaasAdmin, ComboPricing } from 'app/models';
import { useParams, useHistory } from 'react-router-dom';
import CommonComboPricingDetail from 'app/CommonCombo/CommonPricing/DetailScreen/CommonComboPricingDetail';
import { Button, Form, message } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import { trim } from 'opLodash';
import { useLng, useUser } from 'app/hooks';
import { useMutation } from 'react-query';

function ComboPricingDetail({ setPricingName, isOwnerProvince }) {
	const { user } = useUser();
	const CAN_APPROVED_PACKAGE = DX.canAccessFuture2('admin/approved-combo-pack', user.permissions);
	const { id, pricingId } = useParams();
	const [form] = Form.useForm();
	const [openForm, setOpenForm] = useState(false);
	const [approve, setApproveStatus] = useState('');
	const [typeLoading, setTypeLoading] = useState('');
	const [pricingInfo, setPricingInfo] = useState({});
	const history = useHistory();
	const { tMessage, tButton, tValidation } = useLng();
	function closeForm() {
		setOpenForm(false);
	}

	const updateApproveStatus = useMutation(ComboPricing.updateApproveStatusComboPlan, {
		onSuccess: () => {
			if (approve === SaasAdmin.tagStatus.APPROVED.value)
				message.success('Phê duyệt gói Combo dịch vụ thành công');
			else message.success('Từ chối gói Combo dịch vụ thành công');
			closeForm();
			form.resetFields();
			setTimeout(() => {
				history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
			}, 500);
		},
		onError: (e) => {
			if (e.errorCode === 'error.data.exists' && e.field === 'id') {
				message.error(tMessage('opt_isDeleted', { field: 'comboPlan' }));
			} else if (e.errorCode === 'error.combo.must.awaitingApprove' && e.field === 'approveStatus') {
				message.error(tMessage('opt_isApproved', { field: 'comboPlan' }));
			}
			setTimeout(() => {
				history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
			}, 500);
		},
	});

	useEffect(() => {
		if (approve) {
			updateApproveStatus.mutate({
				id: pricingId,
				body: {
					approvedStatus: approve,
					comment: form.getFieldValue('comment'),
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
		<>
			<CommonComboPricingDetail
				portal="admin"
				setPricingName={setPricingName}
				setPricingInfo={setPricingInfo}
				isOwnerProvince={isOwnerProvince}
			/>
			{pricingInfo.approve === SaasAdmin.tagStatus.AWAITING_APPROVAL.value &&
				((pricingInfo.createdBy.indexOf('ADMIN') > -1 && CAN_APPROVED_PACKAGE && isOwnerProvince) ||
					(!user?.department?.provinceId && pricingInfo.createdBy === '' && CAN_APPROVED_PACKAGE)) && (
					<>
						<Button
							onClick={() => {
								setOpenForm(true);
							}}
							style={{ backgroundColor: '#2C3D94' }}
							className="text-white fixed bottom-0 right-10 h-14 w-80 z-max"
						>
							<div className="flex justify-between">
								<div>Phê duyệt gói Combo dịch vụ</div>
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
							title="Phê duyệt gói Combo dịch vụ"
							textAcceptBtn={tButton('accept')}
							content={
								<p>
									Trong trường hợp <b>Từ chối</b>, hãy cung cấp lý do
								</p>
							}
							approved={SaasAdmin.tagStatus.APPROVED.value}
							unApproved={SaasAdmin.tagStatus.REJECTED.value}
							rejected={SaasAdmin.tagStatus.UNAPPROVED.value}
							hideBtnUnApproved
						/>
					</>
				)}
		</>
	);
}

export default ComboPricingDetail;
