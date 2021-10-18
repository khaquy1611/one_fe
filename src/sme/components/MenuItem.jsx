import React from 'react';
import styled from 'styled-components';

const MenuItem = ({ menu, keyMenu, handleClick, className, addOnHeader, title, style }) => {
	const CategoryLi = styled.li`
		position: relative;
		padding: 0.5rem 1rem;
		border-radius: 0.75rem;
		transition: transition all 1s ease;
		background: ${(props) => (props.active ? (!title && '#F8F8F8') || '#FFF' : 'transparent')};
	`;

	return (
		<div className={className} style={style}>
			{title && <h2 className="m-4 text-2xl font-bold text-primary">{title}</h2>}
			{addOnHeader && <div className="pb-4 text-xl font-bold">{addOnHeader}</div>}
			<ul style={{ margin: 0, listStyle: 'none', padding: 0 }}>
				{menu?.map((item) => (
					<CategoryLi
						key={item.value}
						className="mt-2 list-none cursor-pointer font-medium hover:text-primary"
						active={keyMenu === item.value}
						onClick={() => handleClick(keyMenu === item.value ? { id: '' } : item)}
					>
						<h4 className="mb-0">{item.label}</h4>
					</CategoryLi>
				))}
			</ul>
		</div>
	);
};

export default MenuItem;
