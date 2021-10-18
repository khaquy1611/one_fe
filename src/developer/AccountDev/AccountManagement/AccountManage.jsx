import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch as SwitchAntd, Form, Modal, Table, Button, Input, Select, Radio } from 'antd';
import { AddUser } from 'app/icons';
import { noop, trim } from 'opLodash';
import {
	validateRequireInput,
	validateEmail,
	validatePhoneNumber,
	validateMaxLengthStr,
	validateRequire,
} from 'app/validator';
import { RoleAdmin, DX } from 'app/models';
import styled from 'styled-components';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import { useQuery } from 'react-query';
import useUser from '../../../app/hooks/useUser';

const { Item } = Form;

function AccountManage({
	columns,
	configTable,
	onModal,
	visibleModal,
	setVisibleModal,
	form,
	onFinish,
	onFinishFailed,
	formLoading,
}) {
	const { tButton, tMessage, tValidation, tField, tMenu, tFilterField } = useLng();
	const { user } = useUser();
	const [isDirty, setDirty] = useState(false);
	const SelectRole = styled(Select)``;
	const nameRef = React.useRef();
	const [isLoginVnpt, setIsLoginVnpt] = useState('0');
	const onChangeLoginVnpt = (e) => {
		setIsLoginVnpt(e.target.value);
		if (visibleModal && nameRef) {
			nameRef.current.focus({
				cursor: 'end',
			});
		}
	};

	const [roles, setRoles] = useState([]);
	useQuery(
		['GetRoleDEV'],
		async () => {
			const res = await RoleAdmin.getAll({ portalType: 'DEV', size: 1000 });
			setRoles(res.content);
			return res;
		},
		{ desValues: [] },
	);

	useEffect(() => {
		setTimeout(() => {
			if (visibleModal && nameRef) {
				nameRef.current.focus({
					cursor: 'end',
				});
			}
		}, 100);
	}, [visibleModal]);

	return (
		<>
			<div className="animate-zoomOut">
				<div className="flex justify-between mb-8">
					<UrlBreadcrumb type="AccountDevManage" />
					{DX.canAccessFuture2('dev/create-sub-dev-account', user.permissions) && (
						<Button
							type="primary"
							onClick={() => {
								onModal();
								setIsLoginVnpt('0');
							}}
						>
							{tButton('opt_add', { field: 'user' })}
						</Button>
					)}
				</div>
				<Table columns={columns.filter((x) => !x.hide)} {...configTable} />
			</div>

			<Modal
				centered
				visible={visibleModal}
				onCancel={() => {
					setVisibleModal(false);
				}}
				footer={null}
				closable={false}
				width={570}
				maskClosable={false}
				bodyStyle={{
					maxHeight: 'calc(100vh - 3rem)',
					overflow: 'auto',
					padding: '2rem',
				}}
			>
				<div className="justify-center flex pt-4">
					<AddUser />
				</div>
				<p className="text-center font-semibold mt-3.5">{tMessage('addNewUser')}</p>
				<p className="text-center text-sm mt-2.5">{tMessage('plsEnterInfo')}</p>
				<Form
					className="px-2 pb-2"
					layout="vertical"
					onFinish={(value) => {
						const rolesData = value.roles.concat(DX.DEV_ROLES).filter((x, i, a) => a.indexOf(x) === i);
						onFinish({ ...value, roles: rolesData });
					}}
					onFinishFailed={onFinishFailed}
					form={form}
					autoComplete="off"
					initialValues={{
						status: 'ACTIVE',
						roles: [],
						createType: '0',
					}}
					onValuesChange={() => !isDirty && setDirty(true)}
				>
					<Form.Item name="createType" onChange={onChangeLoginVnpt} className="text-center">
						<Radio.Group>
							<Radio value="0">{tFilterField('value', 'addOnSystem')}</Radio>
							<Radio value="1">{tFilterField('value', 'alreadyHaveVNPT')}</Radio>
						</Radio.Group>
					</Form.Item>
					{isLoginVnpt === '1' && (
						<Form.Item
							label="TechID"
							type="text"
							name="techId"
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'TechID' })),
								validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
							]}
						>
							<Input maxLength={100} placeholder={tField('opt_enter', { field: 'TechID' })} autoFocus />
						</Form.Item>
					)}
					<Form.Item
						label={tField('lastName')}
						type="text"
						name="lastname"
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' })),
							validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
						]}
					>
						<Input maxLength={20} ref={nameRef} placeholder={tField('opt_enter', { field: 'lastName' })} />
					</Form.Item>

					<Form.Item
						label={tField('firstName')}
						type="text"
						name="firstname"
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' })),
							validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
						]}
					>
						<Input maxLength={20} placeholder={tField('opt_enter', { field: 'firstName' })} />
					</Form.Item>
					<Form.Item
						name="email"
						label={tField('email')}
						type="text"
						normalize={trim}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
							validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
							validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
						]}
					>
						<Input maxLength={100} placeholder={tField('opt_enter', { field: 'email' })} />
					</Form.Item>
					<Form.Item
						name="phoneNumber"
						label={tField('phoneNum')}
						normalize={trim}
						type="text"
						rules={[validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' }))]}
					>
						<Input maxLength={14} placeholder={tField('opt_enter', { field: 'phoneNum' })} />
					</Form.Item>
					<Form.Item
						name="roles"
						label={tField('decentralization')}
						rules={[validateRequire(tValidation('opt_isRequired', { field: 'decentralization' }))]}
					>
						<SelectRole
							mode="multiple"
							placeholder={tField('opt_select', { field: 'decentralization' })}
							showArrow
							options={[
								...roles.map((x) => ({
									value: x.id,
									label: x.displayName,
								})),
							]}
							style={{
								color: '#78909C',
							}}
							showSearch={false}
						/>
					</Form.Item>
					<div className="flex items-center mb-7">
						<span className="mr-4 text-base ">{tField('activeStatus')}</span>
						<Item name="status" valuePropName="checked" className="flex mb-auto">
							<SwitchAntd />
						</Item>
					</div>

					<div className="flex gap-4">
						<Button
							className="uppercase"
							onClick={() => {
								form.resetFields();
								setVisibleModal(false);
								setDirty(false);
							}}
							block
						>
							{tButton('opt_cancel')}
						</Button>
						<Button
							className="uppercase"
							onClick={() => {
								form.submit();
							}}
							block
							type="primary"
							loading={formLoading}
							disabled={!isDirty}
						>
							{tButton('opt_confirm')}
						</Button>
					</div>
				</Form>
			</Modal>
		</>
	);
}
AccountManage.propTypes = {
	columns: PropTypes.arrayOf(PropTypes.object),
	data: PropTypes.arrayOf(PropTypes.object),
	onFinish: PropTypes.func,
	onFinishFailed: PropTypes.func,
	form: PropTypes.instanceOf(Object).isRequired,
	setVisibleModal: PropTypes.bool,
	visibleModal: PropTypes.bool,
	onModal: PropTypes.func,
	onPageChange: PropTypes.func,
	total: PropTypes.number.isRequired,
	page: PropTypes.number.isRequired,
	pageSize: PropTypes.number.isRequired,
	isLoading: PropTypes.bool,
	configTable: PropTypes.objectOf(PropTypes.object),
	formLoading: PropTypes.bool.isRequired,
};
AccountManage.defaultProps = {
	columns: [],
	data: [],
	onFinish: noop,
	onFinishFailed: noop,
	onModal: noop,
	onPageChange: noop,
	setVisibleModal: false,
	visibleModal: false,
	isLoading: false,
	configTable: {},
};

export default AccountManage;
