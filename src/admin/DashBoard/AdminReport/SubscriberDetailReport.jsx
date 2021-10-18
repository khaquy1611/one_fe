import React, { useState, useMemo, useCallback } from 'react';
import { useLng, usePaginationApply, useUser } from 'app/hooks';
import { Categories, CityInfor, DX, Report } from 'app/models';
import { ExportOutlined, FilterOutlined } from '@ant-design/icons';
import { renderOptions } from 'app/components/Atoms';
import { Button, DatePicker, Divider, Input, message, Select, Table, Tooltip } from 'antd';
import { useQuery } from 'react-query';
import moment from 'moment';
import debounce from 'lodash/debounce';

const activeOptions = [
	{
		value: '',
		label: 'Tất cả',
	},
	{
		value: 'IN_TRIAL',
		label: 'Dùng thử',
	},
	{
		value: 'FUTURE',
		label: 'Đang chờ',
	},
	{
		value: 'CANCELED',
		label: 'Đã hủy',
	},
	{
		value: 'ACTIVE',
		label: 'Hoạt động',
	},
	{
		value: 'NON_RENEWING',
		label: 'Kết thúc',
	},
];

const typeSubs = [
	{
		value: '',
		label: 'Tất cả',
	},
	{
		value: 'SERVICE',
		label: 'Dịch vụ',
	},
	{
		value: 'COMBO',
		label: 'Combo',
	},
];

const formatQuery = (query) => {
	if (query.serviceId) {
		const [id, type] = query.serviceId.split('-');
		query.serviceId = id;
		query.subscriptionType = type;
	}
	if (query.pricingId) {
		const [id, type] = query.pricingId.split('-');
		query.pricingId = id;
		query.subscriptionType = type;
	}
	return query;
};

export default function ReportAdmin() {
	const { tFilterField } = useLng();
	const { user } = useUser();
	const [searchService, setSearchService] = useState('');
	const [searchPricing, setSearchPricing] = useState('');
	const [searchEmployeeCode, setSearchEmployeeCode] = useState('');
	const debounceSearchEmployeeCode = useCallback(debounce(setSearchEmployeeCode, 400), []);
	const debounceSearchService = useCallback(debounce(setSearchService, 400), []);
	const debounceSearchPricing = useCallback(debounce(setSearchPricing, 400), []);
	const defaultDateRange = useMemo(() => [moment().startOf('month'), moment()], []);
	const rootAdmin = !user.departmentId || !user.department?.provinceId;
	const {
		configTable,
		page,
		filterLocal,
		onChangeOneParam,
		pageSize,
		applyQuery,
		onChangeParams,
	} = usePaginationApply(
		(params) => Report.getAllPagination(formatQuery(params)),
		[
			'startDate',
			'endDate',
			'provinceId',
			'status',
			'subscriptionType',
			'categoryId',
			'serviceId',
			'pricingId',
			'employeeCode',
		],
		{
			sort: '',
			startDate: defaultDateRange[0].format('DD/MM/YYYY'),
			endDate: defaultDateRange[1].format('DD/MM/YYYY'),
			provinceId: rootAdmin ? null : user.department.provinceId,
		},
		'Report.getAllPagination',
		{},
		true,
	);

	const [startDate, endDate, provinceId, status, subscriptionType, categoryId, serviceId, pricingId, employeeCode] = [
		filterLocal.startDate || '',
		filterLocal.endDate || '',
		filterLocal.provinceId || null,
		filterLocal.status || '',
		filterLocal.subscriptionType || '',
		filterLocal.categoryId || null,
		filterLocal.serviceId || null,
		filterLocal.pricingId || null,
		filterLocal.employeeCode || null,
	];

	const { data: provinceSelect } = useQuery(
		['getAllProvince'],
		async () => {
			const res = await CityInfor.getProvinceById(1);
			return [
				...res.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	const { data: categorySelect } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await Categories.getAllForDropdownList();
			return [
				...res.map((e) => ({
					label: e.name,
					value: e.id,
				})),
			];
		},
		{
			initialData: [],
		},
	);

	const { data: employeeCodeData } = useQuery(
		['Report.getEmployeeCodeData', searchEmployeeCode],
		async () => {
			const { content: res } = await Report.getAllEmployeeCodeForDropdownList({
				page: 0,
				size: 50,
				search: searchEmployeeCode,
			});
			return res.map((e) => ({
				value: e.employeeCode,
			}));
		},
		{
			initialData: [],
			keepPreviousData: true,
		},
	);

	const { data: optionService } = useQuery(
		['Report.getOptionsService', categoryId, searchService, subscriptionType],
		async () => {
			const { content: res } = await Report.getAllServiceForDropdownList({
				page: 0,
				size: 50,
				categoryId,
				subscriptionType,
				serviceName: searchService,
			});
			return res.map((e) => ({
				labelAll: `${e.subscriptionType === 'SERVICE' ? 'Dịch vụ' : 'Combo'}: ${e.serviceName}`,
				label: e.serviceName,
				value: `${e.serviceId}-${e.subscriptionType}`,
			}));
		},
		{
			initialData: [],
			keepPreviousData: true,
		},
	);

	const { data: optionPricing } = useQuery(
		['Report.getOptionsPricing', categoryId, subscriptionType, serviceId, provinceId, searchPricing],
		async () => {
			const { content: res } = await Report.getAllPricingForDropdownList(
				formatQuery({
					subscriptionType,
					categoryId,
					serviceId,
					provinceId,
					pricingName: searchPricing,
				}),
			);
			return res.map((e) => ({
				labelAll: `${e.subscriptionType === 'SERVICE' ? 'Gói dịch vụ' : 'Gói combo'}: ${e.pricingName}`,
				label: e.pricingName,
				value: `${e.pricingId}-${e.subscriptionType}`,
			}));
		},
		{
			initialData: [],
			keepPreviousData: true,
		},
	);

	async function exportSubscrip() {
		try {
			const file = await Report.exportFileSub(
				formatQuery({
					startDate,
					endDate,
					provinceId,
					status,
					subscriptionType,
					categoryId,
					serviceId,
					pricingId,
					employeeCode,
				}),
			);
			const fileName = 'Báo cáo chi tiết thuê bao';

			DX.exportFile(file, fileName);
		} catch (e) {
			message.error('Tải file lỗi');
		}
	}
	const columns = [
		{
			title: 'STT',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 60,
		},
		{
			title: 'Tỉnh thành',
			dataIndex: 'provinceName',
			key: 'name',
			width: 130,
			ellipsis: true,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (value) => {
				const Status = Report.activeOptions[value] || {};
				return <span>{Status.text}</span>;
			},
			width: 100,
		},
		{
			title: 'Tên khách hàng',
			dataIndex: 'smeName',
			width: 140,
		},
		{
			title: 'Mã số thuế',
			dataIndex: 'taxtNo',
			width: 110,
		},
		{
			title: 'Địa chỉ',
			dataIndex: 'address',
			render: (value, record) => {
				const addressDetail = `${value}${record.street ? `-${record.street}` : ''}${
					record.ward ? `-${record.ward}` : ''
				}${record.district ? `-${record.district}` : ''}${record.province ? `-${record.province}` : ''}${
					record.nation ? `-${record.nation}` : ''
				}`;
				return (
					<Tooltip placement="topLeft" title={addressDetail}>
						{addressDetail}
					</Tooltip>
				);
			},
			width: 110,
			ellipsis: true,
		},
		{
			title: 'SĐT',
			dataIndex: 'phoneNo',
			width: 110,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			width: 200,
		},
		{
			title: 'Mã nhân viên giới thiệu',
			dataIndex: 'employeeCode',
			width: 150,
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceName',
			width: 110,
		},
		{
			title: 'Trạng thái dịch vụ',
			dataIndex: 'installedStatus',
			render: (value) => {
				const serviceStatus = Report.serviceStatus[value] || {};
				return <span>{serviceStatus.text}</span>;
			},
			width: 110,
		},
		{
			title: 'Gói dịch vụ',
			dataIndex: 'pricingName',
			width: 110,
		},
		{
			title: 'ON/OS',
			dataIndex: 'serviceOwnerType',
			width: 110,
		},
		{
			title: 'Ngày đăng ký',
			dataIndex: 'registrationDate',
			width: 130,
		},
		{
			title: 'Ngày bắt đầu sử dụng',
			dataIndex: 'startAt',
			width: 120,
		},
		{
			title: 'Số chu kỳ',
			dataIndex: 'numberOfCycle',
			render: (value) => value || 'Không giới hạn',
			width: 130,
		},
		{
			title: 'Chu kỳ thanh toán',
			dataIndex: 'cycleType',
			render: (value, record) => {
				const cycleInfo = Report.cycleType[value] || {};
				if (record.status === 'IN_TRIAL') return '';
				return (
					<span>
						{record.paymentCycle} {cycleInfo.text}
					</span>
				);
			},
			width: 150,
		},
		{
			title: 'Giá cước dịch vụ/gói cước',
			dataIndex: 'unitAmount',
			width: 130,
		},
		{
			title: 'Số tiền khuyến mại',
			dataIndex: 'promotionAmount',
			width: 130,
		},
		{
			title: 'Số tiền đã thanh toán (Chưa thuế)',
			dataIndex: 'preAmountTax',
			width: 170,
		},
		{
			title: 'Số tiền nộp thuế',
			dataIndex: 'amountTax',
			width: 110,
		},
		{
			title: 'Số tiền đã thanh toán (Đã có thuế)',
			dataIndex: 'afterAmountTax',
			width: 170,
		},
		{
			title: 'Mã giao dịch với Pay',
			dataIndex: 'payTransactionCode',
			width: 110,
		},
		{
			title: 'Mã giao dịch với ĐHSX',
			dataIndex: 'dhsxkdCode',
			width: 120,
		},
		{
			title: 'Đơn hàng tạo bởi',
			dataIndex: 'creator',
			width: 110,
		},
		{
			title: 'Trạng thái thanh toán',
			dataIndex: 'billStatus',
			width: 110,
		},
	];
	const { RangePicker } = DatePicker;

	const disableDate = (day) => day && moment().isBefore(day);
	return (
		<div>
			<div>
				<RangePicker
					allowEmpty={[true, true]}
					disabledDate={disableDate}
					defaultValue={[defaultDateRange[0]]}
					onChange={(_, value) => {
						onChangeParams({
							startDate: value[0],
							endDate: value[1],
						});
					}}
					format="DD/MM/YYYY"
					showToday
					className="w-60 mr-6"
				/>
				<Select
					className="w-60 mr-6"
					disabled={!rootAdmin}
					value={rootAdmin ? provinceId : user.department.provinceId}
					onSelect={onChangeOneParam('provinceId')}
				>
					{renderOptions(tFilterField('prefix', 'province'), [
						{ label: tFilterField('provinceOptions', 'all'), value: null },
						...provinceSelect,
					])}
				</Select>
				<Select className="w-60 mr-6" value={status} onSelect={onChangeOneParam('status')}>
					{renderOptions('Trạng thái', activeOptions)}
				</Select>
				<Select
					className="w-60 mr-6"
					value={subscriptionType}
					onSelect={(value) => {
						onChangeParams({ subscriptionType: value, serviceId: null, pricingId: null });
					}}
				>
					{renderOptions('Nhóm', typeSubs)}
				</Select>
				<Button className="float-right ml-auto" type="default" onClick={applyQuery} icon={<FilterOutlined />}>
					Áp dụng lọc
				</Button>
			</div>
			<div className="flex gap-y-1 mt-5 flex-wrap">
				<Select
					className="w-60 mr-6"
					value={categoryId}
					onSelect={(value) => {
						onChangeParams({ categoryId: value, serviceId: null, pricingId: null });
					}}
				>
					{renderOptions(tFilterField('prefix', 'category'), [
						{ label: tFilterField('serviceOptions', 'all'), value: null },
						...categorySelect,
					])}
				</Select>
				<Select
					allowClear
					filterOption={false}
					className="w-60 mr-6"
					value={serviceId}
					onSelect={(value) => {
						onChangeParams({ serviceId: value, pricingId: undefined });
					}}
					onClear={() => {
						onChangeParams({ serviceId: undefined, pricingId: undefined });
					}}
					placeholder="Dịch vụ, Combo: Tất cả"
					optionLabelProp="labelAll"
					options={optionService}
					dropdownRender={(menu) => (
						<div>
							{menu}
							<Divider className="m-0 mt-1" />
							<div className="px-3 py-2">
								<Input.Search
									onChange={(e) => debounceSearchService(e.target.value)}
									size="small"
									allowClear
								/>
							</div>
						</div>
					)}
				/>

				<Select
					allowClear
					filterOption={false}
					className="w-60 mr-6"
					value={pricingId}
					onSelect={onChangeOneParam('pricingId')}
					onClear={() => {
						onChangeOneParam('pricingId')(undefined);
					}}
					placeholder="Gói dịch vụ, combo: Tất cả"
					optionLabelProp="labelAll"
					options={optionPricing}
					dropdownRender={(menu) => (
						<div>
							{menu}
							<Divider className="m-0 mt-1" />
							<div className="px-3 py-2">
								<Input.Search
									onChange={(e) => debounceSearchPricing(e.target.value)}
									size="small"
									allowClear
								/>
							</div>
						</div>
					)}
				/>
				<Select
					allowClear
					filterOption={false}
					className="w-60 mr-6"
					value={employeeCode}
					onSelect={onChangeOneParam('employeeCode')}
					onClear={() => {
						onChangeOneParam('employeeCode')(undefined);
					}}
					placeholder="Mã nhân viên giới thiệu: Tất cả"
					options={employeeCodeData}
					dropdownRender={(menu) => (
						<div>
							{menu}
							<Divider className="m-0 mt-1" />
							<div className="px-3 py-2">
								<Input.Search
									onChange={(e) => debounceSearchEmployeeCode(e.target.value)}
									size="small"
									allowClear
								/>
							</div>
						</div>
					)}
				/>
				<Button
					className="float-right ml-auto"
					type="primary"
					onClick={() => exportSubscrip()}
					icon={<ExportOutlined />}
				>
					Export
				</Button>
			</div>
			<Table className="mt-8" columns={columns} {...configTable} />
		</div>
	);
}
