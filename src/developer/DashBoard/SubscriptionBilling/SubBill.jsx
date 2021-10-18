import { Input, Select } from 'antd';
import React from 'react';
import styled from 'styled-components';
import ListCard from '../../../admin/DashBoard/SubscriptionBilling/ListCard';

const BoxDetail = styled.div`
	border: 1px solid #f6efee;
	border-radius: 10px;
	padding: 1rem 1.25rem 1.25rem;
	margin-bottom: 1.875rem;
`;
function SubBill({
	handleChange,
	change,
	handleChangeRec,
	changeRec,
	handleChangeDual,
	changeDual,
	handleChangeUnsup,
	changeUnsup,
	options,
	turnoverValueOverTime,
	handleChangeRevenueTime,
}) {
	const optionsData = [
		{ value: 'ALL', label: 'Tất cả' },
		{ value: 'MONTH', label: 'Tháng' },
		{ value: 'PRECIOUS', label: 'Quý' },
		{ value: 'YEAR', label: 'Năm' },
	];
	return (
		<div>
			<ListCard options={options} type="DEV" />

			<div className="mt-10 mb-10">
				<div>
					<BoxDetail>
						<div className="m-2 font-bold">Tổng số khách hàng hủy gói dịch vụ</div>
						<hr />
						<div id="unsupcription" className="mt-10" />
						<hr className="mt-10" />
						<div className="grid grid-cols-4">
							<Select disabled placeholder="Chọn môt ô" value="month" className="mt-5">
								<option value="month">Tháng</option>
								<option value="qoty">Hàng qúy</option>
								<option value="year">Hàng năm</option>
							</Select>
							<Select
								onChange={handleChangeUnsup}
								value={changeUnsup}
								placeholder="Danh mục: Tất cả"
								className="mt-5 ml-4"
								options={[
									{ label: 'Tháng 1', value: 1 },
									{ label: 'Tháng 2', value: 2 },
								]}
							/>
							<Select placeholder="Tỉnh thành: Tất cả" className="mt-5 ml-4" disabled />

							<Select placeholder="Danh mục: Tất cả" className="mt-5 ml-4" disabled />
						</div>
					</BoxDetail>
					<BoxDetail>
						<div className="m-2 font-bold">Tổng số khách hàng đã đăng ký dịch vụ</div>
						<hr />
						<div id="111" className="mt-10 " />
						<hr className="mt-10 " />
						<div className="grid grid-cols-4">
							<Select disabled placeholder="Chọn môt ô" value="month" className="mt-5">
								<option value="month">Tháng</option>
								<option value="qoty">Hàng qúy</option>
								<option value="year">Hàng năm</option>
							</Select>
							<Select
								onChange={handleChange}
								value={change}
								placeholder="Danh mục: Tất cả"
								className="mt-5 ml-4"
								options={[
									{ label: 'Tháng 1', value: 1 },
									{ label: 'Tháng 2', value: 2 },
								]}
							/>
							<Select placeholder="Tỉnh thành: Tất cả" className="mt-5 ml-4" disabled />

							<Select placeholder="Danh mục: Tất cả" className="mt-5 ml-4" disabled />
						</div>
					</BoxDetail>
				</div>
				<div className="grid grid-cols-2 gap-8">
					<BoxDetail>
						<div className="m-2 font-bold">Số lượng khách hàng đăng ký mới dịch vụ</div>
						<hr />
						<div id="dual" className="mt-10" />
						<hr className="mt-10 " />
						<div className="grid grid-cols-2">
							<Select disabled placeholder="Chọn môt ô" value="month" className="mt-5">
								<option value="month">Tháng</option>
								<option value="qoty">Hàng qúy</option>
								<option value="year">Hàng năm</option>
							</Select>
							<Select
								onChange={handleChangeDual}
								value={changeDual}
								placeholder="Danh mục: Tất cả"
								className="mt-5 ml-4"
								options={[{ label: 'Tháng 1', value: 1 }]}
							/>
							<Select placeholder="Chọn tỉnh thành" className="mt-4" disabled />

							<Select placeholder="ERP" className="mt-4 ml-4" disabled />
						</div>
					</BoxDetail>
					<BoxDetail>
						<div className="m-2 font-bold">Tỷ lệ trạng thái thanh toán của hóa đơn</div>
						<hr />
						<div id="container" className="mt-10" />
						<hr className="mt-10 " />
						<div className="grid grid-cols-3 mt-5">
							<Select placeholder="Chọn môt ô" value="month" disabled>
								<option value="month">Tháng</option>
								<option value="qoty">Hàng qúy</option>
								<option value="year">Hàng năm</option>
							</Select>
							<Select
								onChange={handleChangeRec}
								value={changeRec}
								placeholder="Danh mục: Tất cả"
								className="ml-4"
								options={[
									{ label: 'Tháng 1', value: 1 },
									{ label: 'Tháng 2', value: 2 },
								]}
							/>
							<Select placeholder="Tỉnh thành: Tất cả" className="ml-4" disabled />
						</div>
						<div className="grid grid-cols-2">
							<Select placeholder="Danh mục: Tất cả" className="mt-5" disabled />
							<Select placeholder="Tỉnh thành: Tất cả" className="mt-5 ml-4" disabled />
						</div>
					</BoxDetail>
				</div>
				{/* Doanh thu */}
				<BoxDetail>
					<div className="m-2 font-bold">Tổng doanh thu của dịch vụ</div>
					<hr />
					<div id="revenueServiceId" className="mt-10 " />

					<div className="grid grid-cols-5">
						<Select disabled placeholder="Chọn môt ô" value="month" className="mt-5">
							<option value="month">Tháng</option>
							<option value="qoty">Hàng qúy</option>
							<option value="year">Hàng năm</option>
						</Select>
						<Select
							onChange={handleChangeRevenueTime}
							value={turnoverValueOverTime}
							placeholder="Danh mục: Tất cả"
							className="mt-5 ml-4"
							options={[
								{ label: 'Tháng 1', value: 'ALL' },
								//	{ label: "Tháng 2", value: 2 },
							]}
						/>
						<Select placeholder="Tỉnh thành: Tất cả" className="mt-5 ml-4" disabled />

						<Select placeholder="Danh mục: Tất cả" className="mt-5 ml-4" disabled />
						<Select placeholder="Top: 10" className="mt-5 ml-4" disabled />
					</div>
				</BoxDetail>
				<div className="grid grid-cols-2">
					<BoxDetail>
						<div className="m-2 font-bold">Tỉ lệ doanh thu theo từng mục</div>
						<hr />
						<div id="revenue" className="mt-10" />
						<hr className="mt-10 " />
						<div className="grid grid-cols-3">
							<Select disabled placeholder="Chọn môt ô" value="month" className="mt-5">
								<option value="month">Tháng</option>
								<option value="qoty">Hàng qúy</option>
								<option value="year">Hàng năm</option>
							</Select>
							<Select
								onChange={handleChangeDual}
								value={changeDual}
								placeholder="Danh mục: Tất cả"
								className="mt-5 ml-4"
								options={[{ label: 'Tháng 1', value: 1 }]}
							/>
							<Select placeholder="Tỉnh thành: Tất cả" className="mt-5 ml-4" disabled />
						</div>
					</BoxDetail>
				</div>
			</div>
		</div>
	);
}

export default SubBill;
