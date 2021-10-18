import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { appSelects } from 'actions';
import { useSelector } from 'react-redux';
import { useQueryUrl } from 'app/hooks';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function CategoryMenu({ visibleCategory, onChooseCategory }) {
	const query = useQueryUrl();
	const categoryId = parseInt(query.get('category'), 10);
	const { categoryList } = useSelector(appSelects.selectCategoryState);

	const { y } = useSpring({ y: visibleCategory ? 0 : -120 });

	return (
		<div className="overflow-hidden relative z-10">
			<animated.div
				style={{
					marginTop: y.to((x) => x),
					display: y.to((x) => (x > -80 ? 'flex' : 'none')),
				}}
				className={clsx(' flex-wrap pl-10 pt-2 pb-5 container mx-auto overflow-hidden relative z-50')}
			>
				{categoryList.map((category) => (
					<Link
						title={category.name}
						to={category.to}
						className="w-1/4 truncate py-3 pr-2 text-sm text-black"
						onClick={onChooseCategory}
						key={category.id}
					>
						<span className={categoryId === category.id && ' font-bold text-primary text-base'}>
							{category.name}
						</span>
					</Link>
				))}
			</animated.div>
		</div>
	);
}
