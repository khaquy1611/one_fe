import React from 'react';
import styled from 'styled-components';

const BoxDetail = styled.div`
	border: 1px solid #f6efee;
	border-radius: 10px;
	padding: 1rem 1.25rem 1.25rem;
	margin-bottom: 1.875rem;
`;
const Title = styled.div`
	color: #78909c;
	margin-top: 3px;
	margin-bottom: 10px;
`;

const CardDashboard = ({ options, icon, iconArrow }) => {
	const { count, number, name, percent, totalRegister, totalAdmin, totalDev, totalSME } = {
		...options,
	};

	return (
		<BoxDetail className="">
			<div className="flex justify-between">
				<Title>{name}</Title>
				{icon}
			</div>
			{percent === undefined ? (
				<div>
					<div className="flex justify-between">
						<div className="text-4xl mt-1 font-semibold">{count}</div>
					</div>
					<hr className="mt-3 mb-3" />
					<div className="flex justify-between">
						<span>Admin {totalAdmin}</span>
						<span>Nhà phát triển {totalDev}</span>
						<span>SME {totalSME}</span>
					</div>
				</div>
			) : (
				<div>
					<div className="flex justify-between">
						<div className="text-4xl mt-1 font-semibold">{totalRegister}</div>
						<div className="mt-5" style={{ color: '#52C41A' }}>
							{percent}%{iconArrow}
						</div>
					</div>
					<hr className="mt-3 mb-3" />
					<div>Tháng trước {number}</div>
				</div>
			)}
		</BoxDetail>
	);
};

export default CardDashboard;
