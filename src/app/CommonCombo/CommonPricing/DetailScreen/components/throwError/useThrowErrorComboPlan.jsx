import React from 'react';
import { useLng } from 'app/hooks';
import { isEmpty } from 'opLodash';

export default function useThrowErrorComboPlan() {
	const { tMessage, tLowerField } = useLng();

	const throwError = ({ e, selectTaxOption, selectFeatureOption, pricingCombo, addonList }) => {
		const errorArr = [];
		if (e.errorCode === 'error.tax.invalid' && e.field === 'taxList') {
			const arr = e.message.split('|');
			arr.forEach((text) => {
				const d = text.indexOf(' deleted.');
				const i = text.indexOf(' inactive.');
				if (d > -1) {
					const ids = text.slice(0, d).split(',');
					let errorMes = '';
					ids.forEach((element) => {
						const tax = selectTaxOption.filter((value) => value.id === parseInt(element, 10));
						if (errorMes === '') {
							errorMes = tax[0].name;
						} else errorMes = errorMes.concat(', ').concat(tax[0].name);
					});
					errorArr.push(`${tMessage('tax')}: ${errorMes} ${tLowerField('isDisabled')}`);
				}
				if (i > -1) {
					const ids = text.slice(0, i).split(',');
					let errorMes = '';
					ids.forEach((element) => {
						const tax = selectTaxOption.filter((value) => value.id === parseInt(element, 10));
						if (errorMes === '') {
							errorMes = tax[0].name;
						} else errorMes = errorMes.concat(', ').concat(tax[0].name);
					});
					errorArr.push(`${tMessage('tax')}: ${errorMes} đang không hoạt động`);
				}
			});
		} else if (e.errorCode === 'error.object.not.found' && e.field === 'id' && e.object === 'feature') {
			const index = e.message.indexOf(' not found.');
			if (index > -1) {
				const ids = e.message.slice(0, index).split(',');
				let errorMes = '';
				ids.forEach((element) => {
					const feature = selectFeatureOption.filter((value) => value.id === parseInt(element, 10));
					if (errorMes === '') {
						errorMes = feature[0].name;
					} else errorMes = errorMes.concat(', ').concat(feature[0].name);
				});
				errorArr.push(`${tMessage('feature')}: ${errorMes} ${tLowerField('isDisabled')}`);
			}
		} else if (
			(e.errorCode === 'error.invalid.data' || e.errorCode === 'error.object.not.found') &&
			e.field === 'id' &&
			e.object === 'addons'
		) {
			const idErr = e.message.replaceAll(/\D/g, '');
			const idAddonErr = idErr ? parseInt(idErr, 10) : -1;

			const addonErr = [].concat(addonList).filter((el) => el.id === idAddonErr || el.addonId === idAddonErr);
			const errorMes = addonErr.length > 0 ? addonErr[0]?.name : '';
			errorArr.push(`Dịch vụ bổ sung ${errorMes} đang không tồn tại`);
		} else if (
			e.errorCode === 'error.payment.cycle.pricing.greater.than.or.equal.addon' &&
			e.field === 'cycleType'
		) {
			errorArr.push(
				'Dịch vụ bổ sung phải có chu kỳ thanh toán trùng với chu kỳ thanh toán của gói combo dịch vụ',
			);
		} else if (
			(e.errorCode === 'error.object.inactive' ||
				e.errorCode === 'error.object.deleted' ||
				e.errorCode === 'error.pricing.not.found') &&
			e.field === 'id' &&
			e.object === 'pricing'
		) {
			const d = e.message.indexOf(' deleted.');
			const i = e.message.indexOf(' inactive.');
			const f = e.message.indexOf(' pricing not found.');
			let ids = null;
			let typeMess = '';
			if (d > -1) {
				ids = e.message.slice(0, d).split(',');
				typeMess = 'đã bị xóa';
			} else if (i > -1) {
				ids = e.message.slice(0, i).split(',');
				typeMess = tLowerField('isDisabled');
			} else if (f > -1) {
				ids = e.message.slice(0, f).split(',');
				typeMess = 'đang không tồn tại';
			}
			const idPlanErr = !isEmpty(ids) ? parseInt(ids[0], 10) : -1;
			const planErr = [].concat(pricingCombo).filter((el) => el.id === idPlanErr || el.pricingId === idPlanErr);
			const errorMes = planErr.length > 0 ? planErr[0]?.name : '';

			errorArr.push(`Gói dịch vụ ${errorMes} ${typeMess}`);
		} else if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
			errorArr.push('Trường thông tin không hợp lệ để thao tác tạo');
		}
		return errorArr;
	};
	return {
		throwError,
	};
}
