import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { SupportExtraIcon } from 'app/icons';
import { SMESubscription } from 'app/models';
import { validateRequire, validateRequireInput, validateMaxLengthStr, validateFile } from 'app/validator';
import { SelectDebounce, UploadFile } from 'app/components/Atoms';
import { useLng } from 'app/hooks';
import { uniqBy as _uniqBy } from 'opLodash';

const TicketForm = ({ ticketForm, setShowModal, loading, submit, setDirty }) => {
	const [fileNumber, setFileNumber] = useState(0);
	const { tOthers, tField, tButton, tValidation } = useLng();
	function updateButtonUpload() {
		setDirty(true);

		const attachsTemp = ticketForm.getFieldValue('attachs');
		setFileNumber(attachsTemp ? attachsTemp.length : 0);
	}

	// get all service
	const fetchService = async (text) => {
		try {
			const { content: res } = await SMESubscription.getListSubscribe({
				page: 0,
				size: 20,
				name: text,
			});
			const temp = res.map((item) => ({
				value: item.serviceId,
				label: item.serviceName,
			}));

			return _uniqBy(temp, 'value');
		} catch (e) {
			return [];
		}
	};

	return (
		<div>
			<div className="text-center mb-8">
				<SupportExtraIcon width="w-12" className="inline-block mb-3" />
				<p className="font-semibold text-base mb-2 truncate ...">
					{tOthers('opt_create', { field: 'supTicket' })}
				</p>
				<p className="text-sm">{tOthers('supportFromAdmin_Dev')}</p>
			</div>

			<Form layout="vertical" form={ticketForm} onValuesChange={() => updateButtonUpload()}>
				<Form.Item
					label={tField('serviceNeedSupport')}
					name="serviceId"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'serviceNeedSupport' }))]}
				>
					<SelectDebounce
						showSearch
						allowClear
						className="w-3/12"
						placeholder={tField('opt_select', { field: 'service' })}
						autoFocus
						fetchOptions={(value) => fetchService(value)}
					/>
				</Form.Item>

				<Form.Item
					label={tField('title')}
					type="text"
					name="title"
					rules={[
						validateRequire(tValidation('opt_isRequired', { field: 'title' })),
						validateMaxLengthStr(200, tValidation('opt_enterMaxLength', { maxLength: '200' })),
					]}
				>
					<Input maxLength={200} />
				</Form.Item>

				<Form.Item
					label={tField('contentNeedSupport')}
					name="content"
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'contentNeedSupport' })),
						validateMaxLengthStr(1000, tValidation('opt_enterMaxLength', { maxLength: '1000' })),
					]}
				>
					<Input.TextArea maxLength={1000} rows={4} />
				</Form.Item>

				<Form.Item name="attachs" rules={[validateFile()]}>
					<UploadFile
						multiple
						className="upload-list-inline"
						fileNumber={fileNumber}
						maxCount={20}
						formEdit={ticketForm}
						fieldName="attachs"
					/>
				</Form.Item>

				<div className="flex mx-8 gap-8">
					<Button
						className="flex justify-center items-center"
						onClick={() => {
							ticketForm.resetFields();
							setShowModal(false);
							setDirty(false);
						}}
						block
					>
						{tButton('opt_cancel')}
					</Button>
					<Button
						className="flex justify-center items-center"
						onClick={submit}
						block
						type="primary"
						loading={loading}
						// disabled={!isDirty}
					>
						{tButton('opt_create', { field: 'supTicket' })}
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default TicketForm;
