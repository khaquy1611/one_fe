import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useNavigation, useUser } from 'app/hooks';
import useSelectLocation from 'app/hooks/useSelectLocation';
import { DX, Users } from 'app/models';
import SmeProfile from 'app/models/SmeProfile';
import {
	formatNormalizeTaxCode,
	validateMaxLengthStr,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
	validateStrLength,
	validateUrl,
} from 'app/validator';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

const { confirm } = Modal;
function SmeCompanyProfile() {
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
	const [businessSizeList, setBusinessSizeList] = useState([]);
	const [businessArea, setBusinessArea] = useState([]);
	const [isDirty, setDirty] = useState(false);
	const [form] = Form.useForm();
	const { id } = useParams();
	const { goBack } = useNavigation();
	const { user } = useUser();
	const isRootAdmin = !user.departmentId || !user.department?.provinceId;
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-customer-account', user.permissions);

	const { refetch, data: userInfo } = useQuery(
		['getSmeInfor'],
		async () => {
			const res = await Users.getSmeInforByAdmin(id, 'SME');
			res.icon = res.icon != null ? { filePath: res.icon } : res.icon;
			if (res.taxCode) {
				res.taxCode = DX.callFormatTaxCode(res.taxCode);
			}
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

	const updateAccountMutation = useMutation(Users.updateEntepriseSmeProfile, {
		onSuccess: () => {
			setDirty(false);
			refetch();
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
		},
		onError: (e) => {
			if (e.errorCode === 'error.existed.name.sme' && e.field === 'smeName') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'enterpriseName' })],
					},
				]);
			} else if (e?.field === 'phoneNumber' && e?.errorCode === 'error.existed.phone.number.dev') {
				form.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else if (e.errorCode === 'error.existed.tax.sme' && e.field === 'smeTax') {
				form.setFields([
					{
						name: 'taxCode',
						errors: [tValidation('opt_isDuplicated', { field: 'taxCode' })],
					},
				]);
			} else if (e.errorCode === 'error.invalid.website' && e.field === 'smeWebsite') {
				form.setFields([
					{
						name: 'website',
						errors: [tValidation('opt_isNotValid', { field: 'web' })],
					},
				]);
			} else if (e.errorCode === 'error.invalid.tax.sme' && e.field === 'smeTax') {
				form.setFields([
					{
						name: 'taxCode',
						errors: [tValidation('opt_isNotValid', { field: 'taxCode' })],
					},
				]);
			} else message.error(tMessage('opt_badlyUpdated', { field: 'info' }));
		},
	});

	useQuery(
		['getBussinessScale'],
		async () => {
			const res = await SmeProfile.getBussinessScale();
			const scaleTemp = [];
			res.map((item) =>
				scaleTemp.push({
					value: item.id,
					label: item.name,
				}),
			);
			setBusinessSizeList(scaleTemp);
			return scaleTemp;
		},
		{ desValues: [] },
	);

	useQuery(
		['getBussinessArea'],
		async () => {
			const res = await SmeProfile.getBussinessArea();
			const areaTemp = [];
			res.map((item) =>
				areaTemp.push({
					value: item.id,
					label: item.name,
				}),
			);
			setBusinessArea(areaTemp);
			return areaTemp;
		},
		{ desValues: [] },
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
		const province = data.provinceId.split('/');
		data.provinceId = parseInt(province[0], 10);
		data.provinceCode = province.length > 1 ? province[1] : '';
		data.icon = values.icon?.id;
		data.description = values.description || '';
		data.website = values.website || '';
		data.taxCode = values.taxCode?.replace(/\s/g, '');
		showPromiseUpdateConfirm(data);
	}

	function setNewNationValue() {
		setCountryId(form.getFieldValue('countryId'));
		form.setFieldsValue({
			districtId: null,
			provinceId: null,
			wardId: null,
			streetId: null,
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
	function setNewDistrictValue() {
		setDistrictId(form.getFieldValue('districtId'));
		form.setFieldsValue({
			wardId: null,
			streetId: null,
		});
	}

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
				onValuesChange={() => !isDirty && setDirty(true)}
				onFinish={onFinish}
				form={form}
				initialValues={{
					...userInfo,
					icon: userInfo.icon,
				}}
			>
				<Form.Item name="icon" wrapperCol={{ offset: 4 }} className="text-center">
					<UploadAvatar circle />
				</Form.Item>
				<Form.Item
					label={tField('enterpriseName')}
					name="name"
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'enterpriseName' })),
						validateMaxLengthStr(500, tValidation('opt_enterMaxLength', { maxLength: '500' })),
					]}
					labelCol={{
						span: 4,
					}}
				>
					<Input maxLength={500} autoFocus placeholder={tField('opt_enter', { field: 'enterpriseName' })} />
				</Form.Item>
				<Row>
					<Col span={12}>
						<Form.Item
							label={tField('country')}
							name="countryId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'country' }))]}
							labelCol={{
								span: 8,
							}}
						>
							<Select
								className="text-left"
								name="countryId"
								onChange={setNewNationValue}
								options={countryList}
								disabled={!isRootAdmin || !CAN_UPDATE}
								placeholder={tField('opt_select', { field: 'country' })}
								loading={loadingCountry}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="provinceId"
							label={tField('city')}
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'city' }))]}
							labelCol={{
								span: 8,
							}}
						>
							<Select
								className="text-left"
								name="provinceId"
								disabled={!isRootAdmin || !CAN_UPDATE}
								onChange={setNewProvinceValue}
								options={provinceList}
								placeholder={tField('opt_select', { field: 'city' })}
								loading={loadingProvince}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item
							name="districtId"
							label={tField('district')}
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'district' }))]}
							labelCol={{
								span: 8,
							}}
						>
							<Select
								className="text-left"
								name="districtId"
								onChange={setNewDistrictValue}
								options={districtList}
								placeholder={tField('opt_select', { field: 'district' })}
								loading={loadingDistrict}
								disabled={!CAN_UPDATE}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Phường"
							name="wardId"
							rules={[validateRequire('Phường không được bỏ trống')]}
							labelCol={{
								span: 8,
							}}
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
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item
							label="Phố"
							name="streetId"
							rules={[validateRequire('Phố không được bỏ trống')]}
							labelCol={{
								span: 8,
							}}
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
					<Col span={12}>
						<Form.Item
							label={tField('address')}
							name="address"
							rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'address' }))]}
							labelCol={{
								span: 8,
							}}
						>
							<Input
								name="address"
								maxLength={500}
								disabled={!CAN_UPDATE}
								placeholder={tField('opt_enter', { field: 'address' })}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label="Mã số BHXH"
					name="socialInsuranceNumber"
					labelCol={{
						span: 4,
					}}
				>
					<Input maxLength={13} disabled={!CAN_UPDATE} />
				</Form.Item>
				<Row>
					<Col span={12}>
						<Form.Item
							label={tField('phoneNum')}
							name="phoneNumber"
							normalize={trim}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
								validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
							]}
							labelCol={{
								span: 8,
							}}
						>
							<Input
								maxLength={14}
								name="phoneNumber"
								disabled={!CAN_UPDATE}
								placeholder={tField('opt_enter', { field: 'phoneNum' })}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('web')}
							name="website"
							labelCol={{
								span: 8,
							}}
							rules={[
								validateUrl(tValidation('opt_isNotValid', { field: 'web' })),
								validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
							]}
						>
							<Input disabled={!CAN_UPDATE} name="website" maxLength={100} placeholder="https://" />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item
							label={tField('taxCode')}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'taxCode' })),
								validateStrLength(10, 10, tValidation('opt_isNotValid', { field: 'taxCode' })),
							]}
							normalize={(value) => formatNormalizeTaxCode(value)}
							name="taxCode"
							labelCol={{
								span: 8,
							}}
						>
							<Input
								name="taxCode"
								maxLength={10}
								disabled={!CAN_UPDATE}
								placeholder={tField('opt_enter', { field: 'taxCode' })}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('scale')}
							name="businessScaleId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'scale' }))]}
							labelCol={{
								span: 8,
							}}
						>
							<Select
								className="text-left"
								name="businessScaleId"
								disabled={!CAN_UPDATE}
								options={businessSizeList}
								placeholder={tField('opt_select', { field: 'scale' })}
							/>
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					electForm
					label={tField('field')}
					name="businessAreasId"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'field' }))]}
					labelCol={{
						span: 4,
					}}
				>
					<Select
						className="text-left"
						name="businessAreasId"
						options={businessArea}
						disabled={!CAN_UPDATE}
						placeholder={tField('opt_select', { field: 'field' })}
					/>
				</Form.Item>
				<Form.Item
					label={tField('intro')}
					name="description"
					labelCol={{
						span: 4,
					}}
					rules={[validateMaxLengthStr(1000, tValidation('opt_enterMaxLength', { maxLength: '1000' }))]}
				>
					<Input.TextArea disabled={!CAN_UPDATE} name="description" showCount maxLength={1000} />
				</Form.Item>
				<div className="text-right mt-12">
					<Button
						onClick={() => goBack(DX.admin.createPath('/account/sme'))}
						disabled={!isDirty || updateAccountMutation.isLoading}
					>
						{tButton('opt_cancel')}
					</Button>
					{CAN_UPDATE && (
						<Button
							type="primary"
							htmlType="submit"
							className="ml-4"
							icon={<SaveOutlined />}
							disabled={!isDirty}
							loading={updateAccountMutation.isLoading}
						>
							{tButton('update')}
						</Button>
					)}
				</div>
			</Form>
		</div>
	);
}

export default SmeCompanyProfile;
