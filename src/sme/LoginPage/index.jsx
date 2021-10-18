import { appSelects } from 'actions';
import { Alert, Button } from 'antd';
import { useLng } from 'app/hooks';
import { LogoSME, LogoVnpt } from 'app/icons';
import { DX } from 'app/models';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

const CLIEND_ID = process.env.REACT_APP_CLIENT_ID_VNPT;
const SANDBOX = process.env.REACT_APP_SANDBOX_VNPT;
const REACT_APP_AUTH_SERVER = process.env.REACT_APP_AUTH_SERVER_DEV;

export default function LoginPage({ FormRender, titleForm }) {
	const { tOthers, tLowerField, tButton, tMessage } = useLng();
	const [haveError, setError] = useState();
	const { pathname } = useLocation();
	const { isMobile } = useSelector(appSelects.selectSetting);

	const typePage = pathname.split(`${DX.sme.path}/`).join('');

	const handleLoginVNPT = () => {
		window.location.href = `${SANDBOX}/oauth2/authorize?response_type=code&client_id=${CLIEND_ID}&
		redirect_uri=${window.location.origin}${REACT_APP_AUTH_SERVER}/sso/callback&scope=openid`;
	};

	return (
		<div
			className="h-full mx-auto my-0"
			style={
				!isMobile
					? {
							background:
								'radial-gradient(100% 256% at 100% 50%, #000A53 0%, #091267 70.31%, #080C36 100%)',
							padding: '3.125rem 0',
							backgroundImage: 'url("/images/bg-login.svg")',
							backgroundSize: 'cover',
							backgroundPositionY: '20%',
							backgroundRepeat: 'no-repeat',
					  }
					: {}
			}
		>
			<div className="container mx-auto flex justify-center h-full mobile:w-full ">
				<div className="w-6/12 tablet:hidden block text-center h-full relative">
					<div className="text-left absolute top-0 left-0">
						<h1 className="font-black text-left text-5xl mb-4" style={{ color: '#eceff1' }}>
							Welcome to <br /> oneSME Platform
						</h1>
						<span className="text-lg" style={{ color: '#ECEFF1' }}>
							{tOthers('aSingleDigitalTransformation')} <br /> {tLowerField('ofSmallEnterpriseAndMore')}
						</span>
					</div>
				</div>
				<div className="tablet:w-full w-6/12 h-full max-w-xl tablet:max-w-4xl bg-white rounded-2xl py-2">
					<div
						className={clsx(
							!isMobile && 'beauty-scroll ',
							'text-center px-16 mobile:px-4 py-8  overflow-y-auto h-full flex flex-col',
						)}
					>
						<LogoSME className="mx-auto mb-6" width="auto" />
						<div className="text-left flex flex-col justify-between flex-1">
							<div>
								<h2 className="font-bold text-center uppercase mb-7 text-2xl text-primary">
									{tOthers(titleForm)}
								</h2>
								{!!haveError && (
									<div className="mb-4">
										<Alert message={tMessage(haveError)} type="error" showIcon className="w-full" />
									</div>
								)}
								<FormRender setError={setError} />
							</div>

							{/* Login VNPT ID */}
							{typePage === 'login' && (
								<Button
									icon={<LogoVnpt width="w-4" className="mr-3 text-white" />}
									className="w-full flex justify-center mb-10 mt-4 border-none mobile:text-base mobile:items-center"
									onClick={() => handleLoginVNPT()}
									type="ghost"
									style={{ background: '#EDA233', color: '#fff' }}
								>
									{tButton('loginVNPT')}
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
