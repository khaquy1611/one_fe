import React from 'react';
import { PreviewService } from 'app/components/Templates';
import { useLng } from 'app/hooks';
import { DX, ComboSME } from 'app/models';
import { isArray as _isArray } from 'opLodash';
import { useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';

import WrapDetail from 'app/HOCs/WrapDetail';
import { Breadcrumb } from 'antd';

function ComboDetail({ setHaveError }) {
	const params = useParams();
	const id = parseInt(params.id, 10) || 0;
	const { tMenu } = useLng();
	const { data: dataService } = useQuery(
		['getService', id],
		async () => {
			const res = await ComboSME.getDetailCombo(id);
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

	// const {
	// 	data: { content },
	// } = useQuery(
	// 	['getListSubscriptionUsed'],
	// 	async () => {
	// 		const res = await SMESubscription.getAllPagination({
	// 			serviceId: id,
	// 		});
	// 		return res;
	// 	},
	// 	{
	// 		initialData: [],
	// 		enabled: !!user.id && !!DX.canAccessFuture2('sme/payment', user.permissions),
	// 	},
	// );

	// const getSubscriptionUsed = () => {
	// 	if (user.id && content && content.length) {
	// 		return content.some((item) => item.status !== 'CANCELLED');
	// 	}
	// 	return false;
	// };

	const history = useHistory();

	const onRegister = () => {
		history.replace(DX.sme.createPath(`/combo/${id}?tab=3`));
	};
	const onBuyNow = (planId) => {
		history.push(DX.sme.createPath(`/combo/pay/${id}/${planId}`));
	};

	const funcTrialNow = (planId) => {
		history.push(DX.sme.createPath(`/combo/trial/${id}/${planId}`));
	};

	// const { data: dataEvaluate, refetch: refreshDataEvaluate } = useQuery(
	// 	['getServiceEvaluate', id, paramFollow],
	// 	async () => {
	// 		let res;
	// 		if (user.roles.length > 0) {
	// 			res = await SmeEvaluate.getServiceDetailSme(id);
	// 		} else {
	// 			res = await CommonEvaluate.getEvalutionService(id);
	// 		}

	// 		return res;
	// 	},
	// 	{
	// 		initialData: {},
	// 	},
	// );

	return (
		<div className="w-full">
			<Breadcrumb>
				<Breadcrumb.Item
					className="cursor-pointer"
					onClick={() => {
						history.push(`${DX.sme.createPath('/')}`);
					}}
				>
					<span className="text-primary font-bold">{tMenu('homePage')}</span>
				</Breadcrumb.Item>
				<Breadcrumb.Item
					className="cursor-pointer"
					onClick={() => {
						history.push(`${DX.sme.createPath('/combos')}`);
					}}
				>
					<span className="text-primary font-bold">
						{tMenu('all')} {tMenu('combo')}
					</span>
				</Breadcrumb.Item>

				<Breadcrumb.Item>{dataService.name}</Breadcrumb.Item>
			</Breadcrumb>
			<br />
			<div className="animate-zoomOut">
				<PreviewService
					dataService={dataService}
					// dataEvaluate={dataEvaluate}
					// refreshDataEvaluate={refreshDataEvaluate}
					onRegister={onRegister}
					onBuyNow={onBuyNow}
					funcTrialNow={funcTrialNow}
					//	bought={getSubscriptionUsed()}
					// stopBuying={user.id && !DX.canAccessFuture2('sme/payment', user.permissions)}
					type="sme"
					typeScreen="COMBO"
				/>
			</div>
		</div>
	);
}

export default WrapDetail(ComboDetail);
