// eslint-disable-next-line react-hooks/rules-of-hooks
import { Col, Modal, Row, Tree, Table, Button } from 'antd';
import { SelectDebounce } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import usePickInfinity from 'app/hooks/usePickInfinity';
import { AdminCoupon } from 'app/models';
import { cloneDeep, uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

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
const TYPE = {
	DAILY: ' ngày',
	WEEKLY: 'tuần',
	MONTHLY: 'tháng',
	YEARLY: 'năm',
};
function TreeModal({
	id,
	callFn,
	title,
	visible,
	handleApply,
	handleClose,
	placeholder,
	typeModal = '',
	onlyView,
	pricingsId,
	pricingsIdPromo,
	typeTime,
	typeCoupon = '',
	couponInfo,
	valueRad,
	typeAddon,
	addonInFor,
	typeProduct,
	dayValue,
	columsRight,
	indexRecord,
	initItemsPick,
	typeTree = '',
	...argss
}) {
	const defaultParams = {
		type: checkType(typeModal, typeTime),
		pricingIds: typeModal === TYPE_MODAL.PRICING_TYPE ? pricingsId || pricingsIdPromo : '',
		portalType: typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE ? couponInfo?.portalType : null,
		isCreate: !(typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE),
		createdBy: typeCoupon === EDIT && typeModal === TYPE_MODAL.PRICING_TYPE ? couponInfo?.createdBy : null,
		couponId: typeCoupon === EDIT && typeModal === TYPE_MODAL.ADDONS_TYPE ? couponInfo?.id : null,
		bonusType: valueRad || null,
		addonId: typeAddon === EDIT ? addonInFor?.id : null,
		value: dayValue || undefined,
	};
	const { value = {}, onChange, disabled } = argss;

	const [selects, setSelect] = useState([]);
	const [expandedKeys, setExpandKeys] = useState([]);
	const { tButton, tField, tOthers, tMessage } = useLng();
	const [checkedId, setCheckedId] = useState(initItemsPick?.filter((ol) => ol.id).map((el) => el.key) || []);
	const [dataChecked, setDataChecked] = useState([]);
	const optionService = async (searchValue) => {
		const res = await AdminCoupon.getServiceDrop({
			name: searchValue || null,
			type: typeModal === TYPE_MODAL.ADDONS_TYPE ? 'ADDON' : 'PRICING',
		});
		const temp = res?.map((item) => ({
			value: `${item.id}-${item.type}`,
			label: item.serviceName,
		}));

		return _uniqBy(temp, 'value');
	};

	function findDuplicates(arr) {
		return new Set(arr).size !== arr.length;
	}

	const onSelect = (selectedKeysValue, info) => {};
	const [dataItemPick, setDataItemPick] = useState([]);
	const optionPricing = async (searchValue) => {
		const res = await AdminCoupon.getPricingDrop({
			name: searchValue || null,
			type: typeModal === TYPE_MODAL.ADDONS_TYPE ? 'ADDON' : 'PRICING',
		});

		const temp = res?.map((item) => ({
			value: `${item.id}-${item.type}`,
			label: item.pricingName,
		}));

		return _uniqBy(temp, 'value');
	};
	const optionCategory = async (searchValue) => {
		const res = await AdminCoupon.getCategoryDrop({
			name: searchValue || null,
			type: typeModal === TYPE_MODAL.ADDONS_TYPE ? 'ADDON' : 'PRICING',
		});

		const temp = res?.map((item) => ({
			value: item.id,
			label: item.categoryName,
		}));

		return _uniqBy(temp, 'value');
	};
	const optionPeriod = async (searchValue) => {
		const res = await AdminCoupon.getPeriodDrop({
			name: searchValue || null,
			type: typeModal === TYPE_MODAL.ADDONS_TYPE ? 'ADDON' : 'PRICING',
		});

		const temp = res?.map((item) => ({
			value: `${item.paymentCycle}-${item.cycleType}`,
			label: item.pricingPlanName,
		}));

		return _uniqBy(temp, 'value');
	};

	const [dataSave, setDataSave] = useState([]);
	const [totalElements, setTotalElements] = useState([]);

	const { content: dataTest, onChangeOneParam, configTable, filterLocal } = usePickInfinity({
		callFn,
		extra: ['serviceId', 'pricingId', 'pricingType', 'categoryId', 'serviceType', 'paymentCycle', 'cycleType'],
		defaultParams,
	});
	const { serviceId, pricingId, categoryId, paymentCycle, cycleType } = filterLocal;
	const { dataSource, loadMoreItems, haveNextPage, total } = { ...configTable };

	useEffect(() => {
		const arrayIdParent = [];
		if (selects?.halfCheckedKeys?.length > 0) {
			arrayIdParent.push(...selects.halfCheckedKeys);
		}

		const dataPa = [];
		dataSource?.forEach((serviceKey) => {
			_uniqBy(arrayIdParent).forEach((ol) => {
				if (ol === serviceKey.key && serviceKey.type) {
					dataPa.push(serviceKey);
				}
			});
		});

		setDataChecked(
			[
				selects?.checkedNodes?.length > 0 ? _uniqBy(dataPa) : [],
				_uniqBy(selects.checkedNodes?.filter((select) => select.serviceId)),
				// initItemsPick.length === 0 ? [] : initItemsPick.filter((el) => el.serviceId),
			].flat(),
		);

		const dataCheckTree = [
			...dataChecked,
			...(!selects.checkedNodes ? initItemsPick || [] : []),
			...(selects?.checkedNodes || []),
		]?.filter((el) => el.id && (el.children?.length === 0 || !el.children));
		if (findDuplicates(dataCheckTree.map((el) => el.pricingId)) && typeTree === 'PRODUCT') {
			Modal.error({ content: 'Mỗi dịch vụ chỉ được chọn tối đa một chu kỳ thanh toán' });
		} else
			setDataItemPick(
				_uniqBy(
					[
						...(!!serviceId || !!pricingId || !!categoryId || !!paymentCycle || !!cycleType
							? dataSave
							: []),
						...dataCheckTree,
					],
					'key',
				),
			);
	}, [selects.checkedNodes]);
	console.log(filterLocal);
	useEffect(() => {
		setDataSave([...dataItemPick]);
		setCheckedId([...checkedId, ...dataItemPick.filter((el) => el.id).map((ol) => ol.key)]);
		setTotalElements([...totalElements, total]);
	}, [total, dataSource]);

	const onCheck = (checkedKeysValue, infor) => {
		const dataCheckTree = [
			...dataChecked,
			...(!infor.checkedNodes ? initItemsPick || [] : []),
			...(infor?.checkedNodes || []),
		]?.filter((el) => el.id && (el.children?.length === 0 || !el.children));
		const dataCheckedId = _uniqBy([...dataSave.filter((el) => el.id).map((ol) => ol.key), ...checkedKeysValue]);
		if (!findDuplicates(dataCheckTree.map((el) => el.pricingId)) || typeTree !== 'PRODUCT') {
			setCheckedId(checkedKeysValue.filter((e) => dataCheckedId.indexOf(e) !== -1));
		}
	};

	return (
		<Modal
			maskClosable={false}
			title={title}
			visible={visible}
			onOk={() => {
				handleClose();
				handleApply(dataItemPick);
			}}
			okText="Xác nhận"
			okButtonProps={{ disabled: onlyView }}
			width={1200}
			onCancel={() => handleClose()}
			closable
			centered
		>
			<div className="grid grid-cols-4 gap-4 mb-5">
				<SelectDebounce
					showSearch
					allowClear
					placeholder="Tên dịch vụ: Tất cả"
					fetchOptions={optionService}
					onSelect={(valueService) => {
						const types = valueService.split('-');
						onChangeOneParam('serviceType')(types[1]);
						onChangeOneParam('serviceId')(types[0]);
					}}
					onClear={() => {
						onChangeOneParam('serviceId')('');
						onChangeOneParam('serviceType')('');
					}}
					defaultValue={serviceId}
				/>

				<SelectDebounce
					showSearch
					allowClear
					placeholder="Tên gói dịch vụ: Tất cả"
					fetchOptions={optionPricing}
					onSelect={(valuePricing) => {
						const types = valuePricing.split('-');
						onChangeOneParam('pricingType')(types[1]);
						onChangeOneParam('pricingId')(types[0]);
					}}
					onClear={() => {
						onChangeOneParam('pricingId')('');
						onChangeOneParam('pricingType')('');
					}}
					defaultValue={pricingId}
				/>
				<SelectDebounce
					showSearch
					allowClear
					placeholder="Danh mục: Tất cả"
					fetchOptions={optionCategory}
					onSelect={onChangeOneParam('categoryId')}
					onClear={() => onChangeOneParam('categoryId')('')}
					defaultValue={categoryId}
				/>
				<SelectDebounce
					showSearch
					allowClear
					placeholder="Chu kỳ thanh toán: Tất cả"
					fetchOptions={optionPeriod}
					onSelect={(valuePeriod) => {
						const types = valuePeriod.split('-');
						onChangeOneParam('cycleType')(types[1]);
						onChangeOneParam('paymentCycle')(types[0]);
					}}
					onClear={() => {
						onChangeOneParam('cycleType')('');
						onChangeOneParam('paymentCycle')('');
					}}
					defaultValue={
						cycleType && paymentCycle ? `${cycleType || ''} ${TYPE[paymentCycle] || ''}` : undefined
					}
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="border border-gray-600 border-solid">
					<div className="flex justify-between bg-gray-250 px-4 py-3 font-medium">
						<div>Tên dịch vụ</div>
						<div>Tổng số: {configTable.total}</div>
					</div>
					<div
						className="overflow-auto py-4"
						id="popup-scrollableTarget"
						style={{
							maxHeight: '62.5vh',
							minHeight: '50vh',
						}}
					>
						<InfiniteScroll
							dataLength={dataSource?.length}
							next={loadMoreItems}
							hasMore={haveNextPage}
							className="w-full"
							scrollThreshold={0.8}
							scrollableTarget="popup-scrollableTarget"
						>
							<Tree
								treeData={dataSource}
								blockNode
								expandedKeys={expandedKeys}
								onExpand={setExpandKeys}
								checkedKeys={checkedId}
								//	selectedKeys={checkedId}
								checkable
								onCheck={(keys, info) => {
									onCheck(keys, info);
									setSelect(info);
								}}
								onSelect={onSelect}
							/>
						</InfiniteScroll>
					</div>
				</div>
				<div className="border border-gray-600 border-solid">
					{dataItemPick && (
						<Table
							columns={[
								...columsRight,
								{
									align: 'center',
									title: (
										<div>
											{tField('total')}: {dataItemPick?.length}
										</div>
									),
									dataIndex: indexRecord,
									render: (_, record, index) => (
										<Button
											disabled={onlyView}
											type="link"
											onClick={() => {
												setDataItemPick([
													...dataItemPick.slice(0, index),
													...dataItemPick.slice(index + 1),
												]);
												setCheckedId(
													checkedId.filter(
														(el) =>
															el !== record.key &&
															el !== record.keyParent &&
															el !== record.keyChildcrenId,
													),
												);
											}}
										>
											{tButton('deselect')}
										</Button>
									),
									width: 150,
								},
							]}
							scroll={{
								y: dataItemPick?.length >= 10 ? 540 : undefined,
							}}
							dataSource={dataItemPick}
							pagination={false}
							rowClassName="selected-tb"
						/>
					)}
				</div>
			</div>
		</Modal>
	);
}

export default TreeModal;
