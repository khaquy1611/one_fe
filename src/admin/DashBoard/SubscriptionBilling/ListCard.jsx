import React from 'react';
import {
	ArrowUpwardIcon,
	MoneyDashBoardIcon,
	SubServiceIcon,
	SumDebtIcon,
	SumRevenelIcon,
	SupscriptionIcon,
	UserDashboardIcon,
} from 'app/icons';
import { DollarOutlined } from '@ant-design/icons';
import CardDashboard from './CardDashboard';

function ListCard({ options, type }) {
	return (
		<>
			<div className="grid grid-cols-4 gap-x-8">
				<CardDashboard
					options={options[0]}
					icon={<SubServiceIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
				/>
				<CardDashboard
					options={options[1]}
					icon={<UserDashboardIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
				/>
				<CardDashboard
					options={options[2]}
					icon={
						<div style={{ background: '#FFF7E6' }} className="w-12 h-12 text-center rounded-full ">
							<DollarOutlined className="mt-3 text-lg" style={{ color: '#FA8C16' }} />
						</div>
					}
				/>
				<CardDashboard
					options={options[3]}
					icon={
						<div style={{ background: '#FFF1F0' }} className="w-12 h-12 text-center rounded-full ">
							<DollarOutlined className="mt-3 text-lg" style={{ color: '#F5222D' }} />
						</div>
					}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
				/>
			</div>
			{type === 'SME' ? (
				<div className="grid grid-cols-2 gap-x-8">
					<CardDashboard
						options={options[4]}
						icon={<MoneyDashBoardIcon width="w-12" className="inline-block" />}
						iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
						type={type}
					/>
					<CardDashboard
						options={options[5]}
						icon={<SumDebtIcon width="w-12" className="inline-block ml-4" />}
						type={type}
					/>
				</div>
			) : (
				<div className="grid grid-cols-4 gap-x-8">
					<CardDashboard
						options={options[4]}
						icon={<MoneyDashBoardIcon width="w-12" className="inline-block" />}
						iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					/>
					<CardDashboard
						options={options[5]}
						icon={<SumRevenelIcon width="w-12" className="inline-block ml-4" />}
						iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					/>
					<CardDashboard
						options={options[6]}
						icon={<SupscriptionIcon width="w-12" className="inline-block ml-4" />}
						iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					/>
					{type === 'ADMIN' ? (
						<CardDashboard
							options={options[7]}
							icon={<SumDebtIcon width="w-12" className="inline-block ml-4" />}
							iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
						/>
					) : (
						''
					)}
				</div>
			)}
		</>
	);
}

export default ListCard;
