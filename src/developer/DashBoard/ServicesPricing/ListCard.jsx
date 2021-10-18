import React from 'react';
import { AcceptedServiceIcon, ArrowUpwardIcon, AverageRateIcon, TotalPricingIcon } from 'app/icons';
import TotalServiceIcon from 'app/icons/TotalServiceIcon';
import CardDashboard from './CardDashboard';

function ListCard({ options }) {
	return (
		<>
			<div className="grid grid-cols-4 gap-x-8">
				<CardDashboard
					options={options[0]}
					icon={<TotalServiceIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					name="Tổng số dịch vụ"
				/>
				<CardDashboard
					options={options[1]}
					icon={<AcceptedServiceIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					name="Dịch vụ đã duyệt"
				/>
				<CardDashboard
					options={options[2]}
					icon={<TotalPricingIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					name="Tổng số gói dịch vụ"
				/>
				<CardDashboard
					options={options[3]}
					icon={<AverageRateIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					name="Trung bình đánh giá dịch vụ"
				/>
			</div>
		</>
	);
}

export default ListCard;
