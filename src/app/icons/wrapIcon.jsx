import React from 'react';
import classnames from 'classnames';

export default function wrapIcon(Icon) {
	// eslint-disable-next-line react/prop-types
	return React.memo(({ className, width = 'w-6', color }) => (
		<span className={classnames('anticon block leading-none', width, className)}>
			<Icon color={color} />
		</span>
	));
}
