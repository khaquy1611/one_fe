/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Form, Radio, Table } from 'antd';
import { TextInColumn } from 'app/components/Atoms';
import { AddIcon } from 'app/icons';
import { AdminCoupon, DX } from 'app/models';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useLng } from 'app/hooks';
import { idSelects } from 'actions';
import { useSelector } from 'react-redux';
import ModalPick from './ChooseTable';

const { Item } = Form;
const RADIO_TYPE = {
	NONE: 'NONE',
	ALL: 'ALL',
	OPTION: 'OPTION',
};
const TYPE_ID = {
	enterpriseType: 'userId',
	pricingType: 'idPick',
	addonsType: 'addonsId',
	supplierType: 'userId',
};
const TYPE_IDSORT = {
	enterpriseType: 'userIds',
	pricingType: 'pricingIds-comboPlanIds',
	addonsType: 'addonsId',
	supplierType: 'userIds',
};
const TYPE_MODAL = {
	ENTERPRISE_TYPE: 'enterpriseType',
	PRICING_TYPE: 'pricingType',
	ADDON_TYPE: 'addonsType',
	SUPPLIER_TYPE: 'supplierType',
};

const YES = 'YES';
const NO = 'NO';

const style = { color: '#f5222d' };
const checkIdInactive = (arr, id) => {
	if (arr && arr.length > 0) return arr.includes(id);
	return false;
};

export default function ChooseService({
	onChange,
	onlyView,
	value = {},
	title,
	placeholder,
	typeModal,
	form,
	itemName,
	couponInfo,
	checkStatus,
	reFresh,
	disableRad = '',
	typeCoupon = '',
}) {
	const { path } = useRouteMatch();
	const [typeChoose, setTypeChoose] = useState(couponInfo && couponInfo[typeModal]);
	const [openModal, setOpenModal] = useState(false);
	const valueForm = form.getFieldValue('promotionGroup').list;
	const pricingsId = valueForm.map((a) => a.idPick);
	const { list = [], type = 'NONE' } = value;
	const [disRad, setDisRad] = useState(NO);
	const getListContent = () => {
		if (typeModal === TYPE_MODAL.ENTERPRISE_TYPE) return AdminCoupon.getListEnterprise;
		if (typeModal === TYPE_MODAL.PRICING_TYPE)
			return async (params) => {
				const res = await AdminCoupon.getListPricing(params);
				res.content.forEach((el, index) => {
					el.idPick = `${el.pricingId}-${el.type === 'COMBO' ? 'comboPlanIds' : 'pricingIds'}`;
					el.index = index;
				});
				return res;
			};
		if (typeModal === TYPE_MODAL.ADDON_TYPE) return AdminCoupon.getListAddon;
		if (typeModal === TYPE_MODAL.SUPPLIER_TYPE) return AdminCoupon.getListEnterprise;
	};
	const idArrInactive = useSelector(idSelects.selectId);
	const { tFilterField, tField, tButton, tOthers } = useLng();

	useEffect(() => {
		if (typeChoose === RADIO_TYPE.NONE || typeChoose === RADIO_TYPE.ALL) {
			onChange({ list: [], type: typeChoose });
			form.setFields([
				{
					name: itemName,
					errors: [],
				},
			]);
		} else if (typeChoose === RADIO_TYPE.OPTION) {
			onChange({ list: value.list, type: RADIO_TYPE.OPTION });
			form.setFields([
				{
					name: itemName,
					errors: [],
				},
			]);
		} else {
			onChange({ list: [], type: RADIO_TYPE.NONE });
		}
	}, [typeChoose, list.length]);

	useEffect(() => {
		if (couponInfo?.totalBillType === YES && disableRad === '') {
			setDisRad(YES);
		}
		if (disableRad === NO && (typeModal === TYPE_MODAL.PRICING_TYPE || typeModal === TYPE_MODAL.ADDON_TYPE)) {
			setDisRad(NO);
			setTypeChoose();
			form.setFields([
				{
					name: itemName,
					errors: [],
				},
			]);
		}
		if (disableRad === YES && (typeModal === TYPE_MODAL.PRICING_TYPE || typeModal === TYPE_MODAL.ADDON_TYPE)) {
			onChange({ list: [], type: RADIO_TYPE.NONE });
			setTypeChoose();
			form.setFields([
				{
					name: itemName,
					errors: [],
				},
			]);
		}
	}, [disableRad]);

	const onChangeType = (e) => {
		setTypeChoose(e.target.value);
	};

	useEffect(() => {
		if (reFresh === 0 || reFresh === 1) {
			setTypeChoose();
			onChange({ list: [], type: typeChoose });
			setDisRad(NO);
		}
	}, [reFresh]);

	const COLUMN_LEFT = {
		enterpriseType: [
			{
				title: <TextInColumn title={tField('enterpriseName')} />,
				dataIndex: 'name',
				render: (valueColumn) => <TextInColumn title={valueColumn} />,
				sorter: true,
			},
		],
		pricingType: [
			{
				title: <TextInColumn title={tField('serviceName')} />,
				dataIndex: 'serviceName',
				render: (valueColumn) => <TextInColumn title={valueColumn} />,
				sorter: true,
			},
			{
				title: <TextInColumn title={tField('servicePackageName')} />,
				dataIndex: 'pricingName',
				render: (valueColumn) => <TextInColumn title={valueColumn} />,
				sorter: true,
			},
			{
				title: tField('packagePrice'),
				dataIndex: 'price',
				render: (valueColumn) => valueColumn && DX.formatNumberCurrency(valueColumn),
				sorter: true,
			},
		],
		addonsType: [
			{
				title: <TextInColumn title={tField('extraServiceName')} />,
				dataIndex: 'name',
				render: (valueColumn) => <TextInColumn title={valueColumn} />,
				sorter: true,
			},
			{
				title: <TextInColumn title={tField('serviceCode')} />,
				dataIndex: 'code',
				sorter: true,
			},
		],
		supplierType: [
			{
				title: <TextInColumn title={tField('serviceProviderName')} />,
				dataIndex: 'name',
				render: (valueColumn) => <TextInColumn title={valueColumn} />,
				sorter: true,
			},
		],
	};

	const COLUMN_RIGHT = {
		enterpriseType: [
			{
				title: <TextInColumn title={tField('opt_isSelected', { field: 'enterprise' })} />,
				dataIndex: 'name',
				render: (valueColumn, record) => (
					<TextInColumn title={valueColumn} inactive={checkIdInactive(idArrInactive.idArr, record.userId)} />
				),
				sorter: (a, b) => a.name.localeCompare(b.name),
			},
		],
		pricingType: [
			{
				title: <TextInColumn title={tField('opt_isSelected', { field: 'serviceName' })} />,
				dataIndex: 'serviceName',
				render: (valueColumn, record) => (
					<TextInColumn
						title={valueColumn}
						inactive={checkIdInactive(idArrInactive.idArr, record.pricingId)}
					/>
				),
				sorter: (a, b) => a.serviceName.localeCompare(b.serviceName),
			},
			{
				title: <TextInColumn title={tField('opt_isSelected', { field: 'servicePackage' })} />,
				dataIndex: 'pricingName',
				render: (valueColumn, record) => (
					<TextInColumn
						title={valueColumn}
						inactive={checkIdInactive(idArrInactive.idArr, record.pricingId)}
					/>
				),
				sorter: (a, b) => a.pricingName.localeCompare(b.pricingName),
			},
			{
				title: tField('packagePrice'),
				dataIndex: 'price',
				render: (valueColumn, record) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>
						{valueColumn && DX.formatNumberCurrency(valueColumn)}
					</span>
				),
				sorter: {
					compare: (a, b) => {
						if (a.price === null) {
							return 1;
						}
						if (b.price === null) {
							return -1;
						}
						return a.price - b.price;
					},
				},
			},
		],
		addonsType: [
			{
				title: <TextInColumn title={tField('opt_isSelected', { field: 'extraServiceName' })} />,
				dataIndex: 'name',
				render: (valueColumn, record) => (
					<TextInColumn
						title={valueColumn}
						inactive={checkIdInactive(idArrInactive.idArr, record.addonsId)}
					/>
				),
				sorter: (a, b) => a.name.localeCompare(b.name),
			},
			{
				title: tField('serviceCode'),
				dataIndex: 'code',
				render: (valueColumn, record) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.addonsId) ? style : null}>
						{valueColumn}
					</span>
				),
				sorter: (a, b) => a.code?.localeCompare(b.code),
			},
		],
		supplierType: [
			{
				title: <TextInColumn title={tField('opt_isSelected', { field: 'serviceProvider' })} />,
				dataIndex: 'name',
				render: (valueColumn, record) => (
					<TextInColumn title={valueColumn} inactive={checkIdInactive(idArrInactive.idArr, record.userId)} />
				),
				sorter: (a, b) => a.name.localeCompare(b.name),
			},
		],
	};

	const COLUMN_SHOW = {
		generate: [
			{
				dataIndex: 'id',
				key: 'id',
				render: (_, record, index) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.userId || record.addonsId) ? style : null}>
						{index + 1}
					</span>
				),
				width: 50,
			},
			{
				dataIndex: 'name',
				render: (values, record) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.userId || record.addonsId) ? style : null}>
						{values}
					</span>
				),
				key: 'name',
			},
			{
				dataIndex: 'code',
				render: (values, record) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.addonsId) ? style : null}>{values}</span>
				),
				key: 'code',
			},
			{
				title: 'Action',
				align: 'right',
				render: (_, record, index) => (
					<Button
						type="text"
						disabled={path.indexOf('create') === -1 && !checkStatus}
						icon={
							<DeleteOutlined
								style={
									checkIdInactive(idArrInactive.idArr, record.userId || record.addonsId)
										? style
										: null
								}
							/>
						}
						onClick={() => {
							list.splice(index, 1);
							onChange({ list: [...list], type: RADIO_TYPE.OPTION });
						}}
					/>
				),
				key: 'action',
			},
		],
		pricingType: [
			{
				title: '#',
				dataIndex: 'id',
				key: 'id',
				render: (_, record, index) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>
						{index + 1}
					</span>
				),
				width: 50,
			},
			{
				title: 'serviceName',
				dataIndex: 'serviceName',
				render: (values, record) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>{values}</span>
				),
				key: 'serviceName',
			},
			{
				title: 'pricingName',
				dataIndex: 'pricingName',
				render: (values, record) => (
					<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>{values}</span>
				),
				key: 'pricingName',
			},
			{
				title: 'Action',
				align: 'right',
				render: (_, record, index) => (
					<Button
						type="text"
						disabled={path.indexOf('create') === -1 && !checkStatus}
						icon={
							<DeleteOutlined
								style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}
							/>
						}
						onClick={() => {
							list.splice(index, 1);
							onChange({ list: [...list], type: RADIO_TYPE.OPTION });
						}}
					/>
				),
				key: 'action',
			},
		],
	};

	const onChoose = () => {
		setOpenModal(true);
	};
	const setDisable =
		((disableRad === YES || disRad === YES) && (typeModal === 'pricingType' || typeModal === 'addonsType')) ||
		onlyView;
	return (
		<div>
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center">
					<Radio.Group onChange={onChangeType} value={type} disabled={setDisable}>
						<Radio value={RADIO_TYPE.NONE}>{tFilterField('value', 's-NO')}</Radio>
						<Radio value={RADIO_TYPE.ALL}>{tFilterField('value', 'all')}</Radio>
						<Radio value={RADIO_TYPE.OPTION}>{tFilterField('value', 'choose')}</Radio>
					</Radio.Group>
					{itemName && (
						<Item className="mb-0" shouldUpdate={(p, c) => c[itemName].type !== p[itemName].type}>
							{() =>
								form.getFieldValue(itemName).type === RADIO_TYPE.OPTION &&
								checkStatus && (
									<Button
										onClick={onChoose}
										icon={<AddIcon width="w-3.5" />}
										size="middle"
										className="ml-4"
									>
										{tButton('opt_select')}
									</Button>
								)
							}
						</Item>
					)}
				</div>
				<Item className="mb-0" shouldUpdate={(p, c) => c[itemName].type !== p[itemName].type}>
					{() =>
						form.getFieldValue(itemName).type === RADIO_TYPE.OPTION && (
							<div className="text-primary text-base">
								{tOthers('selected')}: {list?.length}
							</div>
						)
					}
				</Item>
			</div>

			{list?.length > 0 && (
				<Table
					dataSource={list.slice(0, 5)}
					columns={typeModal === 'pricingType' ? COLUMN_SHOW.pricingType : COLUMN_SHOW.generate}
					showHeader={false}
					pagination={false}
					rowClassName="change-bg one-tb"
				/>
			)}
			{list?.length > 5 && (
				<div className="text-center mt-2">
					<Button type="link" to className="text-primary" onClick={setOpenModal}>
						{tButton('watchAll')}
					</Button>
				</div>
			)}
			{openModal && (
				<ModalPick
					title={title}
					visible={openModal}
					handleApply={(itemsPick) => onChange({ list: itemsPick, type: RADIO_TYPE.OPTION })}
					handleClose={() => setOpenModal(false)}
					callFn={getListContent()}
					columsLeft={COLUMN_LEFT[typeModal]}
					columsRight={COLUMN_RIGHT[typeModal]}
					indexRecord={TYPE_ID[typeModal]}
					placeholder={placeholder}
					initItemsPick={[...list]}
					typeModal={typeModal}
					centered
					onlyView={onlyView}
					pricingsId={pricingsId}
					picked={TYPE_IDSORT[typeModal]}
					typeCoupon={typeCoupon}
					couponInfo={couponInfo}
				/>
			)}
		</div>
	);
}
