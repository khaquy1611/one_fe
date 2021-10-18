import { FileAddOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import { useLng } from 'app/hooks';
import { DX } from 'app/models';
import { validateMaxLengthStr, validateRequire, validateRequireCheckbox, validateRequireInput } from 'app/validator';
import { noop } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function RegisterServiceForm({
	form,
	onFinish,
	showButtonSubmit,
	disable,
	isFetching,
	selectServiceType,
	loading,
}) {
	const history = useHistory();
	const { tValidation, tButton, tField, tOthers } = useLng();
	const [checkTerm, setCheckTerm] = useState(false);

	return (
		<>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
				onFinish={onFinish}
				autoComplete="off"
				onValuesChange={showButtonSubmit}
			>
				<Form.Item
					name="serviceName"
					label={tField('serviceName')}
					tooltip={tOthers('enterMaxLength', { maxLength: '50' })}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'serviceName' })),
						validateMaxLengthStr(50, tValidation('opt_enterMaxLength', { maxLength: '50' })),
					]}
				>
					<Input autoFocus />
				</Form.Item>

				<Form.Item
					name="languageType"
					label={tField('supLanguage')}
					tooltip={tOthers('supLanguage_selectOne')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'supLanguage' }))]}
				>
					<Checkbox.Group>
						<Checkbox value="0">{tField('vietnamese')}</Checkbox>
						<Checkbox value="1">{tField('english')}</Checkbox>
					</Checkbox.Group>
				</Form.Item>

				<Form.Item
					name="category"
					label={tField('category')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'category' }))]}
				>
					<Select
						placeholder={tField('opt_select', { field: 'category' })}
						loading={isFetching}
						options={selectServiceType}
					/>
				</Form.Item>

				<Form.Item
					name="agreement"
					valuePropName="checked"
					label=" "
					colon={false}
					rules={[validateRequireCheckbox(tValidation('agreeWithOurPolicy'))]}
				>
					<Checkbox checked={checkTerm} onChange={(event) => setCheckTerm(event.target.checked)}>
						{tField('agreeWith')}{' '}
						<span
							className="text-primary text-base font-semibold hover:underline"
							// onClickCapture={(e) => {
							// 	e.preventDefault();
							// 	setShowPolicy(true);
							// }}
						>
							{tField('digitalTransformationPlatformPolicy')}
						</span>
					</Checkbox>
				</Form.Item>

				<div className="text-right">
					<Button
						className="mx-4 w-32"
						onClick={() => {
							history.push(DX.dev.createPath('/service/list'));
						}}
					>
						{tButton('opt_cancel')}
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						icon={<FileAddOutlined width="w-4" />}
						loading={loading}
						disabled={disable}
					>
						{tButton('opt_create', { field: 'service' })}
					</Button>
				</div>
			</Form>
		</>
	);
}

RegisterServiceForm.propTypes = {
	onFinish: PropTypes.func,
	showButtonSubmit: PropTypes.func,
	disable: PropTypes.bool,
	isFetching: PropTypes.bool,
	selectServiceType: PropTypes.arrayOf(PropTypes.object),
};

RegisterServiceForm.defaultProps = {
	onFinish: noop,
	showButtonSubmit: noop,
	disable: true,
	isFetching: true,
	selectServiceType: [],
};
