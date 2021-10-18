import React, { useState } from 'react';
import { Form, message } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useLng } from 'app/hooks';
import { useHistory } from 'react-router-dom';
import { CategoryPortal, SaasDev, DX } from 'app/models';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import RegisterServiceForm from './RegisterServiceForm';

export default function RegisterService() {
	const [form] = Form.useForm();
	const history = useHistory();
	const [disable, setDisable] = useState(true);
	const { tMessage, tMenu, tValidation } = useLng();

	const insertService = useMutation(SaasDev.insert, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'service' }));
			setTimeout(() => {
				history.push(DX.dev.createPath('/service/list'));
			}, 500);
		},
		onError: (e) => {
			if (e.errorCode === 'error.duplicate.name') {
				form.setFields([
					{
						name: 'serviceName',
						errors: [tValidation('opt_isDuplicated', { field: 'serviceName' })],
					},
				]);
			} else message.error(tMessage('retryError'));
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
			categoriesId: values.category,
			language: values.languageType,
			name: values.serviceName,
			agreement: values.agreement,
		};
		insertService.mutate(req);
	};

	const showButtonSubmit = () => {
		const values = form.getFieldsValue();
		if (values.serviceName && values.languageType && values.category && values.agreement) {
			if (values.languageType.length > 0) {
				setDisable(false);
			} else setDisable(true);
		} else setDisable(true);
	};

	return (
		<>
			<UrlBreadcrumb type="registerService" />
			<p className="text-xl font-semibold my-3">{tMenu('opt_create', { field: 'service' })}</p>
			<div className="max-w-4xl mx-auto mt-10">
				<RegisterServiceForm
					form={form}
					onFinish={onFinish}
					showButtonSubmit={showButtonSubmit}
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
