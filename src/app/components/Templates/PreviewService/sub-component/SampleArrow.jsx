import React from 'react';

function SampleArrow(props) {
	const { className, style, onClick, children } = props;
	return (
		<div
			className={`${className} rounded-full`}
			style={{
				...style,
				background: '#FFFFFF',
				width: '2.5rem',
				height: '2.5rem',
				fontSize: '1rem',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				color: 'gray',
			}}
			onClickCapture={onClick}
		>
			{children}
		</div>
	);
}

export default SampleArrow;
