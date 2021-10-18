import { Button, Rate, Tooltip, Popover } from 'antd';
import { UserGroupIcon } from 'app/icons';
import { noop } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { isInt } from 'app/validator';
import styled from 'styled-components';
import { getFlag } from 'app/helpers';
import clsx from 'clsx';

const Title = styled.h1`
	font-size: 1.625rem;
	color: #263238;
`;

const TagCareer = styled.div`
	border-radius: 8px;
	color: var(--color-primary);
	padding: 0.25rem 0.75rem;
	background-color: #eaecf4;
`;

export default function HeaderPreviewService({ className, onClick, info, dataEvaluate }) {
	const { icon, developerName, name, shortDescription, category, embedIconUrl, serviceOwner } = {
		...info,
	};

	function renderCategory(view) {
		let categories = [];
		if (typeof category === 'string') {
			categories.push(category);
		} else {
			categories = category;
		}

		if (view === 'ALL')
			return categories
				.slice(2)
				.map((c) => (
					<TagCareer className="block rounded-md text-primary text-sm font-medium mr-2 mt-2">{c}</TagCareer>
				));

		return categories
			.slice(0, 2)
			.map((c) => (
				<TagCareer className="inline-block rounded-md text-primary text-sm font-medium mr-2 mt-2">
					{c}
				</TagCareer>
			));
	}
	const Flag = getFlag(serviceOwner);
	return (
		<>
			<div className={`flex -mx-4 relative mobile:flex-wrap mobile:justify-center ${className}`}>
				<div
					className="rounded-3xl overflow-hidden mx-4 mobile:mb-6"
					style={{ width: '16.875rem', height: '16.875rem' }}
				>
					<img title={name} src={embedIconUrl || icon} alt={name} className="w-full h-full object-cover" />
				</div>
				<div className="w-3/4 mobile:w-full px-4">
					<div className="flex">
						{Flag && (
							<span className="mr-5">
								<Flag />
							</span>
						)}
						<Title className="font-bold mb-3 mr-36 tablet:mr-0 line-clamp-2">{name}</Title>
					</div>

					{dataEvaluate?.ratingQuantity !== 0 && (
						<div className="mb-4 flex items-center">
							<Rate
								allowHalf
								disabled
								value={isInt(dataEvaluate?.avgRating)}
								className="text-base"
								style={{ color: '#F4BF1B' }}
							/>
							<span className="ml-2 text-gray-350">{dataEvaluate?.ratingQuantity}</span>
						</div>
					)}
					<Tooltip placement="bottomLeft" title={developerName}>
						<div className="mb-3 tablet:mr-0 font-semibold line-clamp-1">
							<UserGroupIcon width="w-4" className="inline-block mr-2" />
							{developerName}
						</div>
					</Tooltip>
					<div
						className={clsx(
							'mb-4 tablet:mr-0 mobile:line-clamp-none font-medium whitespace-pre-wrap break-words',
							dataEvaluate?.ratingQuantity === 0 ? 'line-clamp-5' : 'line-clamp-3',
						)}
					>
						{shortDescription}
					</div>
					{category && renderCategory()}
					{typeof category !== 'string' && category?.length > 2 && (
						<Popover placement="bottom" content={renderCategory('ALL')}>
							<TagCareer className="inline-block rounded-md text-primary text-sm font-medium mt-2 cursor-pointer">
								+{category.length - 2} ...
							</TagCareer>
						</Popover>
					)}
				</div>

				<div className="absolute right-4 top-0 tablet:hidden">
					<Button
						type="primary"
						style={{ width: '10.625rem' }}
						className="uppercase font-semibold "
						onClick={() => onClick()}
					>
						Bảng giá
					</Button>
				</div>
			</div>
			<div className="hidden tablet:block w-full text-center mb-8">
				<Button type="primary" className="uppercase font-semibold w-1/2" onClick={() => onClick()}>
					Bảng giá
				</Button>
			</div>
		</>
	);
}

HeaderPreviewService.propTypes = {
	className: PropTypes.string,
	info: PropTypes.object,
	onClick: PropTypes.func,
};
HeaderPreviewService.defaultProps = {
	className: '',
	info: {},
	onClick: noop,
};
