/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';
import { Button, message, Input, Form, Collapse, Modal, Spin } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useMutation, useQuery } from 'react-query';
import { DX } from 'app/models';
import { useLng } from 'app/hooks';
import { EmailIcon } from 'app/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'react-router-dom';
import Notice from 'app/models/Notification';
import styled from 'styled-components';
import useUser from '../../../app/hooks/useUser';
import { validateRequireInput, validateMaxLengthStr } from '../../../app/validator/Validator';
import EditorEmail from '../../../app/components/Atoms/EditorEmail';

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const EditorCustom = styled(EditorEmail)``;
const EmailConfiguration = () => {
	const { user } = useUser();
	const CAN_UPDATE_EMAIL = DX.canAccessFuture2('admin/update-email-template', user.permissions);
	const history = useHistory();
	const [isDirty, setIsDirty] = useState(false);
	const [form] = Form.useForm();
	const { tButton, tField, tMessage, tMenu, tValidation, tOthers } = useLng();
	const { code } = useParams();
	const [header, setHeader] = useState();
	const [footer, setFooter] = useState();
	const [loading, setLoading] = useState(true);
	const { data, refetch } = useQuery(['GetEmailConfig'], async () => Notice.getEmailConfig(code), {
		onSuccess: async (res) => {
			// todo select data
			const node = document.createElement('div');
			node.innerHTML = res.contentHtml
				?.trim()
				.replaceAll('$IMG_PATH', process.env.REACT_APP_SERVER_IMAGE_PATH ?? 'https://staging.onesme.vn');
			res.content = node.querySelector('.content-container').innerHTML;
			setHeader(node.querySelector('.logo-container').innerHTML);
			setFooter(node.querySelector('.footer-container').innerHTML);
			const body = { ...res };
			form.setFieldsValue(body);
			await timeout(300);
			setLoading(false);
		},
	});
	const { data: emailParameterData } = useQuery(
		['GetEmailParameter'],
		async () => Notice.getEmailParameter(code),
		{},
	);

	const updateMutation = useMutation(Notice.updateEmail, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetch();
		},
		onError: (res) => {
			if (res?.errorCode === 'error.invalid.tag.param.not.exist') {
				message.error(tMessage('opt_tag_param_not_exist', { field: res?.field }));
			} else message.error(tMessage('opt_badlyUpdated'));
			setLoading(false);
		},
	});
	const setDefaultMutation = useMutation(Notice.updateEmail, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullysetDefaultEmail'));
			refetch();
		},
		onError: (res) => {
			message.error(tMessage('opt_badlySetEmailDefault'));
			setLoading(false);
		},
	});
	const sendTestEmailMutate = useMutation(Notice.sendTestEmail, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullySentTestEmail', { email: user?.email }));
		},
		onError: (res) => {
			message.error(tMessage('opt_badlySentTestEmail'));
			setLoading(false);
		},
	});
	function handleValueFormChange() {
		setIsDirty(true);
	}
	const buildContent = () => {
		const content = form.getFieldValue('content');
		const ckeditorCSS = `
		<style id="ckeditor-style">
		:root {
			--ck-color-image-caption-background: hsl(0, 0%, 97%);
			--ck-color-image-caption-text: hsl(0, 0%, 20%);
			--ck-color-mention-background: hsla(341, 100%, 30%, 0.1);
			--ck-color-mention-text: hsl(341, 100%, 30%);
			--ck-color-table-caption-background: hsl(0, 0%, 97%);
			--ck-color-table-caption-text: hsl(0, 0%, 20%);
			--ck-highlight-marker-blue: hsl(201, 97%, 72%);
			--ck-highlight-marker-green: hsl(120, 93%, 68%);
			--ck-highlight-marker-pink: hsl(345, 96%, 73%);
			--ck-highlight-marker-yellow: hsl(60, 97%, 73%);
			--ck-highlight-pen-green: hsl(112, 100%, 27%);
			--ck-highlight-pen-red: hsl(0, 85%, 49%);
			--ck-image-style-spacing: 1.5em;
			--ck-inline-image-style-spacing: calc(var(--ck-image-style-spacing) / 2);
			--ck-todo-list-checkmark-size: 16px;
		  }
		  
		  .ck-content .image.image_resized {
			max-width: 100%;
			display: block;
			-webkit-box-sizing: border-box;
					box-sizing: border-box;
		  }
		  
		  .ck-content .image.image_resized img {
			width: 100%;
		  }
		  
		  .ck-content .image.image_resized > figcaption {
			display: block;
		  }
		  
		  .ck-content .image > figcaption {
			display: table-caption;
			caption-side: bottom;
			word-break: break-word;
			color: var(--ck-color-image-caption-text);
			background-color: var(--ck-color-image-caption-background);
			padding: 0.6em;
			font-size: 0.75em;
			outline-offset: -1px;
		  }
		  
		  .ck-content .image {
			display: table;
			clear: both;
			text-align: center;
			margin: 0.9em auto;
			min-width: 50px;
		  }
		  
		  .ck-content .image img {
			display: block;
			margin: 0 auto;
			max-width: 100%;
			min-width: 100%;
		  }
		  
		  .ck-content .image-inline {
			display: -webkit-inline-box;
			display: -ms-inline-flexbox;
			display: inline-flex;
			max-width: 100%;
			-webkit-box-align: start;
				-ms-flex-align: start;
					align-items: flex-start;
		  }
		  
		  .ck-content .image-inline picture {
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
		  }
		  
		  .ck-content .image-inline img,
		  .ck-content .image-inline picture {
			-webkit-box-flex: 1;
				-ms-flex-positive: 1;
					flex-grow: 1;
			-ms-flex-negative: 1;
				flex-shrink: 1;
			max-width: 100%;
		  }
		  
		  .ck-content .image-style-block-align-left,
		  .ck-content .image-style-block-align-right {
			max-width: calc(100% - var(--ck-image-style-spacing));
		  }
		  
		  .ck-content .image-style-align-left,
		  .ck-content .image-style-align-right {
			clear: none;
		  }
		  
		  .ck-content .image-style-side {
			float: right;
			margin-left: var(--ck-image-style-spacing);
			max-width: 50%;
		  }
		  
		  .ck-content .image-style-align-left {
			float: left;
			margin-right: var(--ck-image-style-spacing);
		  }
		  
		  .ck-content .image-style-align-center {
			margin-left: auto;
			margin-right: auto;
		  }
		  
		  .ck-content .image-style-align-right {
			float: right;
			margin-left: var(--ck-image-style-spacing);
		  }
		  
		  .ck-content .image-style-block-align-right {
			margin-right: 0;
			margin-left: auto;
		  }
		  
		  .ck-content .image-style-block-align-left {
			margin-left: 0;
			margin-right: auto;
		  }
		  
		  .ck-content p + .image-style-align-left,
		  .ck-content p + .image-style-align-right,
		  .ck-content p + .image-style-side {
			margin-top: 0;
		  }
		  
		  .ck-content .image-inline.image-style-align-left,
		  .ck-content .image-inline.image-style-align-right {
			margin-top: var(--ck-inline-image-style-spacing);
			margin-bottom: var(--ck-inline-image-style-spacing);
		  }
		  
		  .ck-content .image-inline.image-style-align-left {
			margin-right: var(--ck-inline-image-style-spacing);
		  }
		  
		  .ck-content .image-inline.image-style-align-right {
			margin-left: var(--ck-inline-image-style-spacing);
		  }
		  
		  .ck-content .marker-yellow {
			background-color: var(--ck-highlight-marker-yellow);
		  }
		  
		  .ck-content .marker-green {
			background-color: var(--ck-highlight-marker-green);
		  }
		  
		  .ck-content .marker-pink {
			background-color: var(--ck-highlight-marker-pink);
		  }
		  
		  .ck-content .marker-blue {
			background-color: var(--ck-highlight-marker-blue);
		  }
		  
		  .ck-content .pen-red {
			color: var(--ck-highlight-pen-red);
			background-color: transparent;
		  }
		  
		  .ck-content .pen-green {
			color: var(--ck-highlight-pen-green);
			background-color: transparent;
		  }
		  
		  .ck-content .text-tiny {
			font-size: 0.7em;
		  }
		  
		  .ck-content .text-small {
			font-size: 0.85em;
		  }
		  
		  .ck-content .text-big {
			font-size: 1.4em;
		  }
		  
		  .ck-content .text-huge {
			font-size: 1.8em;
		  }
		  
		  .ck-content hr {
			margin: 15px 0;
			height: 4px;
			background: #ddd;
			border: 0;
		  }
		  
		  .ck-content pre {
			padding: 1em;
			color: #353535;
			background: rgba(199, 199, 199, 0.3);
			border: 1px solid #c4c4c4;
			border-radius: 2px;
			text-align: left;
			direction: ltr;
			-moz-tab-size: 4;
			  -o-tab-size: 4;
				 tab-size: 4;
			white-space: pre-wrap;
			font-style: normal;
			min-width: 200px;
		  }
		  
		  .ck-content pre code {
			background: unset;
			padding: 0;
			border-radius: 0;
		  }
		  
		  .ck-content blockquote {
			overflow: hidden;
			padding-right: 1.5em;
			padding-left: 1.5em;
			margin-left: 0;
			margin-right: 0;
			font-style: italic;
			border-left: solid 5px #ccc;
		  }
		  
		  .ck-content[dir="rtl"] blockquote {
			border-left: 0;
			border-right: solid 5px #ccc;
		  }
		  
		  .ck-content code {
			background-color: rgba(199, 199, 199, 0.3);
			padding: 0.15em;
			border-radius: 2px;
		  }
		  
		  .ck-content .table > figcaption {
			display: table-caption;
			caption-side: top;
			word-break: break-word;
			text-align: center;
			color: var(--ck-color-table-caption-text);
			background-color: var(--ck-color-table-caption-background);
			padding: 0.6em;
			font-size: 0.75em;
			outline-offset: -1px;
		  }
		  
		  .ck-content .table {
			margin: 0.9em auto;
			display: table;
		  }
		  
		  .ck-content .table table {
			border-collapse: collapse;
			border-spacing: 0;
			width: 100%;
			height: 100%;
			border: 1px double #b2b2b2;
		  }
		  
		  .ck-content .table table td,
		  .ck-content .table table th {
			min-width: 2em;
			padding: 0.4em;
			border: 1px solid #bfbfbf;
		  }
		  
		  .ck-content .table table th {
			font-weight: 700;
			background: black;
		  }
		  
		  .ck-content[dir="rtl"] .table th {
			text-align: right;
		  }
		  
		  .ck-content[dir="ltr"] .table th {
			text-align: left;
		  }
		  
		  .ck-content .page-break {
			position: relative;
			clear: both;
			padding: 5px 0;
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-align: center;
				-ms-flex-align: center;
					align-items: center;
			-webkit-box-pack: center;
				-ms-flex-pack: center;
					justify-content: center;
		  }
		  
		  .ck-content .page-break::after {
			content: "";
			position: absolute;
			border-bottom: 2px dashed #c4c4c4;
			width: 100%;
		  }
		  
		  .ck-content .page-break__label {
			position: relative;
			z-index: 1;
			padding: 0.3em 0.6em;
			display: block;
			text-transform: uppercase;
			border: 1px solid #c4c4c4;
			border-radius: 2px;
			font-family: Helvetica, Arial, Tahoma, Verdana, Sans-Serif;
			font-size: 0.75em;
			font-weight: 700;
			color: #333;
			background: #fff;
			-webkit-box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.15);
					box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.15);
			-webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		  }
		  
		  .ck-content .media {
			clear: both;
			margin: 0.9em 0;
			display: block;
			min-width: 15em;
		  }
		  
		  .ck-content .todo-list {
			list-style: none;
		  }
		  
		  .ck-content .todo-list li {
			margin-bottom: 5px;
		  }
		  
		  .ck-content .todo-list li .todo-list {
			margin-top: 5px;
		  }
		  
		  .ck-content .todo-list .todo-list__label > input {
			-webkit-appearance: none;
			display: inline-block;
			position: relative;
			width: var(--ck-todo-list-checkmark-size);
			height: var(--ck-todo-list-checkmark-size);
			vertical-align: middle;
			border: 0;
			left: -25px;
			margin-right: -15px;
			right: 0;
			margin-left: 0;
		  }
		  
		  .ck-content .todo-list .todo-list__label > input::before {
			display: block;
			position: absolute;
			-webkit-box-sizing: border-box;
					box-sizing: border-box;
			content: "";
			width: 100%;
			height: 100%;
			border: 1px solid #333;
			border-radius: 2px;
			-webkit-transition: 250ms ease-in-out box-shadow, 250ms ease-in-out background, 250ms ease-in-out border;
			transition: 250ms ease-in-out box-shadow, 250ms ease-in-out background, 250ms ease-in-out border;
		  }
		  
		  .ck-content .todo-list .todo-list__label > input::after {
			display: block;
			position: absolute;
			-webkit-box-sizing: content-box;
					box-sizing: content-box;
			pointer-events: none;
			content: "";
			left: calc(var(--ck-todo-list-checkmark-size) / 3);
			top: calc(var(--ck-todo-list-checkmark-size) / 5.3);
			width: calc(var(--ck-todo-list-checkmark-size) / 5.3);
			height: calc(var(--ck-todo-list-checkmark-size) / 2.6);
			border-style: solid;
			border-color: transparent;
			border-width: 0 calc(var(--ck-todo-list-checkmark-size) / 8) calc(var(--ck-todo-list-checkmark-size) / 8) 0;
			-webkit-transform: rotate(45deg);
					transform: rotate(45deg);
		  }
		  
		  .ck-content .todo-list .todo-list__label > input[checked]::before {
			background: #25ab33;
			border-color: #25ab33;
		  }
		  
		  .ck-content .todo-list .todo-list__label > input[checked]::after {
			border-color: #fff;
		  }
		  
		  .ck-content .todo-list .todo-list__label .todo-list__label__description {
			vertical-align: middle;
		  }
		  
		  .ck-content span[lang] {
			font-style: italic;
		  }
		  
		  .ck-content .mention {
			background: var(--ck-color-mention-background);
			color: var(--ck-color-mention-text);
		  }
		  
		  @media print {
			.ck-content .page-break {
			  padding: 0;
			}
			.ck-content .page-break::after {
			  display: none;
			}
		  }
		  .ck-content  img {
			max-width: 100%;
		  }
		  .ck-content  .logo-container {
			display: flex; 
			justify-content: center; 
			align-items: center; 
			border-bottom: 1px solid #cdcdcd;
			padding-top: 20px;
			padding-bottom: 20px;
		  }
		  
		  .ck-content  .logo {
			width: 50%;
		  }
		  
		  .ck-content  .homepage {
			width: 50%;
			padding-top: 10px;
		  }
		  
		</style>
	 
		`;
		const defaultTemplate = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			${ckeditorCSS}
		</head>
		
		<body>
			<div class="main ck-content"
				style="padding: 40px;margin: 0 auto; width: 600px;background-color: #F8F8F8; font-family: 'Montserrat', Helvetica, sans-serif;">
				<div class="email-container" style="background-color: #FFFFFF;">
					<div class="logo-container"  >
						${header}
					</div>
					<div class="content-container " style="padding: 40px;">
						${content}
					</div>
					<div class="footer-container" style="padding: 40px;">
						${footer}
					</div>
				</div>
			</div>
		</body>
		</html>
		`;
		return defaultTemplate;
	};
	const processEmail = async (isPreview, isConvertInline = true) => {
		let content = buildContent();
		if (isPreview) {
			const res = await Notice.fillEmailParam({ ...data, ...form.getFieldsValue(), contentHtml: content });
			content = res.content;
		} else {
			content = content.replaceAll(
				process.env.REACT_APP_SERVER_IMAGE_PATH ?? 'https://staging.onesme.vn',
				'$IMG_PATH',
			);
		}
		document.getElementById('email-holder').innerHTML = content;

		if (isConvertInline) {
			// const dummyWindow = window.open('', 'PRINT', 'width=,height=,resizable=no');
			// TransferCSS to Inline
			const getStylesWithoutDefaults = (element) => {
				// creating an empty dummy object to compare with
				const placeholder = document.createElement('div');
				placeholder.innerHTML = element.outerHTML;
				const dummy = placeholder.firstElementChild;
				// dummyWindow.document.documentElement.appendChild(dummy);
				document.body.appendChild(dummy);

				// getting computed styles for both elements
				const defaultStyles = getComputedStyle(dummy, null);
				const elementStyles = getComputedStyle(element, null);
				// calculating the difference
				const diff = {};
				// eslint-disable-next-line no-restricted-syntax
				for (const key in elementStyles) {
					// eslint-disable-next-line no-prototype-builtins
					if (elementStyles.hasOwnProperty(key) && defaultStyles[key] !== elementStyles[key]) {
						diff[key] = elementStyles[key];
					}
				}
				dummy.remove();

				return diff;
			};

			const transferComputedStyle = (node) => {
				const cs = getStylesWithoutDefaults(node);
				// console.log(node, cs);
				// const cs = getComputedStyle(node, null);
				// eslint-disable-next-line no-restricted-syntax
				// eslint-disable-next-line guard-for-in
				for (const key in cs) {
					if (!key.includes('webkit')) node.style[key] = cs[key];
				}
			};
			const transferAll = () => {
				const all = document.getElementById('email-holder').querySelectorAll('body .ck-content *');
				let i;

				for (i = 0; i < all.length; i++) {
					transferComputedStyle(all[i]);
				}
				const allStyle = document.getElementById('email-holder').querySelectorAll('style');
				for (i = 0; i < allStyle.length; i++) {
					allStyle[i].remove();
				}
			};
			await timeout(300);
			transferAll();
			// dummyWindow.close();
		}

		const result = document.getElementById('email-holder').innerHTML;
		if (isPreview) {
			const newWindow = window.open('', 'PRINT', 'height=900,width=950');
			newWindow.document.documentElement.innerHTML = result;

			const check = () => {
				if (newWindow.document) {
					newWindow.document.title = 'Xem mẫu email';
				} else {
					setTimeout(check, 10);
				}
			};
			check();
		}
		return result;
	};

	const processEmail2 = async (isPreview, isConvertInline = true) => {
		const newWindow = window.open('', 'PRINT', !isPreview ? 'width=,height=,resizable=no' : 'height=900,width=950');
		if (!isPreview) {
			newWindow.resizeTo(0, 0);
			newWindow.moveTo(0, -100000);
			newWindow.blur();
			window.focus();
		}
		let content = buildContent();
		if (isPreview) {
			const res = await Notice.fillEmailParam({ ...data, ...form.getFieldsValue(), contentHtml: content });
			content = res.content;
		} else {
			content = content.replaceAll(
				process.env.REACT_APP_SERVER_IMAGE_PATH ?? 'https://staging.onesme.vn',
				'$IMG_PATH',
			);
		}
		newWindow.document.documentElement.innerHTML = content;

		newWindow.document.documentElement.style.overflow = 'auto';
		newWindow.document.body.style.overflow = 'auto';
		if (isConvertInline) {
			// TransferCSS to Inline
			const getStylesWithoutDefaults = (element) => {
				// creating an empty dummy object to compare with
				const placeholder = document.createElement('div');
				placeholder.innerHTML = element.outerHTML;
				const dummy = placeholder.firstElementChild;
				document.body.appendChild(dummy);

				// getting computed styles for both elements
				const defaultStyles = getComputedStyle(dummy, null);
				const elementStyles = getComputedStyle(element, null);
				// calculating the difference
				const diff = {};
				// eslint-disable-next-line no-restricted-syntax
				for (const key in elementStyles) {
					// eslint-disable-next-line no-prototype-builtins
					if (elementStyles.hasOwnProperty(key) && defaultStyles[key] !== elementStyles[key]) {
						diff[key] = elementStyles[key];
					}
				}
				dummy.remove();

				return diff;
			};

			const transferComputedStyle = (node) => {
				const cs = getStylesWithoutDefaults(node);
				// console.log(node, cs);
				// const cs = getComputedStyle(node, null);
				// eslint-disable-next-line no-restricted-syntax
				// eslint-disable-next-line guard-for-in
				for (const key in cs) {
					if (!key.includes('webkit')) node.style[key] = cs[key];
				}
			};
			const transferAll = () => {
				const all = newWindow.document.querySelectorAll('body .ck-content *');
				let i;

				for (i = 0; i < all.length; i++) {
					transferComputedStyle(all[i]);
				}
				const allStyle = newWindow.document.querySelectorAll('style');
				for (i = 0; i < allStyle.length; i++) {
					allStyle[i].remove();
				}
			};
			await timeout(300);
			transferAll();
		}

		const check = () => {
			if (newWindow.document) {
				newWindow.document.title = 'Xem mẫu email';
			} else {
				setTimeout(check, 10);
			}
		};
		check();
		const result = newWindow?.document?.documentElement?.outerHTML;
		if (!isPreview) {
			newWindow.close();
		}
		return result;
	};
	const handleCancel = () => {
		form.setFieldsValue(data.body);
		setIsDirty(false);
		history.push(DX.admin.createPath(`/general-management/config/`));
	};
	const onFinish = async (values) => {
		setLoading(true);
		const resultEmail = await processEmail(false);
		updateMutation.mutate({
			...data,
			...values,
			contentHtml: resultEmail,
		});
	};
	const sendTestEmail = () => {
		Modal.confirm({
			title: `Bạn có chắc chắn muốn gửi email này tới ${user?.email} ?`,
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: async () => {
				const resultEmail = await processEmail(false);
				sendTestEmailMutate.mutate({
					...data,
					...form.getFieldsValue(),
					contentHtml: resultEmail,
				});
			},
			onCancel: () => {},
			confirmLoading: sendTestEmailMutate.isLoading,
		});
	};
	const handleDefault = () => {
		Modal.confirm({
			title: `Bạn có chắc chắn muốn trở lại phiên bản mặc định của email?`,
			icon: <ExclamationCircleOutlined />,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			onOk: async () => {
				setLoading(true);
				const res = { ...data };
				res.contentHtml = res.contentHtmlDefault;
				const node = document.createElement('div');
				node.innerHTML = res.contentHtml
					?.trim()
					.replaceAll('$IMG_PATH', process.env.REACT_APP_SERVER_IMAGE_PATH ?? 'https://staging.onesme.vn');
				res.title = res.titleDefault || res.title;
				res.content = node.querySelector('.content-container').innerHTML;
				setHeader(node.querySelector('.logo-container').innerHTML);
				setFooter(node.querySelector('.footer-container').innerHTML);
				const body = { ...res };
				form.setFieldsValue(body);
				await timeout(300);
				setLoading(false);
				// setDefaultMutation.mutate({
				// 	...data,
				// 	...form.getFieldsValue(),
				// 	contentHtml: data.contentHtmlDefault,
				// });
			},
			onCancel: () => {},
			confirmLoading: setDefaultMutation.isLoading,
		});
	};

	return (
		<div className="">
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type="emailConfig" />
				<div>
					<Button className="ml-auto mr-4" type="primary" onClick={() => processEmail(true)}>
						{tButton('preview')}
					</Button>
					<Button className="ml-auto" type="primary" onClick={sendTestEmail} icon={<EmailIcon width="w-4" />}>
						{tButton('sendTestEmail')}
					</Button>
				</div>
			</div>
			<Spin
				spinning={
					loading || sendTestEmailMutate.isLoading || setDefaultMutation.isLoading || updateMutation.isLoading
				}
			>
				<Form layout="vertical" form={form} load onFinish={onFinish} onValuesChange={handleValueFormChange}>
					<div className="flex gap-3">
						<div className="w-3/4">
							<Form.Item name="name" label={tField('emailName')}>
								<Input placeholder={tField('emailName')} disabled maxLength={200} />
							</Form.Item>
							<Form.Item
								name="title"
								label={tField('emailTitle')}
								rules={[
									validateRequireInput(tValidation('opt_isRequired', { field: 'emailTitle' })),
									validateMaxLengthStr(200, tValidation('opt_enterMaxLength', { field: '200' })),
								]}
							>
								<Input placeholder={tField('emailTitle')} maxLength={200} />
							</Form.Item>
							<Form.Item
								rules={[validateRequireInput('Vui lòng không để trống mục này.')]}
								name="content"
							>
								<EditorCustom header={header} footer={footer} />
							</Form.Item>
							<div className="flex items-center justify-between mb-5">
								<div>
									<Button
										htmlType="button"
										hidden={!CAN_UPDATE_EMAIL}
										className=" h-10 mr-3"
										type="dashed"
										danger
										onClick={() => {
											handleDefault();
										}}
									>
										{tButton('resetDefault')}
									</Button>
								</div>
								<div>
									<Form.Item>
										<Button
											htmlType="button"
											className="w-20 h-10 mr-3"
											onClick={() => {
												handleCancel();
											}}
										>
											{tButton('opt_cancel')}
										</Button>

										<Button
											hidden={!CAN_UPDATE_EMAIL}
											className="w-20 h-10"
											type="primary"
											disabled={!isDirty}
											htmlType="submit"
										>
											{tButton('opt_save')}
										</Button>
									</Form.Item>
								</div>
							</div>
						</div>
						<div className="w-1/4">
							<div className="mt-8 border-solid border border-gray-200 rounded-lg">
								<div className="pl-4 py-3 font-bold">{tMenu('emailParameterList')}</div>
								<div
									className="pl-4 pt-5 pr-4 border-solid border-t border-r-0 border-b-0 border-l-0 border-gray-200"
									style={{ height: 'calc(100vh - 143px)', overflow: 'auto' }}
								>
									{emailParameterData?.map((y) => (
										<Button
											htmlType="button"
											block
											className="bg-gray-200 mb-2 text-left"
											type="default"
											title={y.remark}
											onClick={() => {
												navigator.clipboard.writeText(y.paramName);

												message.success('Đã sao chép vào bộ nhớ tạm');
											}}
										>
											{y.paramName}
										</Button>
									))}
									{/* {emailParameterData?.content.map((x) => (
										<Collapse
											ghost
											expandIconPosition="right"
											defaultActiveKey={['1']}
											className="bg-white mb-4"
										>
											<Panel header={x.name} extra={() => {}} key="1">
												{x.datas.map((y) => (
													<Button
														htmlType="button"
														block
														className="bg-gray-200 mb-2 text-left"
														type="default"
														tooltip={y.description}
														onClick={() => {
															navigator.clipboard.writeText(y.name);

															message.success('Đã sao chép vào bộ nhớ tạm');
														}}
													>
														{y.name}
													</Button>
												))}
											</Panel>
										</Collapse>
									))} */}
								</div>
							</div>
						</div>
					</div>
				</Form>
			</Spin>
			<div id="email-holder" style={{ display: 'none' }} />
		</div>
	);
};

export default EmailConfiguration;
