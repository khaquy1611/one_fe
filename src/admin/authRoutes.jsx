import React from 'react';
import { DX } from 'app/models';
import AdminLoginPage from 'admin/LoginPage';
import AdminLoginForm from 'admin/LoginPage/LoginForm';
import AdminForgotPasswordForm from 'admin/LoginPage/ForgotPasswordForm';
import AdminResetPasswordForm from 'admin/LoginPage/ResetPasswordForm';

const authRouters = [
	{
		path: DX.admin.createPath('/login'),
		render: () => <AdminLoginPage FormRender={AdminLoginForm} titleForm="login" />,
	},
	{
		path: DX.admin.createPath('/forgot-password'),
		render: () => <AdminLoginPage FormRender={AdminForgotPasswordForm} titleForm="forgotPass" />,
	},
	{
		path: DX.admin.createPath('/reset-password/:id/:resetToken'),
		render: () => <AdminLoginPage FormRender={AdminResetPasswordForm} titleForm="setNewPass" />,
	},
];
export default authRouters;
