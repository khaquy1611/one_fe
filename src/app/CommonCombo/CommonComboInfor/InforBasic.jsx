import { SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Radio, Row, Select } from 'antd';
import { Editor, UploadImg, UploadImgDND, UploadVideo } from 'app/components/Atoms';
import { useLng, useQueryUrl, useUser } from 'app/hooks';
import { DX } from 'app/models';
import {
	validateCode,
	validateEmail,
	validateMaxLengthStr,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
} from 'app/validator';
import { isEmpty, pick, trim } from 'opLodash';
import React, { useEffect, useRef } from 'react';

const { TextArea } = Input;

function InforBasic({
	data,
	formEdit,
	onFinish,
	goBack,
	setDirtyProgess,
	selectServiceType,
	disabled,
	objectCheck = {},
	dirtyInprogess,
}) {
	const { tMenu, tValidation, tField, tButton, tOthers } = useLng();
	const { user } = useUser();
	const DEV_ROLE = DX.dev.canAccessPortal(user);
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const inInit = useRef(true);
	const CAN_UPDATE =
		(data.portalType === 'ADMIN' && DX.canAccessFuture2('admin/update-combo', user.permissions)) ||
		(data.portalType === 'DEV' && DX.canAccessFuture2('dev/update-combo', user.permissions));
	const enableReasonUpdate = () => {
		if (DEV_ROLE) {
			return (
				data.approvedStatus === 'APPROVED' ||
				data.approvedStatus === 'REJECTED' ||
				data.statusBrowsing === 'HAVE_BROWSED'
			);
		}
		return (
			(data.ownerDev === 'NO' && data.approvedStatus !== 'UNAPPROVED' && data.approveFirst === 'YES') || // của admin tạo
			(data.approvedStatus === 'APPROVED' && data.approveFirst === 'NO') || // của dev tạo
			data.approvedStatus === 'REJECTED'
		);
	};
	useEffect(() => {
		inInit.current = true;
		data.countGetData && formEdit.setFieldsValue(data);
	}, [data.countGetData]);

	const regex = /^[a-zA-Z0-9#!@$%&_-]+$/;

	return (
		<>
			<Form
				className="mt-5 mb-20 ml-auto max-w-6xl"
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
				form={formEdit}
				initialValues={data}
				autoComplete="off"
				onFinish={(v) => onFinish(v)}
				scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
				onValuesChange={() => {
					if (!inInit.current && !dirtyInprogess) {
						setDirtyProgess && setDirtyProgess(true);
					} else {
						inInit.current = false;
					}
				}}
			>
				<Row>
					<Col span={6}>
						<p
							className={`text-xl font-semibold mb-6 float-right pr-2 ${
								!isEmpty(
									pick(objectCheck, [
										'comboCode',
										'publisher',
										'comboType',
										'comboOwner',
										'categories',
										'emailSupport',
										'phoneSupport',
										'addressSupport',
									]),
								)
									? 'bg-yellow-400'
									: ''
							}`}
						>
							{tMenu('basicInfo')}
						</p>
					</Col>
				</Row>
				<Form.Item
					name="name"
					label={tField('serviceComboName')}
					tooltip={tOthers('enterMaxLength', { maxLength: '100' })}
					rules={[validateRequireInput('Tên Combo dịch vụ không được để trống')]}
				>
					<Input
						disabled={
							disabled ||
							data.statusBrowsing === 'HAVE_BROWSED' ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
						maxLength={100}
					/>
				</Form.Item>
				{data.ownerDev === 'NO' && (
					<Form.Item
						name="publisher"
						label="Nhà phát hành"
						tooltip={tOthers('enterMaxLength', { maxLength: '100' })}
						rules={[validateRequireInput('Nhà phát hành không được để trống')]}
					>
						<Input
							disabled={
								disabled ||
								data.approvedStatus === 'AWAITING_APPROVAL' ||
								(!DEV_ROLE && data.ownerDev === 'YES')
							}
							maxLength={100}
						/>
					</Form.Item>
				)}
				<Form.Item
					name="comboCode"
					normalize={trim}
					label="Mã combo dịch vụ"
					rules={[validateCode('Mã code không đúng định dạng', regex)]}
				>
					<Input
						placeholder="Mã combo dịch vụ"
						disabled={
							disabled ||
							(!DEV_ROLE && data.ownerDev === 'YES') ||
							data.approvedStatus === 'AWAITING_APPROVAL'
						}
						maxLength={100}
					/>
				</Form.Item>
				<Form.Item
					name="comboType"
					label="Loại combo dịch vụ"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'serviceType' }))]}
				>
					<Radio.Group
						disabled={
							disabled ||
							data.statusBrowsing === 'HAVE_BROWSED' ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					>
						<Radio value="SAAS">Phần mềm</Radio>
						<Radio value="OTHER">Khác</Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item
					name="comboOwner"
					label="Đơn vị phát triến"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'developmentUnit' }))]}
				>
					<Radio.Group
						disabled={
							disabled ||
							data.statusBrowsing === 'HAVE_BROWSED' ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					>
						<Radio value="VNPT">VNPT</Radio>
						<Radio value="OTHER">Khác</Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item
					name="categories"
					label={tField('category')}
					rules={[validateRequireInput('Vui lòng không bỏ trống mục này')]}
				>
					<Select
						placeholder={tField('opt_select', { field: 'category' })}
						mode="multiple"
						options={selectServiceType}
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					/>
				</Form.Item>
				<Form.Item
					rules={[
						validateRequireInput('Vui lòng nhập Email'),
						validateEmail(tValidation('opt_isNotValid', { field: 'supEmail' })),
					]}
					name="emailSupport"
					label={tField('supEmail')}
					normalize={trim}
				>
					<Input
						maxLength={100}
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					/>
				</Form.Item>
				<Form.Item
					rules={[
						validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
						validateRequireInput('Vui lòng nhập số điện thoại'),
					]}
					name="phoneSupport"
					normalize={trim}
					label={tField('supPhoneNum')}
				>
					<Input
						maxLength={14}
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					/>
				</Form.Item>
				{data.ownerDev === 'NO' && (
					<Form.Item
						rules={[validateRequireInput('Địa chỉ hỗ trợ không được để trống')]}
						name="addressSupport"
						label="Địa chỉ hỗ trợ"
					>
						<Input maxLength={200} disabled={disabled || data.approvedStatus === 'AWAITING_APPROVAL'} />
					</Form.Item>
				)}
				<Row>
					<Col span={6}>
						<p
							className={`text-xl font-semibold mb-6 float-right pr-2 ${
								!isEmpty(
									pick(objectCheck, [
										'icon',
										'video',
										'snapshots',
										'shortDescription',
										'description',
									]),
								)
									? 'bg-yellow-400'
									: ''
							}`}
						>
							{tMenu('desInfo')}
						</p>
					</Col>
				</Row>
				<Form.Item
					label="Ảnh đại diện Combo dịch vụ"
					name="icon"
					rules={[validateRequire('Vui lòng chọn ảnh đại diện')]}
				>
					<UploadImg
						canUploadByLink
						onlyOne
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
						formEdit={formEdit}
						fieldName="icon"
						type="service"
					/>
				</Form.Item>
				<Form.Item label="Video giới thiệu" name="video">
					<UploadVideo
						canUploadByLink
						onlyOne
						type="service"
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
						formEdit={formEdit}
						fieldName="video"
					/>
				</Form.Item>
				<Form.Item
					label={tField('capture')}
					name="snapshots"
					rules={[validateRequire('Vui lòng chọn ít nhất một ảnh chụp màn hình.')]}
				>
					<UploadImgDND
						multiple
						type="service"
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
						maxCount={20}
						formEdit={formEdit}
						fieldName="snapshots"
					/>
				</Form.Item>
				<Form.Item
					label={tField('shortDes')}
					name="shortDescription"
					rules={[validateRequireInput('Vui lòng không để trống mục này.')]}
				>
					<TextArea
						maxLength={500}
						showCount
						rows={4}
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					/>
				</Form.Item>
				<Form.Item
					label="Mô tả Combo"
					name="description"
					rules={[
						validateRequireInput('Vui lòng không để trống mục này.'),
						validateMaxLengthStr(5000, tValidation('opt_enterMaxLength', { maxLength: '5000' })),
					]}
				>
					<Editor
						showCount
						disabled={
							disabled ||
							data.approvedStatus === 'AWAITING_APPROVAL' ||
							(!DEV_ROLE && data.ownerDev === 'YES')
						}
					/>
				</Form.Item>
				{((data.approveFirst === 'YES' && getTab === '2') || enableReasonUpdate()) && (
					<>
						<Row>
							<Col span={6}>
								<p className="text-xl font-semibold mb-6 float-right pr-2">{tMenu('updateReason')}</p>
							</Col>
						</Row>
						<Form.Item
							name="reason"
							label={tField('updateReason')}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'updateReason' })),
								validateMaxLengthStr(200, tValidation('opt_enterMaxLength', { maxLength: '200' })),
							]}
						>
							<TextArea
								placeholder={tField('packageUpdateReason')}
								showCount
								maxLength={200}
								rows={2}
								disabled={
									disabled ||
									data.approvedStatus === 'AWAITING_APPROVAL' ||
									(!DEV_ROLE && data.ownerDev === 'YES')
								}
							/>
						</Form.Item>
					</>
				)}
				<div className="mt-10 text-right">
					<Button className="w-20" htmlType="button" onClick={goBack}>
						{tButton('opt_cancel')}
					</Button>
					{((!DEV_ROLE && data.portalType === 'DEV') ||
						getTab === '2' ||
						data.approvedStatus !== 'AWAITING_APPROVAL') &&
						CAN_UPDATE && (
							<Button
								htmlType="submit"
								disabled={!dirtyInprogess}
								type="primary"
								icon={<SaveOutlined />}
								className="ml-4"
							>
								{tButton('opt_save')}
							</Button>
						)}
				</div>
			</Form>
		</>
	);
}

export default InforBasic;
