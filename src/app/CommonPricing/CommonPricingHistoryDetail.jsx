import React from 'react';
import { Form, message, Spin, Tag } from 'antd';
import { DX, Pricing, SaasAdmin } from 'app/models';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useLng } from 'app/hooks';
import CommonPricingForm from './CommonPricingForm';

export default function CommonPricingHistoryDetail({ portal }) {
	const { id, historyId } = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const { tMessage, tFilterField, tMenu } = useLng();
	const { data: initValues, isFetching } = useQuery(
		['getPricingHisInfo', historyId],
		async () => {
			try {
				const res = await Pricing.getDetailPricingHistory(portal, historyId, 'APPROVED');
				if (res.serviceId !== parseInt(id, 10)) {
					message.error(tMessage('err_historyInfoNotBelongThisService'));
					setTimeout(() => {
						if (portal === 'admin') history.push(DX.admin.createPath(`/`));
						else history.push(DX.dev.createPath(`/`));
					}, 500);
					return {};
				}
				const value = Pricing.transformData(res);
				return value;
			} catch (e) {
				if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
					message.error(tMessage('err_notFoundServicePackageInfo'));
					setTimeout(() => {
						if (portal === 'admin') history.push(DX.admin.createPath(`/saas/list/${id}?tab=3`));
						else history.push(DX.dev.createPath(`/service/list/${id}?tab=3`));
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
	const { serviceId, serviceName, serviceStatus, pricingIdDraft, pricingNameDraft, version } = initValues;
	const breadcrumbs = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'serviceList',
			url: `/${portal}-portal/${portal === 'admin' ? 'saas' : 'service'}/list`,
		},
		{
			isName: true,
			name: serviceName,
			url: `/${portal}-portal/${portal === 'admin' ? 'saas' : 'service'}/list/${serviceId}`,
		},
		{
			isName: true,
			name: pricingNameDraft,
			url: `/${portal}-portal/${portal === 'admin' ? 'saas' : 'service'}/list/${serviceId}/${pricingIdDraft}`,
		},
		{
			isName: true,
			name: `${version ? `${tMenu('version')} ${version}` : ''}`,
			url: '',
		},
	];
	const tagStatus = SaasAdmin.tagStatus[serviceStatus];
	const Icon = tagStatus?.icon;
	return (
		<div>
			{!isFetching ? (
				<>
					<UrlBreadcrumb breadcrumbs={breadcrumbs} />
					<div className="font-semibold mt-5 mb-7">
						<div>
							{serviceName}
							<span className="font-medium ml-3">
								<Tag color={tagStatus?.color} icon={tagStatus?.icon && <Icon />}>
									{tFilterField('approvalStatusOptions', tagStatus?.text)}
								</Tag>
							</span>
						</div>
					</div>
					<CommonPricingForm data={initValues} form={form} portal={portal} disabled canLoadOption={false} />
				</>
			) : (
				<div className="text-center">
					<Spin />
				</div>
			)}
		</div>
	);
}
