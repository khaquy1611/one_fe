import { toLower } from 'opLodash';
import React from 'react';
import { DebitBalance } from 'sme/Account/components/common-subscription';

function MemoSubscription({ dataDetail, typePortal }) {
	return (
		<div>
			{dataDetail.subscriptionStatus !== 'IN_TRIAL' ? (
				<DebitBalance dataDetail={dataDetail} typePortal={toLower(typePortal)} />
			) : (
				<div>Chưa có thông tin ghi nhớ</div>
			)}
		</div>
	);
}

export default MemoSubscription;
