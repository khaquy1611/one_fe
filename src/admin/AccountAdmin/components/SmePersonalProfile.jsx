import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Button, Modal, message } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { validateRequireInput, validateEmail, validateMaxLengthStr } from 'app/validator';
import moment from 'moment';
import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from 'react-query';
import { DX, Users } from 'app/models';
import { useParams } from 'react-router-dom';
import { useNavigation, useLng, useUser } from 'app/hooks';
import { trim } from 'opLodash';

const { confirm } = Modal;
function SmePersonalProfile() {
	const { user } = useUser();
	const [isDirty, setDirty] = useState(false);
	const [form] = Form.useForm();
	const { id } = useParams();
	const { goBack } = useNavigation();
	const { tMessage, tValidation, tField, tButton, tFilterField } = useLng();
	const isTechId = user?.techId;

	const CAN_UPDATE = DX.canAccessFuture2('admin/update-customer-account', user.permissions);
	const updateAccountMutation = useMutation(Users.updateProfileAnotherUser, {
		onSuccess: () => {
			setDirty(false);
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
		},
	});

	const { data: userInfo } = useQuery(
		['getPersonalInfor'],
		async () => {
			const res = await Users.getPersonalProfileByAdmin(id);
			res.avatar = res.avatar != null ? { filePath: res.avatar } : res.avatar;

			if (res.birthdate == null) {
				res.birthdate = undefined;
			} else {
				res.birthdate = moment(res.birthdate, 'DD/MM/YYYY');
			}
			form.setFieldsValue(res);
			return res;
		},
		{
			initialData: [],
		},
	);

	function showPromiseUpdateConfirm(values) {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'info' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => updateAccountMutation.mutate({ id, values }),
			onCancel() {},
			confirmLoading: updateAccountMutation.isLoading,
		});
	}

	function onFinish(values) {
		if (values === null) return;
		const data = { ...values };
		let { birthdate } = values;
		if (!birthdate) {
			birthdate = '';
		} else {
			birthdate = moment(birthdate).format('DD/MM/YYYY');
		}
		if (values.gender == null) {
			delete data.gender;
		}
		showPromiseUpdateConfirm({
			...values,
			birthdate,
			avatar: values.avatar?.id,
			status: userInfo.status,
		});
	}

	function disabledDate(current) {
		// Can not select days after today and today
		return moment().startOf('day').isSameOrBefore(current);
	}

	return (
		<div className="max-w-4xl mx-auto mt-10">
			<Form
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				layout="horizontal"
				form={form}
				onFinish={onFinish}
				initialValues={{
					...userInfo,
					avatar: userInfo.avatar,
					birthdate: userInfo.birthdate != null ? moment(userInfo.birthdate, 'DD/MM/YYYY') : undefined,
				}}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item name="avatar" className="text-center" wrapperCol={{ offset: 4 }}>
					<UploadAvatar disabled={!CAN_UPDATE} circle />
				</Form.Item>
				{isTechId && (
					<Form.Item label="TechID:" name="techId">
						<Input maxLength={100} disabled />
					</Form.Item>
				)}
				<Form.Item
					name="lastname"
					label={tField('lastName')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' })),
						validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
					]}
				>
					<Input
						name="lastname"
						maxLength={20}
						disabled={!CAN_UPDATE}
						placeholder={tField('opt_enter', { field: 'lastName' })}
						autoFocus
					/>
				</Form.Item>
				<Form.Item
					name="firstname"
					label={tField('firstName')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' })),
						validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
					]}
				>
					<Input
						disabled={!CAN_UPDATE}
						name="firstname"
						placeholder={tField('opt_enter', { field: 'firstName' })}
						maxLength={20}
					/>
				</Form.Item>
				<Form.Item
					name="email"
					label={tField('email')}
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
					]}
				>
					<Input name="email" disabled="disabled" placeholder={tField('opt_enter', { field: 'email' })} />
				</Form.Item>
				<Form.Item label={tField('dob')} name="birthdate">
					<DatePicker
						name="birthdate"
						className="w-full"
						placeholder={tField('opt_enter', { field: 'dob' })}
						format="DD/MM/YYYY"
						disabledDate={disabledDate}
						disabled={!CAN_UPDATE}
					/>
				</Form.Item>
				<Form.Item name="gender" label={tField('gender')}>
					<Select
						name="gender"
						disabled={!CAN_UPDATE}
						className="text-left"
						placeholder={tField('opt_enter', { field: 'gender' })}
					>
						<Select.Option disabled={!CAN_UPDATE} value="MALE">
							{tFilterField('genderOptions', 'male')}
						</Select.Option>
						<Select.Option disabled={!CAN_UPDATE} value="FEMALE">
							{tFilterField('genderOptions', 'female')}
						</Select.Option>
						<Select.Option disabled={!CAN_UPDATE} value="OTHER">
							{tFilterField('genderOptions', 'other')}
						</Select.Option>
					</Select>
				</Form.Item>

				<div className="text-right">
					<Button type="dashed" onClick={() => goBack(DX.admin.createPath('/account/sme'))}>
						{tButton('opt_cancel')}
					</Button>
					{CAN_UPDATE && (
						<Button
							type="primary"
							htmlType="submit"
							icon={<SaveOutlined />}
							disabled={!isDirty}
							className="ml-3"
						>
							{tButton('update')}
						</Button>
					)}
				</div>
			</Form>
		</div>
	);
}

export default SmePersonalProfile;
