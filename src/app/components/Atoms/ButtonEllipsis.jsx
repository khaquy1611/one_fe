import styled from 'styled-components';
import { Button } from 'antd';

const ButtonEllipsis = styled(Button)`
	width: 100%;
	text-align: left;
	// column cần thêm ellipsis true và className whitespace-none
	span {
		display: block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		word-break: keep-all;
		text-align: left;
	}
`;
export default ButtonEllipsis;
