import React, { useState } from 'react';
import { Form, message } from 'antd';
import { ComboPricing, DX } from 'app/models';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useDispatch } from 'react-redux';
import { useLng } from 'app/hooks';
import WrapDetail from 'app/HOCs/WrapDetail';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import ComboPricingForm from './components/ComboPricingForm';
import useThrowErrorComboPlan from './DetailScreen/components/throwError/useThrowErrorComboPlan';

function CommonPricingCreate({ portal, setHaveError }) {
	const { id } = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const dispatch = useDispatch();
	const [selectTaxOption, setSelectTaxOption] = useState([]);
	const [selectFeatureOption, setSelectFeatureOption] = useState([]);
	const [canUpdate, setCanUpdate] = useState(true);
	const { tMessage } = useLng();
	const { throwError } = useThrowErrorComboPlan();

	const { data: comboInfo } = useQuery(
		['getComboInfoForCreate', id],
		async () => {
			const res = await ComboPricing.getOneComboById(portal, id, 'PROCCESSING');
			if ((portal === 'admin' && res.ownerDev === 'YES') || (portal === 'dev' && res.ownerDev === 'NO')) {
				message.warning('Tài khoản không có quyền tạo cho Combo này!');
				setTimeout(() => {
					if (portal === 'admin') {
						history.push(DX.admin.createPath('/combo'));
					} else history.push(DX.dev.createPath('/combo'));
				}, 500);
			}
			return res;
		},
		{
			initialData: {},
			onError: (e) => {
				e.callbackUrl = portal === 'admin' ? DX.admin.createPath('/combo') : DX.dev.createPath('/combo');
				setHaveError(e);
			},
		},
	);
	const breadcrumb = [
		{
			name: portal === 'admin' ? 'opt_manage/service' : 'service',
			url: '',
		},
		{
			name: 'comboList',
			url: `/${portal}-portal/combo`,
		},
		{
			isName: true,
			name: comboInfo?.name,
			url: `/${portal}-portal/combo/${id}`,
		},
		{
			name: 'opt_create/serviceComboPackage',
			url: '',
		},
	];

	const insertPricing = useMutation(ComboPricing.insertComboPricing, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyCreated', { field: 'serviceComboPackage' }));
			setTimeout(() => {
				if (portal === 'admin') {
					history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
				} else history.push(DX.dev.createPath(`/combo/${id}?tab=3`));
			}, 500);
			dispatch(comboPricingActions.reset());
		},
		onError: (e) => {
			if (e.errorCode === 'error.data.exists' && e.field === 'comboPlanCode') {
				form.setFields([
					{
						name: 'code',
						errors: ['Mã gói Combo đã tồn tại'],
					},
				]);
				form.scrollToField('code', { behavior: 'smooth', block: 'center' });
			} else if (e.errorCode === 'error.data.exists' && e.field === 'comboPlanName') {
				form.setFields([
					{
						name: 'name',
						errors: ['Tên gói Combo đã tồn tại'],
					},
				]);
				form.scrollToField('name', { behavior: 'smooth', block: 'center' });
			} else {
				const errorArr = throwError({
					e,
					selectTaxOption,
					selectFeatureOption,
					pricingCombo: form.getFieldValue('pricingCombo'),
					addonList: form.getFieldValue('addonList'),
				});
				errorArr.forEach((err) => message.error(err));
			}
			setCanUpdate(true);
		},
	});

	const onFinish = (value) => {
		if (canUpdate) {
			setCanUpdate(false);
			insertPricing.mutate({
				comboId: id,
				data: value,
			});
		}
	};

	const getComboOwner = comboInfo.comboOwner;
	const getComboType = comboInfo.comboType;

	return (
		<div>
			<UrlBreadcrumb breadcrumbs={breadcrumb} />
			<ComboPricingForm
				onFinish={onFinish}
				form={form}
				portal={portal}
				loading={insertPricing.isLoading}
				setSelectTaxOption={setSelectTaxOption}
				setSelectFeatureOption={setSelectFeatureOption}
				canLoadOption
				getComboOwner={getComboOwner}
				getComboType={getComboType}
				data={{}}
			/>
		</div>
	);
}

export default WrapDetail(CommonPricingCreate);
