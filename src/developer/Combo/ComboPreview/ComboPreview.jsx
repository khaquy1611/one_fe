import React from 'react';
import PropTypes from 'prop-types';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { DX } from 'app/models';
import { Button } from 'antd';
import { PreviewService } from 'app/components/Templates';

function ComboPreview({ dataCommonPreview, approveProduct, backEdit }) {
	const onChange = () => {
		backEdit();
	};
	const breadcrumb = [
		{
			name: 'Commbo dịch vụ',
			url: '',
		},
		{
			name: 'Danh sách Combo dịch vụ',
			url: '/dev-portal/combo/list/',
		},
		{
			name: `${dataCommonPreview?.name || ''}`,
			url: '',
		},
	];

	const changeText =
		dataCommonPreview?.status === 'APPROVED' ||
		dataCommonPreview?.status === 'REJECTED' ||
		dataCommonPreview?.status === 'AWAITING_APPROVAL';

	return (
		<div className={` w-full pb-16`}>
			<div className="mt-5 mb-7 flex justify-between">
				<div className="justify-between">
					<UrlBreadcrumb breadcrumbs={breadcrumb} />
					<div className="flex items-center gap-1 mt-2">
						<ClockCircleOutlined />
						<p>Cập nhật cuối: {DX.formatDate(dataCommonPreview?.updatedTime)}</p>
					</div>
				</div>

				<div className="">
					<Button type="default" className="h-9" onClick={onChange}>
						{changeText ? (
							<span>Xem chi tiết</span>
						) : (
							<div>
								<EditOutlined />
								<span>Chỉnh sửa</span>
							</div>
						)}
					</Button>

					<Button
						type="primary"
						className="ml-3 h-9"
						onClick={() => approveProduct('previewApprove')}
						disabled={dataCommonPreview?.status !== 'UNAPPROVED'}
					>
						Yêu cầu phê duyệt
					</Button>
				</div>
			</div>
			<PreviewService dataService={dataCommonPreview} type="dev" typePreview="combo" />
		</div>
	);
}

export default ComboPreview;
