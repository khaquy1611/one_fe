import React, { useState } from 'react';
import { Button, Form, Input, message, Radio, Select } from 'antd';
import { useLng, useQueryUrl } from 'app/hooks';
import { useMutation, useQuery } from 'react-query';
import SmeSubscription from 'app/models/SmeSubscription';
import { validateMaxLengthStr, validateRequireInput, validateUrl } from 'app/validator';
import { useForm } from 'antd/lib/form/Form';

export default function PreOrder() {
	const [form] = useForm();
	const query = useQueryUrl();
	const [domains, setDomains] = useState(() => JSON.parse(localStorage.getItem('domains') || '{}') || {});
	const preOrderId = query.get('preOrderId');
	const reqSavePreOrder = useMutation(SmeSubscription.reqSavePreOrder, {
		onSuccess: (_, data) => {
			const { domain } = JSON.parse(data.data);
			domains[preOrderId] = domain;
			setDomains(domains);
			localStorage.setItem('domains', JSON.stringify(domains));
			message.success('PreOrder thành công');
		},
		onError: () => {},
	});

	useQuery(
		['getDataCheck'],
		async () => {
			const res = await SmeSubscription.reqCheckPreOder({ preOrderId });
			form.setFieldsValue({
				...JSON.parse(res.data),
			});
			return res;
		},
		{
			initialData: {},
		},
	);

	const onFinish = (data) => {
		reqSavePreOrder.mutate({ preOrderId, data: JSON.stringify(data) });
	};
	const { tValidation } = useLng();
	return (
		<div className="max-w-6xl mx-auto">
			<Form form={form} className="pt-10 pb-20" layout="horizontal" autoComplete="off" onFinish={onFinish}>
				<Form.Item
					name="domain"
					label="Domain"
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'urlOfService' })),
						// validateUrl(tValidation('opt_isNotValid', { field: 'urlOfService' })),
						// validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
						() => ({
							validator: (_, domain) => {
								if (Object.keys(domains).find((key) => domains[key] === domain && key !== preOrderId)) {
									// eslint-disable-next-line prefer-promise-reject-errors
									return Promise.reject('Domain đã tồn tại, vui lòng chọn domain khác');
								}
								return Promise.resolve();
							},
						}),
					]}
				>
					<Input placeholder="Nhập domain" autoFocus />
				</Form.Item>
				{/* <Form.Item name="operatingSystem" label="Hệ điều hành">
					<Select>
						<Select.Option value="window">Window</Select.Option>
						<Select.Option value="ubuntu">Ubuntu</Select.Option>
						<Select.Option value="macos">MacOS</Select.Option>
						<Select.Option value="linux">Linux</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item name="ssd" label="SSD">
					<Radio.Group>
						<Radio value="yes">Có</Radio>
						<Radio value="no">Không</Radio>
					</Radio.Group>
				</Form.Item> */}
				<Form.Item>
					<div className="flex justify-end">
						<Button htmlType="submit" type="primary" className="py-2 px-6">
							Submit
						</Button>
					</div>
				</Form.Item>
			</Form>
		</div>
	);
}
