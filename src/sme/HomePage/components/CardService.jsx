import { getFlag } from 'app/helpers';
import React from 'react';
import LazyLoad from 'react-lazy-load';

import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { appSelects } from 'actions';

export default function CardService({ id, banner, icon, name, category, to, serviceOwner }) {
	// const { isMobile } = useSelector(appSelects.selectSetting);
	const Flag = getFlag(serviceOwner);
	return (
		<Link to={to} className="pointer-events-auto" title={name}>
			<div className="shadow-card rounded-2xl pb-3 bg-white h-full">
				<span className="w-full pt-full relative block mb-3 rounded-2xl  overflow-hidden mobile:mb-2">
					<LazyLoad debounce={false} offsetVertical={700}>
						<img
							src={banner || '/images/NoImageNew.svg'}
							alt="serviceName"
							title={name}
							className="object-cover w-full h-full absolute top-0 transform hover:scale-125 duration-500"
						/>
					</LazyLoad>
					{Flag && (
						<span className="absolute top-0 right-8">
							<Flag />
						</span>
					)}
				</span>
				<div className="flex pl-4 mobile:pl-2">
					{icon && (
						<div className="flex-none mr-3">
							<LazyLoad debounce={false} offsetVertical={500}>
								<span className="h-10 w-10 block">
									<img
										src={icon || '/images/NoImageNew.svg'}
										alt="serviceName"
										title={name}
										className="object-cover w-full h-full   rounded-base"
									/>
								</span>
							</LazyLoad>
						</div>
					)}
					<div className="flex-1">
						<span className="text-sm font-bold line-clamp-2 text-black">{name}</span>
						<p className="text-xs text-gray-40 mb-0 mt-2">{category}</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
