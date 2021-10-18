import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { UploadAvatar } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
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

const { confirm } = Modal;

export default function CompanyInfo() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('sme/update-enterprise-info', user.permissions);

	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { tValidation, tMessage, tButton, tField } = useLng();

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
		wardList,
		streetList,
		loadingCountry,
		loadingProvince,
		loadingDistrict,
		loadingWard,
		loadingStreet,
	} = useSelectLocation();

	const [businessSizeList, setBusinessSizeList] = useState([]);
	const [businessArea, setBusinessArea] = useState([]);

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

	const { refetch, data: userInfor } = useQuery(
		['getSmeInfor'],
		async () => {
			const res = await Users.getSmeInfor();
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
		{ initialData: {}, cacheTime: 0, staleTime: 0 },
	);
	const setNewNationValue = () => {
		setCountryId(form.getFieldValue('countryId'));
		form.setFieldsValue({
			districtId: null,
			provinceId: null,
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
			streetId: '',
		});
	};

	const setNewStreetValue = () => {
		setStreetId(form.getFieldValue('streetId'));
	};

	const updateAccountMutation = useMutation(Users.updateSmeProfile, {
		onSuccess: () => {
			setDirty(false);
			refetch();
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
		},
		onError: (e) => {
			if (e.errorCode === 'exists' && e.field === 'taxCode') {
				form.setFields([
					{
						name: 'taxCode',
						errors: [tValidation('opt_isDuplicated', { field: 'taxCode' })],
					},
				]);
			} else if (e.errorCode === 'exists' && e.field === 'name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'firstName' })],
					},
				]);
			} else if (e.errorCode === 'exists' && e.field === 'phoneNumber') {
				form.setFields([
					{
						name: 'phoneNumber',
						errors: [tValidation('opt_isDuplicated', { field: 'phoneNum' })],
					},
				]);
			} else message.error(tMessage('opt_badlyUpdated', { field: 'info' }));
		},
	});

	const showPromiseUpdateConfirm = (values) => {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'info' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => updateAccountMutation.mutate(values),
			onCancel() {},
			confirmLoading: updateAccountMutation.isLoading,
		});
	};

	const onFinish = (values) => {
		if (values === null) return;
		const data = { ...values };
		const province = data.provinceId.split('/');
		data.provinceId = parseInt(province[0], 10);
		data.provinceCode = province.length > 1 ? province[1] : '';
		// data.taxCode = data.taxCode?.replace(/\s/g, '');
		data.icon = data.icon?.id;
		data.description = data.description != null ? data.description.trim() : '';
		showPromiseUpdateConfirm(data);
	};

	const restore = () => {
		setDirty(false);

		setCountryId(userInfor.countryId);
		setProvinceId(userInfor.provinceId);
		setDistrictId(userInfor.districtId);
		form.setFieldsValue(userInfor);
	};
	return (
		<div className="box-sme">
			<Form
				layout="vertical"
				onValuesChange={() => !isDirty && setDirty(true)}
				onFinish={onFinish}
				form={form}
				className="max-w-4xl mx-auto"
				autoComplete="off"
				// size=
			>
				<div className="flex justify-center pt-4">
					<Form.Item name="icon">
						<UploadAvatar disabled={!CAN_UPDATE} circle isSme />
					</Form.Item>
				</div>
				<Form.Item
					label={tField('enterpriseName')}
					name="name"
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'enterpriseName' })),
						validateMaxLengthStr(500, tValidation('opt_enterMaxLength', { maxLength: '500' })),
					]}
				>
					<Input disabled={!CAN_UPDATE} maxLength={500} />
				</Form.Item>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('country')}
							name="countryId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'country' }))]}
						>
							<Select
								disabled={!CAN_UPDATE}
								options={countryList}
								onChange={setNewNationValue}
								placeholder={tField('opt_select', { field: 'country' })}
								loading={loadingCountry}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('city')}
							name="provinceId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'city' }))]}
						>
							<Select
								disabled={!CAN_UPDATE}
								options={provinceList}
								onChange={setNewProvinceValue}
								placeholder={tField('opt_select', { field: 'city' })}
								loading={loadingProvince}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('district')}
							name="districtId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'district' }))]}
						>
							<Select
								disabled={!CAN_UPDATE}
								options={districtList}
								onChange={setNewDistrictValue}
								placeholder={tField('opt_select', { field: 'district' })}
								loading={loadingDistrict}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('ward')}
							name="wardId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'ward' }))]}
						>
							<Select
								disabled={!CAN_UPDATE}
								options={wardList}
								onChange={setNewWardValue}
								placeholder={tField('opt_select', { field: 'ward' })}
								loading={loadingWard}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('town')}
							name="streetId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'town' }))]}
						>
							<Select
								disabled={!CAN_UPDATE}
								options={streetList}
								onChange={setNewStreetValue}
								placeholder={tField('opt_select', { field: 'town' })}
								loading={loadingStreet}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('address')}
							name="address"
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'address' })),
								validateMaxLengthStr(500, tValidation('opt_enterMaxLength', { maxLength: '500' })),
							]}
						>
							<Input disabled={!CAN_UPDATE} maxLength={500} />
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
								validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
								validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
							]}
						>
							<Input disabled={!CAN_UPDATE} maxLength={14} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('web')}
							name="website"
							rules={[
								validateUrl(tValidation('wrongFormatUrl')),
								validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { field: '100' })),
							]}
						>
							<Input disabled={!CAN_UPDATE} maxLength={100} />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('taxCode')}
							name="taxCode"
							normalize={(value) => formatNormalizeTaxCode(value)}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'taxCode' })),
								validateStrLength(10, 10, tValidation('opt_isNotValid', { field: 'taxCode' })),
							]}
							className="w-full"
						>
							<Input disabled={!CAN_UPDATE} maxLength={10} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('scale')}
							name="businessScaleId"
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'scale' }))]}
						>
							<Select disabled={!CAN_UPDATE} options={businessSizeList} />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label={tField('socialInsuranceCode')}
					name="socialInsuranceNumber"
					normalize={(value) => formatNormalizeTaxCode(value)}
					rules={[validateStrLength(10, 10, tValidation('opt_isNotValid', { field: 'socialInsuranceCode' }))]}
				>
					<Input disabled={!CAN_UPDATE} maxLength={10} />
				</Form.Item>
				<Form.Item
					label={tField('businessArea')}
					name="businessAreasId"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'businessArea' }))]}
				>
					<Select
						disabled={!CAN_UPDATE}
						showSearch
						allowClear
						optionFilterProp="children"
						filterOption={(input, option) =>
							option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
					>
						{businessArea.map((option) => (
							<Select.Option value={option.value} key={option.value}>
								{option.label}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item
					label={tField('generalIntro')}
					name="description"
					rules={[validateMaxLengthStr(1000, tValidation('opt_enterMaxLength', { maxLength: '1000' }))]}
				>
					<Input.TextArea disabled={!CAN_UPDATE} maxLength={1000} />
				</Form.Item>
				{CAN_UPDATE && (
					<div className="text-right">
						<Button type="default" onClick={restore} disabled={!isDirty}>
							{tButton('opt_back')}
						</Button>
						<Button type="primary" htmlType="submit" className="ml-4" disabled={!isDirty}>
							{tButton('opt_confirm')}
						</Button>
					</div>
				)}
			</Form>
		</div>
	);
}
