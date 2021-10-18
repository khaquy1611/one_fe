import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import styled from 'styled-components';

const editorConfiguration = {
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
		'undo',
		'redo',
	],
};

const EditorHolder = styled.div`
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
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
		border-bottom: none !important;
	}
	.ck-content {
		border-top-left-radius: 0 !important;
		border-top-right-radius: 0 !important;
	}
`;
export default function Editor({ value, onChange, ...props }) {
	const [editor, setEditor] = useState();
	return (
		<EditorHolder className={props.disabled && 'ck-editor--disabled'}>
			<div id="toolbar-editor" />
			<CKEditor
				editor={DecoupledEditor}
				onReady={(editorElm) => {
					const toolbar = document.getElementById('toolbar-editor');
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
		</EditorHolder>
	);
}
