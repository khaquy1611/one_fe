import React from 'react';
import { PreviewService } from 'app/components/Templates';
import { useQueryUrl, useUser, useLng } from 'app/hooks';
import { DX, SMESubscription, SmeService } from 'app/models';
import { isArray as _isArray, isEmpty } from 'opLodash';
import { useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';
import SmeEvaluate from 'app/models/SmeEvaluate';
import CommonEvaluate from 'app/models/CommonEvaluate';
import WrapDetail from 'app/HOCs/WrapDetail';
import { Breadcrumb } from 'antd';

function ServiceDetail({ setHaveError }) {
	const params = useParams();
	const id = parseInt(params.id, 10) || 0;
	const { user } = useUser();
	const { tMenu } = useLng();
	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');

	const { data: dataService } = useQuery(
		['getService', id],
		async () => {
			const res = await SmeService.getServicesByCategoryId({ id });
			if (!_isArray(res.language)) {
				res.language = [res.language || '0'];
			}
			return res;
		},
		{
			initialData: {},
			onError: (e) => {
				e.callbackUrl = DX.sme.createPath('');
				setHaveError(e);
			},
		},
	);

	const {
		data: { content },
	} = useQuery(
		['getListSubscriptionUsed'],
		async () => {
			const res = await SMESubscription.getAllPagination({
				serviceId: id,
			});
			return res;
		},
		{
			initialData: [],
			enabled: !!user.id && !!DX.canAccessFuture2('sme/payment', user.permissions),
		},
	);

	const getSubscriptionUsed = () => {
		if (user.id && content && content.length) {
			return content.some((item) => item.status !== 'CANCELLED');
		}
		return false;
	};

	const history = useHistory();

	const onRegister = () => {
		history.replace(DX.sme.createPath(`/service/${id}?tab=3`));
	};
	const onBuyNow = (planId, idPricingPeriod) => {
		if (idPricingPeriod) {
			return history.push(
				DX.sme.createPath(`/service/pay/${id}/${planId}?pricingMultiPlanId=${idPricingPeriod}`),
			);
		}
		return history.push(DX.sme.createPath(`/service/pay/${id}/${planId}`));
	};

	const funcTrialNow = (planId) => {
		history.push(DX.sme.createPath(`/service/trial/${id}/${planId}`));
	};

	const { data: dataEvaluate, refetch: refreshDataEvaluate } = useQuery(
		['getServiceEvaluate', id, paramFollow],
		async () => {
			let res;
			if (user.roles.length > 0) {
				res = await SmeEvaluate.getServiceDetailSme(id);
			} else {
				res = await CommonEvaluate.getEvalutionService(id);
			}

			return res;
		},
		{
			initialData: {},
		},
	);

	return (
		<div className="w-full">
			<Breadcrumb>
				<Breadcrumb.Item className="cursor-pointer">
					<Link to={DX.sme.path}>{tMenu('homePage')}</Link>
				</Breadcrumb.Item>
				<Breadcrumb.Item className="cursor-pointer">
					<Link to={DX.sme.createPath('/products')}>{tMenu('allProduct')}</Link>
				</Breadcrumb.Item>
				<Breadcrumb.Item>{dataService.name}</Breadcrumb.Item>
			</Breadcrumb>
			<br />
			<div className="animate-zoomOut">
				<PreviewService
					dataService={dataService}
					dataEvaluate={dataEvaluate}
					refreshDataEvaluate={refreshDataEvaluate}
					onRegister={onRegister}
					onBuyNow={onBuyNow}
					funcTrialNow={funcTrialNow}
					bought={getSubscriptionUsed()}
					// stopBuying={user.id && !DX.canAccessFuture2('sme/payment', user.permissions)}
					type="sme"
				/>
			</div>
		</div>
	);
}

export default WrapDetail(ServiceDetail);
