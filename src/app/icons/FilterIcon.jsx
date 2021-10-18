import React from 'react';
import wrapIcon from './wrapIcon';

function FilterIcon() {
	return (
		<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M15.5 0.332031V1.9987H14.6667L10.5 8.2487V15.332H5.5V8.2487L1.33333 1.9987H0.5V0.332031H15.5ZM3.33667 1.9987L7.16667 7.7437V13.6654H8.83333V7.7437L12.6633 1.9987H3.33667Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default wrapIcon(FilterIcon);
