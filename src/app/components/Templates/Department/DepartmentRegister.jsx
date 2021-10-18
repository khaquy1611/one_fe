import { Form, message } from 'antd';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { useLng } from 'app/hooks';
import DepartmentDev from 'app/models/DepartmentDev';
import { dropRight } from 'opLodash';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import DepartmentForm from './DepartmentForm';

function DepartmentRegister({ type, componentSize }) {
	const [form] = Form.useForm();
	const { pathname } = useLocation();
	const pathToList = dropRight(pathname.split('/')).join('/');
	const [isDirty, setDirty] = useState(false);
	const { tMessage, tValidation } = useLng();
	const breadcrumbs = [
		{
			name: 'opt_manage/acc',
			url: '',
		},
		{
			name: 'departmentList',
			url: pathToList,
		},
		{
			name: 'opt_create/department',
			url: '',
		},
	];
	const [disableInputAddress, setDisableInputAddress] = useState(false);
	const history = useHistory();
	const insertDepartment = useMutation(DepartmentDev.insertDepartment, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'department' }));
			setTimeout(() => {
				history.push(pathToList);
			}, 500);
		},

		onError: (e) => {
			if (e.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'departmentName' })],
					},
				]);
			} else if (e.errorCode === 'error.duplicate.code') {
				form.setFields([
					{
						name: 'code',
						errors: [tValidation('opt_isDuplicated', { field: 'departmentCode' })],
					},
				]);
			} else if (e.errorCode === 'error.inactive.department.can.not.create') {
				message.error(tMessage('err_inactive_department_not_create_turnOff'));
			} else if (e.errorCode === 'error.duplicate.name.by.parent') {
				form.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'parentDepartmentName' })],
					},
				]);
			} else if (e.errorCode === 'error.active.department.can.not.create') {
				message.error(tMessage('err_active_department_not_create'));
			} else if (e.errorCode === 'error.parent.department.inactive') {
				message.error(tMessage('err_parent_department_inactive'));
			} else if (e.errorCode === 'error.department.can.not.save') {
				message.error(tMessage('err_department_not_save'));
			} else if (e.errorCode === 'error.parent.department.not.found') {
				message.error(tMessage('err_parent_department_not_found'));
			}
		},
	});

	function onFinish(values) {
		insertDepartment.mutate({
			...values,
			parentId: values.parent?.id,
			employees: values.employees?.map((a) => a.userId || a.id),
		});
	}
	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={type === 'sme' ? breadcrumbs.slice(1) : breadcrumbs} />
			<div className={`mt-10 ${type === 'sme' ? 'bg-white' : 'max-w-5xl mx-auto'} `}>
				<div className={` ${type === 'sme' ? 'max-w-3xl mx-auto p-5' : ''}`}>
					<DepartmentForm
						form={form}
						onFinish={onFinish}
						type={type}
						isDirty={isDirty}
						setDirty={setDirty}
						componentSize={componentSize}
						insertDepartment={insertDepartment}
						disableInputAddress={disableInputAddress}
						setDisableInputAddress={setDisableInputAddress}
					/>
				</div>
			</div>
		</div>
	);
}

export default DepartmentRegister;
