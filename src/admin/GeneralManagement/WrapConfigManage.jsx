import React from 'react';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { Col, Row } from 'antd';
import { useQuery } from 'react-query';
import Notice from 'app/models/Notification';
import { DX } from 'app/models';
import ConfigManage from 'admin/GeneralManagement/components/ConfigManage';
import useUser from '../../app/hooks/useUser';

function WrapConfigManage() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-notification-config', user.permissions);

	const stopDropdown = (event) => {
		event.stopPropagation();
	};

	const { data, refetch } = useQuery(['getConfigNoticeToAdmin'], async () => {
		const res = await Notice.getConfigNoticeToAdmin(DX.admin.role, {});
		return res;
	});
	// const comonConfig = {
	// 	action: [
	// 		{
	// 			actionId: 941,
	// 			actionName: 'Header',
	// 		},
	// 		{
	// 			actionId: 942,
	// 			actionName: 'Footer',
	// 		},
	// 	],
	// 	actionId: 940,
	// 	actionName: 'Thông tin chung',
	// };
	return (
		<>
			<div>
				<div className="flex items-center justify-between mb-5">
					<UrlBreadcrumb type="generalManage" />
				</div>
			</div>
			<div className="max-w-7xl">
				<div className="pl-4 py-3 pr-10">
					<Row
						gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
						className="text-base font-semibold text-black opacity-40"
					>
						<Col className="gutter-row" span={9}>
							<p>Hành động</p>
						</Col>
						<Col className="gutter-row" span={6}>
							<p>Người nhận</p>
						</Col>
						<Col className="gutter-row" span={3}>
							<p>Gửi Email</p>
						</Col>
						<Col className="gutter-row" span={3}>
							<p>Gửi SMS</p>
						</Col>
						<Col className="gutter-row" span={3}>
							<p>Gửi thông báo</p>
						</Col>
					</Row>
				</div>
				{/* <ConfigManage
					stopDropdown={stopDropdown}
					item={comonConfig}
					key={comonConfig.actionId}
					index={994}
					disabled={!CAN_UPDATE}
					isCommon
				/> */}
				{data?.map((item, index) => (
					<ConfigManage
						stopDropdown={stopDropdown}
						item={item}
						key={item.actionId}
						index={index}
						refetch={refetch}
						disabled={!CAN_UPDATE}
					/>
				))}
			</div>
		</>
	);
}
export default WrapConfigManage;
