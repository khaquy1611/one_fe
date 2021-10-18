import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { DX, SubcriptionPlanDev } from 'app/models';
import { TableDragSorting } from 'app/components/Atoms';
import { Button, message, Modal, Radio } from 'antd';
import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigation, useLng } from 'app/hooks';

const CustomRadio = ({ isChecked, onChange }) => {
	if (isChecked) {
		return (
			<div
				onClickCapture={() => {
					onChange();
				}}
			>
				<Radio checked />
			</div>
		);
	}
	return <Radio onChange={onChange} />;
};

function RecommendedSubscription({ refetchInfoService, isDirty, setIsDirty }) {
	const { id } = useParams();
	const { goBack } = useNavigation();
	const [data, setData] = useState([]);
	const { tButton, tField, tMessage } = useLng();

	const { refetch, data: initValues } = useQuery(
		['getSubscription', id],
		async () => {
			try {
				const res = await SubcriptionPlanDev.getListPricingForService(id);
				const rs = res.map((e, i) => ({
					...e,
					index: i,
				}));
				setData(rs);
				return rs;
			} catch (e) {
				return {};
			}
		},
		{ initialData: {} },
	);

	const updateRecommendSubscription = useMutation(SubcriptionPlanDev.updateRecommendedSubscription, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated', { field: 'servicePackageSetting' }));
			setIsDirty(false);
			refetchInfoService();
			refetch();
		},
		onError: (err) => {
			if (err.errorCode === 'error.valid.pattern' && err.object === 'pricing') {
				message.error(tMessage('err_valid_pattern'));
			}
			refetch();
		},
	});

	function changeRecommend(value, index) {
		const rf = data;
		if (value.recommendedStatus === 'RECOMMENDED') {
			rf[index].recommendedStatus = 'UN_RECOMMENDED';
		} else {
			const i = rf.findIndex((e) => e.recommendedStatus === 'RECOMMENDED');
			if (i > -1) rf[i].recommendedStatus = 'UN_RECOMMENDED';
			rf[index].recommendedStatus = 'RECOMMENDED';
		}
		setData([...rf]);
		setIsDirty(true);
	}

	function updateSubscription() {
		if (data.length === 0) return;
		Modal.confirm({
			title: tMessage('opt_wantToUpdate', { field: 'servicePackageSetting' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				const rs = data.map((e, i) => ({
					id: e.id,
					displayedOrder: i + 1,
					recommendedStatus: e?.recommendedStatus === 'RECOMMENDED' ? 'RECOMMENDED' : 'UN_RECOMMENDED',
				}));
				updateRecommendSubscription.mutate({
					serviceId: id,
					body: [...rs],
				});
			},
			confirmLoading: updateRecommendSubscription.isLoading,
		});
	}

	const columns = [
		{
			title: tField('displayOrder'),
			dataIndex: 'id',
			key: 'id',
			align: 'center',
			render: (value, record, index) => index + 1,
		},
		{
			title: tField('servicePackageName'),
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: tField('recommendation'),
			dataIndex: 'recommendedStatus',
			key: 'recommendedStatus',
			render: (value, record, index) => (
				<CustomRadio isChecked={value === 'RECOMMENDED'} onChange={() => changeRecommend(record, index)} />
			),
		},
	];

	return (
		<>
			<TableDragSorting columns={columns} data={data} setData={setData} setIsDirty={setIsDirty} />
			<div className="mt-5 float-right">
				<Button className="w-20 " htmlType="button" onClick={() => goBack(DX.dev.createPath('/service/list'))}>
					{tButton('opt_cancel')}
				</Button>
				<Button
					type="primary"
					disabled={data.length === 0 || !isDirty}
					icon={<SaveOutlined />}
					className="ml-5"
					onClick={() => updateSubscription()}
				>
					{tButton('update')}
				</Button>
			</div>
		</>
	);
}

export default RecommendedSubscription;
