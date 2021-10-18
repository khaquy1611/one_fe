import React, { useRef, useState } from 'react';
import range from 'lodash/range';
import clsx from 'clsx';

export default function useFlicking() {
	const flickRef = useRef(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	// const [moving, setMoving] = useState();
	function onChanged(e) {
		setCurrentIndex(e.index);
	}
	// function onMoveStart() {
	// 	setMoving(true);
	// }
	// function onMoveEnd(e) {
	// 	setMoving();
	// }
	async function goPanel(funcGo) {
		if (!flickRef.current || flickRef.current.animating) {
			console.warn('animating !!!');
			return;
		}
		try {
			await funcGo();
		} catch (e) {
			console.warn('slow down !!!');
		}
	}
	function next() {
		goPanel(() => flickRef.current.next());
	}
	function prev() {
		goPanel(() => flickRef.current.prev());
	}
	function moveTo(i) {
		goPanel(() => flickRef.current.moveTo(i));
	}

	function renderPagination(length) {
		return range(0, length).map((p) => (
			<button onClick={() => currentIndex !== p && moveTo(p)} className="border-none bg-transparent p-0">
				<span
					className={clsx(
						'mr-3 rounded-full border-2 border-primary border-solid inline-block cursor-pointer transition-all',
						p === currentIndex && 'bg-primary',
					)}
					style={{ width: 16, height: 16 }}
				/>
			</button>
		));
	}
	return {
		settings: {
			ref: flickRef,
			onChanged,
			autoResize: true,
			duration: 200,
			// onMoveStart,
			// onMoveEnd,
		},
		currentIndex,
		next,
		prev,
		moveTo,
		// moving,
		renderPagination,
	};
}
