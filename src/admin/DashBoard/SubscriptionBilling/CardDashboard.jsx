import { DX } from 'app/models';
import React from 'react';
import styled from 'styled-components';

const CardDashboard = ({ options, icon, iconArrow, type }) => {
	const BoxDetail = styled.div`
		border: 1px solid #f6efee;
		background: #ffffff;
		border-radius: 10px;
		padding: 1rem 1.25rem 1.25rem;
		margin-bottom: 1.875rem;
		box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	`;
	const Tilte = styled.div`
		color: #78909c;
		margin-top: 3px;
		margin-bottom: 10px;
	`;
	const { name, percent, count, number, billSucess, sumBill, money } = {
		...options,
	};
	return (
		<BoxDetail className="col-span-1 ">
			<div className="flex justify-between">
				<Tilte>{name}</Tilte>
				<div>{icon}</div>
			</div>
			{number !== undefined ? (
				<div>
					<div className="flex justify-between">
						<div className="text-4xl mt-1 font-semibold">{count}</div>
						<div className="mt-5" style={{ color: '#52C41A' }}>
							{percent}%{iconArrow}
						</div>
					</div>
					<hr className="mt-3 mb-3" />
					<div>Tháng trước đó: {number}</div>
				</div>
			) : (
				<div>
					{percent !== undefined ? (
						<div>
							<div>
								<span className="text-4xl font-semibold">
									{billSucess}/{sumBill}
								</span>
								<span className="ml-2" style={{ color: '#FAAD14' }}>
									{percent}%
								</span>
							</div>

							{type === undefined ? <hr className="mt-3 " /> : ''}
						</div>
					) : (
						<div>
							<div className="text-4xl font-semibold">{DX.formatNumberCurrency(money)} VNĐ</div>
							{type === undefined ? <hr className="mt-3 " /> : ''}
						</div>
					)}
				</div>
			)}
		</BoxDetail>
	);
};

export default CardDashboard;
