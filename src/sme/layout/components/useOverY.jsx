import { debounce } from 'opLodash';
import { useCallback, useEffect, useState } from 'react';

export default function useOverY() {
	const [overHeader, setOverHeader] = useState(false);

	function listenScroll() {
		const currentScroll = window.pageYOffset;
		if (currentScroll <= 5) {
			setOverHeader(false);
		} else {
			setOverHeader(true);
		}
	}
	const listenScrollDebounce = useCallback(debounce(listenScroll, 100), []);

	useEffect(() => {
		setOverHeader(window.pageYOffset > 0);
		window.addEventListener('scroll', listenScrollDebounce);
		return () => window.removeEventListener('scroll', listenScrollDebounce);
	}, []);
	return [overHeader];
}
