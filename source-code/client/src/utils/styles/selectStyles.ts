const selectStyleForFilterT1 = {
  clearIndicator: (base: any) => ({
    ...base,
    display: 'none',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    padding: 4,
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    margin: 0,
    width: 0.5,
  }),
  multiValue: (base: any) => ({
    ...base,
    maxWidth: '90% !important',
    width: 'fit-content !important',
    paddingRight: 2,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    backgroundColor: '#e6e6e6 !important',
    borderRadius: 4,
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    display: 'none',
  }),
  valueContainer: (base: any) => ({
    ...base,
    minHeight: 28,
    position: 'unset !important',
  }),
  control: (base: any, state: any) => ({
    ...base,
    width: '-webkit-fill-available',
    borderRadius: 4,
    marginRight: 0,
    fontSize: 12,
    minHeight: 28,
    paddingInline: 0,
    boxShadow: state.menuIsOpen ? '0 0 0 1px #126782' : '',
    border: state.isFocused ? '1px solid #126782 !important' : '',
    '&:hover': {
      borderColor: state.isFocused ? '#126782 !important' : '',
    },
  }),
  menu: (base: any) => ({
    ...base,
    width: '-webkit-fill-available',
    borderRadius: 4,
    boxShadow: '0 0 0 1px #126782',
    hyphens: 'auto',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'left',
    wordWrap: 'break-word',
    fontSize: 12,
    paddingInline: 0,
  }),
  menuList: (base: any) => ({
    ...base,
    width: '-webkit-fill-available',
    borderRadius: 4,
    fontSize: 12,
    paddingInline: 2,
    paddingTop: 2,
    paddingBottom: 2,
    maxHeight: 148,
  }),
  option: (base: any, state: any) => ({
    ...base,
    display: 'flex',
    flexDirection: 'row',
    columnGap: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 2,
    color: '#555',
    backgroundColor:
      state.isFocused || state.isSelected ? '#c9e5ee !important' : '',
    '&:hover': {
      backgroundColor: '#b6d8e3 !important',
    },
  }),
};

const selectStyleGeneralDropdown = {
  clearIndicator: (base: any) => ({
    ...base,
    display: 'none',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    padding: 4,
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    margin: 0,
    width: 0.5,
  }),
  valueContainer: (base: any) => ({
    ...base,
    minHeight: 28,
    position: 'unset !important',
  }),
  control: (base: any, state: any) => ({
    ...base,
    width: 125,
    borderRadius: 4,
    marginRight: 0,
    fontSize: 12,
    minHeight: 28,
    paddingInline: 0,
    boxShadow: state.menuIsOpen ? '0 0 0 1px #126782' : '',
    border: state.isFocused ? '1px solid #126782 !important' : '',
    '&:hover': {
      borderColor: state.isFocused ? '#126782 !important' : '',
    },
  }),
  menu: (base: any) => ({
    ...base,
    width: 125,
    borderRadius: 4,
    boxShadow: '0 0 0 1px #126782',
    hyphens: 'auto',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'left',
    wordWrap: 'break-word',
    fontSize: 12,
    paddingInline: 0,
  }),
  menuList: (base: any) => ({
    ...base,
    width: 125,
    borderRadius: 4,
    fontSize: 12,
    paddingInline: 2,
    paddingTop: 2,
    paddingBottom: 2,
    maxHeight: 148,
  }),
  option: (base: any, state: any) => ({
    ...base,
    display: 'flex',
    flexDirection: 'row',
    columnGap: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 2,
    color: '#555',
    backgroundColor:
      state.isFocused || state.isSelected ? '#c9e5ee !important' : '',
    '&:hover': {
      backgroundColor: '#b6d8e3 !important',
    },
  }),
};

const selectStyleForSearch = {
  clearIndicator: (base: any) => ({
    ...base,
    display: 'none',
  }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    padding: 4,
    color: '#fff',
    '&:hover': {
      color: state.isFocused ? '#fff !important' : '',
    },
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    display: 'none',
  }),
  ValueContainer: (base: any) => ({
    ...base,
    color: '#fff !important',
    backgroudColor: '#126782',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#a7a7a7 !important',
  }),
  input: (base: any) => ({
    ...base,
    color: '#fff !important',
  }),
  control: (base: any, state: any) => ({
    ...base,
    width: '250px',
    borderRadius: 4,
    marginRight: 0,
    fontSize: 12,
    minHeight: 28,
    paddingInline: 0,
    backgroundColor: '#126782',
    boxShadow: state.menuIsOpen ? '0 0 0 1px #126782' : '',
    border: state.isFocused
      ? '2px solid #126782 !important'
      : '1px solid #126782 !important',
    '&:hover': {
      borderColor: state.isFocused ? '#126782 !important' : '',
    },
  }),
};

export { selectStyleForFilterT1, selectStyleForSearch, selectStyleGeneralDropdown };
