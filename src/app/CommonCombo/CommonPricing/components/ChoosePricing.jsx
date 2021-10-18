/* eslint-disable no-param-reassign */
import React from 'react';
import { CategoryPortal, ComboPricing, SubcriptionPlanDev } from 'app/models';
import { usePickInfinity, useLng } from 'app/hooks';
import { SearchCommon, renderOptions, VirtualTable } from 'app/components/Atoms';
import { Button, Select, Table, Modal, message } from 'antd';
import { idSelects } from 'actions';
import { useDispatch, useSelector } from 'react-redux';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import { useQuery } from 'react-query';

const style = { color: '#f5222d' };
const checkIdInactive = (arr, id) => {
	if (arr && arr.length > 0) return arr.includes(id);
	return false;
};

const ModalChoosePricing = ({
	value,
	comboOwner,
	comboType,
	onChange,
	handleCloseModal,
	indexRecord,
	disabled,
	portal,
	onChangePriceFormValue,
}) => {
	const dispatch = useDispatch();
	const idArrInactive = useSelector(idSelects.selectId);
	const { tButton } = useLng();

	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await ComboPricing.getListPricingForCombo(portal, params);
			res.content.forEach((el, index) => {
				el.pricingId = el.id;
				el.index = index;
				if (
					el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[0].value ||
					el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[1].value
				) {
					el.formulas = el.price;
				}
				if (el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[0].value) {
					delete el.price;
					el.showInputCount = false;
				} else {
					el.price = 0;
					el.showInputCount = true;
				}
				if (el.pricingPlan === SubcriptionPlanDev.selectPricingPlan[1].value) {
					el.showInputFree = true;
				} else el.showInputFree = false;
			});
			return res;
		},
		indexRecord,
		extra: ['name', 'categoryId'],
		defaultParams: { comboOwner, comboType },
		initItemsPick: [...value],
		ignorekey: 'pricingId',
	});
	const { data: categoryOptions, isFetching } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			const arr = [
				{
					label: 'Tất cả',
					value: null,
				},
			];
			res.forEach((e) => {
				arr.push({
					label: e.name,
					value: e.id,
				});
			});
			return arr;
		},
		{
			initialData: [],
		},
	);

	const handleOk = () => {
		dispatch(
			comboPricingActions.initComboPricing({
				pricingCombo: itemsPick,
				totalPrice: 0,
				amount: 0,
			}),
		);
		onChange([...itemsPick]);
		onChangePriceFormValue(itemsPick, 'pricingCombo');
		handleCloseModal();
	};

	const { name } = filterLocal;
	const COLUMN_LEFT = [
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceName',
			ellipsis: true,
			sorter: true,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'name',
			ellipsis: true,
			sorter: true,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: 'Danh sách gói đã chọn',
			dataIndex: 'name',
			ellipsis: true,
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
	];

	const onClickPickPricing = (record) => {
		if (itemsPick.length < 30) {
			const indexDup = [].concat(itemsPick).findIndex((e) => e.serviceId === record.serviceId);
			if (indexDup > -1) {
				message.error('Chỉ được chọn tối đa một gói dịch vụ trong cùng một dịch vụ');
			} else chooseItem(record[indexRecord]);
		} else message.warning('Số lượng gói dịch vụ trong Combo không được vượt quá 30 gói');
	};

	return (
		<Modal
			title="Chọn gói dịch vụ"
			width="80vw"
			visible
			onOk={handleOk}
			okText="Thêm gói dịch vụ"
			okButtonProps={{ disabled }}
			onCancel={() => {
				handleCloseModal();
			}}
			closable
			maskClosable={false}
			centered
		>
			<div className="grid grid-cols-4 gap-2 mb-5">
				<SearchCommon
					placeholder="Tìm dịch vụ, gói dịch vụ"
					onSearch={onChangeOneParam('name')}
					defaultValue={name}
				/>
				<Select loading={isFetching} defaultValue={null} onSelect={onChangeOneParam('categoryId')}>
					{renderOptions('Danh mục', categoryOptions)}
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div style={{ border: '1px solid #E5E5E5' }}>
					<VirtualTable
						columns={[
							...COLUMN_LEFT,
							{
								align: 'center',
								dataIndex: { indexRecord },
								render: (_, record) => (
									<div className="flex items-center h-full text-center">
										<Button
											type="link"
											className="w-full"
											disabled={disabled}
											onClick={() => onClickPickPricing(record)}
										>
											{tButton('opt_select', { field: '' })}
										</Button>
									</div>
								),
								width: 100,
							},
						]}
						chooseItem={chooseItem}
						{...configTable}
					/>
				</div>
				<div style={{ border: '1px solid #E5E5E5' }}>
					<Table
						rowKey={indexRecord}
						columns={[
							...COLUMN_RIGHT,
							{
								align: 'center',
								dataIndex: indexRecord,
								render: (_, record) => (
									<Button
										disabled={disabled}
										type="link"
										onClick={() => {
											removeChooseItem(record[indexRecord]);
										}}
										style={checkIdInactive(idArrInactive.idArr, record[indexRecord]) ? style : null}
									>
										{tButton('deselect')}
									</Button>
								),
								width: 120,
							},
						]}
						scroll={{ y: itemsPick.length >= 10 ? 540 : undefined }}
						dataSource={itemsPick}
						pagination={false}
						rowClassName="selected-tb"
					/>
				</div>
			</div>
		</Modal>
	);
};

function ChoosePricing({
	disabled,
	visible,
	setVisible,
	portal,
	onChangePriceFormValue,
	getComboType,
	getComboOwner,
	...argss
}) {
	const { value = [], onChange } = argss;

	return (
		<>
			{visible && (
				<ModalChoosePricing
					value={value}
					comboOwner={getComboOwner}
					comboType={getComboType}
					onChange={onChange}
					portal={portal}
					indexRecord="id"
					disabled={disabled}
					onChangePriceFormValue={onChangePriceFormValue}
					handleCloseModal={() => setVisible(false)}
				/>
			)}
		</>
	);
}

export default ChoosePricing;
