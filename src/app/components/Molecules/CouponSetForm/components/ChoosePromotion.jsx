import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { TextInColumn } from 'app/components/Atoms';
import { AddIcon } from 'app/icons';
import { AdminCoupon } from 'app/models';
import React, { useState } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useLng } from 'app/hooks';
import ModalPick from 'admin/Coupon-Addon/Addon/components/TableService';
import { DX } from 'app/models';

const style = { color: '#f5222d' };

export default function ChoosePromotion({ value = {}, onChange, disabled, addonInFor, errorService }) {
	const { list = [], id, name } = value;
	const [openModal, setOpenModal] = useState(false);
	const onChoose = () => {
		setOpenModal(true);
	};
	const { path } = useRouteMatch();
	const { tMessage, tButton, tField } = useLng();
	const COLUMN_LEFT = [
		{
			title: <TextInColumn title={tField('promoName')} />,
			dataIndex: 'name',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: {},
		},
		{
			title: <TextInColumn title={tField('promoCode')} />,
			dataIndex: 'code',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: {},
		},
		{
			title: <TextInColumn title={tField('promoDiscountValue')} />,
			dataIndex: 'discountValue',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: {},
		},
	];

	function deleteList() {
		onChange({ list: [] });
	}

	const history = useHistory();

	return (
		<>
			<div className="flex justify-between items-center">
				{path.indexOf('detail') === -1 && (
					<Button type="text" onClick={onChoose} size="middle">
						{tButton('opt_select', { field: 'prom' })}
					</Button>
				)}
				{tButton('or')}
				{path.indexOf('detail') === -1 && (
					<Button
						type="text"
						size="middle"
						onClick={() => history.push(DX.dev.createPath('/promotion/coupon/create'))}
					>
						{tButton('opt_create', { field: 'prom' })}
					</Button>
				)}
			</div>
			{(list.name || value?.id) && (
				<tbody className="mt-3 ant-table-tbody flex justify-between w-full">
					<tr className="ant-table-row ant-table-row-level-0 change-bg one-tb  w-full">
						<td
							className="ant-table-cell text-base w-full "
							style={list.id === errorService ? style : null}
						>
							{list?.name || value?.name}
						</td>
						<td className="ant-table-cell" style={{ textAlign: 'right' }}>
							<Button
								type="button"
								onClick={deleteList}
								disabled={disabled}
								className="ant-btn ant-btn-text ant-btn-lg ant-btn-icon-only"
							>
								<DeleteOutlined style={list.id === errorService ? style : null} />
							</Button>
						</td>
					</tr>
				</tbody>
			)}

			{openModal && (
				<ModalPick
					title={tMessage('opt_select', { field: 'service' })}
					visible={openModal}
					handleApply={(colorRow) => onChange({ list: colorRow })}
					handleClose={() => setOpenModal(false)}
					callFn={AdminCoupon.getListPromotionDev}
					columsLeft={COLUMN_LEFT}
					indexRecord="id"
					placeholder={tField('opt_search', { field: 'promName' })}
					centered
					picked="promId"
					initItemsPick={list.id ? list : id}
					id={id}
					name={name}
					addonInFor={addonInFor}
				/>
			)}
		</>
	);
}
