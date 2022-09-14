/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import DonutSmallTwoToneIcon from '@mui/icons-material/DonutSmallTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { AgGridColumnProps, AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import Select, {
  Props,
  createFilter,
  components,
  DropdownIndicatorProps,
} from 'react-select';
import './Dashboard.scss';
import useSWR from 'swr';

import { HcpcsAPI } from '../../utils/constants';
import { IFilters } from '../../utils/models/dashboard';
import {
  selectStyleForFilterT1,
  selectStyleForSearch,
} from '../../utils/styles/selectStyles';

// For Navbar Tabs and Settings Menu
const pages = ['Hcpcs Analysis'];
const settings = ['Profile', 'Account', 'Logout'];

// TEMP For Options react-select
const globalFilterVals = {
  hcpcs_class: [
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Cardiologys', value: 'Cardiologys' },
    { label: 'Cardiologyss', value: 'Cardiologyss' },
    { label: 'aCardiologys', value: 'aCardiologys' },
    { label: 'vCardiologys', value: 'vCardiologys' },
    { label: 'eeCardiologys', value: 'eeCardiologys' },
  ],
  hcpcs_category: [
    { label: 'Clinical Cardiology', value: 'Clinical Cardiology' },
  ],
  hcpcs_sub_category: [{ label: 'Diagnostic', value: 'Diagnostic' }],
  hcpcs_code: [
    {
      label: '93010-Electrocardiogram (Ecg/Ekg) Hospital Reading',
      value: '93010-Electrocardiogram (Ecg/Ekg) Hospital Reading',
    },
    {
      label: '93110-Electrocardiogram (Ecg/Ekg) Hospital Reading',
      value: '93110-Electrocardiogram (Ecg/Ekg) Hospital Reading',
    },
  ],
  loc_state: [{ label: 'dummy_1', value: 'dummy_1' }],
  loc_county: [{ label: 'dummy_1', value: 'dummy_1' }],
  loc_city: [{ label: 'dummy_1', value: 'dummy_1' }],
  loc_zipcode: [{ label: 'dummy_1', value: 'dummy_1' }],
  org_npi: [{ label: 'dummy_1', value: 'dummy_1' }],
  org_name: [{ label: 'dummy_1', value: 'dummy_1' }],
  physician_npi: [{ label: 'dummy_1', value: 'dummy_1' }],
  physician_name: [{ label: 'dummy_1', value: 'dummy_1' }],
  physician_speciality: [{ label: 'dummy_1', value: 'dummy_1' }],
};

// Custom Navbar Dropdown Indicator
const DropdownIndicator = (props: DropdownIndicatorProps) => (
  <components.DropdownIndicator {...props}>
    <SearchIcon
      color="inherit"
      sx={{
        height: 20,
        width: 20,
      }}
    />
  </components.DropdownIndicator>
);

// Custom MenuList Component;
const MenuList = (props: any) => {
  const {
    setMenuOpen,
    setReqFilter,
    setSelectFilter,
    checkedFilters,
    requestedFilter,
  } = props.selectProps;

  const selectAll = () => setSelectFilter({
    ...checkedFilters,
    [props.selectProps.name]: props.options.map((x: any) => x.value.toLowerCase()),
  });

  const clearAll = () => setSelectFilter({
    ...checkedFilters,
    [props.selectProps.name]: [],
  });

  return (
    <div className="custom-menulist-comp">
      <div className="custom-menulist-header">
        <Typography
          onMouseDown={(e) => {
            e.stopPropagation();
            selectAll();
          }}
          sx={{
            marginRight: 0,
            display: 'flex',
            color: '#219EBC',
            fontWeight: 700,
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          SELECT ALL
        </Typography>
        <Typography
          onMouseDown={(e) => {
            e.stopPropagation();
            clearAll();
          }}
          sx={{
            marginRight: 0,
            display: 'flex',
            color: '#219EBC',
            fontWeight: 700,
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          CLEAR
        </Typography>
      </div>
      <components.MenuList {...props}>{props.children}</components.MenuList>
      <div className="custom-menulist-footer">
        <Button
          size="small"
          variant="text"
          key={`${props.selectProps.name}-cancel`}
          onMouseDown={(e) => {
            e.stopPropagation();
            setSelectFilter(requestedFilter);
            setMenuOpen('');
          }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          key={`${props.selectProps.name}-done`}
          variant="contained"
          onMouseDown={(e) => {
            e.stopPropagation();
            setReqFilter(checkedFilters);
            setMenuOpen('');
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

// Custom Option Component;
const Option = (props: any) => (
  <div>
    <components.Option {...props}>
      <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
      <label>{props.label}</label>
    </components.Option>
  </div>
);

// Custom Value Container
const ValueContainer = ({ children, ...props }: any) => {
  const selected: any[] = props.getValue();
  const selectedNode: any[] = [];
  const allSelected: any[] = [];
  let total = 0;

  if (selected.length > 0) {
    children[0].forEach((x: any, i: number) => {
      if (i < 4) selectedNode.push(x);
      else total += 1;
    });
  }

  if (selected.length > 0 && selected.length === props.options.length) {
    allSelected.push(children[0][selected.length - 1]);
  }

  return (
    <components.ValueContainer {...props}>
      {allSelected.length > 0 ? (
        allSelected
      ) : (
        <>
          {selectedNode.length > 0 ? selectedNode : children[0]}
          {total > 0 && <span>{`+${total}`}</span>}
          {children[1]}
        </>
      )}
    </components.ValueContainer>
  );
};

// Custom Multi Value
const MultiValue = (props: any) => {
  let labelToPrint = props.data.label;
  const selected: any[] = props.getValue();
  if (selected.length > 1 && selected.length === props.options.length) {
    labelToPrint = 'All selected';
  }

  return (
    <components.MultiValue {...props}>{labelToPrint}</components.MultiValue>
  );
};

// Axios Interceptor Function
const axiosFetcher = (url: string, params: any) => axios
  .post(`${process.env.REACT_APP_API_URL}${url}`, params)
  .then((res) => res.data);

const Dashboard = () => {
  // Menu open state
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Select Menu state
  const [menuState, setMenuState] = useState<string>('');

  // Ag grid column definitions
  const [columnDefs, setColumnDefs] = useState<AgGridColumnProps[]>([]);

  // All filters for table data
  const [filters, setFilters] = useState(globalFilterVals);

  // Selected filters for API calling and table data
  const [requestKey, setRequestKey] = useState<IFilters>({
    hcpcs_class: [],
    hcpcs_category: [],
    hcpcs_sub_category: [],
    hcpcs_code: [],
    loc_state: [],
    loc_county: [],
    loc_city: [],
    loc_zipcode: [],
    org_npi: [],
    org_name: [],
    physician_npi: [],
    physician_name: [],
    physician_speciality: [],
  });

  // Selected filters for select elements
  const [selectedFilters, setSelectedFilters] = useState<IFilters>({
    hcpcs_class: [],
    hcpcs_category: [],
    hcpcs_sub_category: [],
    hcpcs_code: [],
    loc_state: [],
    loc_county: [],
    loc_city: [],
    loc_zipcode: [],
    org_npi: [],
    org_name: [],
    physician_npi: [],
    physician_name: [],
    physician_speciality: [],
  });

  // SWR fetch call for table data
  const { data: hcpcsData, isValidating } = useSWR(
    () => [HcpcsAPI.listByFilter, requestKey],
    axiosFetcher,
  );

  // Ag-grid coloumn props;
  useEffect(() => {
    const common: (ColDef | ColGroupDef)[] = [
      {
        headerName: 'Provider Information',
        headerClass: 'table-col-br',
        children: [
          {
            flex: 1.1,
            colId: 'physician-npi',
            field: 'Physician NPI',
            headerName: 'Physician NPI',
          },
          {
            flex: 1.15,
            colId: 'physician',
            field: 'Physician',
            headerName: 'Physician',
            cellClass: 'table-cell-text-center',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 2,
            colId: 'org-name',
            field: 'Org Name',
            headerName: 'Organisation',
            headerClass: 'table-header-text-start',
            cellClass: 'table-cell-text-start',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 2,
            colId: 'speciality',
            field: 'Speciality',
            headerName: 'Speciality',
            headerClass: 'table-header-text-start',
            cellClass: 'table-cell-text-start',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 1,
            colId: 'city',
            field: 'City',
            headerName: 'City',
            cellClass: 'table-cell-text-center',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 1,
            colId: 'state',
            field: 'State',
            headerClass: 'table-col-br',
            cellClass: 'table-col-br',
            headerName: 'State',
          },
          // {
          //   flex: 0.75,
          //   colId: 'zip',
          //   field: 'zip',
          //   cellClass: 'table-col-zipcode',
          //   headerName: 'Zipcode',
          // },
        ],
      },
      {
        headerName: 'Place Of Service',
        children: [
          {
            flex: 0.75,
            colId: 'asc',
            field: 'ASC',
            cellClass: 'table-col-br',
            headerName: 'ASC',
          },
          {
            flex: 0.75,
            colId: 'ip',
            field: 'IP',
            cellClass: 'table-col-br',
            headerName: 'IP',
          },
          {
            flex: 0.75,
            colId: 'op',
            field: 'OP',
            cellClass: 'table-col-br',
            headerName: 'OP',
          },
          {
            flex: 0.75,
            colId: 'office',
            field: 'OFFICE',
            cellClass: 'table-col-br',
            headerName: 'OFFICE',
          },
          {
            flex: 1,
            colId: 'total',
            field: 'Total',
            headerName: 'Total',
          },
        ],
      },
    ];
    setColumnDefs(common);
  }, [hcpcsData]);

  // Menu open event handle for Navbar
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Menu open event handle for Navbar
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle selecting only single option react-select
  useEffect(() => {
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key as keyof typeof filters]?.length === 1) {
          setSelectedFilters((s) => ({
            ...s,
            [key as keyof IFilters]: [
              filters[key as keyof typeof filters][0].value.toLowerCase(),
            ],
          }));
          setRequestKey((k) => ({
            ...k,
            [key as keyof IFilters]: [
              filters[key as keyof typeof filters][0].value.toLowerCase(),
            ],
          }));
        }
      });
    }
  }, [filters]);

  // Handle selecting all options where no selected filter react-select
  // useEffect(() => {
  //   if (filters) {
  //     setSelectedFilters((s) => {
  //       let temp = s;
  //       Object.keys(s).forEach((key) => {
  //         if (s[key as keyof IFilters]?.length === 0) {
  //           temp = {
  //             ...temp,
  //             [key as keyof IFilters]: filters[key as keyof typeof filters].map(
  //               (option) => option.value.toLowerCase(),
  //             ),
  //           };
  //         }
  //       });
  //       return temp;
  //     });
  //   }
  // }, [filters]);

  // Change Handlers for react-select
  const filterChangeHandler = (newValue: any, actionMeta: any) => {
    if (actionMeta.action === 'select-option') {
      setSelectedFilters({
        ...selectedFilters,
        [actionMeta.name]: newValue.map((x: any) => x.value.toLowerCase()),
      });
    } else if (actionMeta.action === 'deselect-option') {
      setSelectedFilters({
        ...selectedFilters,
        [actionMeta.name]: newValue.map((x: any) => x.value.toLowerCase()),
      });
    }
  };

  // Filter configs for react-select filters
  const filterConfigForSelect = {
    stringify: (option: any) => option.label,
  };

  return (
    <Container className="dashboard-container">
      {/* Navbar starts from here */}
      <AppBar position="static" className="navbar">
        <Toolbar disableGutters variant="dense">
          <DonutSmallTwoToneIcon sx={{ display: 'flex', marginRight: 2 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              marginRight: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HUMBI ANALYTICS
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pr: 3,
            }}
            className="tabbar"
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {pages.map((page, index) => (
                <Button
                  key={page}
                  className={index === 0 ? 'btn-selected' : ''}
                  sx={{
                    color: 'white',
                    display: 'block',
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>
            <Select
              components={{ DropdownIndicator }}
              value={null}
              styles={selectStyleForSearch}
              isDisabled={false}
              menuIsOpen={false}
              placeholder="Search"
            />
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              size="small"
              color="inherit"
              sx={{
                mr: 1,
              }}
            >
              <Badge variant="dot" color="warning" overlap="circular">
                <MailIcon
                  sx={{
                    width: 24,
                    height: 24,
                  }}
                />
              </Badge>
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              sx={{
                mr: 2,
              }}
            >
              <Badge variant="dot" overlap="circular" color="error">
                <NotificationsIcon
                  sx={{
                    width: 24,
                    height: 24,
                  }}
                />
              </Badge>
            </IconButton>
            <Tooltip title="Open settings">
              <IconButton
                size="small"
                onClick={handleOpenUserMenu}
                sx={{ padding: 0 }}
              >
                <Avatar
                  alt="HA"
                  sx={{
                    bgcolor: '#fb9017',
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    p: 0.25,
                  }}
                >
                  HA
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              className="menu-popped-navbar"
              sx={{ marginTop: '41px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main section starts from here */}
      <div className="main-content">
        {/* Filter section starts from here */}
        <div className="filter-section">
          <Accordion
            className="accordion"
            variant="outlined"
            defaultExpanded
            TransitionProps={{ unmountOnExit: true }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="summary-icon" />}
              className="summary"
            >
              <Typography>Hcpcs Filter</Typography>
            </AccordionSummary>
            <AccordionDetails className="detail">
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_class">
                  Hcpcs Class
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="hcpcs_class"
                  value={
                    filters?.hcpcs_class?.length > 0
                      ? filters?.hcpcs_class?.filter((x: any) => selectedFilters.hcpcs_class?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('hcpcs_class')}
                  menuIsOpen={menuState === 'hcpcs_class'}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.hcpcs_class}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_category">
                  Category
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="hcpcs_category"
                  value={
                    filters?.hcpcs_category?.length > 0
                      ? filters?.hcpcs_category?.filter((x: any) => selectedFilters.hcpcs_category?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('hcpcs_category')}
                  menuIsOpen={menuState === 'hcpcs_category'}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.hcpcs_category}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_sub_category">
                  Sub Category
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="hcpcs_sub_category"
                  value={
                    filters?.hcpcs_sub_category?.length > 0
                      ? filters?.hcpcs_sub_category?.filter((x: any) => selectedFilters.hcpcs_sub_category?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('hcpcs_sub_category')}
                  menuIsOpen={menuState === 'hcpcs_sub_category'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.hcpcs_sub_category}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_code">
                  Hcpcs Code
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="hcpcs_code"
                  value={
                    filters?.hcpcs_code?.length > 0
                      ? filters?.hcpcs_code?.filter((x: any) => selectedFilters.hcpcs_code?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('hcpcs_code')}
                  menuIsOpen={menuState === 'hcpcs_code'}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.hcpcs_code}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion
            className="accordion"
            variant="outlined"
            defaultExpanded
            TransitionProps={{ unmountOnExit: true }}
          >
            <AccordionSummary
              className="summary"
              expandIcon={<ExpandMoreIcon className="summary-icon" />}
            >
              <Typography>Geographic Filter</Typography>
            </AccordionSummary>
            <AccordionDetails className="detail">
              <div className="filter-container">
                <label className="filter-label" htmlFor="loc_state">
                  State
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="loc_state"
                  value={
                    filters?.loc_state?.length > 0
                      ? filters?.loc_state?.filter((x: any) => selectedFilters.loc_state?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('loc_state')}
                  menuIsOpen={menuState === 'loc_state'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.loc_state}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="loc_county">
                  County
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="loc_county"
                  value={
                    filters?.loc_county?.length > 0
                      ? filters?.loc_county?.filter((x: any) => selectedFilters.loc_county?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('loc_county')}
                  menuIsOpen={menuState === 'loc_county'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.loc_county}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="loc_city">
                  City
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="loc_city"
                  value={
                    filters?.loc_city?.length > 0
                      ? filters?.loc_city?.filter((x: any) => selectedFilters.loc_city?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('loc_city')}
                  menuIsOpen={menuState === 'loc_city'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.loc_city}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="loc_zipcode">
                  Zipcode
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="loc_zipcode"
                  value={
                    filters?.loc_zipcode?.length > 0
                      ? filters?.loc_zipcode?.filter((x: any) => selectedFilters.loc_zipcode?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('loc_zipcode')}
                  menuIsOpen={menuState === 'loc_zipcode'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.loc_zipcode}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion
            className="accordion"
            variant="outlined"
            defaultExpanded
            TransitionProps={{ unmountOnExit: true }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="summary-icon" />}
              className="summary"
            >
              <Typography>Provider Filters</Typography>
            </AccordionSummary>
            <AccordionDetails className="detail">
              <div className="filter-container">
                <label className="filter-label" htmlFor="org_npi">
                  Npi Org
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="org_npi"
                  value={
                    filters?.org_npi?.length > 0
                      ? filters?.org_npi?.filter((x: any) => selectedFilters.org_npi?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('org_npi')}
                  menuIsOpen={menuState === 'org_npi'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.org_npi}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="org_name">
                  Org Name
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="org_name"
                  value={
                    filters?.org_name?.length > 0
                      ? filters?.org_name?.filter((x: any) => selectedFilters.org_name?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('org_name')}
                  menuIsOpen={menuState === 'org_name'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.org_name}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="physician_npi">
                  Npi Doc
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="physician_npi"
                  value={
                    filters?.physician_npi?.length > 0
                      ? filters?.physician_npi?.filter((x: any) => selectedFilters.physician_npi?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('physician_npi')}
                  menuIsOpen={menuState === 'physician_npi'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.physician_npi}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="physician_name">
                  Physician
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="physician_name"
                  value={
                    filters?.physician_name?.length > 0
                      ? filters?.physician_name?.filter((x: any) => selectedFilters.physician_name?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('physician_name')}
                  menuIsOpen={menuState === 'physician_name'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.physician_name}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="physician_speciality">
                  Speciality
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="physician_speciality"
                  value={
                    filters?.physician_speciality?.length > 0
                      ? filters?.physician_speciality?.filter((x: any) => selectedFilters.physician_speciality?.includes(
                        x.value.toLowerCase(),
                      ))
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // @ts-ignore
                  setMenuOpen={setMenuState}
                  checkedFilters={selectedFilters}
                  requestedFilter={requestKey}
                  setSelectFilter={setSelectedFilters}
                  setReqFilter={setRequestKey}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('physician_speciality')}
                  menuIsOpen={menuState === 'physician_speciality'}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.physician_speciality}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
        {/* Table section starts from here */}
        <div className="table-section">
          <div className="table-toolbar">TABLE TOOLBAR</div>
          <div className="ag-theme-material table-container">
            <AgGridReact
              // frameworkComponents={{
              //   statusCellRenderer: (cellProps: any) => <span className="rva-custom-cell" style={{ background: DashboardAssetStatusColor[cellProps.value]?.background, color: DashboardAssetStatusColor[cellProps.value]?.text }}>{cellProps.value}</span>,
              // }}
              suppressCellFocus
              suppressMovableColumns
              suppressHorizontalScroll
              headerHeight={53}
              tooltipShowDelay={2000}
              pagination
              paginationPageSize={100}
              rowData={hcpcsData}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, resizable: true }}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
