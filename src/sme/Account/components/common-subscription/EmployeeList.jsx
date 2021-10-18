import { Button, message, Select, Table, Tag } from 'antd';
import { AvatarWithText, filterOption, SearchCommon } from 'app/components/Atoms';
import { useLng, usePaginationLocal, useUser } from 'app/hooks';
import { DX, SMESubscription } from 'app/models';
import { omit } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';

const STATUS_EMPLOYEE = {
	ACTIVE: 'ACTIVE',
	INACTIVE: 'INACTIVE',
};

const STATUS_SERVICE = {
	CANCELLED: 'CANCELLED',
	FUTURE: 'FUTURE',
	NON_RENEWING: 'NON_RENEWING',
};

const { Option } = Select;

const ButtonOnOff = ({ selected, onActive, deActive, showBtnOn, showBtnOff, tButton, tOthers, tLowerField }) => (
	<div className="flex justify-between items-center">
		<div className="font-medium">
			{tOthers('selected')} <span className="font-bold">{selected.length} </span>
			{tLowerField('acc')}
		</div>
		<div className="flex gap-4 mr-24">
			<Button type="primary" onClick={onActive} disabled={!showBtnOn}>
				{tButton('onActivity')}
			</Button>
			<Button type="default" onClick={deActive} disabled={!showBtnOff}>
				{tButton('offActivity')}
			</Button>
		</div>
	</div>
);

export default function EmployeeList({
	refresh,
	statusService,
	typeSubscription,
	selectOptionService,
	loading,
	initService,
}) {
	const { user } = useUser();
	const CAN_CHANGE_EMPLOYEE = DX.canAccessFuture2('sme/change-employee-subscription', user.permissions);
	const notCancel = statusService !== STATUS_SERVICE.CANCELLED && statusService !== STATUS_SERVICE.NON_RENEWING;

	const [selectionRows, setSelectionRows] = useState([]);
	const { id } = useParams();
	const { tOthers, tFilterField, tButton, tField, tMessage, tLowerField } = useLng();

	const [showBtnOn, setShowBtnOn] = useState(false);
	const [showBtnOff, setShowBtnOff] = useState(false);

	const { modifyUserUsing, statusEmployee, getListUserUsing } = SMESubscription;

	const [itemTypeService, setItemTypeService] = useState({
		serviceId: initService,
		itemType: 'SERVICE',
	});

	// ---------------------- get all employee using service------------------------
	const { configTable, page, pageSize, filterLocal, refetch, onChangeOneParam } = usePaginationLocal(
		(params) => getListUserUsing(id, params.serviceId, omit(params, ['serviceId'])),
		[],
		{
			serviceId: itemTypeService.serviceId,
			sort: '',
		},
		'getListEmployee',
		{ enabled: !!initService && statusService !== STATUS_SERVICE.FUTURE },
	);
	const [status, searchText] = [filterLocal.status || '', filterLocal.name || ''];

	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectionRows(selectedRows);
			const userInactive = selectedRows.filter((el) => el.status === STATUS_EMPLOYEE.INACTIVE);
			if (selectedRows.length === 0) {
				setShowBtnOn(false);
				setShowBtnOff(false);
				return;
			}
			if (userInactive.length === 0) {
				setShowBtnOn(false);
				setShowBtnOff(true);
				return;
			}
			if (userInactive.length === selectedRows.length) {
				setShowBtnOn(true);
				setShowBtnOff(false);
				return;
			}
			setShowBtnOn(true);
			setShowBtnOff(true);
		},
		selectedRowKeys: selectionRows.map((el) => el.id),
		preserveSelectedRowKeys: true,
		// getCheckboxProps: (record) => ({
		// 	disabled: record.id === user.id,
		// 	name: record.name,
		// }),
	};

	// ------------------- change user using service------------------------------
	const mutation = useMutation(modifyUserUsing, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetch();
			setSelectionRows([]);
			// refresh();
		},
		onError: () => {
			message.error(tMessage('opt_badlyUpdated'));
			setSelectionRows([]);
		},
	});

	const TagStatus = (display) => {
		const Status = statusEmployee.filter((item) => item.value === display)[0];
		return (
			<Tag color={Status?.color} className="w-36">
				{tFilterField('activeStatusOptions', Status?.label)}
			</Tag>
		);
	};

	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
		},
		{
			title: tField('userName'),
			dataIndex: 'name',
			render: (value, record) => <AvatarWithText name={value} icon={record.avatar} />,
		},
		{
			title: tField('email'),
			dataIndex: 'email',
		},
		{
			title: tField('status'),
			render: (display) => TagStatus(display),
			dataIndex: 'status',
			align: 'center',
		},
	];

	// ----------------------- button active and inactive employee -----------------------------
	const onActive = () => {
		const userInactive = selectionRows.filter((el) => el.status === STATUS_EMPLOYEE.INACTIVE);

		if (userInactive.length > 0) {
			mutation.mutate({
				id,
				query: {
					ids: userInactive.map((el) => el.id),
					status: STATUS_EMPLOYEE.ACTIVE,
					...itemTypeService,
				},
				typeSubscription,
			});
			// }
		}
	};

	const deActive = () => {
		const userActive = selectionRows.filter((el) => el.status === STATUS_EMPLOYEE.ACTIVE);
		if (userActive.length > 0) {
			mutation.mutate({
				id,
				query: {
					ids: userActive.map((el) => el.id),
					status: STATUS_EMPLOYEE.INACTIVE,
					...itemTypeService,
				},
				typeSubscription,
			});
		}
	};

	useEffect(() => {
		setSelectionRows([]);
		if (selectionRows.length === 0) {
			setShowBtnOn(false);
			setShowBtnOff(false);
		}
	}, [searchText, status]);

	const onChangeSelect = (value) => {
		selectOptionService.forEach((el) => {
			if (el.value === value) {
				setItemTypeService({ serviceId: el.value, itemType: el.itemType });
				onChangeOneParam('serviceId')(el.value);
			}
		});
	};

	if (statusService === STATUS_SERVICE.FUTURE)
		return <div className="font-semibold">{tOthers('noInfoIsAssignedToUse')}</div>;

	return (
		<>
			<p className="font-medium mb-2 text-gray-80">{tOthers('opt_select', { field: 'service' })}</p>
			<Select
				className="w-1/3 tablet:w-1/2 mobile:w-full mb-7"
				showSearch
				filterOption={filterOption}
				loading={loading}
				defaultValue={initService}
				onChange={onChangeSelect}
				options={[...selectOptionService]}
			/>

			<div className="box-detail">
				<div className="flex items-center justify-between mb-4">
					<div className="uppercase font-bold text-gray-60">{tOthers('employeeList')}</div>
					<div className="flex items-start">
						<SearchCommon
							className="w-72 mr-4"
							placeholder={tField('opt_search', { field: 'userName' })}
							onSearch={(value) => {
								onChangeOneParam('name')(value);
							}}
							maxLength={100}
							defaultValue={searchText}
						/>

						<Select value={status} onSelect={onChangeOneParam('status')} className="w-72">
							{statusEmployee.map((el) => (
								<Option value={el.value} className="ant-prefix" key={el.label}>
									<span className="prefix">{tFilterField('prefix', 'status')}: </span>
									<span>{tFilterField('activeStatusOptions', el.label)}</span>
								</Option>
							))}
						</Select>
					</div>
				</div>
				<Table
					className="employee-tb"
					rowSelection={notCancel && CAN_CHANGE_EMPLOYEE ? { ...rowSelection } : false}
					columns={columns}
					{...configTable}
					footer={() =>
						notCancel &&
						CAN_CHANGE_EMPLOYEE && (
							<ButtonOnOff
								selected={selectionRows}
								onActive={onActive}
								deActive={deActive}
								showBtnOn={showBtnOn}
								showBtnOff={showBtnOff}
								tButton={tButton}
								tOthers={tOthers}
								tLowerField={tLowerField}
							/>
						)
					}
				/>
			</div>
		</>
	);
}
