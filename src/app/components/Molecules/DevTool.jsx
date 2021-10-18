import { Modal } from 'antd';
import React, { useState } from 'react';

export default function DevTool() {
	const [activeTool, setActiveTool] = useState();
	const [hide, setHide] = useState();

	return (
		<div className="fixed bottom-2 left-16 z-max">
			<span className="flex h-4 w-4 relative float-right cursor-pointer" onClickCapture={() => setHide(!hide)}>
				<span className="animate-ping absolute right-0 inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
				<span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500" />
			</span>
			<span
				className="inline-block px-2 py-2 border-2 rounded-3xl border-red-300 shadow-md text-sm clear-both cursor-pointer bg-white"
				onClickCapture={() => {
					setActiveTool(true);
					setHide(false);
				}}
			>
				{hide ? 'New' : 'New Update DX Code'}
			</span>
			{/* <span onClickCapture={() => setHide(true)}>X</span> */}
			{activeTool && (
				<Modal visible={activeTool} onCancel={() => setActiveTool()} onOk={() => setActiveTool()}>
					<ul>
						<li>6-5: Thêm hook usePaginationLocal để phân trang không dựa vào url</li>
					</ul>
				</Modal>
			)}
		</div>
	);
}
