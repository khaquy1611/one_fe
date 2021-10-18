import React from 'react';
import PropTypes from 'prop-types';
import { ArrowLeftIcon } from 'app/icons';
import { Button } from 'antd';
import { noop } from 'opLodash';

function BackNavigation({ text = 'servicePayment', handleBack, normalType, className }) {
	return (
		<div className={`${className} flex items-center back-nav`}>
			<Button
				className="pl-0 text-primary mr-2"
				type="link"
				icon={<ArrowLeftIcon width="w-5" />}
				onClick={handleBack}
			/>
			<span className={`font-bold ${normalType || 'uppercase'}`}>{text}</span>
		</div>
	);
}
BackNavigation.propTypes = {
	text: PropTypes.string.isRequired,
	handleBack: PropTypes.func,
};
BackNavigation.defaultProps = {
	handleBack: noop,
};
export default BackNavigation;
