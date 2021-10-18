import React from 'react';
import wrapIcon from './wrapIcon';

function ExtraEmailIcon() {
	return (
		<svg width="55" height="48" viewBox="0 0 55 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M50 28H45V11.095L25.18 28.845L5 11.04V40.5H30V45.5H2.5C1.83696 45.5 1.20107 45.2366 0.732233 44.7678C0.263392 44.2989 0 43.663 0 43V3C0 2.33696 0.263392 1.70107 0.732233 1.23223C1.20107 0.763392 1.83696 0.5 2.5 0.5H47.5C48.163 0.5 48.7989 0.763392 49.2678 1.23223C49.7366 1.70107 50 2.33696 50 3V28ZM6.2775 5.5L25.1525 22.155L43.755 5.5H6.2775ZM42.5 48L33.66 39.16L37.1975 35.625L42.5 40.93L51.34 32.09L54.875 35.625L42.5 48Z"
				fill="#2C3D94"
			/>
		</svg>
	);
}

export default wrapIcon(ExtraEmailIcon);
