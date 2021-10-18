import styled from 'styled-components';

const DXMenu = styled.div`
	.dx-menu::after {
		content: '';
		height: 2px;
		opacity: 0;
		background: #f6cd4c;
		border-radius: 2px;
		position: relative;
		top: 0.3rem;
		display: block;
		width: 0;
		transition: 0.3s width ease;
	}
	.dx-menu-active::after {
		opacity: 1;
		width: 100%;
	}
`;

export default DXMenu;
