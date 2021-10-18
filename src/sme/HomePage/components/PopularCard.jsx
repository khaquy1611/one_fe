import React from 'react';
import { Vector } from 'app/icons';
import { DX } from 'app/models';
import { Link } from 'react-router-dom';
import { useLng } from 'app/hooks';
import { Tag } from 'antd';
import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';
// import { useSpring, animated } from '@react-spring/web';
import LazyLoad from 'react-lazy-load';
import { getFlag } from 'app/helpers';

export default function PopularCard({ infoService }) {
	const { ref, inView } = useInView({
		threshold: 0,
	});
	// const styles = useSpring({ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.85 });

	const { tOthers } = useLng();
	const { name, icon, banner, id, sapoDescription, externalLink, externalLinkBanner, serviceOwner } = infoService;
	const Flag = getFlag(serviceOwner);
	return (
		<div
			ref={ref}
			className={clsx(
				'shadow-card rounded-2xl p-6 tablet:p-3 flex bg-white transform duration-300',
				inView ? 'opacity-1' : 'opacity-60 ',
				!inView && 'scale-75 tablet:scale-90',
			)}
		>
			<div className="w-1/2  flex-none  ">
				<div className="relative overflow-hidden rounded-2xl w-full pt-full">
					<LazyLoad debounce={false} offsetVertical={700}>
						<img
							className="absolute inset-0 h-full w-full object-cover duration-500 transform hover:scale-125"
							alt={name}
							title={name}
							src={banner || externalLinkBanner || '/images/NoImageNew.svg'}
						/>
					</LazyLoad>
					{Flag && (
						<span className="absolute top-0 right-8">
							<Flag />
						</span>
					)}
				</div>
			</div>
			<div className="flex-1 pl-3 relative">
				<div className="mb-6 tablet:mb-3 max-w-full flex flex-wrap gap-4">
					<div className="w-16 h-16 tablet:w-14 tablet:h-14 rounded-xl tablet:rounded-2xl relative overflow-hidden flex-none">
						<LazyLoad debounce={false} offsetVertical={700}>
							<img
								src={icon || externalLink || '/images/NoImageNew.svg'}
								alt="icon service"
								title={name}
								className="absolute inset-0 h-full w-full object-cover"
							/>
						</LazyLoad>
					</div>
					<div className="flex-1 ">
						<Tag className="float-right whitespace-normal text-primary line-clamp-2 mr-0" color="#EAECF4">
							{infoService.categoryName}
						</Tag>
					</div>
				</div>

				<div className="mb-3 tablet:mb-1 text-2xl tablet:text-xl text-primary line-clamp-2 max-w-full font-bold">
					{name}
				</div>
				<div className="text-sm line-clamp-3 mobile:line-clamp-2">{sapoDescription}</div>
				<Link
					title={name}
					to={DX.sme.createPath(`/service/${id}`)}
					className="absolute bottom-0 flex items-center"
				>
					<span className="mr-4 text-base">{tOthers('watchDetail')}</span>
					<Vector />
				</Link>
			</div>
		</div>
	);
}
