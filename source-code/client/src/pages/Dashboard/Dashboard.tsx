/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridColumnsChangedEvent,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
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
  selectStyleGeneralDropdown,
} from '../../utils/styles/selectStyles';

// For Navbar Tabs and Settings Menu
const pages = ['HCPCS Analysis'];
const settings = ['Profile', 'Account', 'Logout'];
const typeOfStat = [
  { label: 'Professional', value: 0 },
  { label: 'Facility', value: 1 },
];

const sampleResObj: any = {
  year: '',
  npi_doc: '',
  hcpcs_code_description: 'Total',
  hcpcs_group: '',
  doc_specialty: '',
  loc_city: '',
  loc_state: '',
  loc_zip: '',
  loc_county: '',
  npi_org: '',
  org_name: '',
  phy_name: '',
  op_fac_unit_cost: '',
  asc_fac_unit_cost: '',
  srvs_asc_phy: 0,
  srvs_asc_fac: 0,
  srvs_ip_phy: 0,
  srvs_off: 0,
  srvs_op_phy: 0,
  srvs_op_fac: 1,
  total_savings: 1935.27,
  total: 1000,
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
    setFilterHistory,
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
            e.preventDefault();
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
            e.preventDefault();
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
            setFilterHistory((history: any[]) => {
              if (
                history.includes(props.selectProps.name)
                && checkedFilters[props.selectProps.name].length === 0
              ) {
                return history.filter((x: any) => x !== props.selectProps.name);
              }
              if (
                history.includes(props.selectProps.name)
                && checkedFilters[props.selectProps.name].length > 0
              ) {
                const temp = history.filter(
                  (x: any) => x !== props.selectProps.name,
                );
                return [...temp, props.selectProps.name];
              }
              return [...history, props.selectProps.name];
            });
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

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const calcTotalCols = [
  {
    colId: 'srvs_asc_fac', headerName: 'ASC Services', billType: 1, type: 'normal',
  },
  {
    colId: 'srvs_op_fac', headerName: 'OP Services', billType: 1, type: 'normal',
  },
  {
    colId: 'total_savings',
    headerName: 'Total Savings Possible',
    billType: 1,
    type: 'curr',
  },
  {
    colId: 'total', headerName: 'Total Serives', billType: 0, type: 'normal',
  },
  {
    colId: 'srvs_asc_phy',
    headerName: 'ASC Services',
    billType: 0,
    type: 'normal',
  },
  {
    colId: 'srvs_op_phy', headerName: 'OP Services', billType: 0, type: 'normal',
  },
  {
    colId: 'srvs_ip_phy', headerName: 'IP Services', billType: 0, type: 'normal',
  },
  {
    colId: 'srvs_off',
    headerName: 'Office Services',
    billType: 0,
    type: 'normal',
  },
];

const Dashboard = () => {
  // Menu open state
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Select Menu state
  const [menuState, setMenuState] = useState<string>('');

  // Threshold value setter
  const [thresholdVal, setThresholdVal] = useState<number>(100);

  // Selected measure to display
  const [selectedMeasure, setSelectedMeasure] = useState<number>(0);

  // Ag grid column definitions
  const [columnDefs, setColumnDefs] = useState<AgGridColumnProps[]>([]);

  // Selected filters for API calling and table data
  const [requestKey, setRequestKey] = useState<IFilters>({
    hcpcs_class: [],
    hcpcs_category: [],
    hcpcs_sub_category: [],
    hcpcs_code: [],
    hcpcs_code_description: [],
    loc_state: [],
    loc_county: [],
    loc_city: [],
    loc_zipcode: [],
    org_npi: [],
    org_name: [],
    physician_npi: [],
    physician_name: [],
    physician_speciality: [],
    threshold: 1,
  });

  // Selected filters for select elements
  const [selectedFilters, setSelectedFilters] = useState<IFilters>({
    hcpcs_class: [],
    hcpcs_category: [],
    hcpcs_sub_category: [],
    hcpcs_code: [],
    hcpcs_code_description: [],
    loc_state: [],
    loc_county: [],
    loc_city: [],
    loc_zipcode: [],
    org_npi: [],
    org_name: [],
    physician_npi: [],
    physician_name: [],
    physician_speciality: [],
    threshold: thresholdVal / 100,
  });

  // To maintain filter history
  const [filterHistory, setFilterHistory] = useState<string[]>([]);

  // To maintain kpi array
  const [kpi, setKpi] = useState<any[]>([]);

  // SWR fetch call for table data
  const { data: hcpcsData, isValidating } = useSWR(
    () => [HcpcsAPI.listByFilter, requestKey],
    axiosFetcher,
  );

  // All filters for table data
  const [filters, setFilters] = useState<any>({});

  // Set Filters on loading
  useEffect(() => {
    if (hcpcsData?.filters && !isValidating) {
      const temp = Object.entries(hcpcsData.filters)
        .filter((v: any) => !filterHistory.includes(v[0]))
        .reduce((prev, curr) => ({ ...prev, [curr[0]]: curr[1] }), {});
      setFilters((filter: any) => {
        Object.keys(temp).forEach((key) => {
          filter[key] = temp[key as keyof typeof temp];
        });
        return filter;
      });
    }
  }, [filterHistory, hcpcsData, isValidating]);

  // Ag-grid coloumn props;
  useEffect(() => {
    const common: (ColDef | ColGroupDef)[] = [
      {
        headerName: 'Procedure',
        headerClass: 'table-col-br',
        children: [
          {
            flex: 1.5,
            colId: 'hcpcs_code_description',
            field: 'hcpcs_code_description',
            headerName: 'HCPCS',
            cellClass: 'table-cell-text-start table-col-br',
            headerClass: 'table-header-text-center table-col-br',
            wrapText: true,
            autoHeight: true,
          },
        ],
      },
      {
        headerName: 'Provider Information',
        headerClass: 'table-col-br',
        children: [
          {
            flex: 0.9,
            colId: 'npi_doc',
            field: 'npi_doc',
            headerName: 'Physician NPI',
          },
          {
            flex: 1,
            colId: 'phy_name',
            field: 'phy_name',
            headerName: 'Physician',
            cellClass: 'table-cell-text-center',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 1.5,
            colId: 'org_name',
            field: 'org_name',
            headerName: 'Organization',
            headerClass: 'table-header-text-center',
            cellClass: 'table-cell-text-start',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 1.5,
            colId: 'doc_specialty',
            field: 'doc_specialty',
            headerName: 'Sub-Speciality',
            headerClass: 'table-header-text-center',
            cellClass: 'table-cell-text-start',
            wrapText: true,
            autoHeight: true,
          },
          {
            flex: 1,
            colId: 'loc',
            headerName: 'Location',
            headerClass: 'table-header-text-center table-col-br',
            cellClass: 'table-cell-text-start table-col-br',
            valueGetter: (params: any) => `${params.data.loc_city}${
              params.data.loc_city === '' ? '' : ','
            } ${params.data.loc_county}${
              params.data.loc_county === '' ? '' : ','
            } ${params?.data.loc_state?.toUpperCase()} ${
              params.data.loc_zip
            }`,
            wrapText: true,
            autoHeight: true,
          },
          // {
          //   flex: 1,
          //   colId: 'loc_city',
          //   field: 'loc_city',
          //   headerName: 'City',
          //   cellClass: 'table-cell-text-center',
          //   wrapText: true,
          //   autoHeight: true,
          // },
          // {
          //   flex: 1,
          //   colId: 'loc_state',
          //   field: 'loc_state',
          //   headerName: 'State',
          // },
          // {
          //   flex: 0.75,
          //   colId: 'loc_zip',
          //   field: 'loc_zip',
          //   headerClass: 'table-col-br',
          //   cellClass: 'table-col-br',
          //   headerName: 'Zipcode',
          // },
        ],
      },
      selectedMeasure === 0
        ? {
          headerName: 'Site Of Care (Professional )',
          children: [
            {
              flex: 0.7,
              colId: 'srvs_asc_phy',
              valueGetter: (params: any) => (params?.data.srvs_asc_phy === ''
                ? ''
                : numberFormatter.format(params?.data.srvs_asc_phy)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'ASC',
            },
            {
              flex: 0.7,
              colId: 'srvs_ip_phy',
              valueGetter: (params: any) => (params?.data.srvs_ip_phy === ''
                ? ''
                : numberFormatter.format(params?.data.srvs_ip_phy)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'IP',
            },
            {
              flex: 0.7,
              colId: 'srvs_op_phy',
              valueGetter: (params: any) => (params?.data.srvs_op_phy === ''
                ? ''
                : numberFormatter.format(params?.data.srvs_op_phy)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'OP',
            },
            {
              flex: 0.7,
              colId: 'srvs_off',
              valueGetter: (params: any) => (params?.data.srvs_off === ''
                ? ''
                : numberFormatter.format(params?.data.srvs_off)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'OFF',
            },
            {
              flex: 0.7,
              colId: 'total',
              valueGetter: (params: any) => (params?.data.total === ''
                ? ''
                : numberFormatter.format(params?.data.total)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerClass: 'table-col-br',
              headerName: 'Total',
              sort: 'desc',
            },
          ],
        }
        : { hide: true },
      selectedMeasure === 1
        ? {
          headerName: 'Site Of Care (Facility)',
          children: [
            {
              flex: 0.5,
              colId: 'srvs_op_fac',
              valueGetter: (params: any) => (params?.data.srvs_op_fac === ''
                ? ''
                : numberFormatter.format(params?.data.srvs_op_fac)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'OP',
            },
            {
              flex: 0.75,
              colId: 'op_fac_unit_cost',
              valueGetter: (params: any) => (params?.data.op_fac_unit_cost === ''
                ? ''
                : currencyFormatter.format(params?.data.op_fac_unit_cost)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'OP Rate',
              headerTooltip: 'OP Rate',
            },
            {
              flex: 0.5,
              colId: 'srvs_asc_fac',
              valueGetter: (params: any) => (params?.data.srvs_asc_fac === ''
                ? ''
                : numberFormatter.format(params?.data.srvs_asc_fac)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'ASC',
            },
            {
              flex: 0.75,
              colId: 'asc_fac_unit_cost',
              valueGetter: (params: any) => (params?.data.asc_fac_unit_cost === ''
                ? ''
                : currencyFormatter.format(params?.data.asc_fac_unit_cost)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              cellClass: 'table-col-br',
              headerName: 'ASC Rate',
              headerTooltip: 'ASC Rate',
            },
            {
              flex: 1,
              colId: 'total_savings',
              valueGetter: (params: any) => (params?.data.total_savings === ''
                ? ''
                : currencyFormatter.format(params?.data.total_savings)),
              comparator: (a: string, b: string) => {
                const valA = parseInt(a.replace('$', '').replace(',', ''));
                const valB = parseInt(b.replace('$', '').replace(',', ''));
                if (valA === valB) return 0;
                return valA > valB ? 1 : -1;
              },
              headerName: 'Savings',
              headerTooltip: 'Total Savings',
              sort: 'desc',
            },
          ],
        }
        : { hide: true },
    ];
    setColumnDefs(common);
  }, [hcpcsData, selectedMeasure]);

  // Menu open event handle for Navbar
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Menu open event handle for Navbar
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle selecting only single option react-select
  // useEffect(() => {
  //   if (filters) {
  //     Object.keys(filters).forEach((key) => {
  //       if (filters[key as keyof typeof filters]?.length === 1) {
  //         setSelectedFilters((s) => ({
  //           ...s,
  //           [key as keyof IFilters]: [
  //             filters[key as keyof typeof filters][0].value.toLowerCase(),
  //           ],
  //         }));
  //         setRequestKey((k) => ({
  //           ...k,
  //           [key as keyof IFilters]: [
  //             filters[key as keyof typeof filters][0].value.toLowerCase(),
  //           ],
  //         }));
  //       }
  //     });
  //   }
  // }, [filters]);

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

  // Handle toolbar select elements
  const toolbarFilterChangeHandler = (newValue: any, actionMeta: any) => {
    if (actionMeta.action === 'select-option') {
      setSelectedMeasure(newValue.value);
    }
  };

  // Change Handlers for threshold value
  const thresholdValHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (
      parseInt(e.currentTarget.value) > 0
      && parseInt(e.currentTarget.value) <= 100
    ) {
      setThresholdVal(parseInt(e.currentTarget.value));
    }
    if (e.currentTarget.value === '') setThresholdVal(NaN);
  };

  // Filter configs for react-select filters
  const filterConfigForSelect = {
    stringify: (option: any) => option.label,
  };

  // Ag grid On Ready Add pinned data
  const getKpis = (readyEvent: GridColumnsChangedEvent) => {
    const tempArr: any = [];

    // Tp Handle overall data
    calcTotalCols.forEach((col) => {
      if (selectedMeasure === col.billType) {
        let obj: any = 0;
        readyEvent.api.forEachNode((rowNode: RowNode) => {
          obj += parseInt(rowNode.data[col.colId]);
        });
        obj = col.type === 'normal' ? numberFormatter.format(obj) : currencyFormatter.format(obj);
        tempArr.push({ name: col.headerName, value: obj });
      }
    });

    setKpi(tempArr);
  };

  // For Humbi Logo
  const path = `${process.env.PUBLIC_URL}assets/`;
  const image = 'logo.svg';

  return (
    <Container className="dashboard-container">
      {/* Navbar starts from here */}
      <AppBar position="static" className="navbar">
        <Toolbar disableGutters variant="dense">
          <img width={50} height={30} src={path + image} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              marginLeft: 1,
              marginRight: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: '#023047',
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
              justifyContent: 'center',
              textTransform: 'uppercase',
              pr: 3,
            }}
            className="tabbar"
          >
            Cardiology Site Of Care Optimization Tool
          </Box>

          <Box sx={{ flexGrow: 0 }}>
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
              <Typography sx={{ fontSize: 14 }}>HCPCS Filters</Typography>
            </AccordionSummary>
            <AccordionDetails className="detail">
              <div className="filter-container">
                <label className="filter-label" htmlFor="hcpcs_class">
                  HCPCS Class
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
                <label
                  className="filter-label"
                  htmlFor="hcpcs_code_description"
                >
                  HCPCS Code
                </label>
                <Select
                  components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    MultiValue,
                  }}
                  name="hcpcs_code_description"
                  value={
                    filters?.hcpcs_code_description?.length > 0
                      ? filters?.hcpcs_code_description?.filter((x: any) => selectedFilters.hcpcs_code_description?.includes(
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
                  setFilterHistory={setFilterHistory}
                  onChange={filterChangeHandler}
                  onMenuClose={() => {
                    setMenuState('');
                    setSelectedFilters(requestKey);
                  }}
                  onMenuOpen={() => setMenuState('hcpcs_code_description')}
                  menuIsOpen={menuState === 'hcpcs_code_description'}
                  openMenuOnFocus
                  captureMenuScroll
                  openMenuOnClick
                  closeMenuOnSelect={false}
                  menuPlacement="auto"
                  className="filter-select"
                  placeholder="No Selection"
                  options={filters?.hcpcs_code_description}
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
              <Typography sx={{ fontSize: 14 }}>Geographic Filters</Typography>
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
              <Typography sx={{ fontSize: 14 }}>Provider Filters</Typography>
            </AccordionSummary>
            <AccordionDetails className="detail">
              <div className="filter-container">
                <label className="filter-label" htmlFor="org_npi">
                  NPI Org
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
                  NPI Doc
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
                  setFilterHistory={setFilterHistory}
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
          {/* Table toolbar section */}
          <div className="table-toolbar">
            <div className="table-kpis">
              {kpi?.map((element: any, index: number) => <div className="kpi-card" key={`kpi-card-${index}`}>
                <div className="kpi-value-container">
                  <p className="text">{element.value}</p>
                </div>
                <div className="kpi-headerName-container">
                  <p className="text">{element.name}</p>
                </div>
              </div>)}
            </div>
            <div className="table-inputs">
              <div className="table-threshold-input">
                <label htmlFor="threshold-input" className="threshold-label">
                  OP-ASC Fac Shift %
                </label>
                <TextField
                  size="small"
                  InputLabelProps={{ shrink: false }}
                  value={thresholdVal}
                  onChange={thresholdValHandler}
                  type="number"
                  name="threshold-input"
                  className="threshold-input"
                  inputProps={{ min: 1, max: 100 }}
                />
                {thresholdVal / 100 !== requestKey.threshold && (
                  <CancelOutlinedIcon
                    color="error"
                    sx={{ mr: 0.5, ml: 1 }}
                    onClick={() => setThresholdVal(requestKey.threshold * 100)}
                  />
                )}
                {thresholdVal / 100 !== requestKey.threshold && (
                  <CheckCircleOutlineIcon
                    color="success"
                    onClick={() => {
                      if (!isNaN(thresholdVal)) {
                        setSelectedFilters((s) => ({
                          ...s,
                          threshold: thresholdVal / 100,
                        }));
                        setRequestKey((r) => ({
                          ...r,
                          threshold: thresholdVal / 100,
                        }));
                      }
                    }}
                  />
                )}
              </div>
              <div className="table-opt-input">
                <label className="opt-label" htmlFor="type-of-service">
                  Select Bill Type
                </label>
                <Select
                  name="type-of-service"
                  value={typeOfStat.find((x) => x.value === selectedMeasure)}
                  styles={selectStyleGeneralDropdown}
                  onChange={toolbarFilterChangeHandler}
                  closeMenuOnSelect
                  menuPlacement="bottom"
                  className="opt-select"
                  placeholder="No selection"
                  options={typeOfStat}
                  filterOption={createFilter(filterConfigForSelect)}
                />
              </div>
            </div>
          </div>
          {/* Table from here */}
          <div className="ag-theme-material table-container">
            {isValidating ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress color="success" />
              </Box>
            ) : (
              <AgGridReact
                suppressCellFocus
                suppressMovableColumns
                suppressHorizontalScroll
                onGridColumnsChanged={(e) => setTimeout(() => getKpis(e), 500)}
                tooltipShowDelay={2000}
                pagination
                paginationPageSize={100}
                rowData={hcpcsData?.data}
                columnDefs={columnDefs}
                defaultColDef={{ sortable: true, resizable: true }}
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
