import React, { useState } from 'react';
import { Alert, Form, message, Modal, notification, Spin } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

export default function WrapForm({
	FormContent,
	defaultInitValue,
	getInitValue,
	paramsToRefetch = [],
	handleSubmit,
	needConfirm,
	onSuccess,
	...props
}) {
	const [form] = Form.useForm();
	const [isDirty, setDirty] = useState(false);
	const { pathname } = useLocation();
	const { data, refetch } = useQuery(
		[pathname, ...paramsToRefetch],
		async () => {
			try {
				const res = await getInitValue();
				return res;
			} catch (e) {
				return {
					haveError: 'haveError',
				};
			}
		},
		{
			keepPreviousData: true,
			onSuccess: (res) => {
				if (!res.haveError) {
					form.resetFields();
					setDirty(false);
				} else {
					notification.error({
						title: 'Đã có lỗi xảy ra !',
					});
				}
			},
		},
	);
	const submitMutation = useMutation(handleSubmit, {
		onSuccess: (dataSuccess) => {
			if (onSuccess) {
				onSuccess({ dataSuccess, refetch });
			} else {
				message.success(data.id ? 'Cập nhật thành công !' : 'Thêm mới thành công');
				refetch();
			}
		},
		onError: () => {},
	});

	if (!data) {
		return <Spin></Spin>;
	}
	if (data.haveError) {
		return <Alert message="Error" type="error" showIcon />;
	}
	const formConfig = {
		form,
		onValuesChange: (...args) => {
			!isDirty && setDirty(true);
			props.onValuesChange && props.onValuesChange(...args);
		},
		onFinish: (values) => {
			if (needConfirm) {
				Modal.confirm({
					title: needConfirm.title || 'Bạn có chắc chắn không ?',
					onOk: () => submitMutation.mutate(values),
					okButtonProps: {
						loading: submitMutation.isLoading,
					},
					onCancel: () => {
						message.destroy('Thao tác đã bị hủy.');
					},
				});
			} else {
				submitMutation.mutate(values);
			}
		},
	};
	return <FormContent formConfig={formConfig} submitting={submitMutation.isLoading} {...props} />;
}
