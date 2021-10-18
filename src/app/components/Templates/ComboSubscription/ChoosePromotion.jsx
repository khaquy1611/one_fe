import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Table, Tooltip } from 'antd';
import { TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity } from 'app/hooks';
import { formatNormalizeCurrency } from 'app/validator';
import React, { useEffect, useState } from 'react';

const ModalChoosePromotion = ({ value, onChange, handleCloseModal, indexRecord, disabled, fn }) => {
	const { tButton, tFilterField, tField } = useLng();
	const [disBtnConfirm, setDisBtnConfirm] = useState(true);

	const { chooseItem, removeChooseItem, itemsPick, configTable } = usePickInfinity({
		callFn: fn,
		indexRecord,
		initItemsPick: [...value],
		ignorekey: 'couponIds',
	});

	useEffect(() => {
		if (itemsPick.length > 0) {
			setDisBtnConfirm(false);
		} else setDisBtnConfirm(true);
	}, [itemsPick]);
	const COLUMN_LEFT = [
		{
			title: <TextInColumn title="Tên khuyến mại" />,
			dataIndex: 'couponName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Hình thức khuyến mại" />,
			dataIndex: 'promotionType',
			render: (_, record) => {
				if (record.listPricing?.length === 0) return record.promotionValue;
				return (
					<div>
						{record.promotionValue}{' '}
						{record.listProduct?.length > 0 && (
							<Tooltip
								title={record.listProduct?.map((item) => (
									<div>{item.productName}</div>
								))}
							>
								<InfoCircleOutlined />
							</Tooltip>
						)}
					</div>
				);
			},
			sorter: true,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: <TextInColumn title="Tên khuyến mại" />,
			dataIndex: 'couponName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Hình thức khuyến mại" />,
			dataIndex: 'promotionType',
			render: (_, record) => {
				if (record.listPricing?.length === 0) return record.promotionValue;
				return (
					<div>
						{record.promotionValue}{' '}
						{record.listProduct?.length > 0 && (
							<Tooltip
								title={record.listProduct?.map((item) => (
									<div>{item.productName}</div>
								))}
							>
								<InfoCircleOutlined />
							</Tooltip>
						)}
					</div>
				);
			},
			sorter: true,
		},
	];

	return (
		<Modal
			title="Chọn khuyến mại"
			width="80vw"
			visible
			onOk={() => {
				onChange([...itemsPick]);
				handleCloseModal();
			}}
			okText="Xác nhận"
			okButtonProps={{ disabled: disBtnConfirm }}
			onCancel={() => {
				handleCloseModal();
			}}
			closable
			maskClosable={false}
			centered
		>
			<div className="grid grid-cols-2 gap-4">
				<div style={{ border: '1px solid #E5E5E5' }}>
					<VirtualTable
						columns={[
							...COLUMN_LEFT,
							{
								align: 'center',
								title: (
									<div>
										{tField('total')}: {configTable.total}
									</div>
								),
								dataIndex: { indexRecord },
								render: (_, record) => (
									<div className="flex items-center h-full text-center">
										<Button
											type="link"
											className="w-full"
											disabled={disabled}
											onClick={() => {
												chooseItem(record[indexRecord]);
											}}
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
								title: (
									<div>
										{tField('total')}: {itemsPick.filter((el) => !el.canNotDelete)?.length}
									</div>
								),
								dataIndex: indexRecord,
								render: (_, record) => (
									<Button
										type="link"
										onClick={() => {
											removeChooseItem(record[indexRecord]);
										}}
									>
										{tButton('deselect')}
									</Button>
								),
								width: 120,
							},
						]}
						scroll={{ y: itemsPick.length >= 10 ? 540 : undefined }}
						dataSource={itemsPick.filter((el) => !el.canNotDelete)}
						pagination={false}
						rowClassName="selected-tb"
					/>
				</div>
			</div>
		</Modal>
	);
};

function ChoosePromotion({
	typePortal = 'DEV',
	pricingValue,
	type,
	priceValue,
	indexService,
	totalCoupon,
	typePop,
	fnCall,
	totalAmountPreTax,
	addonsList,
	dataDetail = {},
	typeChange,
	CAN_UPDATE,
	checkAdmin,
	isOrderService,
	disabled,
	...argss
}) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const { value = [], onChange } = argss;
	return (
		<>
			{(((dataDetail.status === 'ACTIVE' || !dataDetail.id) && dataDetail?.status !== 'CANCELED') ||
				dataDetail?.status === 'FUTURE' ||
				typeChange === 'changeSubscription') &&
				CAN_UPDATE &&
				checkAdmin &&
				!isOrderService && (
					<Button
						className="items-center primary"
						disabled={disabled}
						onClick={() => setIsModalVisible(true)}
						type="primary"
					>
						Chọn khuyến mại
					</Button>
				)}
			{isModalVisible && (
				<ModalChoosePromotion
					value={value}
					onChange={onChange}
					indexRecord="id"
					handleCloseModal={() => setIsModalVisible(false)}
					typePortal={typePortal}
					fn={fnCall}
					disabled={disabled}
				/>
			)}
		</>
	);
}

export default ChoosePromotion;
