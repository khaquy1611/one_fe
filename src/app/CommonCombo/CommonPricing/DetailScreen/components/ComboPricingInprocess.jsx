import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { Form, message } from 'antd';
import { ComboPricing, DX } from 'app/models';
import { useDispatch } from 'react-redux';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import { useComboContext } from 'app/contexts/ComboContext';
import ComboPricingForm from '../../components/ComboPricingForm';
import useThrowErrorComboPlan from './throwError/useThrowErrorComboPlan';

function ComboPricingInprocess({ portal, pricingInfo, objectCheck, disabled }) {
	const { id, pricingId } = useParams();
	const [form] = Form.useForm();
	const history = useHistory();
	const dispatch = useDispatch();
	const [selectFeatureOption, setSelectFeatureOption] = useState([]);
	const [selectTaxOption, setSelectTaxOption] = useState([]);
	const [canUpdate, setCanUpdate] = useState(true);
	const { throwError } = useThrowErrorComboPlan();

	const updatePricing = useMutation(ComboPricing.updateComboPricing, {
		onSuccess: () => {
			message.success('Cập nhật gói Combo dịch vụ thành công');
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

	const onFinish = (values) => {
		if (canUpdate) {
			setCanUpdate(false);
			if (pricingInfo.hasApproved === 'YES') values.code = pricingInfo.code;
			updatePricing.mutate({
				comboId: id,
				comboPlanId: pricingId,
				body: values,
			});
		}
	};
	const { comboInfo } = useComboContext();
	return (
		<ComboPricingForm
			data={pricingInfo}
			objectCheck={objectCheck}
			onFinish={onFinish}
			form={form}
			portal={portal}
			disabled={disabled}
			loading={updatePricing.isLoading}
			setSelectTaxOption={setSelectTaxOption}
			setSelectFeatureOption={setSelectFeatureOption}
			canLoadOption
			getComboOwner={comboInfo?.comboOwner}
			getComboType={comboInfo?.comboType}
		/>
	);
}

export default ComboPricingInprocess;
