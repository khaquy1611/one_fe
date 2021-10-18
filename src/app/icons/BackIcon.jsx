import React from 'react';
import wrapIcon from './wrapIcon';

function BackIcon() {
	return (
		<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"
				fill="#CFD8DC"
			/>
			<path
				d="M15.828 18.9997H28V20.9997H15.828L21.192 26.3637L19.778 27.7777L12 19.9997L19.778 12.2217L21.192 13.6357L15.828 18.9997Z"
				fill="#37474F"
			/>
		</svg>
	);
}

export default wrapIcon(BackIcon);
