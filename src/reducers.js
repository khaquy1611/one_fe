import { combineReducers } from '@reduxjs/toolkit';

import appReducer from 'app/appReducer';
import imagePrivateReducer from 'app/redux/imagePrivate';
import idInactiveReducer from 'app/redux/idInactive';
import billingReducer from 'sme/Billing/redux/billingReducer';
import subscriptionReducer from 'developer/Subscription/redux/subscriptionReducer';
import comboReducer from 'app/redux/comboPricingReducer';
import pricingReducer from 'app/redux/servicePricingReducer';

export default combineReducers({
	app: appReducer,
	imagePrivate: imagePrivateReducer,
	idInactive: idInactiveReducer,
	billingSme: billingReducer,
	subscription: subscriptionReducer,
	comboPricing: comboReducer,
	pricingInfo: pricingReducer,
});
