import styled from 'styled-components';

const IconMenu = styled.div`
	position: relative;
	width: 1.5rem;
	height: 1.875rem;
	cursor: pointer;
	span {
		display: inline-block;
		transition: all 0.4s;
		box-sizing: border-box;
		position: absolute;
		left: 0;
		width: 100%;
		height: 0.125rem;
		min-height: 0.125rem;
		background-color: #333333;
		border-radius: 1px;
	}
	span:nth-of-type(1) {
		width: 1rem;
		top: 0;
	}
	span:nth-of-type(2) {
		top: 0.625rem;
	}
	span:nth-of-type(3) {
		top: 1.25rem;
	}

	&.active {
		span:nth-of-type(1) {
			opacity: 0;
			/* left: 50px; */
			animation: hideAnimation 1s forwards;
		}
		span:nth-of-type(2) {
			transform: rotate(-45deg);
		}
		span:nth-of-type(3) {
			transform: translateY(-0.625rem) rotate(45deg);
		}
	}
	@keyframes hideAnimation {
		100% {
			height: 0;
		}
	}
`;

export default IconMenu;
