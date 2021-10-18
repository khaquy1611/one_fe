export default function CheckError(error, tValidation) {
	if (error?.field === 'email' && error?.errorCode === 'exists') {
		return tValidation('opt_isDuplicated', { field: 'email' });
	}
	if (error?.field === 'phoneNumber' && error?.errorCode === 'exists') {
		return tValidation('opt_isDuplicated', { field: 'phoneNum' });
	}
	if (error?.field === 'password' && error?.errorCode === 'invalid.password') {
		return tValidation('opt_isNotExisted', { field: 'pass' });
	}
	if (error?.field === 'email' && error.errorCode === 'error.object.not.found') {
		return tValidation('opt_isNotExisted', { field: 'email' });
	}
	if (error?.errorCode === 'error.reset.token') {
		return tValidation('failedResetToken');
	}

	return tValidation('retryError');
}
