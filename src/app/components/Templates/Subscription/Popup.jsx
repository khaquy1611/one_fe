import { Checkbox, Modal, Radio, Table } from 'antd';
import { SearchCommon } from 'app/components/Atoms';
import { usePaginationLocal } from 'app/hooks';
import React, { useState } from 'react';

const TableToPick = ({
	columsRight,
	searchText,
	placeholder,
	onChangeOneParam,
	typeModal = '',
	valueSearchText,
	typePortal,
	configTable,
	valueSelect,
	pageSize,
	page,
	setValueSelect,
	setDis,
	totalCoupon,
}) => (
	<div className="w-full">
		{typeModal !== 'PROMOTION' && (
			<div className={`flex ${typePortal !== 'DEV' && 'justify-between'} items-end mb-4`}>
				<SearchCommon
					placeholder={placeholder && placeholder[0]}
					onSearch={(valueSearch) => {
						onChangeOneParam(searchText[0])(valueSearch);
					}}
					defaultValue={
						valueSearchText &&
						(valueSearchText.pricingSearch ||
							(typeModal !== 'PRICING' && valueSearchText.companySearch) ||
							valueSearchText.nameSearch)
					}
					autoFocus
					maxLength={typePortal === 'CUSTOMER' ? 500 : undefined}
					className="w-68"
				/>
				<SearchCommon
					placeholder={placeholder && placeholder[1]}
					onSearch={(valueSearch) => {
						onChangeOneParam(searchText[1])(valueSearch);
					}}
					defaultValue={valueSearchText && (valueSearchText.serviceSearch || valueSearchText.adminSearch)}
					maxLength={typePortal === 'CUSTOMER' ? 40 : undefined}
					className={`w-68 ${typePortal === 'DEV' && 'ml-4'}`}
				/>
				{typePortal !== 'DEV' && (
					<SearchCommon
						placeholder={placeholder && placeholder[2]}
						onSearch={(valueSearch) => {
							onChangeOneParam(searchText[2])(valueSearch);
						}}
						defaultValue={
							valueSearchText &&
							(valueSearchText.taxCode ||
								(typeModal !== 'CUSTOMER' ? valueSearchText.companySearch : null))
						}
						maxLength={typePortal === 'CUSTOMER' ? 13 : undefined}
						className="w-68"
					/>
				)}
			</div>
		)}
		<div style={{ border: '1px solid #E5E5E5' }}>
			<Table
				rowKey=""
				columns={[
					{
						title: '#',
						key: 'key',
						render: (value, item, index) => (page - 1) * pageSize + index + 1,
						width: 80,
					},
					...columsRight,
					{
						title: 'Chọn',
						dataIndex: 'id',
						align: 'center',
						render(idEmp, record) {
							const checked = valueSelect[idEmp];

							return typeModal === 'CUSTOMER' ||
								typeModal === 'PRICING' ||
								(record.systemParamCoupon !== 'UNLIMITED' &&
									typeModal === 'PROMOTION' &&
									totalCoupon.length < 2) ? (
								<Radio
									checked={checked}
									onChange={(e) => {
										if (checked) {
											delete valueSelect[idEmp];
											setValueSelect(valueSelect);
										} else {
											setValueSelect({
												[idEmp]: record,
											});
										}
										setDis(false);
									}}
								/>
							) : (
								<Checkbox
									checked={checked}
									onChange={(e) => {
										if (checked) {
											delete valueSelect[idEmp];
											setValueSelect({ ...valueSelect });
										} else {
											setValueSelect({
												...valueSelect,
												[idEmp]: record,
											});
										}
										setDis(false);
									}}
								/>
							);
						},
						width: 80,
					},
				]}
				{...configTable}
				scroll={{ y: 540 }}
				// dataSource={dataSource}
			/>
		</div>
	</div>
);

const ModalPick = ({
	callFn,
	title,
	handleClose,
	columns,
	placeholder,
	visible,
	value,
	onChange,
	searchText,
	typeModal,
	typePortal,
	totalCoupon = [],
	type,
	setOpenForm,
}) => {
	const { configTable, onChangeOneParam, filterLocal, page, pageSize } = usePaginationLocal(
		callFn,
		searchText,
		{},
		type,
	);
	const { companyName, adminName, tin, pricingName, serviceName, name } = filterLocal;
	// const {} = filterLocal;
	const [dis, setDis] = useState(true);
	const [valueSelect, setValueSelect] = useState(() => {
		const f = {};
		value.forEach((el) => {
			f[el.id || el.couponId] = el;
		});
		return f;
	});
	const valueSearch = {
		companySearch: companyName,
		adminSearch: adminName,
		taxCode: tin,
		pricingSearch: pricingName,
		serviceSearch: serviceName,
		nameSearch: name,
	};
	return (
		<Modal
			title={title}
			visible={visible}
			onOk={() => {
				handleClose();
				onChange([...Object.values(valueSelect)]);
				setOpenForm && setOpenForm(false);
			}}
			okText="Chọn"
			okButtonProps={{ disabled: dis }}
			onCancel={() => {
				handleClose();
				setOpenForm && setOpenForm(false);
			}}
			closable
			maskClosable={false}
			centered
			width="1000px"
		>
			<TableToPick
				columsRight={columns}
				placeholder={placeholder}
				configTable={configTable}
				onChangeOneParam={onChangeOneParam}
				value={value}
				onChange={onChange}
				searchText={searchText}
				valueSearchText={valueSearch}
				valueSelect={valueSelect}
				setValueSelect={setValueSelect}
				typeModal={typeModal}
				pageSize={pageSize}
				page={page}
				typePortal={typePortal}
				setDis={setDis}
				totalCoupon={totalCoupon}
			/>
		</Modal>
	);
};

export default ModalPick;
