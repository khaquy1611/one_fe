/* eslint-disable jsx-a11y/label-has-associated-control */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Modal, Table } from 'antd';
import { AvatarWithText, SearchCommon } from 'app/components/Atoms';
import { usePaginationLocal, useLng } from 'app/hooks';
import DepartmentDev from 'app/models/DepartmentDev';
import classNames from 'classnames';
import { isEmpty } from 'opLodash';
import React, { useState } from 'react';

const ModalChooseEmp = ({ value, onChange, handleCloseModal, portalType, isSme }) => {
	const { tButton, tField, tMessage } = useLng();
	const [valueSelect, setValueSelect] = useState(() => {
		const f = {};
		value.forEach((el) => {
			f[el.id] = el;
		});
		return f;
	});

	const { configTable, onChangeOneParam, filterLocal } = usePaginationLocal(
		async (params) => {
			const res = await DepartmentDev.getAllEmpAdd(portalType, params);
			res.content.forEach((el) => {
				el.id = el.userId;
			});
			return res;
		},

		['search', 'departmentName'],
		{
			sort: 'name,asc',
		},
		'DepartmentDev.getAllEmpAdd',
	);
	const columns = [
		{
			title: tField('opt_select'),
			dataIndex: 'id',
			render(idEmp, record) {
				const checked = valueSelect[idEmp];
				return (
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
						}}
					/>
				);
			},
			width: 80,
		},
		{
			title: tField('employeeName'),
			dataIndex: 'name',

			ellipsis: true,
		},
		{
			title: tField('currentDepartment'),
			dataIndex: 'departmentCode',
			render: (_, record) => record.departmentName && `${record.departmentCode} - ${record.departmentName}`,
			ellipsis: true,
		},
	];

	const { search, departmentName } = filterLocal;
	return (
		<Modal
			title={
				<div className={`font-semibold text-xl ${isSme ? 'text-gray-800' : ''}`}>{tMessage('addEmployee')}</div>
			}
			style={{ top: 22 }}
			visible
			onCancel={() => {
				handleCloseModal();
			}}
			okText={tButton('opt_select')}
			cancelText={tButton('opt_cancel')}
			width="700px"
			maskClosable={false}
			bodyStyle={{
				maxHeight: '95vh',
				overflow: 'auto',
			}}
			centered
			footer={null}
		>
			<div className="flex justify-between gap-4">
				<SearchCommon
					className=" mr-6 mb-5"
					placeholder={tField('opt_search', { field: 'employeeName' })}
					onSearch={(valueSearch) => {
						onChangeOneParam('search')(valueSearch);
					}}
					defaultValue={search}
					maxLength={40}
				/>
				<SearchCommon
					className=" mr-6 mb-5"
					placeholder={tField('currentDepartment')}
					onSearch={(valueSearch) => {
						onChangeOneParam('departmentName')(valueSearch);
					}}
					defaultValue={departmentName}
					maxLength={100}
				/>
			</div>

			<Table
				{...configTable}
				columns={columns}
				scroll={12}
				pagination={{
					...configTable.pagination,
					showSizeChanger: false,
				}}
			/>
			<div className="mt-6 flex flex-row-reverse ">
				<div className={`${isSme ? 'w-full flex' : ''}`}>
					<Button
						onClick={() => {
							handleCloseModal();
						}}
						className={`${isSme ? 'w-2/4 mr-4' : ''}`}
					>
						{tButton('opt_cancel')}
					</Button>
					<Button
						className={`ml-2 ${isSme ? 'w-2/4 ml-2' : ''}`}
						type="primary"
						onClick={() => {
							onChange([...Object.values(valueSelect)]);
							handleCloseModal();
						}}
						disabled={isEmpty(valueSelect)}
					>
						{tButton('opt_select')}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
function ChooseEmp({ isSme, ...argss }) {
	const { value = [], onChange, type, disabled } = argss;
	const portalType = type ? type.toUpperCase() : 'DEV';
	const [visible, setIsModalVisible] = useState(false);
	const { tOthers, tField, tButton } = useLng();

	function handleDelete(id) {
		value.splice(
			value.findIndex((i) => i.userId === id || i.id === id),
			1,
		);
		onChange([...value]);
	}

	const columnsTable = [
		{
			title: `${tOthers('employeeList')}`,
			dataIndex: 'name',
			render: (valueName, record) => <AvatarWithText name={valueName} icon={record.avatar || record.icon} />,
			width: '80%',
		},
		{
			title: '',
			dataIndex: 'id',
			render: (_, record) => (
				<div className="text-right">
					<DeleteOutlined onClick={() => handleDelete(record.id || record.userId)} />
				</div>
			),
			width: '20%',
			hide: disabled,
		},
	];
	return (
		<div className="">
			<div className="flex justify-between">
				{type === 'sme' ? <label>{tField('employeeUnderBoss')}</label> : <span />}
				<Button
					disabled={disabled}
					className={classNames('float-right mb-4', { uppercase: isSme, 'font-semibold': isSme })}
					onClick={() => setIsModalVisible(true)}
					icon={type === 'sme' ? <span /> : <PlusOutlined />}
				>
					{tButton('opt_add', { field: 'employee' })}
				</Button>
			</div>
			{visible && (
				<ModalChooseEmp
					value={value}
					onChange={onChange}
					handleCloseModal={() => setIsModalVisible(false)}
					portalType={portalType}
					isSme={isSme}
				/>
			)}
			{value.length > 0 && (
				<Table
					columns={columnsTable.filter((x) => !x.hide)}
					dataSource={value}
					scroll={value?.length > 5 ? { y: 250 } : 12}
					pagination={false}
				/>
			)}
		</div>
	);
}

export default ChooseEmp;
