import { Modal } from 'antd';
import React from 'react';

export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(errors, errorInfo) {
		this.setState({ errors, errorInfo });
	}

	render() {
		const { hasError, errors, errorInfo } = this.state;
		const { children } = this.props;
		if (hasError) {
			// You can render any custom fallback UI
			return (
				<h1 className="text-center mt-4">
					Đã có lỗi xảy ra.{' '}
					<span
						onClickCapture={() => window?.location.reload()}
						className="text-primary underline cursor-pointer"
					>
						Thử lại.
					</span>
					{process.env.NODE_ENV === 'development' && (
						<>
							<div className="mx-8 px-8 shadow-xl rounded-2xl text-red-600">{errors} </div>
							<div className="mx-8 px-8 shadow-xl rounded-2xl text-red-600">{errorInfo} </div>
						</>
					)}
				</h1>
			);
		}

		return children;
	}
}
