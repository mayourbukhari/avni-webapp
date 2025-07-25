import { useReducer, useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Title } from "react-admin";
import { LabelFileName } from "./LabelFileName";
import {
  checkForErrors,
  ExtensionReducer,
  extensionScopeTypes
} from "./ExtensionReducer";
import { get, isEmpty, map } from "lodash";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { httpClient as http } from "common/utils/httpClient";
import CustomizedBackdrop from "../../../dataEntryApp/components/CustomizedBackdrop";
import { getErrorByKey } from "../../common/ErrorUtil";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  padding: theme.spacing(5),
  backgroundColor: theme.palette.background.paper
}));

const initialState = {
  labelFileNames: [],
  file: null,
  errors: []
};

const Extensions = () => {
  const userInfo = useSelector(state => state.app.userInfo);
  const [print, dispatch] = useReducer(ExtensionReducer, initialState);
  const [value, setValue] = useState("");
  const [load, setLoad] = useState(false);
  const { errors, file, labelFileNames, scopeOptions } = print;

  useEffect(() => {
    http
      .fetchJson("/web/organisationConfig")
      .then(response => response.json)
      .then(res => {
        dispatch({
          type: "setData",
          payload: get(res, "organisationConfig.extensions", [])
        });
      });
  }, []);

  useEffect(() => {
    http
      .fetchJson("/web/operationalModules")
      .then(response => response.json)
      .then(om => dispatch({ type: "setScopeOptions", payload: om }));
  }, []);

  const onFileSelect = event => {
    const fileReader = new FileReader();
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      fileReader.readAsText(selectedFile);
    }
    setValue(event.target.value);
    fileReader.onloadend = () => {
      const error = dispatch({ type: "setFile", payload: selectedFile });
      if (error) {
        alert(error);
      }
    };
  };

  const onSave = () => {
    const errors = checkForErrors(print);
    if (isEmpty(errors)) {
      setLoad(true);
      const formData = new FormData();
      const extensionSettings = new Blob([JSON.stringify(labelFileNames)], {
        type: "application/json"
      });
      formData.append("extensionSettings", extensionSettings);
      formData.append("file", file);
      http
        .post("/extension/upload", formData)
        .then(res => {
          if (res.status === 200) {
            setLoad(false);
          }
        })
        .catch(error => {
          setLoad(false);
          const errorMessage = `${get(error, "response.data") ||
            get(error, "message") ||
            "unknown error"}`;
          alert(`Error while uploading the data\n ${errorMessage}`);
          console.error(error);
        });
    } else {
      dispatch({ type: "setErrors", payload: errors });
    }
  };

  const renderSettings = () => {
    const getScopeDisplayValue = ({ scopeType, name }) =>
      scopeType === extensionScopeTypes.subjectDashboard
        ? `${name} Dashboard`
        : scopeType === extensionScopeTypes.programEnrolment
        ? `${name} Program Enrolment`
        : name;
    const getOption = scope => ({
      label: getScopeDisplayValue(scope),
      value: scope
    });
    const options = map(scopeOptions, scope => getOption(scope));
    return map(labelFileNames, ({ label, fileName, extensionScope }, index) => (
      <LabelFileName
        key={index}
        dispatch={dispatch}
        label={label}
        fileName={fileName}
        index={index}
        scope={isEmpty(extensionScope) ? "" : getOption(extensionScope)}
        options={options}
      />
    ));
  };

  return (
    <StyledBox>
      <Title title="Extensions" />
      <DocumentationContainer filename="Prints.md">
        <div className="container">
          <Grid container direction="column" spacing={5}>
            <Grid>
              {renderSettings()}
              {getErrorByKey(errors, "EMPTY_SETTING")}
            </Grid>
            <Grid>
              <Button
                color="primary"
                onClick={() => dispatch({ type: "newSetting" })}
              >
                Add more extensions
              </Button>
            </Grid>
            <Grid container direction="column" item>
              <Grid>
                <input type="file" value={value} onChange={onFileSelect} />
              </Grid>
              <Grid>{getErrorByKey(errors, "EMPTY_FILE")}</Grid>
            </Grid>
            {UserInfo.hasPrivilege(
              userInfo,
              Privilege.PrivilegeType.EditExtension
            ) && (
              <Grid>
                <Button variant="contained" color="primary" onClick={onSave}>
                  Save
                </Button>
              </Grid>
            )}
          </Grid>
        </div>
        <CustomizedBackdrop load={load} />
      </DocumentationContainer>
    </StyledBox>
  );
};

export default Extensions;
