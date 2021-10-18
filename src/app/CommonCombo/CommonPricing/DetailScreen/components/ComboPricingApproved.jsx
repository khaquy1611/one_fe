import React from 'react';
import { Form } from 'antd';
import ComboPricingForm from '../../components/ComboPricingForm';

export default function ComboPricingApproved({ portal, oldPricingInfo }) {
	const [form] = Form.useForm();
	return <ComboPricingForm data={oldPricingInfo} form={form} portal={portal} disabled canLoadOption={false} />;
}
