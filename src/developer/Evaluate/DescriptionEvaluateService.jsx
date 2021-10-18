import { usePagination, useQueryUrl } from 'app/hooks';
import CommonEvaluate from 'app/models/CommonEvaluate';
import DevEvaluate from 'app/models/DevEvaluate';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import DescriptionEvaluate from './DescriptionEvaluate';

function DescriptionEvaluateService(props) {
	const [visibleModal, setVisibleModal] = useState(false);

	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');

	function handleModal() {
		setVisibleModal(true);
	}
	const paramId = useParams();
	const id = parseInt(paramId.id, 10) || 0;
	const { content, isFetching, total, configTable, refetch } = usePagination(
		(params) => CommonEvaluate.getListComment(id, params),
		[paramFollow],
	);

	const { data } = useQuery(
		['getDescriptComment', id],
		async () => {
			const res = await DevEvaluate.getOneByIdDev(id);
			return res;
		},
		{
			initialData: {},
		},
	);

	const breadcumb = [
		{
			isName: true,
			name: 'Quản lý HTKH',
			url: '',
		},
		{
			name: 'rating_review',
			url: '/dev-portal/ticket/evaluate',
		},
		{
			name: 'ratingDetail_review',
			url: '',
		},
	];
	return (
		<DescriptionEvaluate
			onModal={handleModal}
			visibleModal={visibleModal}
			setVisibleModal={setVisibleModal}
			evaluateDataSample={content}
			breadcumb={breadcumb}
			content={content}
			isFetching={isFetching}
			total={total}
			dataRating={data}
			configTable={configTable.pagination}
			refetch={refetch}
		/>
	);
}

export default DescriptionEvaluateService;
