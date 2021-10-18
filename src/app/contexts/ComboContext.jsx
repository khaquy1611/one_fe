import React, { useContext } from 'react';

const ComboContext = React.createContext({
	comboInfo: {},
});
export function useComboContext() {
	return useContext(ComboContext);
}
export const ComboContextProvider = ComboContext.Provider;
