import React from 'react';
import { string, node, number, func } from 'prop-types';
import { useSwipeable } from 'react-swipeable';
import { useSelector } from 'react-redux';
import { appSelects } from 'actions';

const SwipeWrapper = ({ children, className, delta, onSwiping, onSwiped }) => {
	const {isTablet, isMobile} = useSelector(appSelects.selectSetting);
	const swipeHandlers = useSwipeable({
		delta,
		onSwiping,
		onSwiped,
		preventDefaultTouchmoveEvent: !isTablet && !isMobile,
		trackMouse: !isTablet && !isMobile,
	});
	return (
		<div {...swipeHandlers} className={className}>
			{children}
		</div>
	);
};

SwipeWrapper.propTypes = {
	children: node.isRequired,
	className: string,
	delta: number,
	onSwiped: func,
	onSwiping: func,
};

SwipeWrapper.defaultProps = {
	className: '',
	delta: 0,
	onSwiping: () => {},
	onSwiped: () => {},
};

export default SwipeWrapper;
