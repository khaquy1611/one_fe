import { Button, Spin } from 'antd';
import { TickCheck, ErrorIcon } from 'app/icons';
import React, { useEffect, useState } from 'react';
import { Users } from 'app/models';
import { useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useQueryUrl } from 'app/hooks';
import Modal from 'antd/lib/modal/Modal';

export default function VerifyPage() {
	const { id, activeKey } = useParams();
	const query = useQueryUrl();
	const callBack = query.get('callback');

	const [checkError, setCheckError] = useState(null);

	const activeMutation = useMutation(Users.activeAccount, {
		onSuccess: () => setCheckError(true),
		onError: () => setCheckError(false),
	});

	useEffect(() => {
		activeMutation.mutate({ id, activeKey });
	}, []);

	return checkError === null ? (
		<div className="text-center py-16">
			<Spin />
		</div>
	) : (
		<Modal visible footer={false} closable={false}>
			<div className="text-center py-8">
				<div className="mb-4">
					{checkError ? (
						<TickCheck width="w-12" className="inline" />
					) : (
						<ErrorIcon width="w-12" className="inline" />
					)}
				</div>
				<div className="text-lg font-bold mb-2">
					{checkError
						? 'Tài khoản của bạn đã được kích hoạt!'
						: 'Tài khoản của bạn kích hoạt không thành công!'}
				</div>
				{checkError ? (
					<>
						<div className="mb-4">
							Địa chỉ email của bạn đã được xác nhận. Bạn có thể đăng nhập trực tiếp vào tài khoản của
							mình.
						</div>
						<Button type="primary">
							<a href={callBack} rel="noreferrer" className="w-full h-full block">
								Đăng nhập
							</a>
						</Button>
					</>
				) : (
					<div className="">Vui lòng kiểm tra lại địa chỉ email của bạn.</div>
				)}
			</div>
		</Modal>
	);
}
