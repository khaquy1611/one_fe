import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import { useSelectLocation } from 'app/hooks';
import SmeProfile from 'app/models/SmeProfile';
import { validateMaxLengthStr } from 'app/validator';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

const { confirm } = Modal;

function Representative({ form, canUpdate, dataInfo, updateMutation, id }) {
	const { countryList, loadingCountry } = useSelectLocation();
	const [isDirty, setDirty] = useState(false);

	// dân tộc
	const { data: dataFolkes, isFetching: loadingFolkes } = useQuery(
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

	// số chứng thực cá nhân
	const { data: dataPersonalCertType, isFetching: loadingCertType } = useQuery(
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
			id,
			...data,
			repBirthday: data.repBirthday ? moment(data.repBirthday).format('DD/MM/YYYY') : null,
			repPersonalCertDate: data.repPersonalCertDate
				? moment(data.repPersonalCertDate).format('DD/MM/YYYY')
				: null,
		});
	};

	const restore = () => {
		setDirty(false);
		form.setFieldsValue(dataInfo);
	};

	// Can not select days after today and today
	const disabledDate = (current) => current && current >= moment().startOf('day');

	return (
		<Form
			layout="horizontal"
			onValuesChange={() => !isDirty && setDirty(true)}
			onFinish={onFinish}
			form={form}
			autoComplete="off"
		>
			<Row justify="end">
				<Col span={12}>
					<Form.Item
						label="Họ tên"
						name="repFullName"
						rules={[validateMaxLengthStr(50, 'Không nhập quá 50 ký tự')]}
						labelCol={{ span: 8 }}
					>
						<Input autoFocus disabled={!canUpdate} maxLength={50} placeholder="Nhập họ tên" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Giới tính" name="repGender" labelCol={{ span: 8 }}>
						<Select
							disabled={!canUpdate}
							options={[
								{ label: 'Nam', value: 1 },
								{
									label: 'Nữ',
									value: 0,
								},
								{
									label: 'Khác',
									value: 2,
								},
							]}
							placeholder="Chọn giới tính"
						/>
					</Form.Item>
				</Col>
			</Row>

			<Row justify="end">
				<Col span={12}>
					<Form.Item
						label="Chức danh"
						name="repTitle"
						rules={[validateMaxLengthStr(50, 'Không nhập quá 50 ký tự')]}
						labelCol={{ span: 8 }}
					>
						<Input disabled={!canUpdate} maxLength={50} placeholder="Nhập chức danh" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Ngày sinh" name="repBirthday" labelCol={{ span: 8 }}>
						<DatePicker
							disabled={!canUpdate}
							placeholder="Chọn ngày sinh"
							format="DD/MM/YYYY"
							className="w-full"
							disabledDate={disabledDate}
						/>
					</Form.Item>
				</Col>
			</Row>

			<Row justify="end">
				<Col span={12}>
					<Form.Item label="Quốc tịch" name="repNationId" labelCol={{ span: 8 }}>
						<Select
							disabled={!canUpdate}
							options={countryList}
							placeholder="Chọn Quốc tịch"
							loading={loadingCountry}
						/>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Dân tộc" name="repFolkId" labelCol={{ span: 8 }}>
						<Select
							disabled={!canUpdate}
							options={dataFolkes}
							placeholder="Chọn dân tộc"
							loading={loadingFolkes}
						/>
					</Form.Item>
				</Col>
			</Row>

			<Form.Item label="Loại giấy chứng thực" name="repPersonalCertTypeId" labelCol={{ span: 4 }}>
				<Select
					disabled={!canUpdate}
					options={dataPersonalCertType}
					placeholder="Loại giấy chứng thực"
					loading={loadingCertType}
				/>
			</Form.Item>

			<Form.Item
				label="Số chứng thực cá nhân"
				name="repPersonalCertNumber"
				rules={[validateMaxLengthStr(30, 'Không nhập quá 30 ký tự')]}
				labelCol={{ span: 4 }}
			>
				<Input disabled={!canUpdate} maxLength={30} placeholder="Số chứng thực cá nhân" />
			</Form.Item>

			<Row justify="end">
				<Col span={12}>
					<Form.Item label="Ngày cấp" name="repPersonalCertDate" labelCol={{ span: 8 }}>
						<DatePicker
							disabled={!canUpdate}
							placeholder="Chọn ngày cấp"
							format="DD/MM/YYYY"
							className="w-full"
							disabledDate={disabledDate}
						/>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Nơi cấp"
						name="repPersonalCertPlace"
						rules={[validateMaxLengthStr(50, 'Không nhập quá 50 ký tự')]}
						labelCol={{ span: 8 }}
					>
						<Input disabled={!canUpdate} maxLength={50} placeholder="Nơi cấp" />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item label="Nơi đăng ký hộ khẩu" name="repRegisteredPlace" labelCol={{ span: 4 }}>
				<Input disabled={!canUpdate} maxLength={500} placeholder="Nơi đăng ký hộ khẩu" />
			</Form.Item>

			<Form.Item label="Chỗ ở hiện tại" name="repAddress" labelCol={{ span: 4 }}>
				<Input disabled={!canUpdate} maxLength={500} placeholder="Chỗ ở hiện tại" />
			</Form.Item>

			{canUpdate && (
				<div className="text-right mt-8">
					<Button type="default" onClick={restore} disabled={!isDirty || updateMutation.isLoading}>
						Hủy
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						className="ml-4"
						disabled={!isDirty}
						loading={updateMutation.isLoading}
					>
						Lưu
					</Button>
				</div>
			)}
		</Form>
	);
}

export default Representative;
