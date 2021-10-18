import { Select } from 'antd';
import React from 'react';
import styled from 'styled-components';
import ListCard from '../../../admin/DashBoard/SubscriptionBilling/ListCard';

const BoxDetail = styled.div`
	border: 1px solid #f6efee;
	border-radius: 10px;
	padding: 1rem 1.25rem 1.25rem;
	margin-bottom: 1.875rem;
	background: #ffffff;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
`;
function SubBill({ options, handleChangePayment, changePayment }) {
	return (
		<div>
			<ListCard options={options} type="SME" />

			<BoxDetail>
				<div className="m-2">Tỉ lệ trạng thái thanh toán của hóa đơn</div>
				<hr />
				<div className="text-center">
					<div id="paymentRate" className="mt-10 " />
				</div>
				<hr className="mt-10 " />
				<div className=" grid grid-cols-5">
					<Select disabled className="mt-5" placeholder="Chọn môt ô" value="month">
						<option value="month">Tháng</option>
						<option value="qoty">Hàng qúy</option>
						<option value="year">Hàng năm</option>
					</Select>
					<Select
						onChange={handleChangePayment}
						value={changePayment}
						placeholder="Danh mục: Tất cả"
						className="mt-5 ml-4"
						options={[
							{ label: 'Tháng 1', value: 1 },
							{ label: 'Tháng 2', value: 2 },
						]}
					/>
					<Select placeholder="Tỉnh thành: Tất cả" className="mt-5 ml-4" disabled />
					<Select placeholder="Danh mục: Tất cả" className="mt-5 ml-4" disabled />
					<Select placeholder="Dịch vụ: Tất cả" className="mt-5 ml-4" disabled />
				</div>
			</BoxDetail>
		</div>
	);
}

export default SubBill;
