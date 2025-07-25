import { setStatuses, setUploadTypes, types } from "./reducers";
import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import api from "./api";

export function* getImportJobStatusesWatcher() {
  yield takeLatest(types.GET_UPLOAD_JOB_STATUSES, getImportJobStatusesWorker);
}

export function* getImportJobStatusesWorker({ page }) {
  const valueFromApi = yield call(api.fetchUploadJobStatuses, { page });
  yield put(setStatuses(valueFromApi, page));
}

export function* getUploadTypesWatcher() {
  yield takeLatest(types.GET_UPLOAD_JOB_STATUSES, getUploadTypesWorker);
}

export function* getUploadTypesWorker() {
  const valueFromApi = yield call(api.fetchUploadTypes);
  // Filter out voided forms from upload types
  const filteredUploadTypes = {};
  Object.keys(valueFromApi).forEach(key => {
    const uploadType = valueFromApi[key];
    // Only include non-voided forms
    if (!uploadType.voided) {
      filteredUploadTypes[key] = uploadType;
    }
  });
  yield put(setUploadTypes(filteredUploadTypes));
}

export default function* main() {
  yield all([getImportJobStatusesWatcher, getUploadTypesWatcher].map(fork));
}
