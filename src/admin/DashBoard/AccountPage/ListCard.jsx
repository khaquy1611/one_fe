import React from 'react';
import { TotalRegisterAccountIcon, ArrowUpwardIcon, UserDashboardIcon } from 'app/icons';
import CardDashboard from './CardDashboard';

function ListCard({ options }) {
	return (
		<>
			<div className="grid grid-cols-4 gap-x-8">
				<CardDashboard
					options={options[0]}
					icon={<UserDashboardIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					name="Tổng số tài khoản"
				/>
				<CardDashboard
					options={options[1]}
					icon={<TotalRegisterAccountIcon width="w-12" className="inline-block ml-4" />}
					iconArrow={<ArrowUpwardIcon width="w-4" className="inline-block" />}
					name="Đăng ký mới trong tháng"
				/>
			</div>
		</>
	);
}

export default ListCard;
