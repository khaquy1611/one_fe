/* eslint-disable react/no-array-index-key */
import { Button, Checkbox, Form, Input, Modal, Select, Tabs } from 'antd';
import { useLng, useSelectLocation, useUser } from 'app/hooks';
import { Users } from 'app/models';
import {
	formatNormalizeTaxCode,
	validateEmail,
	validateMaxLengthStr,
	validatePassword,
	validatePhoneNumber,
	validateRequire,
	validateRequireInput,
	validateStrLength,
} from 'app/validator';
import { trim, isEmpty } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

const { Item } = Form;

const CompanyInfo = ({ goBackLogin, goRegister, loading, formCompanyInfo, isLoginVnpt, data, forwardRef }) => {
	const [showPolicy, setShowPolicy] = useState();

	const { tButton, tValidation, tField, tOthers } = useLng();
	const [checkTerm, setCheckTerm] = useState(false);
	const { clearUser } = useUser();

	// -----------------------SSO--------------------------
	const mutationLogout = useMutation(Users.logoutSSO, {
		onSuccess: () => {
			clearUser();
		},
	});

	const cancelRegister = () => {
		mutationLogout.mutateAsync();
	};

	const getTechIdInfo = (dataTech = {}) => {
		const fullName = dataTech?.fullName;
		const lastName = fullName?.substring(0, fullName.lastIndexOf(' '));
		const firstName = fullName?.split(' ').pop();

		formCompanyInfo.setFieldsValue({
			techId: dataTech.techId,
			lastname: lastName,
			firstname: firstName,
			email: !isEmpty(dataTech.email) && dataTech.email,
		});
	};

	useEffect(() => {
		if (!isEmpty(data)) getTechIdInfo(data);
	}, [data]);

	// -------------------------------------------------

	const {
		setCountryCode,
		setProvinceId,
		setDistrictId,
		setWardId,
		setStreetId,
		provinceList,
		districtList,
		wardList,
		streetList,
		loadingProvince,
		loadingDistrict,
		loadingWard,
		loadingStreet,
	} = useSelectLocation();

	const setNewProvinceValue = () => {
		const provinceValue = formCompanyInfo.getFieldValue('provinceId');
		const arr = provinceValue.split('/');
		const id = parseInt(arr[0], 10);
		const code = arr.length > 1 ? arr[1] : '';
		setProvinceId(id);
		setCountryCode(code);
		formCompanyInfo.setFieldsValue({
			districtId: '',
			wardId: '',
			streetId: '',
		});
	};

	const setNewDistrictValue = () => {
		setDistrictId(formCompanyInfo.getFieldValue('districtId'));
		formCompanyInfo.setFieldsValue({
			wardId: '',
			streetId: '',
		});
	};

	const setNewWardValue = () => {
		setWardId(formCompanyInfo.getFieldValue('wardId'));
		formCompanyInfo.setFieldsValue({
			streetId: '',
		});
	};

	const setNewStreetValue = () => {
		setStreetId(formCompanyInfo.getFieldValue('streetId'));
	};
	const [tab, setTab] = useState('/pdf/dieu_khoan_dang_ky_tai_khoan.pdf');
	function renderTabsPanelPolicy() {
		return [
			{
				tab: 'Điều khoản',
				src: '/pdf/dieu_khoan_dang_ky_tai_khoan.pdf',
			},
			{
				tab: 'Chính sách bảo mật',
				src: '/pdf/chinh_sach_bao_mat.pdf',
			},
			{
				tab: 'Chính sách vận chuyển và giao nhận',
				src: '/pdf/chinh_sach_van_chuyen_va_giao_nhan.pdf',
			},
			{
				tab: 'Quy định thanh toán',
				src: '/pdf/quy_dinh_thanh_toan.pdf',
			},
		].map((ele) => (
			<Tabs.TabPane
				tab={ele.tab}
				key={ele.src}
				tabKey={ele.src}
				destroyInactiveTabPane
				style={{ height: '60vh' }}
			>
				{tab === ele.src ? (
					<embed src={ele.src} title={ele.tab} height="100%" width="100%" type="application/pdf"></embed>
				) : (
					''
				)}
			</Tabs.TabPane>
		));
	}
	return (
		<div className="relative" id="form-register-id">
			<Form form={formCompanyInfo} layout="vertical" autoComplete="off">
				{isLoginVnpt && (
					<Form.Item
						name="techId"
						label="TechID"
						rules={[validateRequireInput('TechID không được bỏ trống')]}
					>
						<Input maxLength={200} disabled />
					</Form.Item>
				)}

				<Item
					name="taxCode"
					label={tField('taxCode')}
					normalize={(value) => formatNormalizeTaxCode(value)}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'taxCode' })),
						validateStrLength(10, 10, tValidation('opt_isNotValid', { field: 'taxCode' })),
					]}
					className="w-full"
				>
					<Input
						autoFocus
						maxLength={10}
						ref={forwardRef}
						placeholder={tField('opt_enter', { field: 'taxCode' })}
					/>
				</Item>

				<Item
					name="smeName"
					label={tField('enterpriseName')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'enterpriseName' }))]}
				>
					<Input maxLength={500} placeholder={tField('opt_enter', { field: 'enterpriseName' })} />
				</Item>

				<Item className="empty-item" label="Họ và tên người đại diện" style={{ marginBottom: 0 }} required />
				<div className="grid grid-cols-2 gap-4">
					<Item
						className="col-span-1"
						name="lastname"
						// label={tField('lastName')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'lastName' })),
							validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
						]}
					>
						<Input maxLength={20} placeholder={tField('opt_enter', { field: 'lastName' })} />
					</Item>
					<Item
						className="col-span-1"
						name="firstname"
						// label={tField('firstName')}
						rules={[
							validateRequireInput(tValidation('opt_isRequired', { field: 'firstName' })),
							validateMaxLengthStr(20, tValidation('opt_enterMaxLength', { maxLength: '20' })),
						]}
					>
						<Input maxLength={20} placeholder={tField('opt_enter', { field: 'firstName' })} />
					</Item>
				</div>

				<Item
					name="email"
					// label={tField('email')}
					label="Email đăng nhập"
					normalize={trim}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
						validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
						validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
					]}
				>
					<Input
						maxLength={100}
						// placeholder={tField('opt_enter', { field: 'email' })}
						placeholder=" Nhập email đăng nhập"
					/>
				</Item>

				<Item
					name="password"
					label={tField('pass')}
					normalize={trim}
					rules={[
						validateRequire(tValidation('opt_isRequired', { field: 'pass' })),
						validatePassword(tValidation('registerPassNotValid', { field: 'pass' })),
					]}
				>
					<Input type="password" maxLength={16} placeholder={tField('opt_enter', { field: 'pass' })} />
				</Item>

				<Item
					name="confirmPassword"
					dependencies={['password']}
					normalize={trim}
					label={tField('confirmationPass')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'confirmationPass' })),
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('password') === value) {
									return Promise.resolve();
								}
								return Promise.reject(tValidation('confirmationPassUnlikePass'));
							},
						}),
					]}
				>
					<Input
						type="password"
						maxLength={16}
						// placeholder={tField('opt_enter', { field: 'confirmationPass' })}
						placeholder="Nhập lại mật khẩu"
					/>
				</Item>

				<Item
					name="phoneNumber"
					normalize={trim}
					label={tField('contactPhoneNum')}
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'contactPhoneNum' })),
						validatePhoneNumber('office', tValidation('opt_isNotValid', { field: 'contactPhoneNum' })),
					]}
				>
					<Input maxLength={14} placeholder={tField('opt_enter', { field: 'contactPhoneNum' })} />
				</Item>

				{/* address */}
				<div className="flex gap-4 mobile:flex-wrap mobile:gap-0">
					<Item
						className="block w-full"
						name="provinceId"
						// label={tField('province_city')}
						// rules={[validateRequire(tValidation('opt_isRequired', { field: 'city' }))]}
						label="Thành phố/tỉnh"
						rules={[validateRequire('Không được bỏ trống')]}
					>
						<Select
							options={provinceList}
							onChange={setNewProvinceValue}
							getPopupContainer={() => document.getElementById('form-register-id')}
							loading={loadingProvince}
							// placeholder={tField('opt_select', { field: 'city' })}
							placeholder="Chọn thành phố/tỉnh"
						/>
					</Item>
					<Item
						className="block w-full"
						name="districtId"
						// label={tField('district')}
						// rules={[validateRequire(tValidation('opt_isRequired', { field: 'district' }))]}
						label="Quận/huyện"
						rules={[validateRequire('Không được bỏ trống')]}
					>
						<Select
							options={districtList}
							onChange={setNewDistrictValue}
							getPopupContainer={() => document.getElementById('form-register-id')}
							loading={loadingDistrict}
							// placeholder={tField('opt_select', { field: 'district' })}
							placeholder="Chọn quận/huyện"
						/>
					</Item>
				</div>
				<div className="flex gap-4 mobile:flex-wrap mobile:gap-0">
					<Item
						className="block w-full"
						name="wardId"
						// label={tField('subDistrict_village')}
						// rules={[validateRequire(tValidation('opt_isRequired', { field: 'ward' }))]}
						label="Phường/xã"
						rules={[validateRequire('Không được bỏ trống')]}
					>
						<Select
							options={wardList}
							onChange={setNewWardValue}
							getPopupContainer={() => document.getElementById('form-register-id')}
							loading={loadingWard}
							// placeholder={tField('opt_select', { field: 'subDistrict_village' })}
							placeholder="Chọn phường/xã"
						/>
					</Item>
					<Item
						className="block w-full"
						name="streetId"
						// label={tField('town')}
						// rules={[validateRequire(tValidation('opt_isRequired', { field: 'town' }))]}
						label="Phố/đường"
						rules={[validateRequire('Không được bỏ trống')]}
					>
						<Select
							options={streetList}
							onChange={setNewStreetValue}
							getPopupContainer={() => document.getElementById('form-register-id')}
							loading={loadingStreet}
							// placeholder={tField('opt_select', { field: 'town' })}
							placeholder="Chọn phố/đường"
						/>
					</Item>
				</div>

				<Item
					className="col-span-1"
					name="address"
					label={tField('address')}
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'address' }))]}
				>
					<Input
						maxLength={500}
						// placeholder={tField('opt_enter', { field: 'address' })}
						placeholder="Nhập địa chỉ doanh nghiệp"
					/>
				</Item>

				<Item name="agreement" valuePropName="checked">
					<Checkbox checked={checkTerm} onChange={(event) => setCheckTerm(event.target.checked)}>
						{tField('agreeWith')}{' '}
						<span
							type="text"
							className="text-primary ml-0 pl-0 font-semibold hover:underline"
							onClickCapture={(e) => {
								e.preventDefault();
								setShowPolicy(true);
							}}
						>
							{tField('termsOfServiceRegistration')}
						</span>
					</Checkbox>
				</Item>

				{/* button */}
				<Item className="text-center pt-2">
					<div className="flex justify-center gap-4">
						<Button
							type="default"
							className="w-44 tablet:w-60 mobile:w-1/2 text-base tablet:text-lg mobile:text-base font-medium"
							onClick={isLoginVnpt ? cancelRegister : goBackLogin}
							disabled={loading}
						>
							{isLoginVnpt ? tButton('opt_cancel') : tButton('login')}
						</Button>

						<Button
							type="primary"
							className="w-44 tablet:w-60 mobile:w-1/2 text-base tablet:text-lg mobile:text-base font-medium"
							disabled={!checkTerm}
							onClick={goRegister}
							loading={loading}
						>
							{tButton('register')}
						</Button>
					</div>
				</Item>
			</Form>
			{showPolicy && (
				<Modal
					visible={showPolicy}
					footer={<Button onClick={() => setShowPolicy()}>Đóng</Button>}
					onCancel={() => setShowPolicy()}
					title="Điều khoản sử dụng"
					width="90%"
					style={{ maxWidth: '1120px' }}
				>
					<Tabs activeKey={tab} onChange={setTab}>
						{renderTabsPanelPolicy()}
					</Tabs>
				</Modal>
			)}
		</div>
	);
};

export default CompanyInfo;
