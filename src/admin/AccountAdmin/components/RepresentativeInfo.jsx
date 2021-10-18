import { Form, message, Spin } from 'antd';
import { Representative } from 'app/components/Templates';
import { useLng, useUser } from 'app/hooks';
import { DX, Users } from 'app/models';
import moment from 'moment';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

function RepresentativeInfo({ type }) {
	const { tMessage } = useLng();
	const { id } = useParams();
	const [form] = Form.useForm();
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-customer-account', user.permissions);

	const { data: dataRepresentAdmin, refetch, isFetching } = useQuery(
		['getRepresentAdmin'],
		async () => {
			const res = await Users.getRepresentAdmin({ id });
			const data = {
				...res,
				provinceId: `${res.provinceId}/${res.provinceCode}`,
				repBirthday: res.repBirthday ? moment(res.repBirthday, 'DD/MM/YYYY') : null,
				repPersonalCertDate: res.repPersonalCertDate ? moment(res.repPersonalCertDate, 'DD/MM/YYYY') : null,
			};
			form.setFieldsValue(data);
			return data;
		},
		{
			initialData: {},
		},
	);

	const updateMutation = useMutation(Users.setRepresentAdmin, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetch();
		},
		onError: () => message.error(tMessage('opt_badlyUpdated', { field: 'info' })),
	});

	if (isFetching) {
		return (
			<div className="flex justify-center mt-80">
				<Spin />
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto mt-10">
			<Representative
				form={form}
				type={type}
				canUpdate={CAN_UPDATE}
				dataInfo={dataRepresentAdmin}
				updateMutation={updateMutation}
				id={id}
			/>
		</div>
	);
}

export default RepresentativeInfo;
