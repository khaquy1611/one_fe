import { statusBill } from 'admin/DashBoard/dashboard-data/SubBill/statusBill';
import ChartCommon from 'app/CommonChart/ChartCommon';
import React, { useEffect, useState } from 'react';
import SubBill from './SubBill';

function SubBillService() {
	const options = [
		{
			name: 'Số lượt đăng ký dịch vụ trong tháng',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Số khách hàng đăng ký mới hàng đầu',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng số hóa đơn chưa thanh toán/Tổng hóa đơn',
			percent: '33,33',
			count: 15000,
			billSucess: 50,
			sumBill: 100,
		},
		{
			name: 'Tổng số hóa đơn thất bại trong tháng',
			percent: '33,33',
			count: 15000,
			number: 10,
		},
		{
			name: 'Tổng số hóa đơn thanh toán thành công/Tổng hóa đơn',
			percent: '33,33',
			count: 15000,
			billSucess: 50,
			sumBill: 100,
		},
		{
			name: 'Tổng nợ trong tháng',
			money: 10000,
		},
	];
	const [rec, setRec] = useState();
	const [changePayment, setChangePayment] = useState(1);

	function handleChangePayment(value) {
		setChangePayment(value);
	}

	const renderRec = (data) => {
		ChartCommon.renderPieChart('value', 'type', 'paymentRate', data, rec, setRec, 'Tổng số hóa đơn', '');
	};

	useEffect(() => {
		renderRec(statusBill.month[changePayment]);
	}, [changePayment]);
	return <SubBill options={options} handleChangePayment={handleChangePayment} changePayment={changePayment} />;
}

export default SubBillService;
