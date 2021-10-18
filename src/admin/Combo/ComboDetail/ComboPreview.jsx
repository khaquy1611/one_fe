import React from 'react';
import { PreviewService } from 'app/components/Templates';
import { ComboSME, DX } from 'app/models';
import { isArray as _isArray } from 'opLodash';
import WrapDetail from 'app/HOCs/WrapDetail';
import { useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';

function ComboDetail({
	setHaveError,
	formInprogess,
	selectServiceType,
	currentPage,
	statusApprove,
	comboId,
	developerName,
}) {
	const dataFormService = formInprogess.getFieldValue();
	const history = useHistory();
	const { id } = useParams();

	const { data: dataService } = useQuery(
		['getDetailComboAdmin', comboId],
		async () => {
			const res = await ComboSME.getDetailCombo(comboId);
			if (!_isArray(res.language)) {
				res.language = [res.language || '0'];
			}

			return {
				...res,
				externalLinkVideo: res.embedVideoUrl,
				externalLinkIcon: res.embedIconUrl,
				snapshots: res.snapshots,
			};
		},
		{
			initialData: {},
			onError: (e) => {
				e.callbackUrl = DX.sme.createPath('');
				setHaveError(e);
			},
			enabled: !!comboId && !!currentPage && statusApprove === 'APPROVED',
		},
	);
	const category = () => {
		const cate = [];
		for (let i = 0; i < formInprogess.getFieldValue('categories')?.length; i++) {
			for (let j = 0; j < selectServiceType?.length; j++) {
				if (formInprogess.getFieldValue('categories')[i] === selectServiceType[j].value) {
					cate.push(selectServiceType[j].label);
				}
			}
		}
		return cate;
	};

	const snapshotsFormat = () => {
		const snapshots = formInprogess.getFieldValue('snapshots');
		const res = [];

		for (let index = 0; index < snapshots?.length; index++) {
			if (snapshots[index].name && snapshots[index].url) {
				res.push({ priority: index + 1, embedUrl: '', url: snapshots[index]?.url });
			}
			if (snapshots[index].name && !snapshots[index].url) {
				res.push({ priority: index + 1, filePath: '', externalLink: snapshots[index]?.name });
			}
			if (snapshots[index].url && !snapshots[index].name) {
				res.push({ priority: index + 1, embedUrl: '', url: snapshots[index]?.url });
			}
		}

		return res;
	};

	const onRegister = () => {
		history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
	};

	return (
		<div className="w-full">
			<PreviewService
				dataService={
					currentPage
						? dataService
						: {
								category: category(),
								phoneNumber: dataFormService?.phoneSupport,
								email: dataFormService?.emailSupport,
								icon: dataFormService?.icon[0]?.url,
								shortDescription: dataFormService?.shortDescription,
								description: dataFormService?.description,
								snapshots: snapshotsFormat(),
								video: dataFormService?.video[0]?.url,
								name: dataFormService?.name,
								developerName,
								location: dataFormService?.addressSupport,
						  }
				}
				type="admin"
				typeScreen="COMBO"
				idPreUrl={comboId}
				onRegister={onRegister}
			/>
		</div>
	);
}

export default WrapDetail(ComboDetail);
