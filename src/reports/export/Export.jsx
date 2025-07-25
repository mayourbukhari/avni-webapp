import { styled } from "@mui/material/styles";
import {
  FormControl,
  FormLabel,
  Typography,
  Grid,
  Button,
  Paper,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { useEffect, useState, useReducer, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getOperationalModules, getUploadStatuses } from "../reducers";
import JobStatus from "../components/export/JobStatus";
import _ from "lodash";
import ReportTypes, { reportTypes } from "./ReportTypes";
import Radio from "../../dataEntryApp/components/Radio";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import AddressLevelsByType from "../../common/components/AddressLevelsByType";
import { reportSideBarOptions } from "../Common";
import {
  applicableOptions,
  ExportReducer,
  getRequestBody,
  initialState
} from "./reducer/ExportReducer";
import { RegistrationType } from "../components/export/RegistrationType";
import { EnrolmentType } from "../components/export/EnrolmentType";
import { EncounterType } from "../components/export/EncounterType";
import { GroupSubjectType } from "../components/export/GroupSubjectType";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { useTranslation } from "react-i18next";

const StyledBox = styled(Box)(({ theme }) => ({
  border: "1px solid #ddd",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2)
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const StyledGrid = styled(Grid)({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  flexWrap: "nowrap"
});

const StyledWarningText = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "500",
  marginLeft: theme.spacing(1.25),
  marginBottom: theme.spacing(1.25)
}));

const StyledErrorText = styled("div")(({ theme }) => ({
  color: "red",
  fontSize: "12px"
}));

const Export = () => {
  const dispatch = useDispatch();
  const operationalModules = useSelector(
    state => state.reports.operationalModules
  );
  const exportJobStatuses = useSelector(
    state => state.reports.exportJobStatuses
  );
  const userInfo = useSelector(state => state.app.userInfo);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getOperationalModules());
  }, [dispatch]);

  const [exportRequest, dispatchFun] = useReducer(ExportReducer, initialState);
  const [enableExport, setEnableExport] = useState(false);
  const {
    reportType,
    subjectType,
    program,
    encounterType,
    startDate,
    endDate,
    addressLevelIds,
    addressLevelError,
    includeVoided
  } = exportRequest;
  const dispatchExport = (type, payload) => dispatchFun({ type, payload });
  const subjectTypes = _.get(operationalModules, "subjectTypes");
  const { programOptions, encounterTypeOptions } = applicableOptions(
    operationalModules,
    exportRequest
  );

  const onStartExportHandler = async () => {
    const [ok, error] = await api.startExportJob(getRequestBody(exportRequest));
    if (!ok && error) {
      alert(error);
    }
    setTimeout(() => dispatch(getUploadStatuses(0)), 1000);
  };

  const renderAddressLevel = () => {
    return (
      <Grid container direction="row">
        <Grid size={12}>
          <AddressLevelsByType
            label="Address (Leave blank to consider all)"
            addressLevelsIds={addressLevelIds}
            setAddressLevelsIds={ids => dispatchExport("addressLevelIds", ids)}
            setError={error => dispatchExport("AddressLevelError", error)}
          />
        </Grid>
        <Grid size={12}>
          <StyledErrorText>{addressLevelError}</StyledErrorText>
        </Grid>
      </Grid>
    );
  };

  const renderIncludeVoided = () => (
    <FormControlLabel
      control={
        <Checkbox
          color="primary"
          checked={includeVoided}
          name="Include voided entries"
          onChange={event =>
            dispatchExport("includeVoided", event.target.checked)
          }
        />
      }
      label="Include voided entries"
    />
  );

  const onReportTypeChange = type => {
    dispatchExport("reportType", type);
    setEnableExport(false);
  };

  const RenderReportTypes = () => {
    return (
      <FormControl component="fieldset">
        <FormLabel component="legend">Report Type</FormLabel>
        <FormGroup row>
          {ReportTypes.names.map(type => (
            <FormControlLabel
              key={type.name}
              control={
                <Radio
                  checked={type.name === reportType.name}
                  onChange={() => onReportTypeChange(type)}
                  value={type.name}
                />
              }
              label={type.name}
            />
          ))}
        </FormGroup>
      </FormControl>
    );
  };

  const commonProps = {
    dispatch: dispatchExport,
    startDate,
    endDate,
    subjectType,
    subjectTypes,
    setEnableExport
  };
  const reportTypeMap = {
    [reportTypes.Registration]: <RegistrationType {...commonProps} />,
    [reportTypes.Enrolment]: (
      <EnrolmentType
        {...commonProps}
        programOptions={programOptions}
        program={program}
      />
    ),
    [reportTypes.Encounter]: (
      <EncounterType
        {...commonProps}
        programOptions={programOptions}
        program={program}
        encounterTypeOptions={encounterTypeOptions}
        encounterType={encounterType}
      />
    ),
    [reportTypes.GroupSubject]: <GroupSubjectType {...commonProps} />
  };

  const renderReportTypeOptions = () => {
    return reportType.name ? reportTypeMap[reportType.name] : <Fragment />;
  };

  const allowReportGeneration = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.Analytics
  );

  return (
    <ScreenWithAppBar
      appbarTitle="Longitudinal Export"
      enableLeftMenuButton={true}
      sidebarOptions={reportSideBarOptions}
    >
      {operationalModules && (
        <div>
          <StyledBox>
            <DocumentationContainer filename="Report.md">
              {allowReportGeneration && (
                <Grid>
                  {RenderReportTypes()}
                  {renderReportTypeOptions()}
                  {!_.isEmpty(reportType.name) && renderAddressLevel()}
                  {!_.isEmpty(reportType.name) && renderIncludeVoided()}
                </Grid>
              )}
              {allowReportGeneration && (
                <StyledGrid container direction="row">
                  <Button
                    variant="contained"
                    color="primary"
                    aria-haspopup="false"
                    onClick={onStartExportHandler}
                    disabled={!enableExport}
                  >
                    Generate Export
                  </Button>
                  <StyledWarningText component="span">
                    {t("legacyLongitudinalExportWarningMessage")}
                  </StyledWarningText>
                </StyledGrid>
              )}
            </DocumentationContainer>
          </StyledBox>
          <Grid>
            <StyledPaper>
              <JobStatus
                exportJobStatuses={exportJobStatuses}
                operationalModules={operationalModules}
              />
            </StyledPaper>
          </Grid>
        </div>
      )}
    </ScreenWithAppBar>
  );
};

export default Export;
