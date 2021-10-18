import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SelectWithPrefix } from 'app/components/Atoms';
import { Form, Radio, Select } from 'antd';
import RevenueServiceTable from './Components/RevenueServiceTable';

const BorderBox = styled.div`
	border: 1px solid #f6efee;
	border-radius: 10px;
	padding: 1rem 1.25rem 1.25rem;
	margin-bottom: 1.875rem;
`;
function ServicePricingDetail({
	serviceStatusChange,
	setServiceStatusChange,
	pricingStatusChange,
	setPricingStatusChange,
	subPricingChange,
	setSubPricingChange,
	rateServiceStateChange,
	setRateServiceChange,
	totalServiceByDevChange,
	setTotalServiceByDevChange,
	newServicePercentageChange,
	setNewServicePercentageChange,
	serviceAverageRateChange,
	setServiceAverageRateChange,
	topTenServiceChange,
	setTopTenServiceChage,
	totalServiceByTimeChange,
	setTotalServiceByTimeChange,
}) {
	return (
		<div>
			<BorderBox>
				<div className="m-2 font-bold border-b  pb-5">Tổng dịch vụ phát hành theo thời gian</div>
				<div id="totalServiceByTime" className="mt-10 " />
				<hr className="mt-8" />
				<Form layout="horizontal" className="mt-6 ">
					<div className="grid grid-cols-4 gap-3">
						<div>
							<Form.Item>
								<Select disabled value="month" options={[{ label: 'Tháng', value: 'month' }]} />
							</Form.Item>
						</div>
						<div>
							<Form.Item>
								<Select
									onChange={setTotalServiceByTimeChange}
									value={totalServiceByTimeChange}
									options={[
										{ label: 'Tháng 1', value: 1 },
										{ label: 'Tháng 2', value: 2 },
									]}
								/>
							</Form.Item>
						</div>
					</div>
				</Form>
			</BorderBox>

			<div className="grid grid-cols-2 gap-8 mt-10 ">
				<BorderBox>
					<div className="m-2 font-bold border-b  pb-5">Tổng số dịch vụ theo trạng thái phê duyệt</div>
					<div id="serviceStatusChart" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-3 gap-3">
							<div>
								<Form.Item>
									<SelectWithPrefix
										onChange={setServiceStatusChange}
										value={serviceStatusChange}
										className="w-60"
										prefix="Danh mục"
										options={[
											{ label: 'Tất cả', value: 'total' },
											{
												label: 'Accounting Software',
												value: 'accounting',
											},
											{
												label: 'CRM Software',
												value: 'crm',
											},
										]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
				<BorderBox className="border border-gray-900">
					<div className="m-2 font-bold border-b  pb-5">Tỉ lệ trạng thái dịch vụ được tạo mới</div>

					<div id="newServicePercentage" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-3 gap-3">
							<div>
								<Form.Item>
									<SelectWithPrefix
										disabled
										prefix="Danh mục"
										className="w-60"
										value="total"
										options={[{ label: 'Tất cả', value: 'total' }]}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<Select
										onChange={setNewServicePercentageChange}
										value={newServicePercentageChange}
										className="w-60 ml-4"
										options={[
											{ label: 'Tháng 1', value: 1 },
											{ label: 'Tháng 2', value: 2 },
										]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
				<BorderBox className="border border-gray-900">
					<div className="m-2 font-bold border-b  pb-5">Tổng số dịch vụ của nhà phát triển</div>
					<div id="containerService" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-3 gap-3">
							<div>
								<Form.Item>
									<SelectWithPrefix
										disabled
										prefix="Danh mục"
										className="w-60"
										value="total"
										options={[{ label: 'Tất cả', value: 'total' }]}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<SelectWithPrefix
										prefix="Danh mục"
										value={totalServiceByDevChange}
										onChange={setTotalServiceByDevChange}
										className="w-60 ml-4"
										options={[
											{ label: 'Tất cả', value: 'all' },
											{ label: 'ERP', value: 'erp' },
										]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
				<BorderBox className="row-span-2">
					<div className="m-2 font-bold border-b  pb-5">Trung hình đánh giá theo dịch vụ</div>
					<div id="serviceAverageRateChart" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Form.Item>
									<Select disabled value="month" options={[{ label: 'Tháng', value: 'month' }]} />
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<Radio.Group
										className="pt-1"
										value={2}
										options={[
											{
												label: 'Doanh nghiệp',
												value: 1,
												disabled: true,
											},
											{
												label: 'Danh mục',
												value: 2,
											},
										]}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<Select
										value={serviceAverageRateChange}
										onChange={setServiceAverageRateChange}
										options={[
											{ label: 'Tháng 1', value: 1 },
											{ label: 'Tháng 2', value: 2 },
										]}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<SelectWithPrefix
										disabled
										// className="w-80 mt-3"
										prefix="Danh mục"
										value="total"
										options={[{ label: 'Tất cả', value: 'total' }]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
				<BorderBox>
					<div className="m-2 font-bold border-b  pb-5">Tổng số gói dịch vụ theo trạng thái phê duyệt</div>
					<div id="pricingStatusChart" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-4 gap-3">
							<div>
								<Form.Item>
									<SelectWithPrefix
										onChange={setPricingStatusChange}
										value={pricingStatusChange}
										className="w-60"
										prefix="Danh mục"
										options={[
											{ label: 'Tất cả', value: 'total' },
											{
												label: 'Accounting Software',
												value: 'accounting',
											},
											{
												label: 'CRM Software',
												value: 'crm',
											},
										]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
				<div />
			</div>
			<BorderBox>
				<div className="m-2 font-bold border-b  pb-5">Tổng doanh thu theo dịch vụ</div>
				<RevenueServiceTable />

				<hr className="mt-8" />
				<Form layout="horizontal" className="mt-6 ">
					<div className="grid grid-cols-4 gap-3">
						<div>
							<Form.Item>
								<Select
									disabled
									className="w-60"
									value="month"
									options={[{ label: 'Tháng', value: 'month' }]}
								/>
							</Form.Item>
						</div>
						<div>
							<Form.Item>
								<Select
									defaultValue={1}
									className="w-60 ml-4"
									options={[
										{ label: 'Tháng 1', value: 1 },
										{ label: 'Tháng 2', value: 2 },
									]}
								/>
							</Form.Item>
						</div>
						<div>
							<Form.Item>
								<SelectWithPrefix
									disabled
									value="total"
									prefix="Danh mục"
									className="w-60 ml-4"
									options={[{ label: 'Tất cả', value: 'total' }]}
								/>
							</Form.Item>
						</div>
					</div>
				</Form>
			</BorderBox>
			<BorderBox>
				<div className="m-2 font-bold border-b  pb-5">Tổng Subscription theo gói dịch vụ</div>
				<div id="subcriptionByPricing" className="mt-10 " />

				<hr className="mt-8" />
				<Form layout="horizontal" className="mt-6 ">
					<div className="grid grid-cols-4 gap-3">
						<div>
							<Form.Item>
								<Select
									disabled
									className="w-60"
									value="month"
									options={[{ label: 'Tháng', value: 'month' }]}
								/>
							</Form.Item>
						</div>

						<div>
							<Form.Item>
								<Select
									value={subPricingChange}
									onChange={setSubPricingChange}
									className="w-60 ml-4"
									options={[
										{ label: 'Tháng 1', value: 1 },
										{ label: 'Tháng 2', value: 2 },
									]}
								/>
							</Form.Item>
						</div>
						<div>
							<Form.Item>
								<SelectWithPrefix
									disabled
									value="total"
									prefix="Danh mục"
									className="w-60 ml-4"
									options={[{ label: 'Tất cả', value: 'total' }]}
								/>
							</Form.Item>
						</div>
					</div>
				</Form>
			</BorderBox>
			<div className="grid grid-cols-2 gap-8 mt-10">
				<BorderBox>
					<div className="m-2 font-bold border-b  pb-5">Top 10% trung bình đánh giá dịch vụ</div>
					<div id="topTenService" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<Form.Item>
									<Select disabled value="month" options={[{ label: 'Tháng', value: 'month' }]} />
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<SelectWithPrefix
										disabled
										value="total"
										prefix="Danh mục"
										options={[{ label: 'Tất cả', value: 'total' }]}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<Select
										value={topTenServiceChange}
										onChange={setTopTenServiceChage}
										options={[
											{ label: 'Tháng 1', value: 1 },
											{ label: 'Tháng 2', value: 2 },
										]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
				<BorderBox>
					<div className="m-2 font-bold border-b  pb-5">Danh sách 10 dịch vụ có đánh giá tốt nhất</div>
					<div id="topRatedServiceChart" className="mt-10 " />

					<hr className="mt-8" />
					<Form layout="horizontal" className="mt-6 ">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<Form.Item>
									<Select disabled value="month" options={[{ label: 'Tháng', value: 'month' }]} />
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<SelectWithPrefix
										disabled
										value="total"
										prefix="Danh mục"
										options={[{ label: 'Tất cả', value: 'total' }]}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item>
									<Select
										value={rateServiceStateChange}
										onChange={setRateServiceChange}
										options={[
											{ label: 'Tháng 1', value: 1 },
											{ label: 'Tháng 2', value: 2 },
										]}
									/>
								</Form.Item>
							</div>
						</div>
					</Form>
				</BorderBox>
			</div>
		</div>
	);
}

export default ServicePricingDetail;
