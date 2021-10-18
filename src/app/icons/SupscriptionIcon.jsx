import React from 'react';
import wrapIcon from './wrapIcon';

function SupscriptionIcon() {
	return (
		<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle opacity="0.5" cx="22" cy="22" r="22" fill="#D9F7BE" />
			<path
				d="M30.0366 15.5312H28.6324C28.4355 15.5312 28.2487 15.6217 28.1282 15.7763L19.8453 26.269L15.8737 21.2366C15.8136 21.1603 15.737 21.0986 15.6497 21.0562C15.5624 21.0137 15.4666 20.9916 15.3694 20.9915H13.9652C13.8306 20.9915 13.7563 21.1462 13.8386 21.2507L19.3411 28.2217C19.5982 28.5471 20.0924 28.5471 20.3516 28.2217L30.1632 15.7884C30.2456 15.6859 30.1712 15.5312 30.0366 15.5312Z"
				fill="#52C41A"
			/>
		</svg>
	);
}

export default wrapIcon(SupscriptionIcon);
