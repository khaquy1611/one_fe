import { Empty, Spin, Table } from 'antd';
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useResizeDetector } from 'react-resize-detector';
import InfiniteScroll from 'react-infinite-scroll-component';

function VirtualTable(props) {
	const {
		columns,
		loadMoreItems,
		isFetching,
		isItemLoaded,
		dataSource,
		scroll,
		itemCount,
		onClickRow,
		rowClassName,
		tableWidth,
		haveNextPage,
		rowKey,
		total,
		chooseItem,
	} = props;

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

	const RowTable = ({ index, style, scrollbarSize, totalHeight }) => {
		const record = dataSource[index] || {};
		const calcWidth = (columnIndex) => {
			const { width } = mergedColumns[columnIndex];
			return totalHeight > scroll.y && columnIndex === mergedColumns.length - 1
				? width - scrollbarSize - 1
				: width;
		};
		const className = rowClassName ? rowClassName(record) : '';
		return (
			<div
				className="flex w-full h-full"
				style={{ height: 54 }}
				onClickCapture={() => onClickRow && onClickRow(record)}
			>
				{mergedColumns.map((column, indexC) => (
					<div style={{ width: calcWidth(indexC) }} className={`virtual-table-cell ${className}`}>
						{column.render ? column.render(record[column.dataIndex], record) : record[column.dataIndex]}
					</div>
				))}
			</div>
		);
	};
	const renderVirtualList = (rawData, { scrollbarSize, onScroll }) => {
		// ref.current = connectObject;
		const totalHeight = rawData.length * 54;
		if (dataSource?.length === 0) {
			return (
				<div style={{ width: tableWidth, height: scroll.y - 32 }} className="text-center">
					<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			);
		}
		return (
			<div
				id="popup-scrollableTarget"
				className="overflow-y-auto"
				style={{
					width: tableWidth,
					height: scroll.y,
				}}
			>
				<InfiniteScroll
					dataLength={dataSource.length}
					next={loadMoreItems}
					hasMore={haveNextPage}
					className="w-full"
					scrollThreshold={0.9}
					scrollableTarget="popup-scrollableTarget"
				>
					{dataSource.map((item, index) => (
						<RowTable index={index} key={rowKey} scrollbarSize={scrollbarSize} totalHeight={totalHeight} />
					))}
				</InfiniteScroll>
			</div>
		);
	};
	return (
		<Spin spinning={isFetching}>
			<Table
				{...props}
				columns={mergedColumns}
				pagination={false}
				components={{
					body: renderVirtualList,
				}}
			/>
		</Spin>
	);
}

export default function VirtualTableWrap(props) {
	const { width: tableWidth, ref } = useResizeDetector();

	return (
		<div className="w-full h-full" ref={ref}>
			{!!tableWidth && <VirtualTable {...props} tableWidth={tableWidth} />}
		</div>
	);
}
