/* eslint-disable array-callback-return */
import { Col, Modal, Row, Tree, Table, Button, Tag, Icon } from 'antd';
import { SearchCommon, SelectDebounce } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import { AddonAdmin, AdminCombo } from 'app/models';
import { omit, uniqBy as _uniqBy } from 'opLodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';

const tagDisplay = {
	VISIBLE: {
		color: 'success',
		text: 'Hiện',
		value: 'VISIBLE',
	},
	INVISIBLE: {
		color: 'default',
		text: 'Ẩn',
		value: 'INVISIBLE',
	},
};
function TreeModal({ callFn, title, visible, handleApply, handleClose, onlyView, initItemsPick = [] }) {
	const [searchDe, setSearchDe] = useState();
	const [expandedKeys, setExpandKeys] = useState([]);
	const { tField, tMessage } = useLng();
	const [checkedId, setCheckedId] = useState([]);
	const [itemPicks, setItemPicks] = useState([]);
	const refItemPicks = useRef([]);
	// useEffect(() => {
	// 	setCheckedId(initItemsPick);
	// }, [initItemsPick]);

	const convertDataArr = (arr, parentKey = undefined, service, pricing) => {
		const dataConvert = arr.map((item) => {
			const isStrategy = !!item.isMultiPlan;
			const charSpread = isStrategy ? '/' : '-';
			const cusKey = parentKey
				? `${parentKey}${charSpread}${item.id}`
				: `${item.type === 'SERVICE' ? 's' : 'c'}:${item.id}`;
			const el = omit(item, ['children']);
			const resItem = {
				...item,
				title: item.title,
				key: cusKey,
				type: service?.type,
				service,
				parentKey,
				pricing: isStrategy ? pricing : undefined,
				isStrategy,
				children: item.children?.length > 0 ? convertDataArr(item.children, cusKey, service || el, el) : null,
			};
			if (
				isStrategy &&
				initItemsPick.find(
					(ol) =>
						ol.key === resItem.key ||
						(ol.pricingId &&
							ol.id === resItem.id &&
							ol.pricingId === resItem.pricing.id &&
							ol.serviceId === resItem.service.id &&
							ol.type === resItem.type),
				)
			) {
				refItemPicks.current.push(resItem);
			}
			return resItem;
		});

		return dataConvert;
	};
	// const getArr = (arr) => {
	// 	const tmp = arr?.length > 0 ? arr?.filter((it) => arrChooseId.includes(it.key)) : null;
	// 	return tmp;
	// };
	// const chosenArr = (arr) => {
	// 	// eslint-disable-next-line consistent-return
	// 	const tmp = arr?.map((item) => {
	// 		const tmp2 = getArr(item.children);
	// 		if (tmp2?.length > 0) return { ...item, children: tmp2 };
	// 		return {
	// 			...item,
	// 			children: chosenArr(item.children),
	// 		};
	// 	});
	// 	return tmp?.filter((item) => item?.children?.length > 0);
	// };

	const { data, refetch } = useQuery(
		['getData'],
		async () => {
			refItemPicks.current = [];
			const res = await callFn({});
			const dataConvert = convertDataArr(res);
			setCheckedId(refItemPicks.current.map((item) => item.key));
			setItemPicks(refItemPicks.current);
			handleApply(refItemPicks.current);
			return dataConvert;
		},
		{
			initialData: [],
		},
	);

	const optionService = async () => {
		const res = await AddonAdmin.getDataDropDown({
			type: 'NAME',
		});
		const temp = res?.map((item) => ({
			value: item.id,
			label: item.name,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPricing = async () => {
		const res = await AddonAdmin.getDataDropDown({
			type: 'PLAN_NAME',
		});

		const temp = res?.map((item) => ({
			value: item.id,
			label: item.name,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionCategory = async () => {
		const res = await AddonAdmin.getDataDropDown({
			type: 'CATEGORY',
		});

		const temp = res?.map((item) => ({
			value: item.id,
			label: item.name,
		}));

		return _uniqBy(temp, 'value');
	};

	const optionPeriod = async () => {
		const res = await AddonAdmin.getDataDropDown({
			type: 'PERIOD',
		});

		const temp = res?.map((item) => ({
			value: item.cycleType,
			label: item.paymentCycle,
		}));

		return _uniqBy(temp, 'value');
	};

	const treeData = useMemo(() => {
		if (!searchDe) {
			setExpandKeys([]);
			return data;
		}
		setExpandKeys(_uniqBy(expandedKeys));
		return data;
	}, [searchDe, data]);
	return (
		<div className="flex">
			<Modal
				maskClosable={false}
				title={title}
				visible={visible}
				onOk={() => {
					handleClose();
					handleApply(itemPicks);
				}}
				okText="Xác nhận"
				okButtonProps={{ disabled: onlyView }}
				width={1200}
				onCancel={() => handleClose()}
				closable
				centered
			>
				<div className="pt-4 grid grid-cols-4 gap-2 mb-5">
					<SelectDebounce
						className="mr-6"
						showSearch
						allowClear
						placeholder="Tên dịch vụ: Tất cả"
						fetchOptions={optionService}
						maxLength={500}
					/>

					<SelectDebounce
						className="mr-6"
						showSearch
						allowClear
						placeholder="Tên gói dịch vụ: Tất cả"
						fetchOptions={optionPricing}
						maxLength={500}
					/>
					<SelectDebounce
						className="mr-6"
						showSearch
						allowClear
						placeholder="Danh mục: Tất cả"
						fetchOptions={optionCategory}
						maxLength={500}
					/>
					<SelectDebounce
						className="mr-6"
						showSearch
						allowClear
						placeholder="Chu kỳ: Tất cả"
						fetchOptions={optionPeriod}
						maxLength={100}
					/>
				</div>
				<div className="flex justify-between">
					<div className="border border-gray-600 " style={{ borderStyle: 'solid' }}>
						<div className="flex justify-between " style={{ backgroundColor: '#FAFAFA' }}>
							<div className="m-4"> Tên dịch vụ</div>
							<div className="text-right m-4 text-gray-400">Tổng số: {treeData.length}</div>
						</div>
						<div
							style={{
								minHeight: '400px',
								maxHeight: '55vh',
								overflowX: 'hidden',
								overflowY: 'auto',
								width: '550px',
							}}
						>
							<Row>
								<Col>
									<Tree
										treeData={treeData}
										blockNode
										expandedKeys={expandedKeys}
										onExpand={setExpandKeys}
										checkedKeys={checkedId}
										checkable
										selectable={false}
										onCheck={(keys, info) => {
											setCheckedId(keys);
											setItemPicks(info.checkedNodes.filter((el) => el.isStrategy));
										}}
									/>
								</Col>
								<Col />
							</Row>
						</div>
					</div>
					<div
						className="border border-gray-600 "
						style={{
							borderStyle: 'solid',
						}}
					>
						<div
							style={{
								minHeight: '400px',
								maxHeight: '55vh',
								overflowX: 'hidden',
								overflowY: 'auto',
								width: '550px',
							}}
						>
							<Row>
								<Col span={24}>
									<Table
										dataSource={itemPicks}
										pagination={false}
										rowKey="key"
										columns={[
											{
												title: 'Tên dịch vụ đã chọn',
												dataIndex: 'service',
												render: (value) => value?.title,
											},
											{
												title: 'Tên gói dịch vụ đã chọn',
												dataIndex: 'pricing',
												render: (value) => value?.title,
											},
											{
												title: 'Chu kỳ thanh toán',
												dataIndex: 'title',
											},
											{
												title: 'Trạng thái hiển thị',
												dataIndex: 'service',
												render: ({ displayStatus }) => {
													const statusInfo = tagDisplay[displayStatus];
													return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
												},
											},

											{
												title: `Tong so: ${itemPicks.length}`,
												dataIndex: 'key',
												render: (value) => (
													<Button
														type="text"
														className="w-full p-0 text-primary"
														onClick={() => {
															setItemPicks([
																...itemPicks.filter((el) => el.key !== value),
															]);
															let newCheckedIds = [...checkedId];
															const pricingKey = value.split('/')[0];
															if (
																newCheckedIds.filter((el) => el.startsWith(pricingKey))
																	.length === 2
															) {
																newCheckedIds = newCheckedIds.filter(
																	(el) => !el.startsWith(pricingKey),
																);
																const serviceKey = value.split('-')[0];
																if (
																	newCheckedIds.filter((el) =>
																		el.startsWith(serviceKey),
																	).length === 1
																) {
																	newCheckedIds = newCheckedIds.filter(
																		(el) => !el.startsWith(serviceKey),
																	);
																}
															} else {
																newCheckedIds = newCheckedIds.filter(
																	(el) => el !== value,
																);
															}
															setCheckedId(newCheckedIds);
														}}
													>
														Bỏ chọn
													</Button>
												),
											},
										]}
									/>
								</Col>
							</Row>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default TreeModal;
