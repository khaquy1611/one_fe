import React from 'react';
import { DX } from 'app/models';
import DevLoginPage from 'developer/LoginPage';
import DevLoginForm from 'developer/LoginPage/LoginForm';
import DevRegisterForm from 'developer/LoginPage/RegisterForm';
import DevForgotPasswordForm from 'developer/LoginPage/ForgotPasswordForm';
import DevResetPasswordForm from 'developer/LoginPage/ResetPasswordForm';

const authRouters = [
	{
		path: DX.dev.createPath('/login'),
		render: () => <DevLoginPage FormRender={DevLoginForm} titleForm="login" />,
	},
	{
		path: DX.dev.createPath('/register'),
		render: () => <DevLoginPage FormRender={DevRegisterForm} titleForm="registerAcc" />,
	},
	{
		path: DX.dev.createPath('/forgot-password'),
		render: () => <DevLoginPage FormRender={DevForgotPasswordForm} titleForm="forgotPass" />,
	},
	{
		path: DX.dev.createPath('/reset-password/:id/:resetToken'),
		render: () => <DevLoginPage FormRender={DevResetPasswordForm} titleForm="resetPass" />,
	},
];
export default authRouters;
