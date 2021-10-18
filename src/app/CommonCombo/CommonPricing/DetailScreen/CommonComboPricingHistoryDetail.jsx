import React, { useEffect } from 'react';
import { Form, message, Spin, Tag } from 'antd';
import { ComboPricing, DX, SaasAdmin } from 'app/models';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useLng } from 'app/hooks';
import { isEmpty } from 'opLodash';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import { useDispatch } from 'react-redux';
import ComboPricingForm from '../components/ComboPricingForm';

function CommonComboPricingHistoryDetail({ portal }) {
	const { id, historyId } = useParams();
	const history = useHistory();
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const { tMessage, tFilterField, tMenu } = useLng();
	const { data: initValues, isFetching } = useQuery(
		['getComboPlanHistory', historyId],
		async () => {
			try {
				const res = await ComboPricing.getDetailComboPlanByPricingId(historyId, 'HISTORY');
				const resTrans = ComboPricing.transformData(res);
				if (res.comboDraftId !== parseInt(id, 10)) {
					message.error(tMessage('err_historyInfoNotBelongThisCombo'));
					setTimeout(() => {
						if (portal === 'admin') history.push(DX.admin.createPath('/'));
						else history.push(DX.dev.createPath('/'));
					}, 500);
					return {};
				}
				return resTrans;
			} catch (e) {
				if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
					message.error(tMessage('err_notFoundComboPlanInfo'));
					setTimeout(() => {
						if (portal === 'admin') history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
						else history.push(DX.dev.createPath(`/combo/${id}?tab=3`));
					}, 500);
				}
				return e;
			}
		},
		{
			initialData: {},
			enabled: !!historyId,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);
	useEffect(() => {
		if (!isEmpty(initValues)) {
			const { periodValue, periodType, pricingCombo, amount } = initValues;
			dispatch(
				comboPricingActions.initComboPricing({
					pricingCombo,
					totalPrice: 0,
					amount,
				}),
			);
			dispatch(
				comboPricingActions.calculateChangeAllPricing({
					periodValue,
					periodType,
				}),
			);
		}
	}, [initValues]);

	const { comboDraftId, comboDraftName, approve, comboPlanDraftId, comboPlanDraftName, version } = initValues;
	const breadcrumbs = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'comboList',
			url: `/${portal}-portal/combo`,
		},
		{
			isName: true,
			name: comboDraftName,
			url: `/${portal}-portal/combo/${comboDraftId}`,
		},
		{
			isName: true,
			name: comboPlanDraftName,
			url: `/${portal}-portal/combo/${comboDraftId}/${comboPlanDraftId}`,
		},
		{
			isName: true,
			name: `${version ? `${tMenu('version')} ${version}` : ''}`,
			url: '',
		},
	];
	const tagStatus = SaasAdmin.tagStatus[approve];
	const Icon = tagStatus?.icon;
	return (
		<div>
			<Spin spinning={isFetching}>
				<UrlBreadcrumb breadcrumbs={breadcrumbs} />
				<div className="font-semibold mt-5 mb-7">
					<div>
						{comboPlanDraftName}
						<span className="font-medium ml-3">
							<Tag color={tagStatus?.color} icon={tagStatus?.icon && <Icon />}>
								{tFilterField('approvalStatusOptions', tagStatus?.text)}
							</Tag>
						</span>
					</div>
				</div>
				<ComboPricingForm data={initValues} form={form} portal={portal} disabled canLoadOption={false} />
			</Spin>
		</div>
	);
}

export default CommonComboPricingHistoryDetail;
