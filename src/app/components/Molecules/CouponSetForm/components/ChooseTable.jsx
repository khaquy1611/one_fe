import { Button, Modal, Table, message } from 'antd';
import { SearchCommon, VirtualTable } from 'app/components/Atoms';
import { usePickInfinity, useLng } from 'app/hooks';
import React from 'react';
import { idSelects } from 'actions';
import { useSelector } from 'react-redux';

const checkType = (typeModal, typeTime) => {
	if (typeModal === 'enterpriseType') return 'SME';
	if (typeModal === 'supplierType') return 'DEV';
	return typeTime;
};
const EDIT = 'EDIT';
const TYPE_MODAL = {
	PRICING_TYPE: 'pricingType',
	ADDONS_TYPE: 'addonsType',
};

const style = { color: '#f5222d' };
const checkIdInactive = (arr, id) => {
	if (arr && arr.length > 0) return arr.includes(id);
	return false;
};

const TableToPick = ({
	columsLeft,
	columsRight,
	searchText,
	indexRecord,
	chooseItem,
	placeholder,
	onChangeOneParam,
	configTable,
	removeChooseItem,
	itemsPick,
	onlyView,
	typeProduct,
}) => {
	const idArrInactive = useSelector(idSelects.selectId);
	const { tField, tButton } = useLng();

	// don't allow choose 2 pack of service
	const onClickPickPricing = (record) => {
		const indexDup = [].concat(itemsPick).findIndex((e) => e.serviceName === record.serviceName);
		if (indexDup !== -1 && indexRecord === 'idPick' && typeProduct) {
			message.error('Chỉ được chọn tối đa một gói dịch vụ trong cùng một dịch vụ');
		} else chooseItem(record[indexRecord]);
	};

	return (
		<div className="w-full">
			<div className="flex justify-between items-end mb-4">
				<SearchCommon
					placeholder={placeholder}
					onSearch={(valueSearch) => {
						onChangeOneParam('searchText')(valueSearch);
					}}
					defaultValue={searchText}
					autoFocus
					maxLength={250}
					className="w-68"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div style={{ border: '1px solid #E5E5E5' }}>
					<VirtualTable
						columns={[
							...columsLeft,
							{
								align: 'center',
								title: (
									<div>
										{tField('total')}: {configTable.total}
									</div>
								),
								dataIndex: indexRecord,
								render: (_, record) => (
									<div className="flex items-center h-full text-center">
										<Button
											type="link"
											className="w-full"
											disabled={onlyView}
											onClick={() => onClickPickPricing(record)}
										>
											{tButton('opt_select')}
										</Button>
									</div>
								),
								width: 150,
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
							...columsRight,
							{
								align: 'center',
								title: (
									<div>
										{tField('total')}: {itemsPick.length}
									</div>
								),
								dataIndex: indexRecord,
								render: (_, record) => (
									<Button
										disabled={onlyView}
										type="link"
										onClick={() => {
											removeChooseItem(record[indexRecord]);
										}}
										style={checkIdInactive(idArrInactive.idArr, record[indexRecord]) ? style : null}
									>
										{tButton('deselect')}
									</Button>
								),
								width: 150,
							},
						]}
						scroll={{ y: itemsPick.length >= 10 ? 540 : undefined }}
						dataSource={itemsPick}
						pagination={false}
						rowClassName="selected-tb"
					/>
				</div>
			</div>
		</div>
	);
};

const ModalPick = ({
	callFn,
	indexRecord,
	title,
	visible,
	handleApply,
	handleClose,
	columsLeft,
	columsRight,
	placeholder,
	initItemsPick = [],
	width = '80vw',
	typeModal = '',
	onlyView,
	pricingsId,
	pricingsIdPromo,
	picked,
	typeTime,
	typeCoupon = '',
	couponInfo,
	valueRad,
	typeAddon,
	addonInFor,
	typeProduct,
	dayValue,
}) => {
	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn,
		indexRecord,
		extra: ['searchText'],
		defaultParams: {
			type: checkType(typeModal, typeTime),
			pricingIds: typeModal === TYPE_MODAL.PRICING_TYPE ? pricingsId || pricingsIdPromo : '',
			portalType: typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE ? couponInfo?.portalType : null,
			isCreate: !(typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE),
			createdBy: typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE ? couponInfo?.createdBy : null,
			couponId: typeCoupon === EDIT && typeModal === TYPE_MODAL.ADDONS_TYPE ? couponInfo?.id : null,
			bonusType: valueRad || null,
			addonId: typeAddon === EDIT ? addonInFor?.id : null,
			value: dayValue || undefined,
		},

		initItemsPick,
		ignorekey: `${picked}`,
	});

	const { searchText } = filterLocal;
	const { tMessage } = useLng();
	return (
		<Modal
			title={title}
			visible={visible}
			onOk={() => {
				handleClose();
				handleApply(itemsPick);
			}}
			okText={tMessage('apply')}
			okButtonProps={{ disabled: onlyView }}
			width={width}
			onCancel={() => handleClose()}
			closable
			maskClosable={false}
			centered
		>
			<TableToPick
				columsLeft={columsLeft}
				columsRight={columsRight}
				indexRecord={indexRecord}
				placeholder={placeholder}
				searchText={searchText}
				configTable={configTable}
				removeChooseItem={removeChooseItem}
				onChangeOneParam={onChangeOneParam}
				chooseItem={chooseItem}
				itemsPick={itemsPick}
				typeProduct={typeProduct}
				onlyView={onlyView}
			/>
		</Modal>
	);
};

export default ModalPick;
