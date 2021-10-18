import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
	const location = useLocation();
	useEffect(() => {
		window.scrollTo({
			left: 0,
			top: 0,
		});
	}, [location.pathname]);
	return null;
}

export default React.memo(ScrollToTop);
