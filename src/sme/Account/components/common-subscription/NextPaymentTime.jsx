import React from 'react';
import PackDetail from './PackDetail';

function NextPaymentTime({ planId, status, typeSubscription }) {
	return <PackDetail planId={planId} typeSubscription={typeSubscription} activeTab="3" />;
}

export default NextPaymentTime;
