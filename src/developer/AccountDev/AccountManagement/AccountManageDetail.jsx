import { Button, Col, Form, Input, message, Row, Select, Switch, Tag } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useNavigation, useUser } from 'app/hooks';
import { DX, RoleAdmin, Users } from 'app/models';
import {
	validateEmail,
	validateMaxLengthStr,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
} from 'app/validator';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

function AccountManageDetail() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('dev/update-sub-dev-account', user.permissions);
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { id } = useParams();
	const [isStatus, setStatus] = useState(false);
	const { goBack } = useNavigation();
	const { tButton, tMessage, tValidation, tField, tOthers } = useLng();

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

	const { refetch, data: userInfor } = useQuery(
		['getEmployeeInfor'],
		async () => {
			const res = await Users.getInfoAccountByDevAdmin(id);
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
	const updateAccountMutation = useMutation(Users.updateAccountByDevAdmin, {
		onSuccess: () => {
			setDirty(false);
			message.success(tMessage('opt_successfullyUpdated'));
			goBack(DX.dev.createPath('/account/account_manage'));
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

	function showPromiseUpdateConfirm(data) {
		updateAccountMutation.mutate({ id, data });
	}

	function onFinish(values) {
		const data = { ...values };
		data.createType = data.techId ? 'EXTERNAL' : 'INTERNAL';
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
			<Form
				layout="vertical"
				onValuesChange={() => !isDirty && setDirty(true)}
				onFinish={(value) => {
					const rolesData = value.roles.concat(DX.DEV_ROLES).filter((x, i, a) => a.indexOf(x) === i);
					onFinish({ ...value, roles: rolesData });
				}}
				className="text-base max-w-7xl mx-auto"
				form={form}
				autoComplete="off"
				initialValues={{
					...userInfor,
				}}
			>
				<div className="grid grid-cols-3 gap-8">
					<div className="mx-auto pt-20">
						<Form.Item name="avatar">
							<UploadAvatar circle isSme disabled={!CAN_UPDATE} />
						</Form.Item>
					</div>
					<div className="col-span-2">
						<h1 className="mb-8 text-xl">{tOthers('employeeInfo')}</h1>
						{isTechId && (
							<Form.Item
								label="TechID"
								name="techId"
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'TechID' })),
									validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
								]}
							>
								<Input maxLength={100} autoFocus disabled={!CAN_UPDATE} />
							</Form.Item>
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
									rules={[
										validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' })),
									]}
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
										validatePhoneNumber(
											'office',
											tValidation('opt_isNotValid', { field: 'phoneNum' }),
										),
									]}
								>
									<Input maxLength={14} disabled={!CAN_UPDATE} />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label={tField('email')}
									name="email"
									normalize={trim}
									rules={[
										validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
										validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
									]}
								>
									<Input disabled />
								</Form.Item>
							</Col>
						</Row>

						<Form.Item
							name="roles"
							label={tField('decentralization')}
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'decentralization' }))]}
						>
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

						<div className="flex items-center justify-end mb-7 ">
							<span className="mr-4">{tField('activeStatus')}</span>
							<Form.Item name="status" className="flex mb-auto">
								<Switch
									checked={isStatus}
									disabled={!CAN_UPDATE}
									onClick={() => setStatus(!isStatus)}
								/>
							</Form.Item>
						</div>

						<div className="text-right">
							<Button onClick={() => goBack(DX.dev.createPath('/account/employee'))} type="default">
								{tButton('opt_back')}
							</Button>
							{CAN_UPDATE && (
								<Button type="primary" htmlType="submit" className=" ml-4" disabled={!isDirty}>
									{tButton('opt_confirm')}
								</Button>
							)}
						</div>
					</div>
				</div>
			</Form>
		</>
	);
}

export default AccountManageDetail;
