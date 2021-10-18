import React from 'react';
import { Form } from 'antd';
import CommonPricingForm from '../CommonPricingForm';

export default function PricingApproved({ portal, oldPricingInfo }) {
	const [form] = Form.useForm();
	return <CommonPricingForm data={oldPricingInfo} form={form} portal={portal} disabled />;
}
