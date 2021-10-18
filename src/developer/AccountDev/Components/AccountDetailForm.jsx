import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useSelectLocation, useUser } from 'app/hooks';
import { DX, Users } from 'app/models';
import {
	formatNormalizeTaxCode,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
	validateUrl,
} from 'app/validator';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';

const { confirm } = Modal;
function AccountDetailForm() {
	const [form] = Form.useForm();
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('dev/update-enterprise-info', user.permissions);
	const { id } = user;
	const [isDirty, setDirty] = useState(false);
	const { tButton, tMessage, tValidation, tField } = useLng();

	const {
		setCountryId,
		setCountryCode,
		setProvinceId,
		setDistrictId,
		setWardId,
		setStreetId,
		countryList,
		provinceList,
		districtList,
		loadingCountry,
		loadingProvince,
		loadingDistrict,
		wardList,
		loadingWard,
		streetList,
		loadingStreet,
	} = useSelectLocation();

	const { data: businessInfo, refetch } = useQuery(
		['getSmeInforByAdmin'],
		async () => {
			const res = await Users.getSmeInforByAdmin(id, 'DEV');
			res.icon = res.icon != null ? { filePath: res.icon } : res.icon;
			setCountryId(res.countryId);
			setCountryCode(res.provinceCode);
			setProvinceId(res.provinceId);
			setDistrictId(res.districtId);
			setWardId(res.wardId);
			setStreetId(res.streetId);
			const data = { ...res, provinceId: `${res.provinceId}/${res.provinceCode}` };
			form.setFieldsValue(data);
			return data;
		},
		{
			initialData: [],
			cacheTime: 0,
			staleTime: 0,
		},
	);

	const updateAccountMutation = useMutation(Users.updateBusinessInfoDev, {
		onSuccess: (res) => {
			const info = { ...user, ...res };
			setDirty(false);
			form.setFieldsValue(info);
			refetch();
			message.success(tMessage('opt_successfullyUpdated'));
		},
		onError: (e) => {
			if (e?.field === 'devName' && e?.errorCode === 'error.existed.name.dev') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'enterprise' })],
					},
				]);
			} else if (e?.field === 'phoneNumber' && e?.errorCode === 'error.existed.phone.number.dev') {
				// chuyển tới form có input phone
				form.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else message.error(tMessage('opt_badlyUpdated', { field: 'info' }));
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

	const onFinish = (values) => {
		if (values == null) return;
		const province = values.provinceId.split('/');
		showPromiseUpdateConfirm({
			...values,
			provinceId: parseInt(province[0], 10),
			provinceCode: province.length > 1 ? province[1] : '',
			email: user.email,
			icon: values.icon?.id,
		});
	};

	const setNewNationValue = () => {
		setCountryId(form.getFieldValue('countryId'));
		form.setFieldsValue({
			provinceId: null,
			districtId: null,
			wardId: null,
			streetId: null,
		});
		setDistrictId(-1);
		setProvinceId(-1);
	};

	const setNewProvinceValue = () => {
		const provinceValue = form.getFieldValue('provinceId');
		const arr = provinceValue.split('/');
		const idValue = parseInt(arr[0], 10);
		const code = arr.length > 1 ? arr[1] : '';
		setProvinceId(idValue);
		setCountryCode(code);
		form.setFieldsValue({
			districtId: null,
			wardId: null,
			streetId: null,
		});
	};

	const setNewDistrictValue = () => {
		setDistrictId(form.getFieldValue('districtId'));
		form.setFieldsValue({
			wardId: null,
			streetId: null,
		});
	};

	const setNewWardValue = () => {
		setWardId(form.getFieldValue('wardId'));
		form.setFieldsValue({
			streetId: null,
		});
	};

	const setNewStreetValue = () => {
		setStreetId(form.getFieldValue('streetId'));
	};

	const restore = () => {
		setDirty(false);

		setCountryId(businessInfo.countryId);
		setProvinceId(businessInfo.provinceId);
		setDistrictId(businessInfo.setDistrictId);
		form.setFieldsValue(businessInfo);
	};

	return (
		<div className="max-w-5xl mx-auto mt-10">
			<Form
				layout="horizontal"
				form={form}
				onFinish={onFinish}
				autoComplete="off"
				initialValues={{
					...businessInfo,
					icon: businessInfo.icon,
				}}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item name="icon" className="text-center" wrapperCol={{ offset: 4 }}>
					<UploadAvatar disabled={!CAN_UPDATE} circle />
				</Form.Item>

				<Form.Item
					label={`${tField('devName')}:`}
					name="name"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'devName' }))]}
					labelCol={{ span: 4 }}
				>
					<Input disabled={!CAN_UPDATE} name="name" autoFocus maxLength={500} />
				</Form.Item>
				<Form.Item
					label={`${tField('phoneNum')}:`}
					name="phoneNumber"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
						validatePhoneNumber('office'),
					]}
					labelCol={{ span: 4 }}
				>
					<Input disabled={!CAN_UPDATE} maxLength={14} type="phoneNumber" />
				</Form.Item>
				<Form.Item
					label={`${tField('country')}:`}
					name="countryId"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'country' }))]}
					labelCol={{ span: 4 }}
				>
					<Select
						name="countryId"
						onChange={setNewNationValue}
						options={countryList}
						loading={loadingCountry}
						disabled={!CAN_UPDATE}
					/>
				</Form.Item>
				<Row>
					<Col span={12}>
						<Form.Item
							name="provinceId"
							label={`${tField('city')}:`}
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'city' }))]}
							labelCol={{ span: 8 }}
						>
							<Select
								name="provinceId"
								onChange={setNewProvinceValue}
								options={provinceList}
								loading={loadingProvince}
								disabled={!CAN_UPDATE}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="districtId"
							label={`${tField('district')}:`}
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'district' }))]}
							labelCol={{ span: 8 }}
						>
							<Select
								name="districtId"
								onChange={setNewDistrictValue}
								options={districtList}
								loading={loadingDistrict}
								disabled={!CAN_UPDATE}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item
							label="Phường"
							name="wardId"
							rules={[validateRequire('Phường không được bỏ trống')]}
							labelCol={{ span: 8 }}
						>
							<Select
								options={wardList}
								onChange={setNewWardValue}
								placeholder="Chọn Phường"
								loading={loadingWard}
								disabled={!CAN_UPDATE}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Phố"
							name="streetId"
							rules={[validateRequire('Phố không được bỏ trống')]}
							labelCol={{ span: 8 }}
						>
							<Select
								options={streetList}
								onChange={setNewStreetValue}
								placeholder="Chọn Phố"
								loading={loadingStreet}
								disabled={!CAN_UPDATE}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label="Mã số BHXH"
					name="socialInsuranceNumber"
					labelCol={{ span: 4 }}
					normalize={(value) => formatNormalizeTaxCode(value)}
				>
					<Input disabled={!CAN_UPDATE} maxLength={10} />
				</Form.Item>
				<Form.Item
					label={`${tField('address')}:`}
					name="address"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'address' }))]}
					labelCol={{ span: 4 }}
				>
					<Input disabled={!CAN_UPDATE} name="address" maxLength={500} />
				</Form.Item>
				<Form.Item
					label={`${tField('web')}:`}
					name="website"
					rules={[validateUrl(tValidation('wrongFormatUrl'))]}
					labelCol={{ span: 4 }}
				>
					<Input disabled={!CAN_UPDATE} maxLength={100} />
				</Form.Item>

				<Form.Item label={`${tField('intro')}:`} name="description" labelCol={{ span: 4 }}>
					<Input.TextArea disabled={!CAN_UPDATE} maxLength={1000} showCount="true" />
				</Form.Item>
				{CAN_UPDATE && (
					<div className="text-right mt-12">
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
				)}
			</Form>
		</div>
	);
}

export default AccountDetailForm;
