import React from 'react';
import wrapIcon from './wrapIcon';

function CloseIcon() {
	return (
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="5.00098" y="25" width="28" height="2" rx="1" transform="rotate(-45 5.00098 25)" fill="#333333" />
			<rect x="6" y="5" width="28" height="2" rx="1" transform="rotate(45 6 5)" fill="#333333" />
		</svg>
	);
}

export default wrapIcon(CloseIcon);
