import React, { useState } from 'react';
import ResourceNotFound from 'app/components/Templates/ResourceNotFound';
import { useLng } from 'app/hooks';
import { DX } from 'app/models';

export default function WrapDetail(Detail) {
	// eslint-disable-next-line react/prop-types
	return React.memo(({ ...props }) => {
		const [haveError, setHaveError] = useState({});
		const { tMessage } = useLng();
		if (haveError?.status === 404) {
			return (
				<ResourceNotFound
					msg={tMessage('opt_notFound', { field: haveError.object })}
					defaultPage={haveError.callbackUrl}
					dynamicCallBack={haveError.dynamicCallbackUrl}
				/>
			);
		}

		if (haveError?.errorCode) {
			return (
				<ResourceNotFound
					msg={tMessage(haveError?.errorCode.split('.').join('_'), haveError.options)}
					defaultPage={haveError.callbackUrl || DX.sme.path}
					dynamicCallBack={haveError.dynamicCallbackUrl}
				/>
			);
		}

		return <Detail {...props} setHaveError={setHaveError} />;
	});
}
