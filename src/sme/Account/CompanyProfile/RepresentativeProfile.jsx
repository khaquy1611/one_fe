import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, message, Modal, Row, Select } from 'antd';
import { useLng, useSelectLocation, useUser } from 'app/hooks';
import { DX, SmeProfile } from 'app/models';
import { validateMaxLengthStr } from 'app/validator';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';

const { confirm } = Modal;

function RepresentativeProfile() {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('sme/update-enterprise-info', user.permissions);

	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { tFilterField, tMessage, tField, tButton, tValidation } = useLng();
	const { setCountryId, countryList, loadingCountry } = useSelectLocation();

	const { data: dataFolkes, isFetching } = useQuery(
		['getFolkes'],
		async () => {
			const res = await SmeProfile.getFolkes();
			return res.map((item) => ({
				label: item.name,
				value: item.id,
			}));
		},

		{ initialData: [] },
	);

	const { data: dataPersonalCertType } = useQuery(
		['getPersonalCertType'],
		async () => {
			const res = await SmeProfile.getPersonalCertType();
			return res.map((item) => ({
				label: item.name,
				value: item.id,
			}));
		},

		{ initialData: [] },
	);

	const { data: dataRepresent, refetch } = useQuery(
		['getRepresent'],
		async () => {
			const res = await SmeProfile.getRepresent();
			setCountryId(res.countryId);
			const data = {
				...res,
				provinceId: `${res.provinceId}/${res.provinceCode}`,
				repBirthday: res.repBirthday ? moment(res.repBirthday, 'DD/MM/YYYY') : null,
				repPersonalCertDate: res.repPersonalCertDate ? moment(res.repPersonalCertDate, 'DD/MM/YYYY') : null,
			};
			form.setFieldsValue(data);
			return data;
		},
		{ initialData: {} },
	);

	const setNewNationValue = () => {
		setCountryId(form.getFieldValue('countryId'));
	};

	const updateMutation = useMutation(SmeProfile.setRepresent, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'info' }));
			setDirty(false);
			refetch();
		},
		onError: () => {
			message.error(tMessage('retryError'));
		},
	});

	const showPromiseUpdateConfirm = (values) => {
		confirm({
			title: 'Bạn có chắc chắn muốn cập nhật thông tin?',
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: () => updateMutation.mutate(values),
			onCancel() {},
			confirmLoading: updateMutation.isLoading,
		});
	};

	const onFinish = (data) => {
		showPromiseUpdateConfirm({
			...data,
			repBirthday: data.repBirthday ? moment(data.repBirthday).format('DD/MM/YYYY') : null,
			repPersonalCertDate: data.repPersonalCertDate
				? moment(data.repPersonalCertDate).format('DD/MM/YYYY')
				: null,
		});
	};

	const restore = () => {
		setDirty(false);
		setCountryId(dataRepresent.countryId);
		form.setFieldsValue(dataRepresent);
	};

	function disabledDate(current) {
		// Can not select days after today and today
		return current && current >= moment().startOf('day');
	}

	return (
		<div className="box-sme">
			<Form
				layout="vertical"
				onValuesChange={() => !isDirty && setDirty(true)}
				onFinish={onFinish}
				form={form}
				className="max-w-4xl mx-auto"
				autoComplete="off"
			>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('name')}
							name="repFullName"
							rules={[validateMaxLengthStr(50, tValidation('opt_enterMaxLength', { maxLength: '50' }))]}
							autoFocus
						>
							<Input
								disabled={!CAN_UPDATE}
								maxLength={50}
								placeholder={tField('opt_enter', { field: 'name' })}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label={tField('gender')} name="repGender">
							<Select
								disabled={!CAN_UPDATE}
								options={[
									{ label: tFilterField('genderOptions', 'male'), value: 1 },
									{
										label: tFilterField('genderOptions', 'female'),
										value: 0,
									},
									{
										label: tFilterField('genderOptions', 'other'),
										value: 2,
									},
								]}
								placeholder={tField('opt_select', { field: 'gender' })}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item
							label={tField('repTitle')}
							name="repTitle"
							rules={[validateMaxLengthStr(50, tValidation('opt_enterMaxLength', { maxLength: '50' }))]}
						>
							<Input
								disabled={!CAN_UPDATE}
								maxLength={50}
								placeholder={tField('opt_enter', { field: 'repTitle' })}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label={tField('dob')} name="repBirthday">
							<DatePicker
								disabled={!CAN_UPDATE}
								placeholder={tField('opt_select', { field: 'dob' })}
								format="DD/MM/YYYY"
								className="w-full"
								disabledDate={disabledDate}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item label={tField('nationality')} name="repNationId">
							<Select
								disabled={!CAN_UPDATE}
								options={countryList}
								onChange={setNewNationValue}
								placeholder={tField('opt_select', { field: 'nationality' })}
								loading={loadingCountry}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label={tField('ethnic')} name="repFolkId">
							<Select
								disabled={!CAN_UPDATE}
								options={dataFolkes}
								placeholder={tField('opt_select', { field: 'ethnic' })}
								loading={isFetching}
							/>
						</Form.Item>
					</Col>
				</Row>

				<Form.Item label={tField('certificates')} name="repPersonalCertTypeId">
					<Select
						disabled={!CAN_UPDATE}
						options={dataPersonalCertType}
						placeholder={tField('certificates')}
					/>
				</Form.Item>
				<Form.Item
					label={tField('personalIdentificationNumber')}
					name="repPersonalCertNumber"
					rules={[validateMaxLengthStr(30, tValidation('opt_enterMaxLength', { maxLength: '30' }))]}
				>
					<Input disabled={!CAN_UPDATE} maxLength={30} placeholder={tField('personalIdentificationNumber')} />
				</Form.Item>
				<Row gutter={24}>
					<Col span={12}>
						<Form.Item label={tField('issuedOn')} name="repPersonalCertDate">
							<DatePicker
								disabled={!CAN_UPDATE}
								placeholder={tField('opt_select', { field: 'issuedOn' })}
								format="DD/MM/YYYY"
								className="w-full"
								disabledDate={disabledDate}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={tField('issuedAt')}
							name="repPersonalCertPlace"
							rules={[validateMaxLengthStr(50, tValidation('opt_enterMaxLength', { maxLength: '50' }))]}
						>
							<Input disabled={!CAN_UPDATE} maxLength={50} placeholder={tField('issuedAt')} />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item label={tField('permanentResidenceRegisterPlace')} name="repRegisteredPlace">
					<Input
						disabled={!CAN_UPDATE}
						maxLength={500}
						placeholder={tField('permanentResidenceRegisterPlace')}
					/>
				</Form.Item>

				<Form.Item label={tField('placeOfPermanent')} name="repAddress">
					<Input disabled={!CAN_UPDATE} maxLength={500} placeholder={tField('placeOfPermanent')} />
				</Form.Item>
				{CAN_UPDATE && (
					<div className="flex justify-end">
						<Button type="default" onClick={restore} disabled={!isDirty || updateMutation.isLoading}>
							{tButton('opt_cancel')}
						</Button>
						<Button
							type="primary"
							htmlType="submit"
							className="ml-2"
							disabled={!isDirty}
							loading={updateMutation.isLoading}
						>
							{tButton('opt_save')}
						</Button>
					</div>
				)}
			</Form>
		</div>
	);
}

export default RepresentativeProfile;
