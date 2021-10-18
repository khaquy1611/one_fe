import { Button, Checkbox, Drawer, Form, Input, Radio, Select } from 'antd';
import { filterOption, renderOptions } from 'app/components/Atoms';
import { useLng, useUser } from 'app/hooks';
import { DX, RoleAdmin } from 'app/models';
import DepartmentDev from 'app/models/DepartmentDev';
import { validateEmail, validateRequire, validateRequireInput } from 'app/validator';
import { noop, trim } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

function AdminForm({ closeForm, account, visible, onFinish, form }) {
	const { user } = useUser();
	const nameRef = React.useRef();
	const [isDirty, setDirty] = useState(false);
	const { tField, tButton, tValidation, tFilterField } = useLng();
	const [searchDepartment, setSearchDepartment] = useState('');

	useEffect(() => {
		setTimeout(() => {
			if (visible && nameRef) {
				nameRef.current.focus({
					cursor: 'end',
				});
			}
		}, 100);
	}, [visible]);

	const [roles, setRoles] = useState([]);
	useQuery(
		['GetRoleAdmin'],
		async () => {
			const res = await RoleAdmin.getAll({ portalType: 'ADMIN', size: 1000 });
			setRoles(res.content);
			return res;
		},
		{ desValues: [] },
	);

	const { data: optionDepartment } = useQuery(
		['getOptionDepartment'],
		async () => {
			const content = await DepartmentDev.getAllDepartment();
			return [
				...content.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	return (
		<Drawer
			title={account.id ? tField('opt_edit', { field: 'acc' }) : tField('opt_create', { field: 'acc' })}
			width={400}
			onClose={closeForm}
			visible={visible}
			footer={
				<div className="text-right">
					<Button onClick={closeForm}>{tButton('opt_cancel')}</Button>
					<Button
						htmlType="submit"
						className="ml-4"
						type="primary"
						onClick={() => form.submit()}
						disabled={!isDirty}
					>
						{account.id ? tButton('opt_save') : tButton('opt_create')}
					</Button>
				</div>
			}
			maskClosable={false}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={(value) => {
					const rolesData = value.roles.concat(DX.ADMIN_ROLES).filter((x, i, a) => a.indexOf(x) === i);
					onFinish({ ...value, roles: rolesData });
				}}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item
					name="email"
					label={tField('email')}
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
					]}
				>
					<Input placeholder={tField('email')} maxLength={100} ref={nameRef} />
				</Form.Item>
				<Form.Item
					name="lastname"
					label={tField('lastName')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' }))]}
				>
					<Input placeholder={tField('lastName')} maxLength={20} />
				</Form.Item>
				<Form.Item
					name="firstname"
					label={tField('firstName')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' }))]}
				>
					<Input placeholder={tField('firstName')} maxLength={20} />
				</Form.Item>
				<Form.Item
					name="departmentId"
					label="Bộ phận"
					rules={[validateRequireInput('Bộ phận không được bỏ trống')]}
				>
					<Select
						showSearch
						allowClear
						onSearch={setSearchDepartment}
						searchValue={searchDepartment}
						className="w-60 mr-6"
						placeholder="Chọn bộ phận"
						filterOption={filterOption}
					>
						{renderOptions('', [...optionDepartment])}
					</Select>
				</Form.Item>
				<Form.Item
					name="roles"
					label={tField('decentralization')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'decentralization' }))]}
				>
					<Checkbox.Group className="leading-9 max-h-96 overflow-auto w-full">
						{roles.map((x) => (
							<div key={x.id}>
								<Checkbox value={x.id}>{x.displayName}</Checkbox>
							</div>
						))}
					</Checkbox.Group>
				</Form.Item>
				<Form.Item name="status" label={<span style={{ marginBottom: '-8px' }}>{tField('status')}</span>}>
					<Radio.Group>
						<Radio
							value="ACTIVE"
							disabled={!DX.canAccessFuture2('admin/change-status-admin-account', user.permissions)}
						>
							{tFilterField('value', 'active')}
						</Radio>
						<Radio
							value="INACTIVE"
							disabled={!DX.canAccessFuture2('admin/change-status-admin-account', user.permissions)}
						>
							{tFilterField('value', 'inactive')}
						</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Drawer>
	);
}
AdminForm.propTypes = {
	visible: PropTypes.bool,
	closeForm: PropTypes.func,
	onFinish: PropTypes.func,
	form: PropTypes.instanceOf(Object).isRequired,
	account: PropTypes.objectOf(PropTypes.any).isRequired,
};

AdminForm.defaultProps = {
	visible: false,
	closeForm: noop,
	onFinish: noop,
};
export default AdminForm;
