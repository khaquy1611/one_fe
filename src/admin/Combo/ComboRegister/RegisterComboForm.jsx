import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'opLodash';
import { Form, Button, Input, Checkbox, Row, Col, Select } from 'antd';
import { FileAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DX } from 'app/models';
import { Link, useHistory } from 'react-router-dom';
import { useLng } from 'app/hooks';
import { validateRequireCheckbox, validateRequireInput } from 'app/validator';

export default function RegisterComboForm({ form, onFinish, showButtonSubmit, goBack, selectServiceType, loading }) {
	const history = useHistory();
	const { tValidation, tField, tButton, tOthers } = useLng();
	return (
		<>
			<Form
				form={form}
				labelCol={{ span: 7 }}
				wrapperCol={{ span: 12 }}
				layout="horizontal"
				onFinish={onFinish}
				autoComplete="off"
				onValuesChange={showButtonSubmit}
			>
				<Form.Item
					name="name"
					label={tField('serviceComboName')}
					rules={[validateRequireInput('Tên Combo dịch vụ không được để trống')]}
					tooltip={{
						title: 'Độ dài của tên Combo không được vượt quá 100 ký tự',
						icon: <InfoCircleOutlined />,
					}}
				>
					<Input autoFocus maxLength={100} />
				</Form.Item>
				<Form.Item
					name="categoryIds"
					className="mt-5"
					rules={[validateRequireInput('Vui lòng không bỏ trống mục này')]}
					label={tField('category')}
				>
					<Select
						placeholder={tField('opt_select', { field: 'category' })}
						mode="multiple"
						options={selectServiceType}
					/>
				</Form.Item>
				<Form.Item
					label=" "
					colon={false}
					name="rules"
					valuePropName="checked"
					rules={[validateRequireCheckbox(tValidation('agreeWithOurPolicy'))]}
				>
					<Checkbox>
						<span className="font-normal text-black">{tField('agreeWith')}</span>

						<Link target="_blank" to="/term-of-use" className="text-primary ml-2 font-normal">
							{tField('digitalTransformationPlatformPolicy')}
						</Link>
					</Checkbox>
				</Form.Item>
				<Row>
					<Col span={24} style={{ textAlign: 'right', paddingRight: '21%' }}>
						<Button style={{ width: '120px' }} className="mx-4" onClick={goBack}>
							{tButton('opt_cancel')}
						</Button>
						<Button
							className="float-right"
							type="primary"
							htmlType="submit"
							icon={<FileAddOutlined width="w-4" />}
							loading={loading}
						>
							{tButton('opt_create', { field: 'serviceCombo' })}
						</Button>
					</Col>
				</Row>
			</Form>
		</>
	);
}

RegisterComboForm.propTypes = {
	onFinish: PropTypes.func,
	showButtonSubmit: PropTypes.func,
	selectServiceType: PropTypes.arrayOf(PropTypes.object),
};

RegisterComboForm.defaultProps = {
	onFinish: noop,
	showButtonSubmit: noop,
	selectServiceType: [],
};
