import React, { useState } from 'react';
import { Button, Select, Table, Tag } from 'antd';
import { useNavigation, usePaginationLocal, useLng } from 'app/hooks';
import { AdminCombo, DX } from 'app/models';
import { useQuery } from 'react-query';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { renderOptions } from 'app/components/Atoms';

const { Option } = Select;
function HistoryCombo({ data, setActive, portal }) {
	const { goBack } = useNavigation();
	const history = useHistory();
	const { id, comboId } = useParams();
	const { pathname } = useLocation();
	const [objMax, setObjMax] = useState({});
	const { configTable, filterLocal, onChangeOneParam } = usePaginationLocal(
		async (params) => {
			const res = await AdminCombo.getListHistoryByComboId(data.id, {
				...params,
			});
			const max = res.content.reduce((prev, current) =>
				current.objectId > prev.objectId && current.status === 'APPROVED' ? current : prev,
			);
			setObjMax(max);
			return res;
		},
		['type', 'status'],
		{
			sort: 'createdAt,desc',
		},
		'AdminCombo.getListHistoryByComboId',
		{
			enabled: !!data?.id,
		},
	);

	const { version = '', status = '', actionType = '' } = filterLocal;
	const { tButton, tField, tFilterField } = useLng();
	const STATUS_CODE = {
		AWAITING_APPROVAL: {
			label: 'Chờ duyệt',
			color: 'orange',
		},
		UNAPPROVED: {
			label: 'Chưa duyệt',
			color: 'default',
		},
		APPROVED: {
			label: 'Đã duyệt',
			color: 'success',
		},
		REJECTED: {
			label: 'Từ chối',
			color: 'red',
		},
	};
	function handleClickHistory(value) {
		if (value.objectId === objMax.objectId) {
			history.replace(`${pathname}?tab=2`);
			setActive('2');
		} else if (portal === 'dev') {
			history.push(DX.dev.createPath(`/combo/${id}/history/${value.objectId}`));
		} else history.push(DX.admin.createPath(`/combo/${id}/history/${value.objectId}`));
	}

	const columns = [
		{
			title: tField('item'),
			dataIndex: 'objectName',
			key: 'object',
			sorter: {},
		},
		{
			title: 'Phiên bản',
			dataIndex: 'version',
			render: (value, record) =>
				record.actionType === 'COMBO' ? (
					<Button type="link" className="m-0 p-0 h-3" onClick={() => handleClickHistory(record)}>
						<div className="truncate">{value}</div>
					</Button>
				) : (
					''
				),
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			render: (value, record) => (
				<Tag color={STATUS_CODE[record.status].color}>{STATUS_CODE[record.status].label}</Tag>
			),
			key: 'approve',
			sorter: {},
		},
		{
			title: tField('content'),
			dataIndex: 'content',
			key: 'content',
			sorter: {},
		},
		{
			title: tField('influencer'),
			dataIndex: 'actor',
			render: (value, record) => <div>{`${record.actor} (${record.portal})`}</div>,
			key: 'portal',
			sorter: {},
		},
		{
			title: tField('time'),
			dataIndex: 'createdAt',
			render: (value) => <div>{DX.formatTime(value, 'YYYY-MM-DD HH:mm:ss')}</div>,
			key: 'createdAt',
			sorter: {},
		},
	];

	return (
		<>
			<div className="flex gap-10">
				<Select className="flex-1" defaultValue={actionType} onChange={onChangeOneParam('actionType')}>
					{renderOptions('Đối tượng', [
						{ value: '', label: 'Tất cả' },
						{ value: 'COMBO', label: 'Combo dịch vụ' },
						{ value: 'COMBO_PLAN', label: 'Gói Combo dịch vụ' },
					])}
				</Select>
				<Select className="flex-1" defaultValue={version} onChange={onChangeOneParam('version')}>
					{renderOptions('Phiên bản', [
						{ value: '', label: 'Tất cả' },
						{ value: 'LATEST', label: 'Mới nhất' },
						{ value: 'OLDEST', label: 'Cũ nhất' },
					])}
				</Select>
				<Select className="flex-1" defaultValue={status} onChange={onChangeOneParam('status')}>
					{renderOptions('Trạng thái', [
						{ value: '', label: 'Tất cả' },
						{ value: 'APPROVED', label: 'Đã duyệt' },
						{ value: 'AWAITING_APPROVAL', label: 'Chờ duyệt' },
						{ value: 'UNAPPROVED', label: 'Chưa duyệt' },
						{ value: 'REJECTED', label: 'Từ chối' },
					])}
				</Select>
			</div>
			<Table className="mt-8" columns={columns} {...configTable} />
			<Button
				className="w-20 float-right"
				htmlType="button"
				onClick={() => goBack(DX.admin.createPath('/combo'))}
			>
				{tButton('opt_cancel')}
			</Button>
		</>
	);
}
HistoryCombo.propTypes = {};
export default HistoryCombo;
