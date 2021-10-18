import { Rate } from 'antd';
import React from 'react';
import styled from 'styled-components';

const CardDashboard = ({ name, options, icon }) => {
	const BoxDetail = styled.div`
		border: 1px solid #f6efee;
		border-radius: 10px;
		padding: 1rem 1.25rem 1.25rem;
		margin-bottom: 1.875rem;
	`;
	const Tilte = styled.div`
		color: #78909c;
		margin-top: 3px;
		margin-bottom: 10px;
	`;
	const { count, footer } = {
		...options,
	};

	return (
		<BoxDetail className="col-span-1 ">
			<div className="flex justify-between">
				<Tilte>{name}</Tilte>
				{icon}
			</div>
			{footer.length > 0 ? (
				<div>
					<div className="flex justify-between">
						<div className="text-4xl font-semibold">{count}</div>
					</div>
					<hr className="mt-3 mb-3" />
					<div className="grid grid-cols-2">
						{footer.map((option) => (
							<div className="grid grid-cols-2 mt-2">
								<div>{option.name}</div>
								<div className="text-center">{option.value}</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="text-center">
					<div className=" justify-between">
						<div className="text-4xl font-semibold">{count} / 5</div>
					</div>
					<Rate allowHalf disabled defaultValue={count} />
				</div>
			)}
		</BoxDetail>
	);
};

export default CardDashboard;
