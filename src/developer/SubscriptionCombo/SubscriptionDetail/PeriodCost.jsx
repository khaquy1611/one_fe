import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Row, Tooltip } from 'antd';
import { DX } from 'app/models';
import React from 'react';
import { useSelector } from 'react-redux';
import { subSelects } from '../redux/subscriptionReducer';
import SubscriptionComboService from '../SubscriptionComboService';

function PeriodCost({ typePortal, extraFee, coupons, dataDetail, addonListChange }) {
	const haveTax = useSelector(subSelects.haveTax);

	return (
		<div>
			<SubscriptionComboService
				typePortal={typePortal}
				typeSupscrip="detail"
				extraFee={extraFee}
				coupons={coupons}
				dataDetail={dataDetail}
				addonListChange={addonListChange}
				typeGeneral="PERIOD"
			/>

			{extraFee.length > 0 && (
				<>
					<div className=" p-6 text-base" style={{ backgroundColor: '#FAFAFA' }}>
						<div className="bg-white px-4 text-base">
							{extraFee.map((extra, index) => (
								<Row className="items-center py-2" key={extra.id}>
									<Col span={15}>
										<span className="mr-2">{extra.name || extra.customFeeName}</span>
										{extra.description && (
											<Tooltip title={extra.description}>
												<InfoCircleOutlined />
											</Tooltip>
										)}
										<div className="text-gray-400 text-sm">
											(
											{extra.paymentType === 'NOW' ? 'Thanh toán ngay' : 'Thanh toán hóa đơn sau'}
											)
										</div>
									</Col>
									<Col span={haveTax ? 4 : 8} className="text-right text-primary font-semibold">
										{DX.formatNumberCurrency(dataDetail.finalAmountPreTax || 0)}
									</Col>
									<Col span={4} hidden={!haveTax} className="text-right text-primary font-semibold">
										{DX.formatNumberCurrency(dataDetail.finalAmountAfterTax || 0)}
									</Col>
									<Col span={1} />
								</Row>
							))}
						</div>
					</div>
				</>
			)}
			<div className="mt-5 p-6 text-base" style={{ backgroundColor: '#FAFAFA' }}>
				<div className="bg-white px-4 text-base">
					<Row className="items-center pt-4 pb-4">
						<Col span={15} className="font-semibold">
							Tổng số tiền thanh toán
						</Col>
						<Col span={haveTax ? 4 : 8} className="text-right text-primary font-semibold">
							{DX.formatNumberCurrency(dataDetail.finalAmountPreTax || 0)}
						</Col>
						<Col span={4} hidden={!haveTax} className="text-right text-primary font-semibold">
							{DX.formatNumberCurrency(dataDetail.finalAmountAfterTax || 0)}
						</Col>
						<Col span={1} />
					</Row>
				</div>
			</div>
		</div>
	);
}

export default PeriodCost;
