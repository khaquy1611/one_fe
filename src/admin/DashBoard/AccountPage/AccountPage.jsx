import React from 'react';
import styled from 'styled-components';
import { SelectWithPrefix } from 'app/components/Atoms';
import { Select } from 'antd';

const BorderBox = styled.div`
	border: 1px solid #f6efee;
	border-radius: 10px;
	padding: 1rem 1.25rem 1.25rem;
	margin-bottom: 1.875rem;
`;
function AccountPage({
	totalAccountChange,
	setTotalAccountChange,
	totalSmeEmployeeChange,
	setTotalSmeEmployeeChange,
	changeDual,
	handleChangeDual,
}) {
	return (
		<div>
			<BorderBox>
				<div className="m-2 font-bold border-b  pb-5">Tổng số account trong hệ thống</div>
				<div id="serviceTotalAccount" className="mt-10 " />
				<div className="m-2 border-t">
					<div className="flex items-center mt-5">
						<Select
							onChange={setTotalAccountChange}
							value={totalAccountChange}
							className="w-60"
							options={[{ label: 'Năm', value: 'year' }]}
						/>
						<Select
							className="w-60"
							defaultValue="month1"
							options={[{ label: 'Năm 2021', value: 'y2021' }]}
						/>
						<SelectWithPrefix
							className="w-60"
							prefix="Tỉnh thành"
							defaultValue="all"
							options={[{ label: 'Tất cả', value: 'all' }]}
						/>
					</div>
				</div>
			</BorderBox>

			<div className="grid grid-cols-2 gap-8 mt-10 ">
				<BorderBox className="border border-gray-900">
					<div className="m-2 font-bold border-b  pb-5">
						Tổng số Account SME Employee của từng doanh nghiệp
					</div>
					<div id="containerService" className="mt-10 " />
					<div className="m-2 border-t">
						<div className="flex items-center mt-5">
							<SelectWithPrefix
								prefix="Doanh nghiệp"
								value={totalSmeEmployeeChange}
								onChange={setTotalSmeEmployeeChange}
								className="w-60 ml-4"
								options={[
									{ label: 'Tất cả', value: 'all' },
									{ label: 'ERP', value: 'erp' },
								]}
							/>
						</div>
					</div>
				</BorderBox>
				<BorderBox>
					<div className="m-2 font-bold border-b  pb-5">Số lượng Daily active user</div>
					<div id="dualLine" className="mt-10 " style={{ height: 500 }} />
					<div className="border-t m-2">
						<div className="flex items-center mt-5 justify-items-end">
							<Select
								onChange={handleChangeDual}
								value={changeDual}
								className="w-60"
								options={[{ label: 'Tháng', value: 'month' }]}
							/>
							<Select
								className="w-60"
								defaultValue="month1"
								options={[{ label: 'Tháng 1', value: 'month1' }]}
							/>
							<SelectWithPrefix
								className="w-60"
								prefix="Dịch vụ"
								defaultValue="all"
								options={[{ label: 'Tất cả', value: 'all' }]}
							/>
						</div>
					</div>
				</BorderBox>

				<BorderBox>
					<div className="m-2 font-bold border-b  pb-5">Tỉ lệ doanh nghiệp có đăng ký dịch vụ</div>
					<div id="registerServiceEnterprise" className="mt-10 " />
					<div className="m-2 border-t">
						<div className="flex items-center mt-5">
							<Select
								className="w-60"
								defaultValue="month"
								options={[{ label: 'Tháng', value: 'month' }]}
							/>
							<Select
								className="w-60"
								defaultValue="month1"
								options={[{ label: 'Tháng 1', value: 'month1' }]}
							/>
							<SelectWithPrefix
								className="w-60"
								defaultValue="all"
								prefix="Tỉnh thành"
								options={[{ label: 'Tất cả', value: 'all' }]}
							/>
						</div>
					</div>
				</BorderBox>
				<BorderBox className="border border-gray-900">
					<div className="m-2 font-bold border-b  pb-5">Tỉ lệ doanh nghiệp cung cấp dịch vụ</div>

					<div id="enterpriseProvisionService" className="mt-10 " />
					<div className="m-2 border-t">
						<div className="flex items-center mt-5">
							<Select
								className="w-60"
								defaultValue="month"
								options={[{ label: 'Tháng', value: 'month' }]}
							/>
							<Select
								// onChange={setNewServicePercentageChange}
								// value={newServicePercentageChange}
								className="w-60"
								defaultValue="month1"
								options={[{ label: 'Tháng 1', value: 'month1' }]}
							/>
							<SelectWithPrefix
								defaultValue="all"
								className="w-60"
								prefix="Tỉnh thành"
								options={[{ label: 'Tất cả', value: 'all' }]}
							/>
						</div>
					</div>
				</BorderBox>

				<div />
			</div>
		</div>
	);
}

export default AccountPage;
