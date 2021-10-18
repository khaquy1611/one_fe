/* eslint-disable react/no-danger */
import React from 'react';
import { useLng, useUser } from 'app/hooks';
import { DX, AdminSubscription } from 'app/models';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import WrapDetail from 'app/HOCs/WrapDetail';
import styled from 'styled-components';
import { Form, Input, Card } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';

const CustomCard = styled(Card)`
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;
	.total-row {
		background-color: #fafafa;
	}
`;
const IFRAME = styled.div`
	iframe {
		width: 100%;
		min-height: 100vh;
	}
`;

function EContractDetail({ setHaveError }) {
	const params = useParams();
	const id = parseInt(params.id, 10) || 83;
	const { user } = useUser();
	const { tOthers, tField } = useLng();

	const { data: eContractInfo } = useQuery(
		['getEContractInfo', id],
		async () => {
			const res = await AdminSubscription.getDetailEContract(id);
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

	const iframeHtml = `<iframe   frameBorder="0" src="${
		eContractInfo?.data?.uri || 'http://www.africau.edu/images/default/sample.pdf'
	}" width="540" height="450"></iframe>`;

	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb type="detailEcontract" />
			</div>
			<div className="font-bold text-xl pt-5">Chi tiết hợp đồng</div>
			<br />
			{eContractInfo?.data?.contractNumber ? (
				<div className="w-full mt-4">
					<CustomCard>
						<Form hideRequiredMark layout="vertical">
							<div className="flex gap-8">
								<div className="w-1/3">
									<span className="mr-4">{tField('eContractCode')}</span>&nbsp;
									{eContractInfo?.data?.contractNumber || tOthers('econtractWaittingTitle')}
								</div>
								<div className="w-1/3">
									<span className="mr-4">{tField('eContractName')}</span>&nbsp;
									{eContractInfo?.data?.contractName || tOthers('econtractWaittingTitle')}
								</div>
							</div>
						</Form>
					</CustomCard>
					<br />
					<div className="w-full mt-4">
						<CustomCard>
							{/* <p className="font-medium">{tField('econtractDetail')}</p> */}
							<IFRAME dangerouslySetInnerHTML={{ __html: iframeHtml }} />
						</CustomCard>
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
