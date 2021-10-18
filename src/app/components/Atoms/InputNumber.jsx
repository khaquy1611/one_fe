import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { noop } from 'opLodash';

function InputNumber({ value = {}, onChange, ...props }) {
	const [number, setNumber] = useState(0);

	const triggerChange = (changedValue) => {
		if (onChange) {
			onChange({
				number,
				...value,
				...changedValue,
			});
		}
	};

	const onNumberChange = (e) => {
		const newNumber = parseInt(e.target.value || '0', 10);

		if (Number.isNaN(newNumber)) {
			return;
		}
		if ('number' in value) {
			setNumber(newNumber);
		}

		triggerChange({
			number: newNumber,
		});
	};

	return <Input type="text" value={value.number || number} onChange={onNumberChange} {...props} />;
}

InputNumber.propTypes = {
	onChange: PropTypes.func,
};

InputNumber.defaultProps = {
	onChange: noop,
};

export default InputNumber;
