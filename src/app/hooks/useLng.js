import { useTranslation } from 'react-i18next';

export default function useMultiLng() {
	const { t } = useTranslation();

	const tButton = (field, option) => t(`btn.${field}`, option || { field: '' });

	const tField = (field, option) => t(`form.field.${field}`, option || { field: '' });

	const tFilterField = (prefix, value) => t(`form.filter.${prefix}.${value}`);

	const tMessage = (message, option) => t(`mess.${message}`, option || { field: '' });

	const tMenu = (value, option) => t(`menu.${value}`, option || { field: '' });

	const tLowerField = (field) => t(`form.lowerField.${field}`);

	const tOthers = (field, option) => t(`others.${field}`, option || { field: '' });

	const tValidation = (field, options) => t(`form.validation.${field}`, options);

	const tModal = (field) => t(`modal.${field}`);
	return {
		t,
		tButton,
		tField,
		tFilterField,
		tMessage,
		tMenu,
		tLowerField,
		tOthers,
		tValidation,
		tModal,
	};
}
