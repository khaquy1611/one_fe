import { DeleteOutlined } from '@ant-design/icons';
import { idSelects } from 'actions';
import { Button, Form, Radio, Space, Table } from 'antd';
import { TextInColumn } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import { AddIcon } from 'app/icons';
import { AdminCoupon, DX } from 'app/models';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import TreeModal from './TreeModal';

const checkType = (typeModal) => {
	if (typeModal === 'enterpriseType') return 'SME';
	return 'DEV';
};
const TYPE_PERIOD = {
	lần: null,
	ngày: 0,
	tuần: 1,
	tháng: 2,
	năm: 3,
};
function fortmatPeriod(values) {
	const types = values.split(' ');
	return { paymentCyle: types[0] === 'Một' ? null : parseInt(types[0], 10), cycleType: TYPE_PERIOD[types[1]] };
}
const { Item } = Form;

const style = { color: '#f5222d' };

const checkIdInactive = (arr, id) => {
	if (arr && arr.length > 0) return arr.includes(id);
	return false;
};

const RADIO_TYPE = {
	PRODUCT: 'PRODUCT',
	DISCOUNT: 'DISCOUNT',
};

const EDIT = 'EDIT';
const TYPE_MODAL = {
	PRICING_TYPE: 'pricingType',
	ADDONS_TYPE: 'addonsType',
};

export default function ChoosePromotion({
	onChange,
	onlyView,
	value = {},
	title,
	placeholder,
	form,
	couponInfo,
	checkStatus,
	typeModal,
	setReFresh,
	typeCoupon,
}) {
	const { path } = useRouteMatch();
	const [promotion, setPromotion] = useState();
	const [openModal, setOpenModal] = useState(false);
	const valueForm = form.getFieldValue('pricingGroup').list;
	const pricingsIdPromo = valueForm.map((a) => a.idPick);
	const { type, list } = value;
	const [preChoose, setPreChoose] = useState([]);
	const idArrInactive = useSelector(idSelects.selectId);
	const { tButton, tFilterField, tOthers, tField } = useLng();

	const LEFT_COLUMN = [
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: tField('servicePackageName'),
			dataIndex: 'pricingName',
			render: (valueColumn) => <TextInColumn title={valueColumn} />,
			sorter: true,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'title',
			render: (valueColumn) => valueColumn && DX.formatNumberCurrency(valueColumn),
			sorter: true,
		},
	];

	// choose multi product
	useEffect(() => {
		if (promotion === RADIO_TYPE.DISCOUNT) {
			onChange({ list: [], type: RADIO_TYPE.DISCOUNT });
			setPreChoose([]);
			form.setFields([
				{
					name: 'promotionGroup',
					errors: [],
				},
			]);
		}
		if (promotion === RADIO_TYPE.PRODUCT) {
			onChange({ list: preChoose, type: RADIO_TYPE.PRODUCT });
		}
	}, [promotion]);

	useEffect(() => {
		if (list.length > 0) {
			form.setFields([
				{
					name: 'promotionGroup',
					errors: [],
				},
			]);
		}
	}, [list.length]);

	const onChangePromotion = (e) => {
		setPromotion(e.target.value);
		setPreChoose([]);
	};

	const RIGHT_COLUMN = [
		{
			title: tField('serviceName'),
			dataIndex: 'serviceName',
			render: (valueColumn, record) => (
				<TextInColumn title={valueColumn} inactive={checkIdInactive(idArrInactive.idArr, record.pricingId)} />
			),
			sorter: (a, b) => a.serviceName.localeCompare(b.serviceName),
		},
		{
			title: tField('servicePackageName'),
			dataIndex: 'pricingName',
			render: (valueColumn, record) => (
				<TextInColumn title={valueColumn} inactive={checkIdInactive(idArrInactive.idArr, record.pricingId)} />
			),
			sorter: (a, b) => a.pricingName.localeCompare(b.pricingName),
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'title',
			render: (valueColumn, record) => (
				<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>{valueColumn}</span>
			),
			sorter: {
				compare: (a, b) => {
					if (a.cycleType === b.cycleType) {
						// Price is only important when cities are the same
						return a.paymentCyle - b.paymentCyle;
					}
					return a.cycleType > b.cycleType ? 1 : -1;
				},
			},
		},
	];

	const columnShow = [
		{
			align: 'center',
			dataIndex: 'id',
			key: 'id',
			render: (values, record, index) => (
				<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>{index + 1}</span>
			),
			width: 50,
		},
		{
			dataIndex: 'serviceName',
			render: (values, record) => (
				<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>{values}</span>
			),
			key: 'serviceName',
		},
		{
			dataIndex: 'pricingName',
			render: (values, record) => (
				<span style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null}>{values}</span>
			),
			key: 'pricingName',
		},
		{
			align: 'right',
			render: (_, record, index) => (
				<Button
					type="text"
					icon={
						<DeleteOutlined style={checkIdInactive(idArrInactive.idArr, record.pricingId) ? style : null} />
					}
					disabled={path.indexOf('create') === -1 && !checkStatus}
					onClick={() => {
						list.splice(index, 1);
						onChange({ list: [...list], type: RADIO_TYPE.PRODUCT });
					}}
				/>
			),
			key: 'action',
		},
	];

	const onChoose = () => {
		setOpenModal(true);
	};
	const defaultParams = {
		type: checkType(typeModal),
		pricingIds: typeModal === TYPE_MODAL.PRICING_TYPE ? pricingsIdPromo : '',
		portalType: typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE ? couponInfo?.portalType : null,
		isCreate: !(typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE),
		createdBy: typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE ? couponInfo?.createdBy : null,
		couponId: typeCoupon === EDIT && typeModal === TYPE_MODAL.ADDONS_TYPE ? couponInfo?.id : null,
	};
	return (
		<div>
			<div className="flex justify-between items-end mb-6">
				<div>
					<Radio.Group onChange={onChangePromotion} value={type} disabled={onlyView}>
						<Space direction="vertical">
							<Radio onClick={() => setReFresh(0)} value={RADIO_TYPE.DISCOUNT}>
								{tFilterField('value', 'discount')}
							</Radio>
							<Radio onClick={() => setReFresh(1)} value={RADIO_TYPE.PRODUCT}>
								{tFilterField('value', 'freePerProduct')}
							</Radio>
						</Space>
					</Radio.Group>
					<Item
						className="absolute top-6 left-52"
						shouldUpdate={(p, c) => c.promotionGroup.type !== p.promotionGroup.type}
					>
						{() =>
							form.getFieldValue('promotionGroup').type === RADIO_TYPE.PRODUCT &&
							path.indexOf('detail') === -1 &&
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
				</div>

				<Item noStyle shouldUpdate={(p, c) => c.promotionGroup.type !== p.promotionGroup.type}>
					{() =>
						form.getFieldValue('promotionGroup').type === RADIO_TYPE.PRODUCT && (
							<div className="text-primary text-base">
								{tOthers('selected')}: {list?.length}
							</div>
						)
					}
				</Item>
			</div>

			{list.filter((el) => el.id)?.length > 0 && (
				<Table
					columns={columnShow}
					showHeader={false}
					pagination={false}
					dataSource={list.filter((el) => el.id).slice(0, 5)}
					rowClassName="change-bg one-tb"
				/>
			)}
			{list.filter((el) => el.id)?.length > 5 && (
				<div className="text-center mt-2">
					<Button type="link" to className="text-primary" onClick={setOpenModal}>
						{tButton('watchAll')}
					</Button>
				</div>
			)}

			{openModal && (
				// <ModalPick
				// 	title={title}
				// 	onlyView={onlyView}
				// 	visible={openModal}
				// 	handleApply={(itemsPick) => onChange({ list: itemsPick, type: RADIO_TYPE.PRODUCT })}
				// 	handleClose={() => setOpenModal(false)}
				// 	callFn={async (params) => {
				// 		const res = await AdminCoupon.getListPricing(params);
				// 		res.content.forEach((el) => {
				// 			el.idPick = `${el.pricingId}-${el.type === 'COMBO' ? 'comboPlanIds' : 'pricingIds'}`;
				// 		});
				// 		console.log(res);
				// 		return res;
				// 	}}
				// 	columsLeft={LEFT_COLUMN}
				// 	columsRight={RIGHT_COLUMN}
				// 	indexRecord="idPick"
				// 	placeholder={placeholder}
				// 	initItemsPick={[...list]}
				// 	form={form}
				// 	pricingsIdPromo={pricingsIdPromo}
				// 	typeModal={typeModal}
				// 	picked="pricingIds-comboPlanIds"
				// 	typeCoupon={typeCoupon}
				// 	couponInfo={couponInfo}
				// 	typeProduct
				// />
				<TreeModal
					title={title}
					onlyView={onlyView}
					visible={openModal}
					handleApply={(itemsPick) => onChange({ list: itemsPick, type: RADIO_TYPE.PRODUCT })}
					handleClose={() => setOpenModal(false)}
					callFn={async (params) => {
						const res = await AdminCoupon.getListPricing({ ...params, ...defaultParams });
						res.content.forEach((el) => {
							el.idPick = `${el.pricingId}-${el.type === 'COMBO' ? 'comboPlanIds' : 'pricingIds'}`;
						});
						res.content.forEach((service) => {
							service.children?.forEach((servicePricing) => {
								servicePricing.children?.forEach((el) => {
									el.serviceName = service.title;
									el.pricingName = servicePricing.title;
									el.childrenId = el.id;
									el.keyParent = service.key;
									el.keyChildcrenId = servicePricing.key;
									el.pricingId = servicePricing.pricingId;
									el.paymentCyle = fortmatPeriod(el.title).paymentCyle;
									el.cycleType = fortmatPeriod(el.title).cycleType;
									if (servicePricing.type === 'ONCE' || servicePricing.type === 'PERIODIC')
										el.type = servicePricing.type;
									if (typeModal === TYPE_MODAL.ADDONS_TYPE) el.addonsId = servicePricing.addonId;
									else el.pricingId = servicePricing.pricingId;
								});
							});
						});
						return res;
					}}
					columsLeft={LEFT_COLUMN}
					columsRight={RIGHT_COLUMN}
					indexRecord="idPick"
					placeholder={placeholder}
					initItemsPick={[...list]}
					form={form}
					pricingsIdPromo={pricingsIdPromo}
					typeModal={typeModal}
					picked="pricingIds-comboPlanIds"
					typeCoupon={typeCoupon}
					couponInfo={couponInfo}
					typeProduct
					typeTree="PRODUCT"
				/>
			)}
		</div>
	);
}
