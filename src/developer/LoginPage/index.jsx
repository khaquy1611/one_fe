import { Alert } from 'antd';
import { useLng } from 'app/hooks';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const BoxForm = styled.div`
	border-top: 5px solid #2c3d94;
	max-width: 31.875rem;
	height: 100%;
	background: #fffdfd;
	border-radius: 0px 0px 10px 10px;
	overflow-y: auto;

	&::-webkit-scrollbar-track {
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
		border-radius: 10px;
		background-color: #f5f5f5;
	}

	&::-webkit-scrollbar {
		width: 6px;
		background-color: #f5f5f5;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 10px;
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
		background-color: #b0bec5;
	}
`;

const BoxFormItem = styled.div`
	padding: 2rem 3.5rem 3.5rem 3.5rem;
	text-align: left;
`;

export default function LoginPage({ FormRender, titleForm }) {
	const [haveError, setError] = useState();
	const { tOthers } = useLng();

	useEffect(() => {
		setTimeout(() => {
			if (haveError !== '') setError('');
		}, 5000);
	}, [haveError]);

	return (
		<div
			className="h-full mx-auto my-0"
			style={{
				background: '#f0f2f5',
				padding: '3.125rem 0 3.125rem 0',
			}}
		>
			<div className="container mx-auto flex justify-center h-full">
				<div className="w-6/12 tablet:hidden block text-center h-full">
					<div className="ml-6 h-full overflow-hidden">
						<img src="/images/bg-login-dev.svg" alt="Background login" className="object-contain h-full" />
					</div>
				</div>
				<BoxForm className="tablet:w-full w-6/12 text-center">
					<div className="inline-block">
						<img src="/images/logo-login-dev.svg" alt="Logo dev login" />
					</div>
					<BoxFormItem>
						<p className="mb-6 uppercase text-primary font-semibold text-xl">{tOthers(titleForm)}</p>
						{!!haveError && <Alert message={haveError} type="error" showIcon className="w-full mb-4" />}
						<FormRender setError={setError} />
					</BoxFormItem>
				</BoxForm>
			</div>
		</div>
	);
}
