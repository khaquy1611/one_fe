import React from 'react';
import wrapIcon from './wrapIcon';

function CategoryHeaderIcon() {
	return (
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="4" y="5" width="16" height="2" rx="1" fill="#333333" />
			<rect x="4" y="15" width="24" height="2" rx="1" fill="#333333" />
			<rect x="4" y="25" width="24" height="2" rx="1" fill="#333333" />
		</svg>
	);
}

export default wrapIcon(CategoryHeaderIcon);
