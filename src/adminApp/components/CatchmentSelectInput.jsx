import { AutocompleteInput } from "react-admin";

export const CatchmentSelectInput = props => (
  <AutocompleteInput 
    {...props} 
    optionText="name" 
    resettable
    // Fix for dropdown floating issue - ensure proper z-index and positioning
    TextFieldProps={{
      ...props.TextFieldProps,
      sx: {
        '& .MuiAutocomplete-popper': {
          zIndex: 1300, // Higher than default Material-UI z-index values
        },
        ...props.TextFieldProps?.sx
      }
    }}
    // Ensure dropdown doesn't get clipped by container
    PopperProps={{
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'flip',
          enabled: true,
          options: {
            altBoundary: true,
            rootBoundary: 'document',
            padding: 8,
          },
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: false,
            rootBoundary: 'document',
            padding: 8,
          },
        },
      ],
      ...props.PopperProps
    }}
  />
);
