import { Button, Input, Modal, Table } from 'antd';
import { SelectDebounce, TextInColumn, VirtualTable } from 'app/components/Atoms';
import { useLng, usePickInfinity } from 'app/hooks';
import { SubscriptionDev } from 'app/models';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';
import { uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';

const ModalChooseAccount = ({ value, onChange, handleCloseModal, indexRecord, typePortal }) => {
	const reqParams = {
		portalType: typePortal,
	};
	const { tButton, tFilterField, tField } = useLng();
	const [disBtnConfirm, setDisBtnConfirm] = useState(true);
	const { chooseItem, removeChooseItem, itemsPick, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn: async (params) => {
			const res = await SubscriptionDev.getEMPpopup({ ...params, ...reqParams });
			return res;
		},
		indexRecord,
		extra: ['companyName', 'adminName', 'tin', 'provinceName'],

		initItemsPick: [...value],
		ignorekey: 'removeId',
	});

	const disabled = itemsPick?.length === 1;
	// const disBtnConfirm = itemsPick.length === 0;
	useEffect(() => {
		if (itemsPick.length > 0) {
			setDisBtnConfirm(false);
		} else setDisBtnConfirm(true);
	}, [itemsPick]);
	const { companyName, adminName, tin, provinceName } = filterLocal;
	const COLUMN_LEFT = [
		{
			title: <TextInColumn title="Tên khách hàng" />,
			dataIndex: 'companyName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},

		{
			title: <TextInColumn title="Mã số thuế" />,
			dataIndex: 'tin',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Người đại diện" />,
			dataIndex: 'adminName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: <TextInColumn title="Tỉnh thành" />,
			dataIndex: 'provinceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
	];

	const COLUMN_RIGHT = [
		{
			title: 'Tên khách hàng đã chọn',
			dataIndex: 'companyName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},

		{
			title: <TextInColumn title="Mã số thuế" />,
			dataIndex: 'tin',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
		{
			title: <TextInColumn title="Tỉnh thành" />,
			dataIndex: 'provinceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
		{
			title: <TextInColumn title="Người đại diện" />,
			dataIndex: 'adminName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
		},
	];
	const optionSmeName = async (searchValue) => {
		const res = await ComboSubscriptionDev.getSmeName({
			name: searchValue,
		});

		const temp = res.content?.map((item) => ({
			value: item.name,
			label: item.name,
		}));
		return _uniqBy(temp, 'value');
	};

	const optionAdminName = async (searchValue) => {
		const res = await ComboSubscriptionDev.getAdminName({
			adminName: searchValue || null,
		});
		const temp = res.content?.map((item) => ({
			value: item.adminName,
			label: item.adminName,
		}));
		return _uniqBy(temp, 'value');
	};
	const optionAddress = async (searchValue) => {
		const res = await ComboSubscriptionDev.getListAddress({
			provinceName: searchValue || null,
		});
		const temp = res.content?.map((item) => ({
			value: item.provinceName,
			label: item.provinceName,
		}));
		return _uniqBy(temp, 'value');
	};
	const optionTin = async (searchValue) => {
		const res = await ComboSubscriptionDev.getListTin({
			tin: searchValue || null,
		});
		const temp = res.content?.map((item) => ({
			value: item.tin,
			label: item.tin,
		}));
		return _uniqBy(temp, 'value');
	};

	return (
		<Modal
			title="Chọn khách hàng"
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
			<div className="grid grid-cols-4 gap-2 mb-5">
				<SelectDebounce
					className=" mr-6"
					showSearch
					allowClear
					placeholder="Tên khách hàng: Tất cả"
					fetchOptions={optionSmeName}
					onSelect={onChangeOneParam('companyName')}
					onClear={() => onChangeOneParam('companyName')(undefined)}
					value={companyName}
					maxLength={500}
				/>
				<SelectDebounce
					className=" mr-6"
					showSearch
					allowClear
					placeholder="Mã số thuế: Tất cả"
					fetchOptions={optionTin}
					onSelect={onChangeOneParam('tin')}
					onClear={() => onChangeOneParam('tin')(undefined)}
					value={tin}
					maxLength={100}
				/>
				<SelectDebounce
					className=" mr-6"
					showSearch
					allowClear
					placeholder="Người đại diện: Tất cả"
					fetchOptions={optionAdminName}
					onSelect={onChangeOneParam('adminName')}
					onClear={() => onChangeOneParam('adminName')(undefined)}
					value={adminName}
					maxLength={500}
				/>
				<SelectDebounce
					className=" mr-6"
					showSearch
					allowClear
					placeholder="Tỉnh thành: Tất cả"
					fetchOptions={optionAddress}
					onSelect={onChangeOneParam('provinceName')}
					onClear={() => onChangeOneParam('provinceName')(undefined)}
					value={provinceName}
					maxLength={500}
				/>
			</div>

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
										{tField('total')}: {itemsPick.length}
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
						dataSource={itemsPick}
						pagination={false}
						rowClassName="selected-tb"
					/>
				</div>
			</div>
		</Modal>
	);
};

function ChooseAccountSme({ visible, setVisible, dataDetail, disableSmeAccount, typePortal, ...argss }) {
	const { value = [], onChange } = argss;
	const [isModalVisible, setIsModalVisible] = useState(false);
	return (
		<>
			<Input
				value={`${value[0]?.id ? `${value[0]?.companyName} ` : ``}`}
				readOnly
				onClick={() => setIsModalVisible(true)}
				onSearch={() => setIsModalVisible(true)}
				placeholder="Chọn khách hàng"
				autoComplete="off"
				className="cursor-pointer bg-white"
				disabled={dataDetail.smeId || disableSmeAccount}
			/>

			{isModalVisible && (
				<ModalChooseAccount
					value={value}
					onChange={onChange}
					indexRecord="id"
					handleCloseModal={() => setIsModalVisible(false)}
					typePortal={typePortal}
				/>
			)}
		</>
	);
}

export default ChooseAccountSme;
