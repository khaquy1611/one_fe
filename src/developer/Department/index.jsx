import Department from 'app/components/Templates/Department';
import React from 'react';

export default function DepartmentDev(props) {
	return (
		<div className="animate-zoomOut">
			<Department {...props} />
		</div>
	);
}
