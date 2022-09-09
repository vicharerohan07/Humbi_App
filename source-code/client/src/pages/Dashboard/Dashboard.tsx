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
  alpha,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { AgGridColumnProps, AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import Select, {
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
const pages = ['Hcpcs Analysis', 'Physician Analysis'];
const settings = ['Profile', 'Account', 'Logout'];

// TEMP For Options react-select
const globalFilterVals = {
  hcpcs_class: [{ label: 'Cardiology', value: 'Cardiology' }],
  hcpcs_category: [
    { label: 'Clinical Cardiology', value: 'Clinical Cardiology' },
  ],
  hcpcs_sub_category: [{ label: 'Diagnostic', value: 'Diagnostic' }],
  hcpcs_code: [
    {
      label: '93010-Electrocardiogram (Ecg/Ekg) Hospital Reading',
      value: '93010',
    },
  ],
  loc_state: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  loc_county: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  loc_city: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  loc_zipcode: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  org_npi: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  org_name: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  physician_npi: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  physician_name: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
  physician_speciality: [
    { label: 'dummy_1', value: '1' },
    { label: 'dummy_2', value: '2' },
    { label: 'dummy_3', value: '3' },
    { label: 'dummy_4', value: '4' },
    { label: 'dummy_5', value: '5' },
    { label: 'dummy_6', value: '6' },
  ],
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
const MenuList = (props: any) => (
  <div className="custom-menulist-comp">
    <div className="custom-menulist-header">
      <Typography
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
      <Button size="small" variant="text">
        Cancel
      </Button>
      <Button size="small" variant="contained">
        Done
      </Button>
    </div>
  </div>
);

// Custom Option Component;
const Option = (props: any) => (
  <div>
    <components.Option {...props}>
      <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
      <label>{props.label}</label>
    </components.Option>
  </div>
);

// Axios Interceptor Function
const axiosFetcher = (url: string, params: any) => axios
  .post(`${process.env.REACT_APP_API_URL}${url}`, { params: { ...params } })
  .then((res) => res.data);

const Dashboard = () => {
  // Menu open state
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Ag grid column definitions
  const [columnDefs, setColumnDefs] = useState<AgGridColumnProps[]>([]);

  // All filters for table data
  const [filters, setFilters] = useState(globalFilterVals);

  // Selected filters for table data
  const [selectedFilters, setSelectedFilters] = useState<IFilters>({
    hcpcs_class: [],
    hcpcs_category: [],
    hcpcs_sub_category: [],
    hcpcs_code: [],
  });

  // SWR fetch call for table data
  const {
    data: hcpcsData,
    mutate: fetchHcpcsData,
    isValidating,
  } = useSWR(() => [HcpcsAPI.listByFilter, selectedFilters], axiosFetcher);

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

  // Change Handlers for react-select

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
                  components={{ Option, MenuList }}
                  name="hcpcs_class"
                  value={
                    filters.hcpcs_class.length > 0
                      ? filters.hcpcs_class[0]
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.hcpcs_class}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_category">
                  Category
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="hcpcs_category"
                  value={
                    filters.hcpcs_category.length > 0
                      ? filters.hcpcs_category[0]
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.hcpcs_category}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_sub_category">
                  Sub Category
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="hcpcs_sub_category"
                  value={
                    filters.hcpcs_sub_category.length > 0
                      ? filters.hcpcs_sub_category[0]
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.hcpcs_sub_category}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_code">
                  Hcpcs Code
                </label>
                <Select
                  components={{ MenuList }}
                  name="hcpcs_code"
                  value={
                    filters.hcpcs_code.length > 0 ? filters.hcpcs_code[0] : null
                  }
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.hcpcs_code}
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
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
              className="summary"
              expandIcon={<ExpandMoreIcon className="summary-icon" />}
            >
              <Typography>Geographic Filter</Typography>
            </AccordionSummary>
            <AccordionDetails className="detail">
              <div className="filter-container">
                <label className="filter-label" htmlFor="state">
                  State
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="state"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.loc_state}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="county">
                  County
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="county"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.loc_county}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="city">
                  City
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="city"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.loc_city}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="zip-code">
                  Zipcode
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="zip-code"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.loc_zipcode}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
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
                <label className="filter-label" htmlFor="npi-org">
                  Npi Org
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="npi-org"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.org_npi}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="org-name">
                  Org Name
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="org-name"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.org_name}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="npi-doc">
                  Npi Doc
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="npi-doc"
                  value={
                    filters.physician_npi.length > 0
                      ? [filters.physician_npi[0], filters.physician_npi[1], filters.physician_npi[2], filters.physician_npi[4]]
                      : null
                  }
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.physician_npi}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="physician">
                  Physician
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="physician"
                  value={filters.physician_name.length > 0 ? filters.physician_name[0] : null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.physician_name}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="filter-container">
                <label className="filter-label" htmlFor="speciality">
                  Speciality
                </label>
                <Select
                  components={{ Option, MenuList }}
                  name="speciality"
                  value={null}
                  styles={selectStyleForFilterT1}
                  // onChange={handleSelectTemplateChange}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters.physician_speciality}
                  isMulti
                  hideSelectedOptions={false}
                  filterOption={createFilter(filterConfigForSelect)}
                  closeMenuOnSelect={false}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Table section starts from here */}
        <div className="table-section">
          <div className="ag-theme-material table-container">
            <AgGridReact
              // frameworkComponents={{
              //   statusCellRenderer: (cellProps: any) => <span className="rva-custom-cell" style={{ background: DashboardAssetStatusColor[cellProps.value]?.background, color: DashboardAssetStatusColor[cellProps.value]?.text }}>{cellProps.value}</span>,
              // }}
              suppressCellSelection
              suppressMovableColumns
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
