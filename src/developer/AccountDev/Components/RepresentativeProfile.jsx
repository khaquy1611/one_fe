import { Form, message, Spin } from 'antd';
import { Representative } from 'app/components/Templates';
import { useLng, useUser } from 'app/hooks';
import { DX } from 'app/models';
import SmeProfile from 'app/models/SmeProfile';
import moment from 'moment';
import React from 'react';
import { useMutation, useQuery } from 'react-query';

function RepresentativeProfile() {
	const { tMessage } = useLng();
	const [form] = Form.useForm();
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('dev/update-enterprise-info', user.permissions);

	const { data: dataRepresentDev, refetch, isFetching } = useQuery(
		['getRepresentDev'],
		async () => {
			const res = await SmeProfile.getRepresent();
			const data = {
				...res,
				provinceId: `${res.provinceId}/${res.provinceCode}`,
				repBirthday: res.repBirthday ? moment(res.repBirthday, 'DD/MM/YYYY') : null,
				repPersonalCertDate: res.repPersonalCertDate ? moment(res.repPersonalCertDate, 'DD/MM/YYYY') : null,
			};
			form.setFieldsValue(data);
			return data;
		},
		{ initialData: {} },
	);

	const updateMutation = useMutation(SmeProfile.setRepresent, {
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
				canUpdate={CAN_UPDATE}
				dataInfo={dataRepresentDev}
				updateMutation={updateMutation}
			/>
		</div>
	);
}

export default RepresentativeProfile;
