import React from 'react';
import { Spin } from 'antd';
import { useQuery } from 'react-query';
import { SubscriptionDev } from 'app/models';
import { CostIncurred } from 'app/components/Templates/Subscription';
import ComboSubscriptionDev from 'app/models/ComboSubscriptionDev';

function CostIncurredBox({ isFetching, previewCost }) {
	return (
		<Spin spinning={isFetching}>
			<CostIncurred dataPreviewCost={previewCost} />{' '}
		</Spin>
	);
}

export default CostIncurredBox;
