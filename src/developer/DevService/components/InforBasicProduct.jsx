/* eslint-disable no-unused-expressions */
import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Radio, Select } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import { useLng, useUser } from 'app/hooks';
import { DX, SaasDev } from 'app/models';
import {
	validateCode,
	validateEmail,
	validateMaxLengthStr,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
	validateUrl,
} from 'app/validator';
import { trim } from 'opLodash';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

const { selectServiceOwner, selectServiceOwnerVNPT } = SaasDev;
const UNIT_VNPT = selectServiceOwnerVNPT[0].value;
function InforBasicProduct({
	formEdit,
	refetch,
	initValues,
	statusApprove,
	selectServiceType,
	typePortal = 'DEV',
	refetchInfoService,
	serviceOwner,
	setServiceOwner,
	goBack,
	serviceOwnerVNPT,
	setServiceOwnerVNPT,
}) {
	const [isDirty, setDirty] = useState();
	const { user } = useUser();
	const isDisable =
		statusApprove === 'APPROVED' ||
		statusApprove === 'REJECTED' ||
		statusApprove === 'AWAITING_APPROVAL' ||
		typePortal === 'ADMIN' ||
		!DX.canAccessFuture2('dev/update-service', user.permissions);

	const { tButton, tMessage, tField, tValidation, tFilterField, tOthers } = useLng();

	const updateServiceMutation = useMutation(SaasDev.updateByIdBySaas, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetch && refetch();
			refetchInfoService();
			setDirty();
		},
		onError: (e) => {
			if (e.errorCode === 'error.duplicate.name') {
				formEdit.setFields([
					{
						name: 'name',
						errors: [tValidation('opt_isDuplicated', { field: 'serviceName' })],
					},
				]);
			}
		},
	});

	const showPromiseUpdateConfirm = (values) => {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'service' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				let type = '';
				if (values.serviceOwner === selectServiceOwner[0].value) {
					if (values.serviceOwnerVNPT === selectServiceOwnerVNPT[0].value) type = 'VNPT';
					else type = 'SAAS';
				} else if (values.serviceOwnerVNPT === selectServiceOwnerVNPT[0].value) type = 'OTHER';
				else type = 'NONE';

				updateServiceMutation.mutate({
					...values,
					urlPreOrder: values.urlPreOrder === '' ? null : values.urlPreOrder,
					serviceOwner: type,
				});
			},
			onCancel() {},
			confirmLoading: updateServiceMutation.isLoading,
		});
	};
	const invisibleBtn = statusApprove === 'AWAITING_APPROVAL' || statusApprove === 'REJECTED';

	const regex = /^[a-zA-Z0-9#!@$%&_-]+$/;

	return (
		<>
			<Form
				className="mt-5 mb-20"
				labelCol={{ xxl: { span: 10 }, xl: { span: 6 }, lg: { span: 6 }, md: { span: 5 } }}
				wrapperCol={{ xxl: { span: 14 }, xl: { span: 14 }, lg: { span: 14 }, md: { span: 18 } }}
				layout="horizontal"
				form={formEdit}
				initialValues={initValues}
				autoComplete="off"
				onFinish={showPromiseUpdateConfirm}
				onValuesChange={() => !isDirty && setDirty(true)}
			>
				<Form.Item
					name="name"
					label={tField('serviceName')}
					tooltip={typePortal === 'DEV' && tOthers('enterMaxLength', { maxLength: '50' })}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'serviceName' })),
						// validateMaxLengthStr(50, 'Độ dài của tên dịch vụ quá 50 ký tự'),
					]}
				>
					<Input disabled={isDisable} maxLength={50} />
				</Form.Item>
				<Form.Item
					name="serviceCode"
					normalize={trim}
					label={tField('serviceCode')}
					rules={[validateCode('Mã code không đúng định dạng', regex)]}
				>
					<Input placeholder={tField('serviceCode')} disabled={isDisable} maxLength={100} />
				</Form.Item>
				<Form.Item
					name="displayed"
					label={tField('status')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'status' }))]}
				>
					<Radio.Group
						disabled={
							statusApprove !== 'APPROVED' ||
							typePortal === 'ADMIN' ||
							!DX.canAccessFuture2('dev/update-service', user.permissions) ||
							!DX.canAccessFuture2('dev/change-status-service', user.permissions)
						}
						value="displayed"
					>
						<Radio value="VISIBLE">{tFilterField('value', 'show')}</Radio>
						<Radio value="INVISIBLE">{tFilterField('value', 'hide')}</Radio>
					</Radio.Group>
				</Form.Item>

				{/* Xử lý URL */}
				<Form.Item
					name="serviceOwner"
					label={tField('serviceType')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'serviceType' }))]}
				>
					<Radio.Group
						disabled={isDisable}
						onChange={(e) => setServiceOwner && setServiceOwner(e.target.value)}
					>
						{selectServiceOwner.map((e) => (
							<Radio value={e.value}>{tFilterField('value', e.label)}</Radio>
						))}
					</Radio.Group>
				</Form.Item>
				<Form.Item
					name="serviceOwnerVNPT"
					label={tField('developmentUnit')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'developmentUnit' }))]}
				>
					<Radio.Group
						disabled={isDisable}
						onChange={(e) => setServiceOwnerVNPT && setServiceOwnerVNPT(e.target.value)}
					>
						{selectServiceOwnerVNPT.map((e) => (
							<Radio value={e.value}>{tFilterField('value', e.label)}</Radio>
						))}
					</Radio.Group>
				</Form.Item>
				{serviceOwnerVNPT === UNIT_VNPT && (
					<Form.Item
						name="serviceTypeId"
						normalize={trim}
						label={tField('typeCodeService')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'typeCodeService' })),
							validateCode('Mã loại dịch vụ không đúng định dạng', regex),
						]}
					>
						<Input placeholder={tField('typeCodeService')} disabled={isDisable} maxLength={100} />
					</Form.Item>
				)}
				{serviceOwner !== 'NONE' && (
					<>
						<Form.Item
							name="url"
							label={tField('urlOfService')}
							tooltip={typePortal === 'DEV' && tOthers('urlExample')}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'urlOfService' })),
								validateUrl(tValidation('opt_isNotValid', { field: 'urlOfService' })),
								validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
							]}
						>
							<Input disabled={isDisable} width="100%" />
						</Form.Item>
						{serviceOwnerVNPT !== 'VNPT' && (
							<>
								<Form.Item
									name="urlSetup"
									label={tField('urlOfSetting')}
									rules={[
										validateRequireInput(tValidation('opt_isRequired', { field: 'urlOfSetting' })),
										validateUrl(tValidation('opt_isNotValid', { field: 'urlOfSetting' })),
										validateMaxLengthStr(
											100,
											tValidation('opt_enterMaxLength', { maxLength: '100' }),
										),
									]}
								>
									<Input disabled={isDisable} width="100%" />
								</Form.Item>
								<Form.Item
									name="tokenSPDV"
									label={tField('urlTokenOfSetting')}
									rules={[
										validateRequireInput(
											tValidation('opt_isRequired', { field: 'urlTokenOfSetting' }),
										),
										validateMaxLengthStr(
											3000,
											tValidation('opt_enterMaxLength', { maxLength: '3000' }),
										),
									]}
								>
									<Input.TextArea
										disabled={isDisable}
										width="100%"
										autoSize={{ minRows: 2, maxRows: 6 }}
										maxLength={3000}
									/>
								</Form.Item>
							</>
						)}

						<Form.Item
							name="language"
							label={tField('supLanguage')}
							tooltip={typePortal === 'DEV' && tOthers('supLanguage_selectOne')}
							rules={[validateRequire(tValidation('opt_isRequired', { field: 'supLanguage' }))]}
						>
							<Checkbox.Group disabled={isDisable}>
								<Checkbox value="0" style={{ lineHeight: '32px' }}>
									{tField('vietnamese')}
								</Checkbox>

								<Checkbox value="1" style={{ lineHeight: '32px' }}>
									{tField('english')}
								</Checkbox>
							</Checkbox.Group>
						</Form.Item>
					</>
				)}
				<Form.Item
					name="urlPreOrder"
					label={tField('urlPreOrder')}
					normalize={trim}
					rules={[
						validateUrl(tValidation('opt_isNotValid', { field: 'urlOfSetting' })),
						validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
					]}
				>
					<Input disabled={isDisable} width="100%" />
				</Form.Item>
				<Form.Item
					name="categoriesId"
					label={tField('classifyService')}
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'classifyService' }))]}
				>
					<Select
						placeholder={tField('opt_select', { field: 'categoryClassification' })}
						options={selectServiceType}
						disabled={isDisable}
					/>
				</Form.Item>

				<Form.Item
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'supEmail' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'supEmail' })),
					]}
					name="email"
					label={tField('supEmail')}
					normalize={trim}
				>
					<Input maxLength={100} disabled={isDisable} />
				</Form.Item>

				<Form.Item
					rules={[
						validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'supPhoneNum' })),
						validateRequireInput(tValidation('opt_isRequired', { field: 'supPhoneNum' })),
					]}
					name="phoneNumber"
					normalize={trim}
					label={tField('supPhoneNum')}
				>
					<Input maxLength={14} disabled={isDisable} />
				</Form.Item>
				<Form.Item style={{ display: 'none' }} name="id">
					<Input />
				</Form.Item>
				<Form.Item style={{ display: 'none' }} name="updatedTime">
					<Input />
				</Form.Item>
				<div className="mt-5 flex justify-end ">
					<Button className="w-20 float-right" htmlType="button" onClick={goBack}>
						{tButton('opt_cancel')}
					</Button>
					{!invisibleBtn && (
						<Button
							htmlType="submit"
							type="primary"
							disabled={!isDirty}
							icon={<SaveOutlined />}
							className={`ml-5 ${typePortal === 'ADMIN' ? 'hidden' : 'show'} `}
						>
							{tButton('update')}
						</Button>
					)}
				</div>
			</Form>
		</>
	);
}

export default InforBasicProduct;
