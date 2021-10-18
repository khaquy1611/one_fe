import React from 'react';
import InforBasic from '../InforBasic';

export default function ComboApproved({ portal, goBack, objectCheck, formEdit, selectServiceType, data }) {
	return (
		<InforBasic
			key="aprooved"
			data={data}
			formEdit={formEdit}
			portal={portal}
			objectCheck={objectCheck}
			goBack={goBack}
			selectServiceType={selectServiceType}
			disabled
			canLoadOption={false}
		/>
	);
}
