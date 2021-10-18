import React from 'react';
import wrapIcon from './wrapIcon';

function CovertIcon() {
	return (
		<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12.0375 9.03711L15.75 12.7496L12.0375 16.4621L10.977 15.4016L12.879 13.4989L3 13.4996V11.9996H12.879L10.977 10.0976L12.0375 9.03711ZM5.9625 1.53711L7.023 2.59761L5.121 4.49961H15V5.99961H5.121L7.023 7.90161L5.9625 8.96211L2.25 5.24961L5.9625 1.53711Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default wrapIcon(CovertIcon);
