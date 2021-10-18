import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, message, Modal, Select } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { Users, DX } from 'app/models';
import { validateRequireInput } from 'app/validator';
import moment from 'moment';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';

const { confirm } = Modal;

function DevPersonalForm() {
	const { user } = useUser();
	const [form] = Form.useForm();
	const { Option } = Select;
	const [isDirty, setDirty] = useState(false);
	const history = useHistory();
	const { id } = useParams();
	const { tMessage, tValidation, tField, tButton, tFilterField } = useLng();
	const isTechId = user?.techId;
	const isRootAdmin = !user.departmentId || !user.department?.provinceId;
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-customer-account', user.permissions);
	const { data: userInfo } = useQuery(
		['getOneById'],
		async () => {
			const res = await Users.getOneById(id);
			res.avatar = res.avatar != null ? { filePath: res.avatar } : res.avatar;
			if (res.birthdate == null) {
				res.birthdate = '';
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

	const updateAccountMutation = useMutation(Users.updateProfileAnotherUser, {
		onSuccess: () => {
			setDirty(false);
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
		},
	});

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
		const data = {
			...values,
			status: userInfo.status,
			avatar: values.avatar?.id,
		};
		if (new Date(data.birthdate).toString() === 'Invalid Date') {
			delete data.birthdate;
		} else {
			data.birthdate = new Date(data.birthdate).toLocaleDateString('vi-VN');
		}
		if (data.gender == null) {
			delete data.gender;
		}
		showPromiseUpdateConfirm(data);
	}

	const disableDate = (current) => current && current > moment().startOf('day');
	return (
		<div className="max-w-4xl mx-auto mt-10">
			<Form
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 24 }}
				layout="horizontal"
				form={form}
				onFinish={onFinish}
				initialValues={{
					...userInfo,
					avatar: userInfo.avatar,
					birthdate: moment(userInfo.birthdate !== null ? userInfo.birthdate : moment(), 'DD/MM/YYYY'),
				}}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item name="avatar" className="text-center" wrapperCol={{ offset: 4 }}>
					<UploadAvatar disabled={!isRootAdmin || !CAN_UPDATE} circle />
				</Form.Item>
				{isTechId && (
					<Form.Item label="TechID: " name="techId">
						<Input maxLength={100} disabled />
					</Form.Item>
				)}
				<Form.Item
					label={tField('lastName')}
					name="lastname"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' }))]}
				>
					<Input
						name="lastname"
						maxLength={20}
						autoFocus
						disabled={!isRootAdmin || !CAN_UPDATE}
						placeholder={tField('opt_enter', { field: 'lastName' })}
					/>
				</Form.Item>
				<Form.Item
					label={tField('firstName')}
					name="firstname"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' }))]}
				>
					<Input
						disabled={!isRootAdmin || !CAN_UPDATE}
						name="firstname"
						maxLength={20}
						placeholder={tField('opt_enter', { field: 'firstName' })}
					/>
				</Form.Item>

				<Form.Item label={tField('email')} name="email" normalize={trim}>
					<Input type="email" name="email" disabled="disabled" />
				</Form.Item>
				<Form.Item label={tField('dob')} name="birthdate">
					<DatePicker
						name="birthdate"
						disabled={!isRootAdmin || !CAN_UPDATE}
						className="w-full"
						placeholder={tField('opt_enter', { field: 'fullDob' })}
						format="DD/MM/YYYY"
						disabledDate={disableDate}
					/>
				</Form.Item>

				<Form.Item name="gender" label={tField('gender')}>
					<Select
						disabled={!isRootAdmin || !CAN_UPDATE}
						placeholder={tField('opt_enter', { field: 'gender' })}
						name="gender"
					>
						<Option value="MALE">{tFilterField('genderOptions', 'male')}</Option>
						<Option value="FEMALE">{tFilterField('genderOptions', 'female')}</Option>
						<Option value="OTHER">{tFilterField('genderOptions', 'other')}</Option>
					</Select>
				</Form.Item>

				<div className="text-right">
					<Button onClick={() => history.goBack()}>{tButton('opt_cancel')}</Button>
					{isRootAdmin && CAN_UPDATE && (
						<Button
							type="primary"
							htmlType="submit"
							icon={<SaveOutlined />}
							disabled={!isDirty}
							className="ml-4"
						>
							{tButton('update')}
						</Button>
					)}
				</div>
			</Form>
		</div>
	);
}

export default DevPersonalForm;
