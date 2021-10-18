import { Pagination, Rate } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { Evaluate } from 'app/CommonEvaluation';
import CommentItem from 'app/CommonEvaluation/CommentItem';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { isInt } from 'app/validator';
import React from 'react';

function DescriptionEvaluate({ evaluateDataSample, breadcumb, dataRating = {}, total, configTable, refetch }) {
	const hidden = evaluateDataSample.length === 0 && dataRating.avgRating !== 0;
	const hiddenRating = dataRating.avgRating === 0;
	return (
		<>
			<div className="max-w-6xl">
				<UrlBreadcrumb breadcrumbs={breadcumb} />
				<div className="flex items-center gap-3 mt-5 mb-5">
					<Avatar
						shape="square"
						src={dataRating.icon || dataRating.externalLinkIcon || ''}
						className="mr-2"
						style={{
							minWidth: '2rem',
						}}
					/>

					<div className="font-bold max-w-xs truncate ...">{dataRating.serviceName}</div>
					{!hiddenRating && (
						<div>
							<Rate
								disabled
								value={isInt(dataRating.avgRating)}
								allowHalf
								className="text-base ml-9 mr-2"
								style={{ color: '#F4BF1B' }}
							/>{' '}
							<span>({dataRating.ratingQuantity})</span>
						</div>
					)}
				</div>

				{dataRating.ratingQuantity !== 0 ? (
					<>
						<Evaluate data={dataRating} title="Đánh giá" typeTitle="dev" />
						<div className="font-semibold mb-2 mt-8">Nhận xét chi tiết</div>
						{!hidden ? (
							<div>
								{evaluateDataSample.map((item) => (
									<CommentItem type="dev" data={item} refetch={refetch} />
								))}
							</div>
						) : (
							<div>Chưa có nhận xét nào</div>
						)}
					</>
				) : (
					<>
						<div className="font-semibold">Đánh giá</div>
						<div>Chưa có đánh giá nào</div>
					</>
				)}
			</div>
			{total > 10 && (
				<div>
					<Pagination {...configTable} className="mt-8  flex justify-center" />
				</div>
			)}
		</>
	);
}

export default DescriptionEvaluate;
