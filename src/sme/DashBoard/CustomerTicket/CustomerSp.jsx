import { Divider, Select } from 'antd';
import styled from 'styled-components';
import { BlueHeadphoneIcon, GreenClockIcon, YellowHeadphoneIcon } from 'app/icons';
import React from 'react';

const BoxDetail = styled.div`
	background: #ffffff;
	border: 1px solid #f0f0f0;
	border-radius: 16px;
	padding: 1rem 1.25rem 1.25rem;
	margin-bottom: 1.875rem;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
`;

const CustomDiv = styled.div`
	color: rgba(0, 0, 0, 0.45);
`;
function CustomerSp({ handleChange, change, handleChangeDual, changeDual }) {
	return (
		<div classNames="mb-10">
			<div>
				<div className="flex gap-8">
					<BoxDetail className="w-80">
						<div className="flex gap-8">
							<CustomDiv className="font-normal mt-4">Tổng số Ticket đang xử lý</CustomDiv>
							<BlueHeadphoneIcon className="inline-block w-12 mt-1" />
						</div>
						<div className="font-bold text-4xl">50</div>
					</BoxDetail>
					<BoxDetail className="w-80">
						<div className="flex gap-8">
							<CustomDiv className="font-normal mt-4">Tổng số Ticket chưa xử lý</CustomDiv>
							<YellowHeadphoneIcon className="inline-block w-12 mt-1" />
						</div>
						<div className="font-bold text-4xl">10</div>
					</BoxDetail>
					<BoxDetail className="w-80">
						<div className="flex gap-8">
							<CustomDiv className="font-normal mt-4">Thời gian xử lý trung bình</CustomDiv>
							<GreenClockIcon className="inline-block w-12 mt-1" />
						</div>
						<div className="font-bold text-4xl">3.6 ngày</div>
					</BoxDetail>
				</div>
			</div>
			<div className="mt-10 mb-10">
				<div className="shadow-card p-6">
					<div className="m-2 font-bold">Tổng số Ticket</div>
					<div id="111" className="mt-10" />
					<Divider className="mb-10" />
					<div className="flex">
						<Select placeholder="Năm" className=" ml-5 flex-1" disabled />
						<Select onChange={handleChange} value={change} className=" flex-1 ml-5">
							<option value="month">2021</option>
							<option value="qoty">2022</option>
							<option value="year">2023</option>
						</Select>
						<Select placeholder="Danh mục: Tất cả" className=" flex-1 ml-5" disabled />
						<Select placeholder="Danh mục: Tất cả" className="  flex-1 ml-5" disabled />
					</div>
				</div>
				<div className="mt-10 shadow-card p-6">
					<div className="m-2 font-bold">Tốc độ xử lý ticket theo thời gian</div>
					<div id="dual" className="mt-10" />
					<Divider className="mb-10 w-full" />
					<div className="flex">
						<Select placeholder="Năm" className=" w-1/4 ml-5" disabled />
						<Select
							onChange={handleChangeDual}
							placeholder="Chọn môt ô"
							value={changeDual}
							className=" w-1/4 ml-5"
						>
							<option value="month">2021</option>
							<option value="qoty">2022</option>
							<option value="year">2023</option>
						</Select>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CustomerSp;
