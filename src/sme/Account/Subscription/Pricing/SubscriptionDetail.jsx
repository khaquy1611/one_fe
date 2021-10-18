import { Spin } from 'antd';
import WrapDetail from 'app/HOCs/WrapDetail';
import { SMESubscription } from 'app/models';
import { dropRight } from 'opLodash';
import React from 'react';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import CommonSubscription from '../../components/CommonSubscription';

function SubscriptionDetail({ setHaveError }) {
	const { id } = useParams();
	const { getOneById } = SMESubscription;

	const { pathname } = useLocation();
	const pathToList = dropRight(pathname.split('/')).join('/');

	const { refetch, data: subscriptionInfo, isFetching } = useQuery(
		['getSubscriptionById', id],
		async () => {
			try {
				const res = await getOneById(id);
				return res;
			} catch (e) {
				e.callbackUrl = pathToList;
				setHaveError(e);
				return null;
			}
		},
		{
			initialData: {
				loading: true,
			},
			enabled: !!id,
			cacheTime: 0,
		},
	);

	if (isFetching) {
		return (
			<div className="flex justify-center mt-28">
				<Spin />
			</div>
		);
	}

	return <CommonSubscription dataSubscription={subscriptionInfo} refetch={refetch} subcriptionId={id} />;
}

export default WrapDetail(SubscriptionDetail);
