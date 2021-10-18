import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
	return (
		<div className="pt-10 text-center">
			<p className="text-center">Well come to home page</p>
			<p>
				Bạn đã có tài khoản admin, <Link to="/admin-portal">Go admin portal</Link>
			</p>
			<p>
				Bạn đã có tài khoản developer, <Link to="/dev-portal">Go dev portal</Link>
			</p>
			<p>
				Bạn đã có tài khoản sme, <Link to="/sme-portal">Go sme portal</Link>
			</p>
		</div>
	);
}
