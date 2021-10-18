import { LoadingOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Radio, Select, Switch as SwitchAntd, Table, Tag, Upload } from 'antd';
import { useLng, useUser } from 'app/hooks';
import { AddUser, AttachFileIcon, ErrorWarningLineIcon, ImportIcon } from 'app/icons';
import { DX, RoleAdmin } from 'app/models';
import { validateEmail, validateMaxLengthStr, validatePhoneNumber, validateRequireInput } from 'app/validator';
import { isEmpty, noop, trim } from 'opLodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';

const { Item } = Form;
const Div = styled.div`
	.ant-upload {
		width: 100% !important;
	}
`;

function Employee({
	columns,
	configTable,
	onModal,
	visibleModal,
	setVisibleModal,
	form,
	onFinish,
	onFinishFailed,
	formLoading,
	visibleModalImport,
	setVisibleModalImport,
	exportEmployeeAccountFile,
	uploadMutation,
	dataUpload,
	setDataUpload,
	visibleModalSuccess,
	responseUpload,
	setVisibleModalSuccess,
	validateFileUpload,
	errorFile,
	setErrorFile,
	errorMalformed,
	setErrorMalformed,
}) {
	const { tMessage, tValidation, tField, tButton, tOthers, tMenu, tFilterField, tLowerField } = useLng();
	const [isDirty, setDirty] = useState(false);
	const [isLoginVnpt, setIsLoginVnpt] = useState('0');
	const nameRef = React.useRef();
	const [roles, setRoles] = useState([]);
	const { user } = useUser();
	const CAN_IMPORT = DX.canAccessFuture2('sme/import-customer', user.permissions);
	const CAN_CREATE = DX.canAccessFuture2('sme/create-sub-sme-account', user.permissions);
	useQuery(
		['GetRoleSME'],
		async () => {
			const res = await RoleAdmin.getAll({ portalType: 'SME', size: 1000 });
			setRoles(res.content);
			return res;
		},
		{ desValues: [] },
	);

	const onChangeLoginVnpt = (e) => {
		setIsLoginVnpt(e.target.value);
		if (visibleModal && nameRef) {
			nameRef.current.focus({
				cursor: 'end',
			});
		}
	};
	const getContentResult = () => {
		if (
			responseUpload.successEditQuantity === 0 &&
			responseUpload.successAddQuantity === 0 &&
			responseUpload.errorLines?.length === 0
		) {
			return <div>{tOthers('noneDataImport')}</div>;
		}
		if (errorMalformed) {
			return <div>{tOthers('importFail')}</div>;
		}
		return (
			<ul>
				<li>{`${responseUpload?.successAddQuantity} ${tLowerField('successfullyCreateNewEmployee')}`}</li>
				<li>{`${responseUpload?.successEditQuantity} ${tLowerField('successfullyUpdateNewEmployee')}`}</li>
				{responseUpload?.errorLines?.length > 0 && (
					<li className="break-words">{`${responseUpload?.errorQuantity} ${tLowerField(
						'errInLine',
					)} ${responseUpload?.errorLines?.join(', ')}`}</li>
				)}
			</ul>
		);
	};

	function tagRender(props) {
		const { label, value, closable, onClose } = props;
		const onPreventMouseDown = (event) => {
			event.preventDefault();
			event.stopPropagation();
		};
		if (!roles.map((x) => x.id).includes(value)) {
			return null;
		}
		return (
			<Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
				{label}
			</Tag>
		);
	}
	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<p className="uppercase font-bold mb-4 text-gray-60">{tMenu('userList')}</p>
				<div>
					{CAN_IMPORT && (
						<Button
							className="items-center mr-3"
							type="default"
							onClick={() => {
								setVisibleModalImport(true);
								setDataUpload({});
								setErrorFile('');
								setErrorMalformed(false);
							}}
						>
							Import
						</Button>
					)}
					{CAN_CREATE && (
						<Button
							className="items-center"
							type="primary"
							onClick={() => {
								onModal();
								setIsLoginVnpt('0');
							}}
						>
							{tButton('opt_add', { field: 'user' })}
						</Button>
					)}
				</div>
			</div>
			<Table columns={columns} {...configTable} />

			{visibleModalImport && (
				<Modal
					centered
					visible={visibleModalImport}
					onCancel={() => {
						setVisibleModalImport(false);
					}}
					width={580}
					footer={null}
					maskClosable={false}
					closable={false}
					bodyStyle={{ padding: '2rem' }}
				>
					<div className="justify-center flex pt-4">
						<ImportIcon />
					</div>
					<p className="text-center font-semibold mt-3.5">{tMessage('importEmployeeList')}</p>
					<p className="text-center text-sm mt-2.5">{tMessage('importTrueFormat')}</p>

					<Button
						className="flex mx-auto my-8 font-semibold px-14"
						type="default"
						onClick={() => exportEmployeeAccountFile()}
					>
						{tButton('uploadFile')}
					</Button>
					<p className="font-semibold">{tField('fileImport')}</p>
					<Div>
						<Upload
							className="w-full block upload-full"
							showUploadList={false}
							customRequest={({ file }) => {
								if (validateFileUpload(file)) {
									setDataUpload(file);
								}
							}}
							percent
						>
							<div className="justify-between flex w-full">
								<div className="w-full">
									<Input readOnly className="cursor-pointer" value={dataUpload.name} />
									<span className="text-red-500">{errorFile}</span>
								</div>

								<Button
									className="font-semibold ml-4"
									type="default"
									icon={<AttachFileIcon width="w-4" />}
								>
									{tButton('select_File')}
								</Button>
							</div>
						</Upload>
					</Div>

					<div className="flex justify-center gap-6 mt-7">
						<Button
							className="font-semibold w-44"
							type="default"
							onClick={() => {
								setVisibleModalImport(false);
							}}
						>
							Hủy
						</Button>
						<Button
							className="font-semibold w-44"
							type="primary"
							onClick={() => {
								uploadMutation.mutate();
							}}
							disabled={isEmpty(dataUpload)}
						>
							{uploadMutation.isLoading && <LoadingOutlined spin />}
							Import
						</Button>
					</div>
				</Modal>
			)}

			{/* Modal success */}
			{visibleModalSuccess && (
				<Modal
					centered
					visible={visibleModalSuccess}
					footer={null}
					maskClosable={false}
					closable={false}
					bodyStyle={{ padding: '1.875rem 4rem' }}
				>
					<div className="justify-center flex">
						<ErrorWarningLineIcon width="w-14" />
					</div>
					<p className="font-semibold text-center mt-4">{tMessage('importResult')}</p>
					<div className="flex justify-center mt-3">{getContentResult()}</div>
					<div className="flex justify-center">
						<Button
							className="font-semibold w-2/5 mt-5 "
							type="primary"
							onClick={() => {
								setVisibleModalSuccess(false);
							}}
						>
							{tButton('close')}
						</Button>
					</div>
				</Modal>
			)}

			{/* Modal tạo mới nhân viên */}
			{visibleModal && (
				<Modal
					visible
					onCancel={() => {
						setVisibleModal(false);
					}}
					footer={null}
					closable={false}
					width={580}
					maskClosable={false}
					className="custom-modal"
					bodyStyle={{ padding: '2rem', maxHeight: 'calc(100vh - 9rem)', overflow: 'auto' }}
				>
					<div className="justify-center flex pt-4">
						<AddUser />
					</div>
					<p className="text-center font-semibold mt-3.5">{tMessage('addNewUser')}</p>
					<p className="text-center text-sm mt-2.5">{tMessage('plsEnterInfo')}</p>
					<Form
						className="py-2 text-base"
						layout="vertical"
						onFinish={(value) => {
							const rolesData = value.roles.concat(DX.SME_ROLES).filter((x, i, a) => a.indexOf(x) === i);
							onFinish({ ...value, roles: rolesData });
						}}
						onFinishFailed={onFinishFailed}
						form={form}
						initialValues={{
							status: 'ACTIVE',
							roles: [],
							createType: 'INTERNAL',
						}}
						onValuesChange={() => !isDirty && setDirty(true)}
					>
						<Form.Item name="createType" onChange={onChangeLoginVnpt} className="text-center">
							<Radio.Group>
								<Radio value="INTERNAL">{tFilterField('value', 'addOnSystem')}</Radio>
								<Radio value="EXTERNAL">{tFilterField('value', 'alreadyHaveVNPT')}</Radio>
							</Radio.Group>
						</Form.Item>
						{isLoginVnpt === 'EXTERNAL' && (
							<Form.Item
								label="TechID"
								type="text"
								name="techId"
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'TechID' })),
									validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
								]}
							>
								<Input maxLength={100} autoFocus placeholder="Nhập TechID của nhân viên" />
							</Form.Item>
						)}
						<div className="grid grid-cols-2 gap-4">
							<Form.Item
								label={tField('lastName')}
								type="text"
								name="lastname"
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' })),
									validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
								]}
							>
								<Input maxLength={20} ref={nameRef} autoFocus placeholder="Nhập họ" />
							</Form.Item>

							<Form.Item
								label={tField('firstName')}
								type="text"
								name="firstname"
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' })),
									validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
								]}
							>
								<Input maxLength={20} placeholder="Nhập tên" />
							</Form.Item>
						</div>
						<Form.Item
							name="email"
							label={tField('email')}
							type="text"
							normalize={trim}
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
								validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
								validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
							]}
						>
							<Input maxLength={100} placeholder="Nhập email" />
						</Form.Item>
						<Form.Item
							name="phoneNumber"
							label={tField('phoneNum')}
							normalize={trim}
							type="text"
							rules={[
								validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'phoneNum' })),
							]}
						>
							<Input maxLength={14} placeholder="Nhập số điện thoại" />
						</Form.Item>
						<Form.Item name="roles" label={tField('decentralization')}>
							<Select
								mode="multiple"
								placeholder="Chọn phân quyền"
								showArrow
								tagRender={tagRender}
								options={[
									...roles.map((x) => ({
										value: x.id,
										label: x.displayName,
									})),
								]}
								showSearch={false}
							/>
						</Form.Item>
						<div className="flex justify-between items-center mb-7">
							<div className="font-medium">{tField('activeStatus')}</div>
							<Item name="status" valuePropName="checked" className="flex mb-auto">
								<SwitchAntd />
							</Item>
						</div>

						<div className="flex gap-6 justify-center">
							<Button
								onClick={() => {
									form.resetFields();
									setVisibleModal(false);
									setDirty(false);
								}}
								className="px-12"
							>
								{tButton('opt_cancel')}
							</Button>
							<Button
								onClick={() => {
									form.submit();
								}}
								type="primary"
								loading={formLoading}
								disabled={!isDirty}
								className="px-8"
							>
								{tButton('opt_confirm')}
							</Button>
						</div>
					</Form>
				</Modal>
			)}
		</>
	);
}
Employee.propTypes = {
	columns: PropTypes.arrayOf(PropTypes.object),
	data: PropTypes.arrayOf(PropTypes.object),
	onFinish: PropTypes.func,
	onFinishFailed: PropTypes.func,
	form: PropTypes.instanceOf(Object).isRequired,
	setVisibleModal: PropTypes.func,
	visibleModal: PropTypes.bool,
	onModal: PropTypes.func,
	onPageChange: PropTypes.func,
	total: PropTypes.number.isRequired,
	page: PropTypes.number.isRequired,
	pageSize: PropTypes.number.isRequired,
	isLoading: PropTypes.bool,
	configTable: PropTypes.object,
	formLoading: PropTypes.bool.isRequired,
	visibleModalImport: PropTypes.bool,
	setVisibleModalImport: PropTypes.func,
	onModalImport: PropTypes.func,
	exportEmployeeAccountFile: PropTypes.func,
	handleUploadFile: PropTypes.func,
	setDataUpload: PropTypes.func,
	visibleModalSuccess: PropTypes.bool,
	dataUpload: PropTypes.object,
	responseUpload: PropTypes.object,
	setVisibleModalSuccess: PropTypes.func,
	validateFileUpload: PropTypes.func,
	errorFile: PropTypes.string,
	setErrorFile: PropTypes.func,
	uploadMutation: PropTypes.object,
};
Employee.defaultProps = {
	columns: [],
	data: [],
	onFinish: noop,
	onFinishFailed: noop,
	onModal: noop,
	onPageChange: noop,
	setVisibleModal: noop,
	visibleModal: false,
	isLoading: false,
	visibleModalImport: false,
	configTable: {},
	setVisibleModalImport: noop,
	onModalImport: noop,
	exportEmployeeAccountFile: noop,
	handleUploadFile: noop,
	setDataUpload: noop,
	visibleModalSuccess: false,
	dataUpload: {},
	responseUpload: {},
	setVisibleModalSuccess: noop,
	validateFileUpload: noop,
	errorFile: '',
	setErrorFile: noop,
	uploadMutation: {},
};

export default Employee;
