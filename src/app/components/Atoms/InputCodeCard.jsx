import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import { Input } from 'antd';

function InputCodeCard({ value = {}, onChange }) {
	const [expirationDate, setExpiration] = useState(null);
	const [cvvNumber, setCvvNumber] = useState(null);

	const triggerChange = (changedValue) => {
		if (onChange) {
			onChange({
				expirationDate,
				cvvNumber,
				...value,
				...changedValue,
			});
		}
	};

	const onExpirationDate = (e) => {
		triggerChange({
			expirationDate: e.target.value,
		});
	};
	const onCvvNumber = (e) => {
		triggerChange({
			cvvNumber: e.target.value,
		});
	};

	return (
		<>
			<span>
				<InputMask
					mask="99/99"
					maskChar=" "
					value={value.expirationDate || expirationDate}
					onChange={onExpirationDate}
				>
					{() => (
						<Input
							type="text"
							className="text-center mr-4"
							placeholder="/"
							style={{
								width: 100,
							}}
						/>
					)}
				</InputMask>
				<Input
					type="text"
					value={value.cvvNumber || cvvNumber}
					onChange={onCvvNumber}
					placeholder="CVV"
					style={{
						width: 100,
					}}
					maxLength={3}
				/>
			</span>
		</>
	);
}
InputCodeCard.propTypes = {};

export default InputCodeCard;
