import React from 'react';
import PropTypes from 'prop-types';
import wrapIcon from './wrapIcon';

function ResponseIcon(props) {
	return (
		<svg
			// width="18"
			// height="14"
			viewBox="0 0 18 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9.16665 13.6668L0.833313 7.00016L9.16665 0.333496V4.50016C13.7691 4.50016 17.5 8.231 17.5 12.8335C17.5 13.061 17.4916 13.286 17.4733 13.5085C16.2541 11.1968 13.865 9.59933 11.0941 9.50433L10.8333 9.50016H9.16665V13.6668ZM7.49998 7.8335H10.8616L11.1508 7.83933C12.2216 7.87516 13.2541 8.09766 14.2141 8.47766C12.9916 7.06266 11.1833 6.16683 9.16665 6.16683H7.49998V3.801L3.50165 7.00016L7.49998 10.1993V7.8335Z"
				fill="#09121F"
			/>
		</svg>
	);
}

export default wrapIcon(ResponseIcon);
