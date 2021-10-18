import React, { useMemo } from 'react';
import { Empty, Form, Input, Spin, Table, Tooltip } from 'antd';
import { useResizeDetector } from 'react-resize-detector';
import { pick } from 'opLodash';
import { DeleteOutlined } from '@ant-design/icons';
import SubPriceList from 'app/CommonCombo/CommonPricing/components/subComponents/SubPriceList';
import { useDispatch } from 'react-redux';
import { comboPricingActions } from 'app/redux/comboPricingReducer';

function EditableCells(props) {
	const dispatch = useDispatch();
	const { columns, isFetching, dataSource = [], scroll, tableWidth, nameForm, disabled, onChangeAmount } = props;
	const mergedColumns = useMemo(() => {
		const widthColumnCount = columns.filter(({ width }) => !width).length;

		let widthConst = 0;
		columns.forEach((el) => {
			if (el.width) {
				widthConst += el.width;
			}
		});
		return columns.map((column) => {
			if (column.width) {
				return column;
			}

			return { ...column, width: Math.floor((tableWidth - widthConst) / widthColumnCount) };
		});
	}, [tableWidth, columns]);

	const RowTable = ({ index, fieldKey, scrollbarSize, totalHeight, remove, restField }) => {
		const record = dataSource[index] || {};
		const calcWidth = (columnIndex) => {
			const { width } = mergedColumns[columnIndex];
			return totalHeight > scroll.y && columnIndex === mergedColumns.length - 1
				? width - scrollbarSize - 1
				: width;
		};
		return (
			<div className="flex w-full h-full" style={{ height: 70 }}>
				{mergedColumns
					.filter((column) => !column.hide)
					.map((column, indexC) => {
						if (column.canDeleted) {
							return (
								<div
									key={`${index}-${column.dataIndex}-${record.id}`}
									style={{ width: calcWidth(indexC) }}
									className="virtual-table-cell pt-6"
								>
									<DeleteOutlined
										onClick={() => {
											dispatch(
												comboPricingActions.deleteSubPricingList({
													index,
												}),
											);
											remove(index);
										}}
									/>
								</div>
							);
						}
						return (
							<div style={{ width: calcWidth(indexC) }} className="virtual-table-cell">
								{column.editable ? (
									<>
										{((column.name === 'freeQuantity' && record.showInputFree) ||
											(column.name === 'quantity' && record.showInputCount)) && (
											<Form.Item
												{...restField}
												name={[index, column.name]}
												fieldKey={[fieldKey, column.name]}
												{...pick(column, ['normalize', 'rules'])}
											>
												<Input
													onChange={(e) =>
														onChangeAmount(e.target.value, column.name, index, record)
													}
													maxLength={column?.child?.maxLength || 1000}
													disabled={disabled}
													placeholder={column?.child?.placeholder || null}
													addonAfter={
														column?.child?.addonAfter ? (
															<span>
																<Tooltip
																	placement="bottomLeft"
																	title={record[column.child?.addonAfter]}
																>
																	<div
																		className=" truncate"
																		style={{ width: '40px' }}
																	>
																		{record[column.child?.addonAfter]}
																	</div>
																</Tooltip>
															</span>
														) : null
													}
												/>
											</Form.Item>
										)}
									</>
								) : (
									<>
										{column.ellipsis ? (
											<Tooltip
												key={`${index}-${column.dataIndex}-${record.id}`}
												placement="bottomRight"
												title={
													column.render
														? column.render(record[column.dataIndex], record)
														: record[column.dataIndex]
												}
											>
												<div
													key={`${index}-${column.dataIndex}-${record.id}`}
													className="truncate  pt-2"
												>
													{column.render
														? column.render(record[column.dataIndex], record)
														: record[column.dataIndex]}
												</div>
											</Tooltip>
										) : (
											<>
												{column.component ? (
													<SubPriceList index={index} />
												) : (
													<div
														key={`${index}-${column.dataIndex}-${record.id}`}
														className="pt-3"
													>
														{column.render
															? column.render(record[column.dataIndex], record)
															: record[column.dataIndex]}
													</div>
												)}
											</>
										)}
									</>
								)}
							</div>
						);
					})}
			</div>
		);
	};
	const renderVirtualList = (rawData, { scrollbarSize }) => {
		const totalHeight = rawData.length * 54;
		if (dataSource?.length === 0) {
			return (
				<div style={{ width: tableWidth }} className="text-center">
					<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			);
		}
		return (
			<div
				className="overflow-auto"
				style={{
					// minWidth: scroll.x,
					maxHeight: scroll.y,
				}}
			>
				<Form.List name={nameForm}>
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, fieldKey, ...restField }) => (
								<RowTable
									key={key}
									index={name}
									fieldKey={fieldKey}
									scrollbarSize={scrollbarSize}
									totalHeight={totalHeight}
									remove={remove}
									restField={restField}
								/>
							))}
						</>
					)}
				</Form.List>
			</div>
		);
	};

	return (
		<Spin spinning={isFetching}>
			<Table
				{...props}
				className="beauty-scroll-table"
				columns={mergedColumns}
				pagination={false}
				components={{
					body: renderVirtualList,
				}}
			/>
		</Spin>
	);
}

export default function TableEditableCells(props) {
	const { width: tableWidth, ref } = useResizeDetector();

	return (
		<div className="w-full h-full" ref={ref}>
			{!!tableWidth && <EditableCells {...props} tableWidth={tableWidth} />}
		</div>
	);
}
