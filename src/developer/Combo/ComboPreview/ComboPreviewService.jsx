import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import CommonCombo from 'app/models/CommonCombo';
import { useParams } from 'react-router-dom';
import { useNavigation } from 'app/hooks';
import { DX } from 'app/models';
import ComboPreview from './ComboPreview';

function ComboPreviewService(props) {
	const { id } = useParams();
	const { goBack } = useNavigation();
	const { data: dataCommonPreview } = useQuery(
		['getServices'],
		async () => {
			try {
				const res = await CommonCombo.getOneById(id);
				return res;
			} catch (e) {
				console.log('error: ', e);
				return null;
			}
		},
		{
			initialData: [],
		},
	);
	return <ComboPreview dataCommonPreview={dataCommonPreview} backEdit={() => goBack(DX.dev.createPath(''))} />;
}

export default ComboPreviewService;
