import { Avatar, Button, Select, Tag, Tooltip } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { InfoIcon } from 'app/icons';
import { DX, TicketAdmin } from 'app/models';
import { React } from 'react';

function SupportHeader({
	className,
	support,
	closeTicket,
	options,
	searchName,
	setSearchName,
	isCheckRole,
	onSelectEmployee,
}) {
	const { user } = useUser();
	const { tOthers, tMenu, tButton, tFilterField } = useLng();
	const convertCloseTag = (value) => {
		let temp = '';
		switch (value) {
			case 'ADMIN':
				temp = tOthers('admin');
				break;
			case 'DEVELOPER':
				temp = tOthers('dev');
				break;
			default:
				temp = tOthers('sme');
				break;
		}
		return temp;
	};
	return (
		<div className={className}>
			<div className="flex mb-4">
				<div>
					<Avatar shape="square" size={32} src={support.icon} />
				</div>
				<div className="ml-3 text-2xl font-bold flex-auto">{support.serviceName}</div>
				<div>
					{!isCheckRole
						? support.status === TicketAdmin.tagStatus.IN_PROGRESS.value &&
						  DX.canAccessFuture2('dev/close-ticket', user.permissions) && (
								<Button
									type="primary"
									htmlType="button"
									className="w-max px-4"
									onClick={() => {
										closeTicket();
									}}
								>
									{tButton('closeTicket')}
								</Button>
						  )
						: (support.status === TicketAdmin.tagStatus.IN_PROGRESS.value ||
								support.status === TicketAdmin.tagStatus.OPEN.value) &&
						  DX.canAccessFuture2('admin/close-ticket', user.permissions) && (
								<Button
									type="primary"
									htmlType="button"
									className="w-max px-4"
									onClick={() => {
										closeTicket();
									}}
								>
									{tButton('closeTicket')}
								</Button>
						  )}

					<div
						className="text-right text-gray-500"
						style={{
							display:
								support.updatedRole && support.status === TicketAdmin.tagStatus.RESOLVED.value
									? 'block'
									: 'none',
						}}
					>
						{tOthers('payer')}: {support.updatedName} ({convertCloseTag(support.updatedRole)})
						<br />
						{tOthers('time')}: {support.updatedTime}
					</div>
				</div>
			</div>

			<div className="mb-8">
				<div className="flex flex-wrap lg:flex-nowrap gap-8 lg:gap-16">
					<div className="flex flex-col">
						<div className="mb-2">{tMenu('status')}</div>

						<Tag color={TicketAdmin.tagStatus[support.status]?.color}>
							{tFilterField('value', TicketAdmin.tagStatus[support.status]?.text)}
						</Tag>
					</div>
					<div className="flex flex-col">
						<div className="mb-2">{tMenu('smeName')}</div>
						<Tooltip placement="topLeft" title={support.smeName}>
							<div className="font-semibold w-40 truncate">{support.smeName}</div>
						</Tooltip>
					</div>
					<div className="flex flex-col">
						<div className="mb-2">{tMenu('dev')}</div>
						<Tooltip placement="topLeft" title={support.developerName}>
							<span className="font-semibold w-40 truncate">{support.developerName}</span>
						</Tooltip>
					</div>
					<div className="xl:w-5/12">
						<div className="mb-2">{tMenu('supportStaff')}</div>
						<div>
							{DX.canAccessFuture2('admin/assign-ticket', user.permissions) &&
							support.status !== TicketAdmin.tagStatus.RESOLVED.value ? (
								<Select
									showSearch
									allowClear
									searchValue={searchName}
									// className="w-72"
									placeholder="Chọn nhân viên hỗ trợ"
									onSearch={setSearchName}
									value={support.supporterId}
									onSelect={(value, option) => onSelectEmployee(option)}
									filterOption={false}
									options={options}
								/>
							) : (
								<Tag color="default">{support.supporterName}</Tag>
							)}
						</div>
						{support.sameProvince === 'NO' && (
							<div className="flex items-center mt-2.5">
								<span className="mr-2.5">
									<InfoIcon width="w-6" className="text-yellow-500" />
								</span>
								<div className="text-yellow-500">
									Nhân viên {support.supporterName} đã chuyển sang tỉnh thành khác.
									<br className="xl:block hidden" /> Đề nghị đổi nhân viên hỗ trợ.
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
export default SupportHeader;
