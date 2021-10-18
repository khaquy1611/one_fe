import { Alert, Tabs } from 'antd';
import { useLng } from 'app/hooks';
import { VnptLogo } from 'app/icons';
import React, { useState } from 'react';

const { TabPane } = Tabs;

export default function LoginPage({ FormRender, titleForm }) {
	const { tMenu } = useLng();
	const [haveError, setError] = useState();

	return (
		<div className="pt-10 flex flex-col h-full justify-between">
			<div className="tablet:max-w-sm w-96 mx-auto text-primary">
				<div className="mb-12">
					<VnptLogo className="mx-auto w-10 mb-4" />
					<span className="text-3xl text-center font-extrabold block">oneSME Admin Portal</span>
				</div>
				{!!haveError && (
					<div>
						<Alert message={haveError} type="error" showIcon className="w-full" />
					</div>
				)}
				<Tabs>
					<TabPane tab={tMenu(titleForm)} key="login">
						<FormRender setError={setError} />
					</TabPane>
				</Tabs>
			</div>
			<div className="text-center text-sm mb-6" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
				Copyright ©2021 VNPT oneSME Portal by VNPT
			</div>
		</div>
	);
}
