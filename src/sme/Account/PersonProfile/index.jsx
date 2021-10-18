import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, message, Modal, Row, Select, Spin } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { Users } from 'app/models';
import { validateEmail, validateMaxLengthStr, validateRequire } from 'app/validator';
import moment from 'moment';
import { trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

const { confirm } = Modal;

export default function PersonProfile() {
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { tMessage, tField, tButton, tValidation, tFilterField } = useLng();
	// [oldAvatar, setOldAvatar] = useState(user.avatar);
	const { user, updateUser } = useUser();
	const [avatarPath, setAvatarPath] = useState(user.avatar ? user.avatar : null);
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
	const isTechId = user?.techId;

	const updateAccountMutation = useMutation(Users.updateProfileUser, {
		onSuccess: (res) => {
			const newUser = {
				...userInfor,
				firstname: res.firstname,
				lastname: res.lastname,
				gender: res.gender,
				avatar: avatarPath,
			};
			if (res.birthdate !== null) {
				newUser.birthdate = moment(res.birthdate, 'DD/MM/YYYY');
			} else {
				newUser.birthdate = undefined;
			}
			setDirty(false);
			updateUser(newUser);
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
			getInfoUser.mutate();
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
		setAvatarPath(values.avatar?.filePath);
		values.avatar = values.avatar?.id;
		if (values.birthdate == null || new Date(values.birthdate).toString() === 'Invalid Date') {
			delete values.birthdate;
		} else {
			values.birthdate = new Date(values.birthdate).toLocaleDateString('vi-VN');
		}
		showPromiseUpdateConfirm({
			...values,
			lastname: trim(values.lastname),
			firstname: trim(values.firstname),
		});
	}

	const restore = () => {
		setDirty(false);
		form.resetFields();
	};

	function disabledDate(current) {
		// Can not select days after today and today
		return current && current >= moment().startOf('day');
	}
	return (
		<div className="box-sme">
			<Spin spinning={getInfoUser.isLoading}>
				<Form
					layout="vertical"
					onValuesChange={() => !isDirty && setDirty(true)}
					onFinish={onFinish}
					form={form}
					initialValues={{
						...userInfor,
						// birthdate: moment(
						// 	userInfor.birthdate !== null
						// 		? userInfor.birthdate
						// 		: moment(),
						// 	"DD/MM/YYYY"
						// ),
					}}
					autoComplete="off"
					className="max-w-4xl mx-auto"
				>
					<div className="flex justify-center pt-4 w-full">
						<Form.Item name="avatar">
							<UploadAvatar circle isSme />
						</Form.Item>
					</div>
					{isTechId && (
						<Form.Item label="TechID" name="techId">
							<Input disabled />
						</Form.Item>
					)}
					<Row gutter={24}>
						<Col span={12}>
							<Form.Item
								label={tField('lastName')}
								name="lastname"
								rules={[
									validateRequire(tValidation('opt_isRequired', { field: 'lastName' })),
									validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
								]}
							>
								<Input maxLength={20} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label={tField('firstName')}
								name="firstname"
								rules={[
									validateRequire(tValidation('opt_isRequired', { field: 'firstName' })),
									validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { field: '20' })),
								]}
							>
								<Input maxLength={20} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item
						label={tField('email')}
						name="email"
						type="email"
						disabled="disabled"
						normalize={trim}
						rules={[
							validateRequire(tValidation('opt_isRequired', { field: 'email' })),
							validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
						]}
					>
						<Input disabled />
					</Form.Item>
					<Row gutter={24}>
						<Col span={12}>
							<Form.Item label={tField('dob')} name="birthdate">
								<DatePicker
									placeholder={tField('opt_select', { field: 'dob' })}
									format="DD/MM/YYYY"
									className="w-full"
									disabledDate={disabledDate}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label={tField('gender')} name="gender">
								<Select
									options={[
										{ label: tFilterField('genderOptions', 'male'), value: 'MALE' },
										{
											label: tFilterField('genderOptions', 'female'),
											value: 'FEMALE',
										},
										{
											label: tFilterField('genderOptions', 'other'),
											value: 'OTHER',
										},
									]}
									placeholder={tField('gender')}
								/>
							</Form.Item>
						</Col>
					</Row>
					<div className="text-right">
						<Button onClick={restore} disabled={!isDirty || updateAccountMutation.isLoading} type="default">
							{tButton('opt_back')}
						</Button>
						<Button
							type="primary"
							htmlType="submit"
							className="ml-4"
							disabled={!isDirty}
							loading={updateAccountMutation.isLoading}
						>
							{tButton('opt_confirm')}
						</Button>
					</div>
				</Form>
			</Spin>
		</div>
	);
}
