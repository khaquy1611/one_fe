import React, { useState } from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { DX, AddonDev, SaasAdmin } from 'app/models';
import { useLng } from 'app/hooks';
import { Form, message, Tag, Tooltip, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { idInactiveActions } from 'actions';
import RegisterAddonForm from 'admin/Coupon-Addon/Addon/components/RegisterAddonForm';
import { checkAlertPopup, convertToArrNumber } from 'app/validator';

const EXIST_ERROR = 'error.data.exists';
const APPROVED = 'APPROVED';

export default function AddonEdit() {
	const dispatch = useDispatch();
	const [errorService, setError] = useState();
	const { id } = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const { tMessage, tValidation, tOthers, tFilterField } = useLng();
	const { data: addonInfo } = useQuery(
		['getAddonInfoEdit', id],
		async () => {
			const res = await AddonDev.getOneAddonById(id);
			res.unitLimitedList.forEach((e) => {
				e.price = e.price.toLocaleString('vi-VN');
			});
			return res;
		},
		{
			initialData: {
				loading: true,
			},
			cacheTime: 0,
			enabled: !!id,
		},
	);

	const tagApproveInfo = SaasAdmin.tagStatus[addonInfo.approveStatus] || {};
	const goBack = () => {
		history.replace(DX.dev.createPath(`/promotion/addon/${id}/detail`));
	};

	const putUpdateMutation = useMutation(AddonDev.updateAddon, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'extraService' }));
			goBack();
			// refetch();
		},
		onError: (e) => {
			if (e.errorCode === EXIST_ERROR && e.field === 'name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'extraServiceName' })],
					},
				]);
			}
			if (e.errorCode === EXIST_ERROR && e.field === 'code') {
				form.setFields([
					{
						name: 'code',
						errors: ['Mã dịch vụ bổ sung đã tồn tại'],
					},
				]);
				form.scrollToField('code', { behavior: 'smooth', block: 'center' });
			}
			if (!Number.isNaN(parseInt(e.message, 10)) && typeof parseInt(e.message, 10) === 'number') {
				dispatch(idInactiveActions.getAllIdInactive(convertToArrNumber(e.message)));
			}
			if (!!form.getFieldValue('serviceId').id && e.field === 'id' && e.errorCode === 'error.object.inactive') {
				message.error({
					content: `Dịch vụ áp dụng ${form.getFieldValue('serviceId').serviceName} không hoạt động`,
					duration: 5,
					className: 'msg-coupon',
				});
				setError(form.getFieldValue('serviceId').id);
			} else if (form.getFieldValue('listPricingBonus').list.length > 0 && e.field === 'listPricingBonus')
				message.error({
					content: checkAlertPopup(
						e,
						form.getFieldValue('listPricingBonus').list,
						'pricingId',
						'pricingName',
					),
					duration: 5,
					className: 'msg-coupon',
				});
			form.scrollToField('name', { behavior: 'smooth', block: 'center' });
		},
	});

	const onFinish = (values) => {
		const dataEdit = {
			...values,
			status: addonInfo.status,
			serviceId: values.serviceId.id,
			unitLimitedList: values.unitLimitedList?.length > 0 ? values.unitLimitedList : null,
			hasTax: values.hasTax === true ? 'YES' : 'NO',
		};

		putUpdateMutation.mutate({
			id,
			body: { ...dataEdit },
		});
	};

	const addonUpdate = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'extraService',
			url: DX.dev.createPath('/promotion/addon'),
		},
		{
			isName: true,
			name: addonInfo.name,
			url: '',
		},
	];
	if (id && addonInfo.loading) {
		return <Spin />;
	}

	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={addonUpdate} />{' '}
			<div className="flex max-w-7xl justify-between mt-4">
				<div className="flex justify-start items-center">
					<Tooltip placement="topLeft" title={tOthers('couponNameHere')}>
						<div className="font-semibold text-xl truncate max-w-lg">
							{addonInfo.name || 'This is coupon name'}
						</div>
					</Tooltip>
					<Tag className="block ml-4 text-sm font-normal" color={tagApproveInfo?.color}>
						{tFilterField('approvalStatusOptions', tagApproveInfo?.text)}
					</Tag>
				</div>
			</div>
			<RegisterAddonForm
				className="mt-12"
				form={form}
				onFinish={onFinish}
				data={addonInfo}
				disabled={addonInfo.approveStatus === APPROVED}
				isEdit
				checkStatus={addonInfo.approveStatus !== APPROVED}
				goBack={goBack}
				errorService={errorService}
				checkApproved
			/>
		</div>
	);
}
