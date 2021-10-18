import { useLocation } from 'react-router-dom';

function useQueryUrl() {
	return new URLSearchParams(useLocation().search);
}

export default useQueryUrl;
