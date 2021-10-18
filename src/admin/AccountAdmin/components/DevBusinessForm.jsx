import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useSelectLocation, useUser } from 'app/hooks';
import { Users, DX } from 'app/models';
import { validatePhoneNumber, validateRequire, validateRequireInput, validateUrl } from 'app/validator';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';

const { confirm } = Modal;

function DevBusinessForm() {
	const [form] = Form.useForm();
	const history = useHistory();
	const { id } = useParams();
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
	const { tMessage, tValidation, tField, tButton } = useLng();
	const [isDirty, setDirty] = useState(false);
	const { user } = useUser();
	const isRootAdmin = !user.departmentId || !user.department?.provinceId;
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-customer-account', user.permissions);

	const updateAccountMutation = useMutation(Users.updateBusinessInfoDev, {
		onSuccess: () => {
			setDirty(false);
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
		},
		onError: (e) => {
			if (e.errorCode === 'error.existed.name.dev' && e.field === 'devName') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'devName' })],
					},
				]);
			} else if (e?.field === 'phoneNumber' && e?.errorCode === 'error.existed.phone.number.dev') {
				form.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			}
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

	const { data: businessInfo } = useQuery(
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

	function onFinish(values) {
		if (values == null) return;
		const data = {
			...values,
		};
		const province = data.provinceId.split('/');
		data.provinceId = parseInt(province[0], 10);
		data.provinceCode = province.length > 1 ? province[1] : '';
		data.icon = values.icon?.id;
		delete data.avatar;
		delete data.coverImage;
		showPromiseUpdateConfirm(data);
	}

	function setNewNationValue() {
		setCountryId(form.getFieldValue('countryId'));
		form.setFieldsValue({
			districtId: null,
			provinceId: null,
		});
		setDistrictId(-1);
		setProvinceId(-1);
	}

	function setNewProvinceValue() {
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
	}

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

	return (
		<div className="max-w-5xl mx-auto mt-10">
			<Form
				layout="horizontal"
				form={form}
				onFinish={onFinish}
				initialValues={{
					...businessInfo,
				}}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item name="icon" className="text-center" wrapperCol={{ offset: 4 }}>
					<UploadAvatar disabled={!isRootAdmin || !CAN_UPDATE} circle />
				</Form.Item>
				<Form.Item
					label={tField('devName')}
					name="name"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'devName' }))]}
					labelCol={{ span: 4 }}
				>
					<Input
						name="name"
						disabled={!isRootAdmin || !CAN_UPDATE}
						maxLength={500}
						autoFocus
						placeholder={tField('opt_enter', { field: 'devName' })}
					/>
				</Form.Item>

				<Form.Item
					label={tField('phoneNum')}
					name="phoneNumber"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
						validatePhoneNumber('office'),
					]}
					labelCol={{ span: 4 }}
				>
					<Input
						maxLength={14}
						type="phoneNumber"
						disabled={!isRootAdmin || !CAN_UPDATE}
						placeholder={tField('opt_enter', { field: 'phoneNum' })}
					/>
				</Form.Item>
				<Form.Item
					label={tField('country')}
					name="countryId"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'country' }))]}
					labelCol={{ span: 4 }}
				>
					<Select
						name="countryId"
						onChange={setNewNationValue}
						disabled={!isRootAdmin || !CAN_UPDATE}
						options={countryList}
						placeholder={tField('opt_enter', { field: 'country' })}
						loading={loadingCountry}
					/>
				</Form.Item>
				<Row>
					<Col span={12}>
						<Form.Item
							name="provinceId"
							label={tField('city')}
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'city' }))]}
							labelCol={{ span: 8 }}
						>
							<Select
								name="provinceId"
								onChange={setNewProvinceValue}
								options={provinceList}
								disabled={!isRootAdmin || !CAN_UPDATE}
								placeholder={tField('opt_enter', { field: 'city' })}
								loading={loadingProvince}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="districtId"
							label={tField('district')}
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'district' }))]}
							labelCol={{ span: 8 }}
						>
							<Select
								onChange={setNewDistrictValue}
								options={districtList}
								disabled={!isRootAdmin || !CAN_UPDATE}
								placeholder={tField('opt_enter', { field: 'district' })}
								loading={loadingDistrict}
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
								disabled={!isRootAdmin || !CAN_UPDATE}
								onChange={setNewWardValue}
								placeholder="Chọn Phường"
								loading={loadingWard}
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
								disabled={!isRootAdmin || !CAN_UPDATE}
								onChange={setNewStreetValue}
								placeholder="Chọn Phố"
								loading={loadingStreet}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Form.Item label="Mã số BHXH" name="socialInsuranceNumber" labelCol={{ span: 4 }}>
					<Input maxLength={13} disabled={!isRootAdmin || !CAN_UPDATE} />
				</Form.Item>
				<Form.Item
					label={tField('address')}
					name="address"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'address' }))]}
					labelCol={{ span: 4 }}
				>
					<Input
						name="address"
						disabled={!isRootAdmin || !CAN_UPDATE}
						maxLength={500}
						placeholder={tField('opt_enter', { field: 'address' })}
					/>
				</Form.Item>
				<Form.Item
					label={tField('web')}
					name="website"
					rules={[validateUrl(tValidation('opt_isNotValid', { field: 'web' }))]}
					labelCol={{ span: 4 }}
				>
					<Input
						name="website"
						disabled={!isRootAdmin || !CAN_UPDATE}
						maxLength={100}
						placeholder="https://"
					/>
				</Form.Item>

				<Form.Item label={tField('intro')} name="description" labelCol={{ span: 4 }}>
					<Input.TextArea maxLength={1000} disabled={!isRootAdmin || !CAN_UPDATE} showCount="true" />
				</Form.Item>
				<div className="text-right mt-12">
					<Button onClick={() => history.goBack()}>{tButton('opt_cancel')}</Button>
					{isRootAdmin && CAN_UPDATE && (
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

export default DevBusinessForm;
