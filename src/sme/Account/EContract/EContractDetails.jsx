/* eslint-disable react/no-danger */
import React from 'react';
import { PreviewService } from 'app/components/Templates';
import { useLng, useQueryUrl, useUser } from 'app/hooks';
import { DX, SMESubscription, SmeService, ComboSME } from 'app/models';
import { isArray as _isArray } from 'opLodash';
import { useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import SmeEvaluate from 'app/models/SmeEvaluate';
import CommonEvaluate from 'app/models/CommonEvaluate';
import WrapDetail from 'app/HOCs/WrapDetail';
import styled from 'styled-components';
import { Rate, Tooltip, Button, Form, Input, Popover } from 'antd';
import { isInt } from 'app/validator';
import { UserGroupIcon } from 'app/icons';

const Title = styled.h3`
	font-size: 1.625rem;
	color: #263238;
`;

const IFRAME = styled.div`
	iframe {
		width: 100%;
		min-height: 100vh;
	}
`;

const TagCareer = styled.div`
	border-radius: 8px;
	color: var(--color-primary);
	padding: 0.25rem 0.75rem;
	background-color: #eaecf4;
`;

function EContractDetail({ setHaveError }) {
	const params = useParams();
	const id = parseInt(params.id, 10) || 83;
	const { user } = useUser();
	const queryUrl = useQueryUrl();
	const paramFollow = queryUrl.get('notif_id');
	const { tButton, tOthers, tField } = useLng();

	const { data: eContractInfo } = useQuery(
		['getEContractInfo', id],
		async () => {
			const res = await SMESubscription.getDetailEContract(id);
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

	const { data: dataService } = useQuery(
		['getDataService', eContractInfo, eContractInfo.serviceId, eContractInfo.subscriptionType],
		async () => {
			if (!eContractInfo || !eContractInfo.serviceId) return [];
			// "Loại subscription service = 1 | combo = 2"
			let res;
			if (eContractInfo.subscriptionType === 1) {
				res = await SmeService.getServicesByCategoryId({ id: eContractInfo.serviceId });
			} else {
				res = await ComboSME.getDetailCombo(eContractInfo.serviceId);
			}
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

	const { data: dataEvaluate } = useQuery(
		['getDataEvaluate', eContractInfo, eContractInfo.serviceId, paramFollow, eContractInfo.subscriptionType],
		async () => {
			let res;
			if (!eContractInfo || !eContractInfo.serviceId || eContractInfo.subscriptionType === 2) return [];
			if (user.roles.length > 0) {
				res = await SmeEvaluate.getServiceDetailSme(eContractInfo.serviceId);
			} else {
				res = await CommonEvaluate.getEvalutionService(eContractInfo.serviceId);
			}

			return res;
		},
		{
			initialData: {},
		},
	);
	const { icon, altAvatar, name, developerName, shortDescription, category } = dataService;

	const iframeHtml = `<iframe   frameBorder="0" src="${
		eContractInfo?.data?.uri || 'http://www.africau.edu/images/default/sample.pdf'
	}" width="540" height="450"></iframe>`;
	const goToEcontract = () => {
		if (eContractInfo?.data?.contractNumber) {
			window.open(
				`https://hopdong-demo.vnptit3.vn/webview/contracts/manage?contractId=${
					eContractInfo?.data?.contractId || 'e2991810-1930-481c-95c9-bdeadee18d65'
				}`,
			);
		} else {
			window.open('https://hopdong-demo.vnptit3.vn/webview/contracts/manage');
		}
	};
	function renderCategory(view) {
		let categories = [];
		if (typeof category === 'string') {
			categories.push(category);
		} else {
			categories = category;
		}

		if (view === 'ALL')
			return categories
				.slice(2)
				.map((c) => (
					<TagCareer className="block rounded-md text-primary text-sm font-medium mr-2 mb-2">{c}</TagCareer>
				));

		return categories
			.slice(0, 2)
			.map((c) => (
				<TagCareer className="inline-block rounded-md text-primary text-sm font-medium mr-2 mb-2">
					{c}
				</TagCareer>
			));
	}
	return (
		<div>
			<div className={`flex -mx-4 relative `}>
				<div className="rounded-3xl overflow-hidden mx-4" style={{ width: '16.875rem', height: '16.875rem' }}>
					<img src={icon} alt={altAvatar} className="w-full h-full object-cover" />
				</div>
				<div className="w-2/3 px-4">
					<Title className="font-bold mb-3 mr-16 line-clamp-1">{name}</Title>

					{dataEvaluate?.ratingQuantity !== 0 && dataEvaluate?.ratingQuantity ? (
						<div className="mb-4 flex items-center">
							<Rate
								allowHalf
								disabled
								value={isInt(dataEvaluate?.avgRating)}
								className="text-base"
								style={{ color: '#F4BF1B' }}
							/>
							<span className="ml-2 text-gray-350">{dataEvaluate?.ratingQuantity}</span>
						</div>
					) : (
						''
					)}
					<Tooltip placement="bottomLeft" title={name}>
						<div className="mb-6 mr-16 font-medium line-clamp-1">
							<UserGroupIcon width="w-4" className="inline-block mr-2" />
							{developerName}
						</div>
					</Tooltip>

					<div
						className="mb-6 line-clamp-3 mr-16 font-medium"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{ __html: shortDescription }}
					/>

					{category && renderCategory()}
					{typeof category !== 'string' && category?.length > 2 && (
						<Popover placement="bottom" content={renderCategory('ALL')}>
							<TagCareer className="inline-block rounded-md text-primary text-sm font-medium mb-2 cursor-pointer">
								+{category.length - 2} ...
							</TagCareer>
						</Popover>
					)}
				</div>
				{/* <div className="absolute right-4 top-0">
					<Button
						type="primary"
						className="uppercase font-semibold "
						onClick={() => {
							goToEcontract();
						}}
					>
						{tButton('opt_edit', { field: 'econtract' })}
					</Button>
				</div> */}
			</div>
			{eContractInfo?.data?.contractNumber ? (
				<div className="w-full mt-4">
					<Form hideRequiredMark layout="vertical">
						<div className="flex gap-8">
							<div className="w-1/3">
								<Form.Item label={tField('eContractCode')}>
									<Input
										disabled
										value={eContractInfo?.data?.contractNumber || tOthers('econtractWaittingTitle')}
									/>
								</Form.Item>
							</div>
							<div className="w-1/3">
								<Form.Item label={tField('eContractName')}>
									<Input
										disabled
										value={eContractInfo?.data?.contractName || tOthers('econtractWaittingTitle')}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
					<div className="w-full mt-4">
						<p className="font-medium">{tField('econtractDetail')}</p>
						<IFRAME dangerouslySetInnerHTML={{ __html: iframeHtml }} />
					</div>
				</div>
			) : (
				<div className="w-full text-center mt-4">
					<p>{tOthers('econtractWaitting')} </p>
				</div>
			)}
		</div>
	);
}

export default WrapDetail(EContractDetail);
