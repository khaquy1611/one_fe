import React, { useState } from 'react';
import { Col, Form, Tag } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { DevCombo, CategoryPortal, DX, SaasAdmin } from 'app/models';
import { useQuery } from 'react-query';
import { useLng, useQueryUrl } from 'app/hooks';
import { useHistory, useParams } from 'react-router-dom';
import InforBasic from '../InforBasic';

export default function HistoryDetailDev(portal) {
	const { id, historyId } = useParams();
	const [form] = Form.useForm();
	const history = useHistory();
	const { tFilterField, tMenu } = useLng();

	console.log(historyId);
	const { data: initValues } = useQuery(
		['getComboHistory', historyId],
		async () => {
			const res = await DevCombo.getDetailComboByComboId(historyId);
			res.categories = res.categories?.map((e) => e.id);
			if (res.snapshots != null && res.snapshots.length > 0) {
				res.snapshots = res.snapshots.sort((itemFirst, itemSecond) => {
					if (itemFirst.priority < itemSecond.priority) return -1;
					if (itemFirst.priority > itemSecond.priority) return 1;
					return 0;
				});
				res.snapshots = res.snapshots.map((item) => ({
					name: item.fileNameSnapShot,
					url: item.url || item.embedUrl,
					uid: item.id,
					fileSize: item.fileSize || 0,
				}));
			} else {
				res.snapshots = [];
			}
			const avatarLs = [];
			const videoList = [];

			if (res.icons) {
				const icon = {
					name: res.icons.fileNameIcon,
					url: res.icons.icon || res.icons.iconEmbedUrl,
					uid: res.icons.idIcon,
				};
				avatarLs.push(icon);
			}
			if (res.videos && res.videos != null) {
				const video = {
					name: res.videos.fileNameVideo,
					url: res.videos.video || res.videos.videoEmbedUrl,
					uid: res.videos.idVideo,
					thumbUrl: '/images/fileUpload.svg',
				};
				videoList.push(video);
			}
			res.icon = avatarLs;
			res.video = videoList;
			res.countGetData = (initValues.countGetData || 0) + 1;
			return res;
		},
		{
			initialData: {},
			enabled: !!historyId,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
			countGetData: 0,
		},
	);
	const { data: selectServiceType } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			return res.map((e) => ({
				label: e.name,
				value: e.id,
			}));
		},
		{
			initialData: [],
		},
	);

	const tagApproveInfo = SaasAdmin.tagStatus[initValues.approvedStatus] || {};
	const { version } = initValues;
	const breadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'comboList',
			url: '/dev-portal/combo',
		},
		{
			isName: true,
			name: initValues.name,
			url: !historyId ? '' : DX.dev.createPath(`/combo/${id}`),
		},
		{
			isName: true,
			name: `${version ? `${tMenu('version')} ${version}` : ''}`,
		},
	];

	const goBack = () => {
		history.push(DX.dev.createPath(`/combo/${id}?tab=4`));
	};

	return (
		<div>
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={breadcrumb} />
			</div>
			<div className="my-5">
				<span className="text-xl font-semibold">{initValues.name || 'This is coupon name'}</span>
				<span className="font-medium ml-3">
					<Tag color={tagApproveInfo?.color}>
						{tFilterField('approvalStatusOptions', tagApproveInfo?.text)}
					</Tag>
				</span>
			</div>
			<Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={20}>
				<InforBasic
					data={initValues}
					formEdit={form}
					selectServiceType={selectServiceType}
					portal={portal}
					goBack={goBack}
					disabled
				/>
			</Col>
		</div>
	);
}
