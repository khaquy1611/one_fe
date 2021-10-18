import { FileAddOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, DatePicker, Form, Input, Radio, Row, Select, Space, Table, Typography } from 'antd';
import { useQuery } from 'react-query';
import { validateCode, validateMaxLengthStr, validateRequireInput } from 'app/validator';
import { AdminCoupon, DX, SubscriptionDev } from 'app/models';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import React, { useState } from 'react';
import { AddIcon } from 'app/icons';
import { useUser, useLng, usePagination } from 'app/hooks';
import { useRouteMatch, useHistory } from 'react-router-dom';

const APPROVED = 'APPROVED';
const UNAPPROVED = 'UNAPPROVED';
const { Item } = Form;
const SELECT_TYPE = {
	ONLYNUMBER: 2,
	ONLYLETTERS: 3,
	LETTERSANDNUMBERS: 1,
};

export default function CouponSetForm({
	handleSubmit,
	form,
	isLoading,
	onlyView,
	couponInfo,
	isDirty,
	goBack,
	className,
	onDeleteCoupon,
	checkStatus,
	checkApproved,
	updateDraftCoupon,
	rollbackCoupon,
	rollbackStatus,
}) {
	const { tButton, tFilterField, tValidation, tField, tMessage } = useLng();
	const { path } = useRouteMatch();
	const { user } = useUser();
	const rootAdmin = !user.isAdminProvince;
	const regex = /^[^!@#$%^&*()+?<>:;]+$/;
	// const regexNumberLessThan6 = /^[1-9][0-9]|[6-9]$/;
	const { data: ctkm1, refetch } = usePagination(
		AdminCoupon.getAllPagination,
		['searchText', 'status', 'approveStatus', 'duration', 'permission'],
		{
			sort: '',
			pageSize: '10000000',
		},
	);
	const { data: ctkm } = useQuery(
		'getCTKM',
		async () => {
			try {
				return ctkm1;
			} catch (e) {
				return [];
			}
		},
		{
			initialData: [],
		},
	);
	const res = ctkm1.content
		? ctkm1.content.map((item) => ({
				name: item.name,
				code: item.code,
				discount: item.discountValue,
				discountType: item.discountType,
		  }))
		: [];

	const renderTitle = (titles) => (
		<Row className="bg-gray-300">
			{titles.map((item) => (
				<Col span={8}>
					<h3>{item}</h3>
				</Col>
			))}
		</Row>
	);

	const renderDiscountType = (item) => {
		if (item === 0) {
			return '%';
		}
		if (item === 1) {
			return '(VND)';
		}
		return null;
	};

	const renderDiscountValue = (item) => {
		if (item !== null) {
			return Number(item).toLocaleString();
		}
		return null;
	};

	const renderItem = (item) => ({
		value: item.name,
		label: (
			<Row>
				<Col span={8}>
					<Typography.Text ellipsis>{item.name}</Typography.Text>
				</Col>
				<Col span={8}>
					<Typography.Text ellipsis>{item.code}</Typography.Text>
				</Col>
				<Col span={8}>
					<Typography.Text ellipsis>
						{renderDiscountValue(item.discount)}
						{renderDiscountType(item.discountType)}
					</Typography.Text>
				</Col>
			</Row>
		),
		key: item.code,
	});
	const options = [
		{
			label: renderTitle([tField('promoName'), tField('promoCode'), tField('promoDiscountValue')]),
			options: res.map((item) => renderItem(item)),
		},
	];
	function handleFocus() {
		refetch();
		options.options = res.map((item) => renderItem(item));
	}

	const filterOption = (inputValue, option) => {
		const { label, value } = option;
		return option.value?.includes(inputValue);
	};

	const selectUseType = [
		{ value: 1, label: tFilterField('value', 'lettersAndNumbers') },
		{ value: 2, label: tFilterField('value', 'onlyNumber') },
		{ value: 3, label: tFilterField('value', 'onlyletters') },
	];

	const CAN_DELETE_ADMIN =
		DX.canAccessFuture2('admin/delete-coupon', user.permissions) &&
		(rootAdmin || couponInfo?.adminType === 'PROVINCE_ADMIN') &&
		couponInfo?.portalType !== 'DEV';

	const CAN_DELETE_DEV = DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions);

	const CAN_CHANGE_STATUS =
		(couponInfo?.portalType === 'ADMIN' &&
			DX.canAccessFuture2('admin/change-status-coupon-by-admin', user.permissions) &&
			(rootAdmin || (couponInfo.adminType === 'PROVINCE_ADMIN' && !rootAdmin))) ||
		(couponInfo?.portalType === 'DEV' && DX.canAccessFuture2('dev/change-status-coupon-by-dev', user.permissions));
	function handleTransformDataBeforeSubmit(value) {
		const couponId = ctkm1.content.filter((el) => el.name === value.CTKM)[0].id;
		const temp = { ...value, couponId };
		handleSubmit(temp);
	}
	function validateCouponCodeLength(message) {
		return {
			validator: (_, value) => {
				if (Number(value) < 6) {
					return Promise.reject(message);
				}
				return Promise.resolve();
			},
		};
	}
	return (
		<Form
			className={className}
			form={form}
			onFinish={handleTransformDataBeforeSubmit}
			autoComplete="off"
			scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
		>
			{/* Thông tin chung */}
			<Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('generalInfo')}</span>}
			/>
			<Item
				label={tField('couponSetName')}
				name="name"
				rules={[
					validateRequireInput(tValidation('opt_isRequired', { field: 'couponSetName' })),
					validateCode(tValidation('plsEnterTrueFormatKey'), regex),
					validateMaxLengthStr(100, 'Vui lòng nhập thông tin đúng qui tắc: Độ dài không quá 100 ký tự'),
				]}
				labelCol={{ span: 6 }}
			>
				<Input
					type="text"
					placeholder={tField('couponSetName')}
					autoFocus
					disabled={(!onlyView && !checkStatus) || !checkApproved}
				/>
			</Item>
			<Item
				name="code1"
				label={tField('couponSetCode')}
				labelCol={{ span: 6 }}
				rules={[
					validateRequireInput(tValidation('opt_isRequired', { field: 'couponSetCode' })),
					validateCode(tValidation('plsEnterTrueFormatKey'), regex),
					validateMaxLengthStr(100, 'Vui lòng nhập thông tin đúng qui tắc: Độ dài không quá 100 ký tự'),
				]}
			>
				<Input
					type="text"
					placeholder={tField('couponSetCode')}
					disabled={(!onlyView && !checkStatus) || !checkApproved}
				/>
			</Item>

			{/* Định dạng bộ khuyến mại */}
			<Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('couponSetType')}</span>}
			/>
			<Item>
				<Row gutter={[16, 16]}>
					<Col span={12}>
						<Item
							className="mb-0"
							name="amount"
							label={tField('couponAmount')}
							required
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'couponAmount' })),
								validateMaxLengthStr(
									4,
									'Vui lòng nhập thông tin đúng qui tắc: Chỉ gồm các số từ 0-9 và độ dài không quá 4 chữ số',
								),
							]}
							labelCol={{ span: 12 }}
						>
							<Input
								type="number"
								placeholder={tField('quantity')}
								disabled={(!onlyView && !checkStatus) || !checkApproved}
							/>
						</Item>
					</Col>
					<Col span={12}>
						<Item
							className="mb-0"
							name="length"
							label={tField('couponCodeLength')}
							required
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'couponCodeLength' })),
								validateCouponCodeLength('Vui lòng nhập thông tin đúng qui tắc: Giá trị nhỏ nhất là 6'),
								validateMaxLengthStr(
									2,
									'Vui lòng nhập thông tin đúng qui tắc: Chỉ gồm các số từ 0-9 và độ dài không quá 2 chữ số',
								),
							]}
							labelCol={{ span: 12 }}
						>
							<Input
								type="number"
								placeholder={tField('couponCodeLength')}
								disabled={(!onlyView && !checkStatus) || !checkApproved}
							/>
						</Item>
					</Col>
					<Col span={12}>
						<Item
							className="mb-0"
							name="prefix"
							label={tField('prefix')}
							rules={[
								validateCode(tValidation('plsEnterTrueFormatKey'), regex),
								validateMaxLengthStr(
									5,
									'Vui lòng nhập thông tin đúng qui tắc: Độ dài không quá 5 ký tự',
								),
							]}
							labelCol={{ span: 12 }}
						>
							<Input
								type="text"
								placeholder={tField('prefix')}
								maxLength={5}
								disabled={(!onlyView && !checkStatus) || !checkApproved}
							/>
						</Item>
					</Col>
					<Col span={12}>
						<Item
							className="mb-0"
							name="suffix"
							label={tField('suffix')}
							rules={[
								validateCode(tValidation('plsEnterTrueFormatKey'), regex),
								validateMaxLengthStr(
									10,
									'Vui lòng nhập thông tin đúng qui tắc: Độ dài không quá 10 ký tự',
								),
							]}
							labelCol={{ span: 12 }}
						>
							<Input
								type="text"
								placeholder={tField('suffix')}
								maxLength={10}
								disabled={(!onlyView && !checkStatus) || !checkApproved}
							/>
						</Item>
					</Col>
				</Row>
			</Item>

			<Item name="type" label={tField('type')} labelCol={{ span: 6 }}>
				<Select disabled={onlyView} defaultValue={SELECT_TYPE.LETTERSANDNUMBERS} options={selectUseType} />
			</Item>

			{/* Chương trình khuyến mại */}
			<Item
				className="mb-4"
				labelCol={{ span: 6 }}
				colon={false}
				label={<span className="text-xl font-semibold">{tField('prom')}</span>}
			>
				<Button
					className="float-right"
					icon={<AddIcon width="w-4" />}
					// onClick={() => history.push(DX.dev.createPath('/promotion/coupon/create'))}
					onClick={() => window.open(DX.admin.createPath('/promotion/coupon/create'))}
				>
					{tButton('opt_create', { field: 'prom' })}
				</Button>
			</Item>
			<Item
				name="CTKM"
				label={tButton('opt_select', { field: 'prom' })}
				labelCol={{ span: 6 }}
				rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'prom' }))]}
			>
				<AutoComplete
					dropdownClassName="certain-category-search-dropdown"
					dropdownMatchSelectWidth={500}
					filterOption={filterOption}
					options={options}
					onFocus={handleFocus}
					onClick={handleFocus}
				>
					<Input.Search size="large" placeholder={tField('couponSelect')} />
				</AutoComplete>
			</Item>

			{/* button */}
			<Item className="mt-10" label=" " colon={false} labelCol={{ span: 6 }}>
				<Row
					className={`flex ${
						path.indexOf('detail') !== -1 &&
						(couponInfo?.createdBy === user.id || CAN_DELETE_ADMIN || CAN_DELETE_DEV)
							? 'justify-between'
							: 'justify-end'
					}`}
				>
					{path.indexOf('detail') !== -1 &&
						(couponInfo?.createdBy === user.id || CAN_DELETE_ADMIN || CAN_DELETE_DEV) && (
							<Button type="dashed" danger onClick={onDeleteCoupon}>
								{tButton('delete')}
							</Button>
						)}
					<div>
						{path.indexOf('detail') !== -1 && couponInfo?.approve === APPROVED && rollbackStatus && (
							<Button className="mr-5" type="primary" onClick={rollbackCoupon}>
								{tButton('opt_back', { field: 'oldVersion' })}
							</Button>
						)}
						<Button onClick={goBack}>{tButton('opt_cancel')}</Button>
						{path.indexOf('create') !== -1 && (
							<Button
								className="ml-5"
								type="primary"
								htmlType="submit"
								icon={<FileAddOutlined width="w-4" />}
								loading={isLoading}
								disabled={!isDirty}
							>
								{tButton('opt_create', { field: 'prom' })}
							</Button>
						)}
						{couponInfo?.approve === APPROVED && path.indexOf('edit') !== -1 && (
							<Button
								className="ml-5"
								type="primary"
								icon={<SaveOutlined width="w-4" />}
								onClick={updateDraftCoupon}
							>
								{tButton('opt_save')}
							</Button>
						)}
						{couponInfo?.approve === UNAPPROVED && path.indexOf('edit') !== -1 && (
							<Button
								className="ml-5"
								type="primary"
								htmlType="submit"
								icon={<SaveOutlined width="w-4" />}
								loading={isLoading}
								disabled={!isDirty}
							>
								{tButton('opt_save')}
							</Button>
						)}
					</div>
				</Row>
			</Item>
		</Form>
	);
}
