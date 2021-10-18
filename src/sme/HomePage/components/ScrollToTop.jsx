import React, { useState, useEffect, useCallback } from 'react';
import { Vector } from 'app/icons';
import { debounce } from 'opLodash';

function ScrollToTop() {
	const [showScroll, setShowScroll] = useState(false);

	const checkScrollTop = () => {
		setShowScroll(window.pageYOffset > (window.screen.height * 2) / 3);
	};
	const debounceCheckScrollTop = useCallback(debounce(checkScrollTop, 400), []);
	useEffect(() => {
		window.addEventListener('scroll', debounceCheckScrollTop);
		return () => window.removeEventListener('scroll', debounceCheckScrollTop);
	}, []);

	const scrollTop = () => {
		window.scrollTo({
			left: 0,
			top: 0,
			behavior: 'smooth',
		});
	};

	return (
		<>
			{showScroll && (
				<div className="fixed animate-fadeIn top-2/4 right-4 mobile:right-1 z-10 bg-transparent">
					<button
						className="bg-primary border-none w-10 h-10 rounded-full flex items-center justify-center transform -rotate-90 text-white cursor-pointer "
						onClick={scrollTop}
						style={{
							boxShadow: '-8px 0  16px 6px #70686849',
							transition: 'opacity 0.9s',
						}}
					>
						<Vector />
					</button>
				</div>
			)}
		</>
	);
}

export default ScrollToTop;
