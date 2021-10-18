/* eslint-disable react/no-danger */
import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { UploadImage } from 'app/models';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import styled from 'styled-components';

class MyUploadAdapter {
	constructor(props) {
		this.loader = props;
	}

	async upload() {
		const { loader } = this;
		const data = new FormData();
		const files = await loader.file;
		if (Array.isArray(files)) {
			files.forEach((file) => {
				data.append('files', file);
			});
		} else {
			data.append('files', files);
			data.append('fileSize', files.size);
		}

		const res = await UploadImage.insert(data);
		return {
			default: `${window.location.origin}${res.filePath}`,
		};
	}

	// Aborts the upload process.
	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}
}
function MyCustomUploadAdapterPlugin(editor) {
	// eslint-disable-next-line no-param-reassign
	editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new MyUploadAdapter(loader);
}

const editorConfiguration = {
	extraPlugins: [MyCustomUploadAdapterPlugin],
	toolbar: [
		'heading',
		'|',
		'bold',
		'italic',
		'link',
		'|',
		'bulletedList',
		'numberedList',
		'|',
		'outdent',
		'indent',
		'|',
		'imageUpload',
		'undo',
		'redo',
	],
};
const EmailHolder = styled.div`
	border: 1px solid var(--ck-color-toolbar-border);
	border-radius: 3.5px;

	.ck.ck-editor__editable_inline {
		border: 1px solid #999999 !important;
		border-radius: 4px;
	}
	&.ck-editor--disabled {
		opacity: 0.5;
		pointer-events: none;
		cursor: not-allowed;
	}
	.ck-toolbar {
		border-top: 0 !important;
		border-left: 0 !important;
		border-right: 0 !important;
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.main {
		max-height: calc(100vh - 300px);
		overflow: auto;
	}

	.ck-content img {
		max-width: 100%;
	}
	.ck-content .logo-container {
		display: flex;
		justify-content: center;
		align-items: center;
		border-bottom: 1px solid #cdcdcd;
		padding-top: 20px;
		padding-bottom: 20px;
	}

	.ck-content .logo {
		width: 50%;
	}

	.ck-content .homepage {
		width: 50%;
		padding-top: 10px;
	}

	.email-body {
		padding: 40px;
		margin: 0 auto;
		width: 600px;
		background-color: #f8f8f8;
		font-family: Montserrat, Helvetica, sans-serif;

		.email-container {
			background-color: #ffffff;
			.content-container {
				padding: 40px;
			}
			.footer-container {
				padding: 40px;
			}
		}
	}
`;
export default function EditorEmail({ value, onChange, ...props }) {
	const [editor, setEditor] = useState();
	return (
		<EmailHolder className={props.disabled && 'ck-editor--disabled'}>
			<div id="toolbar-email" />
			<div className="main">
				<div className="email-body ck-content">
					<div className="email-container">
						<div className="logo-container" dangerouslySetInnerHTML={{ __html: props.header }} />
						<div className="content-container">
							<CKEditor
								editor={DecoupledEditor}
								onReady={(editorElm) => {
									const toolbar = document.getElementById('toolbar-email');
									if (toolbar && toolbar.innerHTML === '') {
										toolbar.appendChild(editorElm.ui.view.toolbar.element);
									}
									setEditor(editorElm);
								}}
								onError={({ willEditorRestart }) => {
									if (willEditorRestart) {
										editor.ui.view.toolbar.element.remove();
									}
								}}
								data={value || ''}
								onChange={(_, editorElm) => onChange(editorElm.getData())}
								{...props}
								disabled={false}
								config={
									props.config
										? {
												...editorConfiguration,
												...props.config,
										  }
										: editorConfiguration
								}
							/>
						</div>
						<div className="footer-container" dangerouslySetInnerHTML={{ __html: props.footer }} />
					</div>
				</div>
			</div>
		</EmailHolder>
	);
}
