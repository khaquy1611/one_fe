import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Switch, Button } from 'antd';
import { noop } from 'opLodash';
import { Link } from 'react-router-dom';
import { DX } from 'app/models';
import { useUser } from 'app/hooks';

function ConfigManageItem({ conf, stopDropdown, handleChangeConfigItem, indexItem, disabled, isCommon }) {
	const { user } = useUser();
	const CAN_VIEW_EMAIL = DX.canAccessFuture2('admin/view-email-template', user.permissions);
	return (
		<>
			<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="mb-6">
				<Col className="gutter-row" span={9}>
					<p className="text-base">{conf.actionName}</p>
				</Col>
				<Col className="gutter-row" span={6}>
					<p className="text-base">{conf.receiver}</p>
				</Col>
				<Col className="gutter-row" span={3} onClick={stopDropdown}>
					{!isCommon && (
						<Switch
							checked={conf.isSendEmail === 'ON'}
							onClick={() => {
								handleChangeConfigItem(indexItem, 'isSendEmail');
							}}
							disabled={conf.allowChangeEmail === 'A' || conf.allowChangeEmail === 'D' || disabled}
						/>
					)}
					{CAN_VIEW_EMAIL && conf.actionCode && (
						<Link
							className={!isCommon ? '' : 'ml-10'}
							to={DX.admin.createPath(`/general-management/email-config/${conf.actionCode}`)}
							disabled={disabled}
						>
							<Button type="link">Mẫu</Button>
						</Link>
					)}
				</Col>
				<Col className="gutter-row" span={3} onClick={stopDropdown}>
					{!isCommon && (
						<Switch
							checked={conf.isSendSms === 'ON'}
							onClick={() => {
								handleChangeConfigItem(indexItem, 'isSendSms');
							}}
							disabled={conf.allowChangeSMS === 'A' || conf.allowChangeSMS === 'D' || disabled}
						/>
					)}
				</Col>
				<Col className="gutter-row" span={3} onClick={stopDropdown}>
					{!isCommon && (
						<Switch
							checked={conf.isNotification === 'ON'}
							onClick={() => {
								handleChangeConfigItem(indexItem, 'isNotification');
							}}
							disabled={conf.allowChangeNotif === 'A' || conf.allowChangeNotif === 'D' || disabled}
						/>
					)}
				</Col>
			</Row>
		</>
	);
}
ConfigManageItem.propTypes = {
	conf: PropTypes.objectOf(PropTypes.object),
	stopDropdown: PropTypes.func,
	handleChangeConfigItem: PropTypes.func,
	indexItem: PropTypes.number.isRequired,
};
ConfigManageItem.defaultProps = {
	conf: {},
	stopDropdown: noop,
	handleChangeConfigItem: noop,
};
export default ConfigManageItem;
