import React from 'react';
import wrapIcon from './wrapIcon';

function SortIcon() {
	return (
		<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M14.6667 0.332031V10.332H17.1667L13.8333 14.4987L10.5 10.332H13V0.332031H14.6667ZM8 11.9987V13.6654H0.5V11.9987H8ZM9.66667 6.16536V7.83203H0.5V6.16536H9.66667ZM9.66667 0.332031V1.9987H0.5V0.332031H9.66667Z"
				fill="#2C3D94"
			/>
		</svg>
	);
}

export default wrapIcon(SortIcon);
