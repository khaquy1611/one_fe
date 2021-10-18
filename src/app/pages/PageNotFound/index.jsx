import React from 'react';
import { Result } from 'antd';

function PageNotFound() {
	return (
		<Result
			status="404"
			title="404"
			subTitle={<span className="capitalize text-3xl font-semibold">Page not found!</span>}
		/>
	);
}

export default PageNotFound;
