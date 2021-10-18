import { Button, Drawer, Form, Input } from 'antd';
import { useLng } from 'app/hooks';
import { SaveIcon } from 'app/icons';
import { validateCode, validateRequireInput } from 'app/validator';
import { trimNormalizer } from 'app/validator/Validator';
import { toUpper } from 'opLodash';
import React, { useEffect } from 'react';

function FeatureForm({ onClose, visible, form, onFinish, typeForm, isDirty, setDirty }) {
	const nameRef = React.useRef();
	const { tButton, tField, tValidation } = useLng();

	useEffect(() => {
		setTimeout(() => {
			if (visible && nameRef) {
				nameRef.current?.focus({
					cursor: 'end',
				});
			}
		}, 100);
	}, [visible]);
	return (
		<>
			<Drawer
				title={typeForm === 'createForm' ? tField('createFeature') : tField('editFeature')}
				width={400}
				onClose={onClose}
				visible={visible}
				footer={
					<div className="text-right mr-2">
						<Button onClick={onClose}>{tButton('opt_cancel')}</Button>
						<Button
							htmlType="submit"
							type="primary"
							onClick={() => form.submit()}
							icon={typeForm === 'createForm' ? '' : <SaveIcon width="w-4" />}
							className="ml-4"
						>
							{typeForm === 'createForm' ? tButton('opt_create', { field: 'new' }) : tButton('opt_save')}
						</Button>
					</div>
				}
				maskClosable={false}
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={(values) =>
						onFinish({
							...values,
							code: toUpper(values.code),
						})
					}
					onValuesChange={() => !isDirty && setDirty(true)}
				>
					<Form.Item
						name="name"
						label={tField('featureName')}
						rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'featureName' }))]}
					>
						<Input placeholder={tField('featureName')} maxLength={100} ref={nameRef} />
					</Form.Item>
					<Form.Item
						name="code"
						label={tField('featureCode')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'featureCode' })),
							validateCode(tValidation('plsEnterTrueFormat')),
						]}
						normalize={trimNormalizer}
					>
						<Input
							className="uppercase ph-text-transform-none"
							placeholder={tField('featureCode')}
							maxLength={100}
							disabled={typeForm !== 'createForm'}
						/>
					</Form.Item>
				</Form>
			</Drawer>
		</>
	);
}

export default FeatureForm;
