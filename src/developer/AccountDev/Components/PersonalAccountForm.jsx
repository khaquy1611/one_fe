import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Form, Input, message, Select, Modal } from 'antd';
import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useMutation } from 'react-query';
import { useUser, useLng } from 'app/hooks';
import { Users } from 'app/models';
import moment from 'moment';
import { UploadAvatar } from 'app/components/Atoms';
import { validateRequireInput } from 'app/validator';
import { trim } from 'opLodash';

const { confirm } = Modal;

function PersonalAccountForm() {
	const [form] = Form.useForm();
	const { Option } = Select;
	const { user, updateUser } = useUser();
	const [isDirty, setDirty] = useState(false);
	const [avatar, setAvatar] = useState({ filePath: user.avatar });
	const { tButton, tMessage, tValidation, tField, tFilterField } = useLng();
	const isTechId = user?.techId;

	const getInfoUser = useMutation(async () => {
		const res = await Users.getMyProfile();
		if (res.birthdate == null) {
			res.birthdate = '';
		} else {
			res.birthdate = moment(res.birthdate, 'DD/MM/YYYY');
		}

		res.avatar = res.avatar != null ? { filePath: res.avatar } : res.avatar;
		form.setFieldsValue(res);
		return res;
	});

	useEffect(() => {
		getInfoUser.mutate();
	}, []);
	const userInfor = getInfoUser.data;

	const updateAccountMutation = useMutation(Users.updateProfileUser, {
		onSuccess: (res) => {
			const newUser = { ...userInfor, ...res };
			if (res.birthdate !== null) {
				newUser.birthdate = moment(res.birthdate, 'DD/MM/YYYY');
			} else {
				newUser.birthdate = undefined;
			}
			newUser.avatar = userInfor.avatar;
			setDirty(false);
			form.setFieldsValue(newUser);
			newUser.avatar = avatar.filePath;
			updateUser(newUser);
			message.success(tMessage('opt_successfullyUpdated'));
		},
		onError: () => message.error(tMessage('retryError')),
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
		if (values.birthdate == null || new Date(values.birthdate).toString() === 'Invalid Date') {
			delete values.birthdate;
		} else {
			values.birthdate = new Date(values.birthdate).toLocaleDateString('vi-VN');
		}

		values.avatar = values.avatar?.id;
		showPromiseUpdateConfirm(values);
	}

	const restore = () => {
		setDirty(false);
		form.resetFields();
	};

	function callbackUploadImg(item) {
		setAvatar(item);
		userInfor.avatar = item;
	}
	const disableDate = (current) => current && current >= moment().startOf('day');
	return (
		<div className="max-w-5xl mx-auto mt-10">
			<Form
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 25 }}
				layout="horizontal"
				form={form}
				onFinish={onFinish}
				autoComplete="off"
				initialValues={{
					...userInfor,
				}}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item name="avatar" className="text-center" wrapperCol={{ offset: 6 }}>
					<UploadAvatar circle onChange={callbackUploadImg} />
				</Form.Item>
				{isTechId && (
					<Form.Item label="TechID:" name="techId">
						<Input maxLength={100} disabled />
					</Form.Item>
				)}
				<Form.Item
					label={tField('lastName')}
					name="lastname"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' }))]}
				>
					<Input name="lastname" maxLength={20} autoFocus />
				</Form.Item>
				<Form.Item
					label={`${tField('firstName')}`}
					name="firstname"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' }))]}
				>
					<Input name="firstname" maxLength={20} />
				</Form.Item>

				<Form.Item label={`${tField('email')}`} name="email" normalize={trim}>
					<Input type="email" name="email" disabled="disabled" />
				</Form.Item>
				<Form.Item label={`${tField('dob')}`} name="birthdate">
					<DatePicker
						name="birthdate"
						className="w-full"
						placeholder={tField('opt_select', { field: 'fullDob' })}
						format="DD/MM/YYYY"
						disabledDate={disableDate}
					/>
				</Form.Item>

				<Form.Item name="gender" label={`${tField('gender')}`}>
					<Select placeholder={tField('opt_select', { field: 'gender' })} name="gender">
						<Option value="MALE">{tFilterField('genderOptions', 'male')}</Option>
						<Option value="FEMALE">{tFilterField('genderOptions', 'female')}</Option>
						<Option value="OTHER">{tFilterField('genderOptions', 'other')}</Option>
					</Select>
				</Form.Item>

				<div className="text-right">
					<Button onClick={restore} disabled={!isDirty || updateAccountMutation.isLoading}>
						{tButton('opt_cancel', { field: 'change' })}
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						icon={<SaveOutlined />}
						disabled={!isDirty}
						className="ml-4"
						loading={updateAccountMutation.isLoading}
					>
						{tButton('opt_save')}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export default PersonalAccountForm;
