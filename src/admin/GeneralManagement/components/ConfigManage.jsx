import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Collapse, Row, Switch } from 'antd';
import { noop } from 'opLodash';
import ConfigManageItem from 'admin/GeneralManagement/components/ConfigManageItem';
import Notice from 'app/models/Notification';

const { Panel } = Collapse;

const disableType = (type) => ['A', 'D'].includes(type);
const itemIsDisableType = (item, type) => item.action.every((el) => disableType(el[type]));
function ConfigManage({ stopDropdown, item, index, disabled, isCommon }) {
	const [configItems, setConfigItems] = useState(item.action);
	const [configParentNotice, setConfigParentNotice] = useState({
		isSendEmail: item.action.some((el) => el.isSendEmail === 'ON'),
		isDisableEmail: itemIsDisableType(item, 'allowChangeEmail'),
		isSendSms: item.action.some((el) => el.isSendSms === 'ON'),
		isDisableSms: itemIsDisableType(item, 'allowChangeSMS'),
		isNotification: item.action.some((el) => el.isNotification === 'ON'),
		isDisableNotify: itemIsDisableType(item, 'allowChangeNotif'),
	});

	const handleChangeConfigAll = async (field, fieldType) => {
		try {
			// Chọn trạng thái muốn thay đổi
			const newStatus = configParentNotice[field] ? 'OFF' : 'ON';
			// Gọi api cập nhật trạng thái
			const res = await Notice.updateConfigNoticeToAdmin(item.actionId, {
				isSendEmail: null,
				isSendSms: null,
				isNotification: null,
				[field]: newStatus,
			});
			// Cập nhật trạng thái nút switch
			setConfigParentNotice({
				...configParentNotice,
				[field]: newStatus === 'ON',
			});
			// Cập nhật trạng thái các field theo trạng thái nút switch
			setConfigItems([
				...configItems.map((el) => {
					if (!disableType(el[fieldType])) {
						return { ...el, [field]: newStatus };
					}
					return el;
				}),
			]);
			return res;
		} catch (error) {
			return null;
		}
	};

	const handleChangeConfigItem = async (indexItem, field) => {
		try {
			const { actionId, isSendEmail, isSendSms, isNotification } = configItems[indexItem];
			const newStatus = configItems[indexItem][field] === 'ON' ? 'OFF' : 'ON';
			const res = await Notice.updateConfigNoticeToAdmin(actionId, {
				isSendEmail,
				isSendSms,
				isNotification,
				[field]: newStatus,
			});
			configItems[indexItem][field] = newStatus;
			setConfigParentNotice({
				...configParentNotice,
				[field]: configItems.some((el) => el[field] === 'ON'),
			});
			setConfigItems([...configItems]);
			return res;
		} catch (error) {
			return null;
		}
	};
	const { isDisableEmail, isDisableSms, isDisableNotify } = configParentNotice;

	return (
		<Collapse expandIconPosition="right" className="bg-white mb-4">
			<Panel
				header={
					<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
						<Col className="gutter-row" span={9}>
							<p className="font-semibold text-base">{item.actionName}</p>
						</Col>
						<Col className="gutter-row" span={6} />
						<Col className="gutter-row cursor-default" span={3} onClick={stopDropdown}>
							{!isCommon && (
								<Switch
									checked={configParentNotice.isSendEmail}
									onClick={() => handleChangeConfigAll('isSendEmail', 'allowChangeEmail')}
									disabled={isDisableEmail || disabled}
									className="laptop:ml-1 ml-0"
								/>
							)}
						</Col>
						<Col className="gutter-row cursor-default" span={3} onClick={stopDropdown}>
							{!isCommon && (
								<Switch
									checked={configParentNotice.isSendSms}
									onClick={() => handleChangeConfigAll('isSendSms', 'allowChangeSMS')}
									disabled={isDisableSms || disabled}
									className="laptop:ml-1 ml-0"
								/>
							)}
						</Col>
						<Col className="gutter-row cursor-default" span={3} onClick={stopDropdown}>
							{!isCommon && (
								<Switch
									checked={configParentNotice.isNotification}
									onClick={() => handleChangeConfigAll('isNotification', 'allowChangeNotif')}
									disabled={isDisableNotify || disabled}
									className="laptop:ml-1 ml-0"
								/>
							)}
						</Col>
					</Row>
				}
				extra={() => {}}
			>
				<div className="pr-6">
					{configItems.map((conf, indexItem) => (
						<ConfigManageItem
							stopDropdown={stopDropdown}
							key={conf.actionId}
							conf={conf}
							indexItem={indexItem}
							handleChangeConfigItem={handleChangeConfigItem}
							disabled={disabled}
							isCommon={isCommon}
						/>
					))}
				</div>
			</Panel>
		</Collapse>
	);
}
ConfigManage.propTypes = {
	stopDropdown: PropTypes.func,
	item: PropTypes.objectOf(PropTypes.object).isRequired,
	index: PropTypes.number.isRequired,
};
ConfigManage.defaultProps = {
	stopDropdown: noop,
};

export default ConfigManage;
