import React from 'react';
import { DX } from 'app/models';
import SmeLoginPage from 'sme/LoginPage';
import LoginForm from 'sme/LoginPage/LoginForm';
import RegisterForm from 'sme/LoginPage/RegisterForm';
import ForgotPasswordForm from 'sme/LoginPage/ForgotPasswordForm';
import ResetPasswordForm from 'sme/LoginPage/ResetPasswordForm';
import PageNotFound from '../app/pages/PageNotFound';

const authRouters = [
	{
		path: DX.sme.createPath('/login'),
		isSSO: true,
		render: () => <SmeLoginPage FormRender={LoginForm} titleForm="login" />,
	},
	{
		path: DX.sme.createPath('/register'),
		render: () => <SmeLoginPage FormRender={RegisterForm} titleForm="register" />,
	},
	{
		path: DX.sme.createPath('/forgot-password'),
		render: () => <SmeLoginPage FormRender={ForgotPasswordForm} titleForm="forgotPass" />,
	},
	{
		path: DX.sme.createPath('/reset-password/:id/:resetToken'),
		render: () => <SmeLoginPage FormRender={ResetPasswordForm} titleForm="resetPass" />,
	},
	{
		path: DX.sme.createPath('/page-not-found'),
		render: () => <PageNotFound />,
	},
];
export default authRouters;
