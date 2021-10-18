import { Table } from 'antd';
import React from 'react';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

function TableDragSorting({ columns, data, setData, setIsDirty }) {
	const SortableItem = sortableElement((props) => <tr {...props} draggable className="hover:cursor-allScroll" />);
	const SortableContainer = sortableContainer((props) => <tbody {...props} />);

	const onSortEnd = ({ oldIndex, newIndex }) => {
		if (oldIndex !== newIndex) {
			const newData = arrayMove([].concat(data), oldIndex, newIndex).filter((el) => !!el);
			setData(newData);
			setIsDirty && setIsDirty(true);
		}
	};

	const DraggableContainer = (props) => (
		<SortableContainer
			// useDragHandle
			axis="y"
			lockAxis="y"
			lockToContainerEdges
			pressDelay={150}
			// disableAutoscroll
			lockOffset="25%"
			helperClass="row-dragging"
			onSortEnd={onSortEnd}
			{...props}
		/>
	);

	const DraggableBodyRow = ({ className, style, ...restProps }) => {
		// function findIndex base on Table rowKey props and should always be a right array index
		const index = data.findIndex((x) => x.index === restProps['data-row-key']);
		return <SortableItem index={index} {...restProps} />;
	};
	const configtable = {
		components: data.length
			? {
					body: {
						wrapper: DraggableContainer,
						row: DraggableBodyRow,
					},
			  }
			: null,
	};

	return (
		<Table
			className="beauty-scroll-table"
			// className="table-select-class"
			pagination={false}
			dataSource={data}
			columns={columns}
			rowKey="index"
			{...configtable}
			scroll={{ x: 810, y: 580 }}
		/>
	);
}

export default TableDragSorting;
