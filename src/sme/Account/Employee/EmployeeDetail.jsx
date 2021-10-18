import React, { useState } from 'react';
import { Breadcrumb, Button, Col, Form, Input, message, Row, Select, Switch, Tag } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { Users, DX, RoleAdmin } from 'app/models';
import { Link, useParams } from 'react-router-dom';
import { UploadAvatar } from 'app/components/Atoms';
import { validateRequireInput, validatePhoneNumber, validateEmail, validateMaxLengthStr } from 'app/validator';
import { trim } from 'opLodash';
import { useNavigation, useLng, useUser } from 'app/hooks';

function EmployeeDetail() {
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { id } = useParams();
	const [isStatus, setStatus] = useState(false);
	const { goBack } = useNavigation();
	const { tMessage, tValidation, tField, tButton } = useLng();
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('sme/update-sub-sme-account', user.permissions);
	const CAN_CHANGE_STATUS = DX.canAccessFuture2('sme/change-status-sub-sme-account', user.permissions);
	const [roles, setRoles] = useState([]);
	useQuery(
		['GetRoleSME'],
		async () => {
			const res = await RoleAdmin.getAll({ portalType: 'SME', size: 1000 });
			setRoles(res.content);
			return res;
		},
		{ desValues: [] },
	);
	const { refetch, data: userInfor } = useQuery(
		['getEmployeeInfor', id],
		async () => {
			const res = await Users.getEmployeeInforByID(id);
			res.avatar = res.avatar != null ? { filePath: res.avatar } : res.avatar;
			// TODO : remove fixed role
			res.roles = res.roles.map((x) => x.id).filter((x) => !DX.SYSTEM_ROLES.includes(x));

			if (res.status === 'ACTIVE') {
				res.status = true;
				setStatus(true);
			} else {
				res.status = false;
			}
			form.setFieldsValue(res);
			return res;
		},
		{
			initialData: [],
		},
	);
	const isTechId = userInfor?.techId;
	const updateAccountMutation = useMutation(Users.updateEmployeeInforById, {
		onSuccess: () => {
			setDirty(false);
			refetch();
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
			goBack(DX.sme.createPath('/account/employee'));
		},
		onError: (e) => {
			if (e.errorCode === 'exists' && e.field === 'email') {
				form.setFields([
					{
						name: 'email',
						errors: [tValidation('opt_isDuplicated', { field: 'email' })],
					},
				]);
			} else if (e.errorCode === 'exists' && e.field === 'phoneNumber') {
				form.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else if (e.errorCode === 'error.user.techId') {
				form.setFields([
					{
						name: 'techId',
						errors: [tValidation('opt_isDuplicated', { field: 'TechID' })],
					},
				]);
			}
		},
	});

	function showPromiseUpdateConfirm(values) {
		updateAccountMutation.mutate({ id, values });
	}

	function onFinish(values) {
		const data = { ...values };
		data.status = data.status ? 'ACTIVE' : 'INACTIVE';
		data.avatar = data.avatar?.id;
		if (data.avatar == null) {
			delete data.avatar;
		}
		showPromiseUpdateConfirm({
			...data,
			lastname: trim(data.lastname),
			firstname: trim(data.firstname),
		});
	}

	function tagRender(props) {
		const { label, value, closable, onClose } = props;
		const onPreventMouseDown = (event) => {
			event.preventDefault();
			event.stopPropagation();
		};
		if (!roles.map((x) => x.id).includes(value)) {
			return null;
		}
		return (
			<Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
				{label}
			</Tag>
		);
	}

	return (
		<>
			<Breadcrumb className="mb-3">
				<Breadcrumb.Item>
					<Link to={DX.sme.createPath('/account/employee')}>Quản lý tài khoản nhân viên </Link>
				</Breadcrumb.Item>
				<Breadcrumb.Item>Chi tiết nhân viên</Breadcrumb.Item>
			</Breadcrumb>
			<Form
				layout="vertical"
				onValuesChange={() => !isDirty && setDirty(true)}
				onFinish={(value) => {
					const rolesData = value.roles.concat(DX.SME_ROLES).filter((x, i, a) => a.indexOf(x) === i);
					onFinish({ ...value, roles: rolesData });
				}}
				form={form}
				initialValues={{
					...userInfor,
				}}
				className="max-w-2xl mx-auto"
			>
				<div className="flex justify-center w-full">
					<Form.Item name="avatar">
						<UploadAvatar circle isSme disabled={!CAN_UPDATE} />
					</Form.Item>
				</div>
				{isTechId && (
					<Row gutter={24}>
						<Col span={24}>
							<Form.Item
								label="TechID"
								name="techId"
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'TechID' })),
									validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
								]}
							>
								<Input maxLength={100} disabled={!CAN_UPDATE} />
							</Form.Item>
						</Col>
					</Row>
				)}
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('lastName')}
							name="lastname"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' }))]}
						>
							<Input maxLength={20} autoFocus disabled={!CAN_UPDATE} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('firstName')}
							name="firstname"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' }))]}
						>
							<Input maxLength={20} disabled={!CAN_UPDATE} />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('phoneNum')}
							name="phoneNumber"
							normalize={trim}
							rules={[
								validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
							]}
						>
							<Input maxLength={14} disabled={!CAN_UPDATE} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('email')}
							name="email"
							disabled
							normalize={trim}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
								validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
							]}
						>
							<Input maxLength={100} disabled={!CAN_UPDATE} />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item name="roles" label={tField('decentralization')}>
					<Select
						mode="multiple"
						showArrow
						placeholder={tField('opt_select', { field: 'role' })}
						options={[
							...roles.map((x) => ({
								value: x.id,
								label: x.displayName,
							})),
						]}
						tagRender={tagRender}
						showSearch={false}
						disabled={!CAN_UPDATE}
					/>
				</Form.Item>
				<div className="flex items-center justify-between mb-7 ">
					<span className="text-base font-medium">{tField('activeStatus')}</span>
					<Form.Item name="status" className="flex mb-auto">
						<Switch disabled={!CAN_CHANGE_STATUS} checked={isStatus} onClick={() => setStatus(!isStatus)} />
					</Form.Item>
				</div>
				<div className="text-right">
					<Button onClick={() => goBack(DX.sme.createPath('/account/employee'))} type="default">
						{tButton('opt_back')}
					</Button>
					{(CAN_UPDATE || CAN_CHANGE_STATUS) && (
						<Button type="primary" htmlType="submit" className=" ml-4" disabled={!isDirty}>
							{tButton('opt_confirm')}
						</Button>
					)}
				</div>
			</Form>
		</>
	);
}
EmployeeDetail.propTypes = {};

export default EmployeeDetail;
