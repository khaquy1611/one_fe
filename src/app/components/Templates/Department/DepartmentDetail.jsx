import { Form, message } from 'antd';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import WrapDetail from 'app/HOCs/WrapDetail';
import { useLng, useNavigation } from 'app/hooks';
import DepartmentDev from 'app/models/DepartmentDev';
import { dropRight } from 'opLodash';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import DepartmentForm from './DepartmentForm';

const getInitializeValues = (values) => {
	const initials = [];
	Object.keys(values).forEach((key) => {
		initials.push({
			value: values[key],
			touched: false,
			name: key,
		});
	});
	return initials;
};
function DepartmentDetail({ type, setHaveError, componentSize }) {
	const idDepart = parseInt(useParams().id, 10);
	const [form] = Form.useForm();
	const history = useHistory();
	const { pathname } = useLocation();
	const pathToList = dropRight(pathname.split('/')).join('/');
	const [isDirty, setDirty] = useState(false);
	const typeDeportal = type ? type.toUpperCase() : 'DEV';
	const { tMessage, tValidation, tMenu } = useLng();

	const updateDepartment = useMutation(DepartmentDev.updateDepartmentById, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'department' }));
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
			} else if (e.errorCode === 'error.department.active.sub.department') {
				message.error(tMessage('err_department_active_sub_department'));
			} else if (e.errorCode === 'error.department.can.not.save') {
				message.error(tMessage('err_department_not_save'));
			} else if (e.errorCode === 'error.parent.department.not.found') {
				message.error(tMessage('err_parent_department_not_found'));
			}
			// else if (e.errorCode === 'error.parent.department.not.found') {
			// 	message.error(tMessage("")'Bạn không có quyền chỉnh sửa');
			// }
			else {
				e.callbackUrl = pathToList;
				setHaveError(e);
			}
		},
	});
	function onFinish(values) {
		updateDepartment.mutate({
			id: idDepart,
			portalType: typeDeportal,
			data: {
				...values,
				parentId: values.parent?.id,
				employees: values.employees?.map((a) => a.userId || a.id),
			},
		});
	}
	const [disableInputAddress, setDisableInputAddress] = useState(false);
	const { data: initValues } = useQuery(
		['getSassInfo', idDepart],
		async () => {
			try {
				const res = await DepartmentDev.getOneByIdDepartment(idDepart, typeDeportal);
				form.setFields(
					getInitializeValues({
						status: 'ACTIVE',
						...res,
						parent: {
							code: res.parentCode,
							name: res.parentName,
							id: res.parentId,
						},
					}),
				);
				setDisableInputAddress(initValues && res.provinceId !== null && res.parentId !== null);
				return res;
			} catch (e) {
				e.callbackUrl = pathToList;
				return setHaveError(e);
			}
		},
		{ initialData: {} },
	);
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
			isName: true,
			name: initValues.name,
			url: '',
		},
	];
	return (
		<div className="pb-8">
			<UrlBreadcrumb breadcrumbs={type === 'sme' ? breadcrumbs.slice(1) : breadcrumbs} />

			<div className={`mt-10 ${type === 'sme' ? 'bg-white' : 'max-w-5xl mx-auto'} `}>
				<div className={` ${type === 'sme' ? 'max-w-3xl mx-auto p-5' : ''}`}>
					<DepartmentForm
						componentSize={componentSize}
						form={form}
						initValues={initValues}
						onFinish={onFinish}
						type={type}
						isDirty={isDirty}
						setDirty={setDirty}
						id={idDepart}
						updateDepartment={updateDepartment}
						disableInputAddress={disableInputAddress}
						setDisableInputAddress={setDisableInputAddress}
					/>
				</div>
			</div>
		</div>
	);
}

export default WrapDetail(DepartmentDetail);
