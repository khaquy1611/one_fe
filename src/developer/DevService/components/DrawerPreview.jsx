import { ClockCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { PreviewService } from 'app/components/Templates';
import { useLng } from 'app/hooks';
import { LeftIcon } from 'app/icons';
import { DX } from 'app/models';
import { noop } from 'opLodash';
import React from 'react';

function DrawerPreview({ saasInfo, data, desInFo, classToggle, backEdit, type = 'dev', dataEvaluate }) {
	const { tMenu } = useLng();

	const { name, updatedTime } = { ...saasInfo };

	const saasPreview = {
		...data,
		...saasInfo,
		...desInFo,
		shortDescription: desInFo.sapoDescription,
	};

	const breadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'serviceList',
			url: `${type === 'admin' ? DX.admin.createPath('/saas/list') : DX.dev.createPath('/service/list')}`,
		},
		{
			isName: true,
			name,
			url: '',
		},
	];

	return (
		<div className={classToggle}>
			<div className="mb-8 flex justify-between">
				<div>
					<UrlBreadcrumb breadcrumbs={breadcrumb} />
					<div className="flex items-center gap-1 mt-2">
						<ClockCircleOutlined className="mr-1" />
						{tMenu('lastUpdate')}: {DX.formatDate(updatedTime)}
					</div>
				</div>
				<Button type="default" onClick={backEdit}>
					<LeftIcon width="w-2" className="my-auto" /> Quay lại chi tiết dịch vụ
				</Button>
			</div>
			<PreviewService
				dataEvaluate={dataEvaluate}
				dataService={saasPreview}
				onRegister={noop}
				onBuyNow={noop}
				type={type}
			/>
		</div>
	);
}

export default DrawerPreview;
