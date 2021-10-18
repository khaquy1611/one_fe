import React from 'react';
import wrapIcon from './wrapIcon';

function FilterVectorIcon() {
	return (
		<svg
			width="14"
			height="10"
			viewBox="0 0 14 10"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ marginBottom: '0.1rem' }}
		>
			<path d="M5.5 9.5H8.5V8H5.5V9.5ZM0.25 0.5V2H13.75V0.5H0.25ZM2.5 5.75H11.5V4.25H2.5V5.75Z" fill="#22AAA1" />
		</svg>
	);
}
export default wrapIcon(FilterVectorIcon);
