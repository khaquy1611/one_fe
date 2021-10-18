import React, { useContext } from 'react';

const AppContext = React.createContext({
	user: null,
});
export function useAppContext() {
	return useContext(AppContext);
}
export const AppContextProvider = AppContext.Provider;
