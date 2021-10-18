import React, { useState } from 'react';
import { Form, message } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { CategoryPortal, DX, DevCombo } from 'app/models';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { useLng, useUser } from 'app/hooks';
import RegisterComboForm from 'admin/Combo/ComboRegister/RegisterComboForm';

export default function RegisterCombo() {
	const [form] = Form.useForm();
	const history = useHistory();
	const goBack = () => {
		history.push(DX.dev.createPath('/combo'));
	};
	const { user } = useUser();
	const CAN_VIEW = DX.canAccessFuture2('dev/view-combo', user.permissions);
	const [disable, setDisable] = useState(true);
	const { tMessage, tValidation, tOthers } = useLng();
	const insertService = useMutation(DevCombo.insert, {
		onSuccess: (data) => {
			message.success('Tạo Combo dịch vụ thành công.');
			CAN_VIEW
				? setTimeout(() => {
						history.push(DX.dev.createPath(`/combo/${data.id}`));
				  }, 500)
				: setTimeout(() => {
						history.push(DX.dev.createPath(`/combo`));
				  }, 500);
		},
		onError: (e) => {
			if (e.errorCode === 'error.duplicate') {
				form.setFields([
					{
						name: 'name',
						errors: ['Tên Combo dịch vụ đã tồn tại'],
					},
				]);
			}
		},
	});

	const { data: selectServiceType, isFetching } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			return res.map((e) => ({
				label: e.name,
				value: e.id,
			}));
		},
		{
			initialData: [],
		},
	);

	const onFinish = (values) => {
		const req = {
			categoryIds: values.categoryIds,
			name: values.name,
		};
		insertService.mutate(req);
	};

	const breadcumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'comboList',
			url: DX.dev.createPath('/combo'),
		},
		{
			name: 'opt_create/serviceCombo',
			url: '',
		},
	];

	return (
		<>
			<UrlBreadcrumb breadcrumbs={breadcumb} />
			<p className="text-xl font-semibold my-3">{tOthers('opt_create', { field: 'serviceCombo' })}</p>
			<div className="mx-auto max-w-4xl mt-10">
				<RegisterComboForm
					form={form}
					goBack={goBack}
					onFinish={onFinish}
					disable={disable}
					isFetching={isFetching}
					selectServiceType={selectServiceType}
					setDisable={setDisable}
					loading={insertService.isPaused}
				/>
			</div>
		</>
	);
}
