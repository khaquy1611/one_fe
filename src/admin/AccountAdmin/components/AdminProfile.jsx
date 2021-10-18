import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, message, Modal, Select } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { Users } from 'app/models';
import { validateEmail, validateMaxLengthStr, validateRequireInput } from 'app/validator';
import moment from 'moment';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation } from 'react-query';

const { confirm } = Modal;

function AdminProfile() {
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { user, updateUser } = useUser();
	const [avatar, setAvatar] = useState(user.avatar !== null ? user.avatar : {});
	const { tMessage, tButton, tValidation, tField, tFilterField } = useLng();
	const updateAccountMutation = useMutation(Users.updateProfileUser, {
		onSuccess: (res) => {
			const newUser = {
				...user,
				firstname: res.firstname,
				lastname: res.lastname,
				gender: res.gender,
				avatar: avatar?.filePath,
			};
			if (res.birthdate !== null) {
				newUser.birthdate = moment(res.birthdate, 'DD/MM/YYYY');
			} else {
				newUser.birthdate = undefined;
			}
			updateUser(newUser);

			// form.setFieldsValue(newUser);
			setDirty(false);
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
		},
		onError: () => message.error(tMessage('opt_badlyUpdated', { field: 'info' })),
	});

	function showPromiseUpdateConfirm(values) {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'info' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => updateAccountMutation.mutate(values),
			onCancel() {},
			confirmLoading: updateAccountMutation.isLoading,
		});
	}

	function onFinish(values) {
		if (values === null) return;
		const valueSubmit = { ...values };
		valueSubmit.avatar = values.avatar?.id;
		showPromiseUpdateConfirm({
			...valueSubmit,
			birthdate: valueSubmit.birthdate ? moment(valueSubmit.birthdate).format('DD/MM/YYYY') : '',
		});
	}

	const restore = () => {
		form.resetFields();
		setDirty(false);
	};

	function disabledDate(current) {
		// Can not select days after today and today
		return current && current >= moment().startOf('day');
	}
	const getInitValues = () => {
		const inits = {
			...user,
			avatar: user.avatar != null ? { filePath: user.avatar } : user.avatar,
			birthdate: user.birthdate != null ? moment(user.birthdate, 'DD/MM/YYYY') : undefined,
		};

		if (!inits.birthdate) {
			delete inits.birthdate;
		}
		return inits;
	};
	return (
		<div className="max-w-4xl mx-auto mt-10">
			<Form
				labelCol={{ span: 3 }}
				layout="horizontal"
				form={form}
				onFinish={onFinish}
				initialValues={getInitValues()}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item name="avatar" className="text-center">
					<UploadAvatar onChange={setAvatar} />
				</Form.Item>
				<Form.Item
					name="lastname"
					label={tField('lastName')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' })),
						validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { field: '20' })),
					]}
				>
					<Input name="lastname" maxLength={20} autoFocus />
				</Form.Item>
				<Form.Item
					name="firstname"
					label={tField('firstName')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' })),
						validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { field: '20' })),
					]}
				>
					<Input name="firstname" maxLength={20} />
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
					<Input name="email" disabled="disabled" />
				</Form.Item>
				<Form.Item label={tField('dob')} name="birthdate">
					<DatePicker
						className="w-full"
						placeholder={tField('opt_select', { field: 'fullDob' })}
						format="DD/MM/YYYY"
						disabledDate={disabledDate}
					/>
				</Form.Item>
				<Form.Item
					name="gender"
					label={tField('gender')}
					placeholder={tField('opt_select', { field: 'gender' })}
				>
					<Select name="gender" className="text-left">
						<Select.Option value="MALE">{tFilterField('genderOptions', 'male')}</Select.Option>
						<Select.Option value="FEMALE">{tFilterField('genderOptions', 'female')}</Select.Option>
						<Select.Option value="OTHER">{tFilterField('genderOptions', 'other')}</Select.Option>
					</Select>
				</Form.Item>

				<div className="mt-10 text-right">
					<Button
						type="dashed"
						className={isDirty === true ? 'visible border-217' : 'invisible border-217'}
						onClick={restore}
						disabled={updateAccountMutation.isLoading}
					>
						{tButton('opt_cancel', { field: 'change' })}
					</Button>
					<Button
						type="primary"
						className="ml-4"
						htmlType="submit"
						icon={<SaveOutlined />}
						disabled={!isDirty}
						loading={updateAccountMutation.isLoading}
					>
						{tButton('update')}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export default AdminProfile;
