import { Button, Drawer, Form, Input, Radio } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { DX } from 'app/models';
import { validateEmail, validatePhoneNumber, validateRequireInput } from 'app/validator';
import { noop, trim } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

function DevelopForm({ closeForm, account, visible, onFinish, form }) {
	const { tFilterField, tValidation, tField, tButton } = useLng();
	const { user } = useUser();
	const nameRef = React.useRef();
	useEffect(() => {
		setTimeout(() => {
			if (visible && nameRef) {
				nameRef.current.focus({
					cursor: 'end',
				});
			}
		}, 100);
	}, [visible]);
	const [isDirty, setDirty] = useState(false);

	return (
		<Drawer
			title={account.id ? tField('opt_edit', { field: 'acc' }) : tField('opt_create', { field: 'acc' })}
			width={350}
			onClose={closeForm}
			visible={visible}
			footer={
				<div className="text-right mr-2">
					<Button onClick={closeForm}>{tButton('opt_cancel')}</Button>
					<Button
						htmlType="submit"
						type="primary"
						className="ml-4"
						onClick={() => form.submit()}
						disabled={!isDirty}
					>
						{account.id ? tButton('opt_save') : tButton('opt_create')}
					</Button>
				</div>
			}
			maskClosable={false}
		>
			<Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={() => !isDirty && setDirty(true)}>
				{account?.techId ? (
					<Form.Item name="techId" label="TechID">
						<Input maxLength={100} disabled style={{ fontSize: '15px', paddingRight: '2px' }} />
					</Form.Item>
				) : null}
				<Form.Item
					name="name"
					label={tField('devName')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'devName' }))]}
				>
					<Input placeholder={tField('opt_enter', { field: 'devName' })} maxLength={200} ref={nameRef} />
				</Form.Item>
				<Form.Item
					name="email"
					label={tField('email')}
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
					]}
				>
					<Input placeholder={tField('opt_enter', { field: 'email' })} maxLength={100} />
				</Form.Item>
				<Form.Item
					name="phoneNumber"
					normalize={trim}
					label={tField('phoneNum')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'phoneNum' })),
						validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
					]}
				>
					<Input maxLength={14} placeholder={tField('opt_enter', { field: 'phoneNum' })} />
				</Form.Item>
				<Form.Item name="status" label={<span style={{ marginBottom: '-8px' }}>{tField('status')}</span>}>
					<Radio.Group
						disabled={!DX.canAccessFuture2('admin/change-status-customer-account', user.permissions)}
					>
						<Radio value="ACTIVE">{tFilterField('value', 'active')}</Radio>
						<Radio value="INACTIVE">{tFilterField('value', 'inactive')}</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Drawer>
	);
}
DevelopForm.propTypes = {
	visible: PropTypes.bool,
	closeForm: PropTypes.func,
	onFinish: PropTypes.func,
	form: PropTypes.instanceOf(Object).isRequired,
	account: PropTypes.objectOf(PropTypes.any).isRequired,
};

DevelopForm.defaultProps = {
	visible: false,
	closeForm: noop,
	onFinish: noop,
};
export default DevelopForm;
