import { FileAddOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select } from 'antd';
import ChooseDepartment from 'app/ComboDepartment/ChooseDepartment';
import ChooseEmp from 'app/ComboDepartment/ChooseEmp';
import { useLng, useUser } from 'app/hooks';
import { CityInfor, DX } from 'app/models';
import { validateRequireInput } from 'app/validator';
import { dropRight, isEmpty, trim } from 'opLodash';
import React from 'react';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';

function DepartmentForm({
	isDirty,
	setDirty,
	onFinish,
	form,
	id,
	initValues,
	type = 'dev',
	insertDepartment,
	updateDepartment,
	componentSize,
	disableInputAddress,
	setDisableInputAddress,
}) {
	const { user } = useUser();
	const CAN_UPDATE =
		(type === 'admin' && DX.canAccessFuture2('admin/update-department', user.permissions)) ||
		(type === 'dev' && DX.canAccessFuture2('dev/update-department', user.permissions)) ||
		(type === 'sme' && DX.canAccessFuture2('sme/update-department', user.permissions));
	const history = useHistory();
	const { pathname } = useLocation();
	const pathToList = dropRight(pathname.split('/')).join('/');
	const { tButton, tField, tValidation, tFilterField } = useLng();
	const { data: categorySelect } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CityInfor.getProvinceById(1);
			return [
				...res.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	function resetFieldAddress() {
		form.setFieldsValue({
			provinceId: undefined,
		});
		setDisableInputAddress(false);
	}
	function onFormChange(value) {
		if (trim(form.getFieldValue('name')) && trim(form.getFieldValue('code'))) {
			setDirty(true);
		} else setDirty(false);
		if (value.parent?.provinceName || value.provinceId) {
			if ((value.parent?.provinceName !== null && value.parent?.provinceId !== null) || value.provinceId) {
				form.setFieldsValue({
					provinceId: value.parent?.provinceId || value.provinceId,
				});
				setDisableInputAddress(!value.provinceId);
			} else {
				resetFieldAddress();
			}
		}
		if (value.parent && isEmpty(value.parent)) {
			resetFieldAddress();
		}
	}
	return (
		<>
			<Form
				layout={type === 'sme' ? 'vertical' : 'horizontal'}
				className="mt-10 mb-5"
				form={form}
				autoComplete="off"
				onFinish={onFinish}
				initialValues={{
					status: `${!initValues && 'ACTIVE'}`,
				}}
				size={componentSize}
				labelCol={{ span: `${type === 'sme' ? '' : 4}` }}
				onValuesChange={onFormChange}
			>
				<Form.Item
					name="name"
					label={tField('departmentName')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'departmentName' }))]}
				>
					<Input disabled={!CAN_UPDATE} placeholder={tField('departmentName')} maxLength={100} autoFocus />
				</Form.Item>
				<Form.Item
					name="code"
					label={tField('departmentCode')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'departmentCode' }))]}
				>
					<Input disabled={!CAN_UPDATE} placeholder={tField('departmentCode')} maxLength={20} />
				</Form.Item>

				<Form.Item name="parent" label={tField('parentDepartmentName')}>
					<ChooseDepartment disabled={!CAN_UPDATE} isSme={type === 'sme'} id={id} />
				</Form.Item>

				{type === 'admin' && (
					<Form.Item name="provinceId" label="Thành phố / Tỉnh">
						<Select
							className="w-60 mr-6"
							disabled={disableInputAddress || !CAN_UPDATE}
							placeholder="Chọn thành phố /tỉnh"
							options={[...categorySelect]}
						/>
					</Form.Item>
				)}

				<Form.Item name="status" label={tField('activeStatus')}>
					<Radio.Group>
						<Radio disabled={!CAN_UPDATE} value="ACTIVE">
							{tFilterField('value', 'on')}
						</Radio>
						<Radio disabled={!CAN_UPDATE} value="INACTIVE">
							{tFilterField('value', 'off')}
						</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item name="employees" label={type !== 'sme' && tField('employeeUnderBoss')} className="relative">
					<ChooseEmp disabled={!CAN_UPDATE} type={type} isSme={type === 'sme'} />
				</Form.Item>

				<div className="flex gap-6 justify-end">
					<Button
						className={`${
							type === 'sme' ? 'uppercase font-semibold w-36' : ''
						} flex justify-center items-center`}
						onClick={() => {
							form.resetFields();
							history.push(pathToList);
						}}
						// block={type === 'sme'}
					>
						{tButton('opt_cancel')}
					</Button>
					<Button
						hidden={!CAN_UPDATE}
						className={`${
							type === 'sme' ? 'uppercase font-semibold w-36' : ''
						} flex justify-center items-center`}
						type="primary"
						htmlType="submit"
						icon={type !== 'sme' && <FileAddOutlined width="w-4" />}
						disabled={!isDirty}
						// block={type === 'sme'}
						loading={insertDepartment?.isLoading || updateDepartment?.isLoading}
					>
						{initValues ? tButton('opt_save') : tButton('opt_create', { field: 'department' })}
					</Button>
				</div>
			</Form>
		</>
	);
}

export default DepartmentForm;
