import React, { useRef, useMemo, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Box, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import PfServiceInstance from 'service/service.purhaseflow';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';

import { TItemMaterialRequest } from 'pages/Purchasefolder/type/materrequest_pf-types';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// import { Grid } from 'lucide-react';
import { Grid } from '@mui/material';
import CustomAlert from 'components/@extended/CustomAlert';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { dispatch } from 'store';

interface ProdOption {
  prod_code: string;
  prod_name: string;
  upp: number;
  p_uom?: string;
  l_uom?: string;
}

interface CostOption {
  cost_code: string;
  cost_name: string;
}

interface ProjectOption {
  project_code: string;
  project_name: string;
}

interface CostListResponse {
  tableData: CostOption[];
  count: number;
}

interface ProdListResponse {
  tableData: ProdOption[];
  count: number;
}

interface ProjectListResponse {
  tableData: ProjectOption[];
  count: number;
}

interface MaterialItemDetailsGridProps {
  items: TItemMaterialRequest[];
  isEditMode: boolean;
  onItemsChange: (updatedItems: TItemMaterialRequest[]) => void;
}

interface PrimaryUomOption {
  p_uom: string;
  uom_code: string;
  uom_name: string;
  // cost_name: string;
}

interface PrimaryUomResponse {
  tableData: PrimaryUomOption[];
  count: number;
}
interface SecondaryUomOption {
  l_uom: string;
  uom_code: string;
  uom_name: string;
  // cost_name: string;
}

interface SecondaryUomResponse {
  tableData: SecondaryUomOption[];
  count: number;
}

const AddRowPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onAdd: (newItem: TItemMaterialRequest) => void;
  prodList: ProdOption[];
  costList: CostOption[];
  uomList: PrimaryUomOption[];
  l_uomList: SecondaryUomOption[];
  projectList: ProjectOption[];
  initialData?: TItemMaterialRequest;
}> = ({ open, onClose, onAdd, prodList, costList, projectList, uomList, l_uomList, initialData }) => {
  const [formData, setFormData] = useState<TItemMaterialRequest>(
    initialData || {
      item_code: '',
      item_rate: 0,
      p_uom: '',
      l_uom: '',
      item_p_qty: 0,
      item_l_qty: 0,
      from_cost_code: '',
      to_cost_code: '',
      from_project_code: '',
      to_project_code: ''
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        item_code: '',
        item_rate: 0,
        p_uom: '',
        l_uom: '',
        item_p_qty: 0,
        item_l_qty: 0,
        from_cost_code: '',
        to_cost_code: '',
        from_project_code: '',
        to_project_code: ''
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof TItemMaterialRequest, value: any) => {
    if (field === 'item_code') {
      const prod = prodList.find((p) => p.prod_code === value);
      if (prod) {
        setFormData((prev) => ({
          ...prev,
          item_rate: prod.upp || 0,
          item_code: value
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const errors = [];

    if (!formData.from_project_code) {
      errors.push('From Project Code is required.');
    }

    if (!formData.to_project_code) {
      errors.push('To Project Code is required.');
    }

    if (!formData.item_code) {
      errors.push('Product Code is required.');
    }

    if (!formData.item_p_qty && !formData.item_l_qty) {
      errors.push('Primary Quantity or Secondary Quantity one of them is required.');
    }
    // Validate Primary Quantity
    if (formData.item_p_qty) {
      if (formData.item_p_qty < 0) {
        errors.push('Primary Quantity always greater than 0.');
      }
      if (formData.item_p_qty && !formData.p_uom) {
        errors.push('Primary UOM is required when Primary Quantity is provided.');
      }
    }

    if (formData.item_l_qty) {
      if (formData.item_l_qty < 0) {
        errors.push('Secondary Quantity always greater than 0.');
      }
      if (formData.item_l_qty && !formData.l_uom) {
        errors.push('Secondary UOM is required when Primary Quantity is provided.');
      }
    }

    // Prevent same from/to project code
    if (formData.from_project_code && formData.to_project_code && formData.from_project_code === formData.to_project_code) {
      errors.push('From Project Code and To Project Code must be different.');
    }

    if (errors.length > 0) {
      dispatch(
        showAlert({
          open: true,
          message: errors.join(' '),
          severity: 'error'
        })
      );
      return;
    }

    // All validations passed
    onAdd(formData);
    setFormData(
      initialData || {
        item_code: '',
        item_rate: 0,
        p_uom: '',
        l_uom: '',
        item_p_qty: 0,
        item_l_qty: 0,
        from_cost_code: '',
        to_cost_code: '',
        from_project_code: '',
        to_project_code: ''
      }
    );
    onClose();
  };

  console.log('uomList in addrow', uomList);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Item' : 'Add New Item'}</DialogTitle>
      <DialogContent dividers>
        <div style={{ paddingLeft: 8, paddingRight: 8 }}>
          <CustomAlert />
        </div>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              select
              label="From Project Code"
              fullWidth
              margin="normal"
              value={formData.from_project_code}
              onChange={(e) => handleChange('from_project_code', e.target.value)}
            >
              {projectList
                .filter((proj) => proj.project_code !== formData.to_project_code)
                .map((proj) => (
                  <MenuItem key={proj.project_code} value={proj.project_code}>
                    {proj.project_code} - {proj.project_name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="To Project Code"
              fullWidth
              margin="normal"
              value={formData.to_project_code}
              onChange={(e) => handleChange('to_project_code', e.target.value)}
            >
              {projectList
                .filter((proj) => proj.project_code !== formData.from_project_code)
                .map((proj) => (
                  <MenuItem key={proj.project_code} value={proj.project_code}>
                    {proj.project_code} - {proj.project_name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              select
              label="From Cost Code"
              fullWidth
              margin="normal"
              value={formData.from_cost_code}
              onChange={(e) => handleChange('from_cost_code', e.target.value)}
            >
              {costList.map((cost) => (
                <MenuItem key={cost.cost_code} value={cost.cost_code}>
                  {cost.cost_code} - {cost.cost_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="To Cost Code"
              fullWidth
              margin="normal"
              value={formData.to_cost_code}
              onChange={(e) => handleChange('to_cost_code', e.target.value)}
            >
              {costList.map((cost) => (
                <MenuItem key={cost.cost_code} value={cost.cost_code}>
                  {cost.cost_code} - {cost.cost_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          select
          label="Product Code"
          fullWidth
          margin="normal"
          value={formData.item_code}
          onChange={(e) => handleChange('item_code', e.target.value)}
          required
        >
          {prodList.map((prod) => (
            <MenuItem key={prod.prod_code} value={prod.prod_code}>
              {prod.prod_code} - {prod.prod_name}
            </MenuItem>
          ))}
        </TextField>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              label="Primary Qty"
              type="number"
              fullWidth
              margin="normal"
              value={formData.item_p_qty}
              onChange={(e) => handleChange('item_p_qty', parseFloat(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              label="Primary UOM"
              fullWidth
              margin="normal"
              value={formData.p_uom}
              onChange={(e) => handleChange('p_uom', e.target.value)}
              required
            >
              {uomList.map((prod) => (
                <MenuItem key={prod.uom_code} value={prod.uom_code}>
                  {prod.uom_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Secondary Qty"
              type="number"
              fullWidth
              margin="normal"
              value={formData.item_l_qty}
              onChange={(e) => handleChange('item_l_qty', parseFloat(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              label="Secondary UOM"
              fullWidth
              margin="normal"
              value={formData.l_uom}
              onChange={(e) => handleChange('l_uom', e.target.value)}
              required
            >
              {l_uomList.map((prod) => (
                <MenuItem key={prod.uom_code} value={prod.uom_code}>
                  {prod.uom_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <TextField
          label="Item Rate"
          type="number"
          fullWidth
          margin="normal"
          value={formData.item_rate}
          onChange={(e) => handleChange('item_rate', parseFloat(e.target.value) || 0)}
        />
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-start' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MaterialItemDetailsGrid: React.FC<MaterialItemDetailsGridProps> = ({ items, isEditMode, onItemsChange }) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const gridRef = useRef<AgGridReact<TItemMaterialRequest>>(null);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  const { data: projectList } = useQuery<ProjectListResponse>({
    queryKey: ['project_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      const response = await PfServiceInstance.getMasters(app, 'dropdwonprojectmaster');
      return response ? { tableData: response.tableData as ProjectOption[], count: response.count } : { tableData: [], count: 0 };
    },
    enabled: !!app
  });

  const { data: prodList } = useQuery<ProdListResponse>({
    queryKey: ['prod_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      const response = await GmPfServiceInstance.getddProductMaster('10');
      const transformedData = (Array.isArray(response) ? response : [response]).map((item) => ({
        prod_code: item.prod_code || '',
        prod_name: item.prod_name || '',
        upp: item.upp || 0,
        p_uom: item.p_uom || '',
        l_uom: item.l_uom || '',
        ...item
      }));
      return {
        tableData: transformedData,
        count: transformedData.length
      };
    },
    enabled: !!app
  });

  const { data: costList } = useQuery<CostListResponse>({
    queryKey: ['cost_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      const response = await PfServiceInstance.getMasters(app, 'ddcostmaster');
      return response ? { tableData: response.tableData as CostOption[], count: response.count } : { tableData: [], count: 0 };
    },
    enabled: !!app
  });

  const { data: uomList } = useQuery<PrimaryUomResponse>({
    queryKey: ['uom_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      const response = await PfServiceInstance.getMasters(app, 'dduommaster');
      return response ? { tableData: response.tableData as PrimaryUomOption[], count: response.count } : { tableData: [], count: 0 };
    },
    enabled: !!app
  });

  const { data: l_uomList } = useQuery<SecondaryUomResponse>({
    queryKey: ['uom_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      const response = await PfServiceInstance.getMasters(app, 'dduommaster');
      return response ? { tableData: response.tableData as SecondaryUomOption[], count: response.count } : { tableData: [], count: 0 };
    },
    enabled: !!app
  });

  console.log('working api', uomList);

  const handleDeleteItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  const handleEditItem = (index: number) => {
    setEditIndex(index);
    setPopupOpen(true);
  };

  const columnDefs: ColDef<TItemMaterialRequest>[] = useMemo(
    () => [
      {
        field: 'action',
        headerName: 'Action',
        width: 80,
        cellRenderer: (params: any) => {
          return (
            <div className="flex justify-center items-center gap-2">
              <EditOutlined
                style={{
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditItem(params.node.rowIndex);
                }}
              />
              <DeleteOutlined
                style={{
                  cursor: 'pointer',
                  color: 'red',
                  fontSize: '16px'
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row selection when clicking
                  handleDeleteItem(params.node.rowIndex);
                }}
              />
            </div>
          );
        },
        headerClass: 'flex justify-center'
      },
      {
        headerName: 'From Project Code',
        field: 'from_project_code',
        editable: isEditMode,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: projectList?.tableData.map((proj) => proj.project_code) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = projectList?.tableData?.find((proj) => proj.project_code === code);
          return match ? `${match.project_code} - ${match.project_name}` : code || '';
        },
        width: 250
      },
      {
        headerName: 'To Project Code',
        field: 'to_project_code',
        editable: isEditMode,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: projectList?.tableData.map((proj) => proj.project_code) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = projectList?.tableData?.find((proj) => proj.project_code === code);
          return match ? `${match.project_code} - ${match.project_name}` : code || '';
        },
        width: 250
      },
      {
        headerName: 'From Cost Code',
        field: 'from_cost_code',
        editable: isEditMode,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: costList?.tableData.map((cost) => cost.cost_code) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = costList?.tableData?.find((cost) => cost.cost_code === code);
          return match ? `${match.cost_code} - ${match.cost_name}` : code || '';
        },
        width: 200
      },
      {
        headerName: 'To Cost Code',
        field: 'to_cost_code',
        editable: isEditMode,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: costList?.tableData.map((cost) => cost.cost_code) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = costList?.tableData?.find((cost) => cost.cost_code === code);
          return match ? `${match.cost_code} - ${match.cost_name}` : code || '';
        },
        width: 200
      },
      {
        headerName: 'Product Code',
        field: 'item_code',
        editable: isEditMode,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: prodList?.tableData.map((prod) => prod.prod_code) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = prodList?.tableData?.find((prod) => prod.prod_code === code);
          return match ? `${match.prod_code} - ${match.prod_name}` : code || '';
        },
        width: 200
      },
      { headerName: 'Primary Qty', field: 'item_p_qty', editable: isEditMode, width: 120 },

      {
        headerName: 'Primary UOM',
        field: 'p_uom',
        editable: isEditMode,
        cellEditor: 'agSelectCellEditor',
        width: 120,
        cellEditorParams: {
          values: uomList?.tableData.map((prod) => prod.p_uom) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = uomList?.tableData?.find((prod) => prod.p_uom === code);
          return match ? `${match.p_uom}` : code || '';
        }
      },

      {
        headerName: 'Secondary Qty',
        field: 'item_l_qty',
        editable: isEditMode,
        width: 120,
        cellEditorParams: {
          values: l_uomList?.tableData.map((prod) => prod.l_uom) || []
        },
        valueFormatter: (params) => {
          const code = params.value;
          const match = l_uomList?.tableData?.find((prod) => prod.l_uom === code);
          return match ? `${match.l_uom}` : code || '';
        }
      },
      { headerName: 'Secondary UOM', field: 'l_uom', editable: isEditMode, width: 120 },
      { headerName: 'Item Rate', field: 'item_rate', editable: isEditMode, width: 120 }
    ],
    [isEditMode, prodList, costList, projectList, uomList, l_uomList]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
      editable: isEditMode
    }),
    [isEditMode]
  );

  // For popup add new item dialog
  const [isPopupOpen, setPopupOpen] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('Grid Items:', items);
    console.log(
      'From Project Codes:',
      items.map((i) => i.from_project_code)
    );
  }, [items]);

  // Refresh cells when items or lists change to ensure update
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshCells();
    }
  }, [items, prodList, costList, uomList, projectList]);

  const handleCellValueChanged = (params: any) => {
    const updatedData = params.data as TItemMaterialRequest;
    // Update items in parent component
    onItemsChange(items.map((item) => (item === params.node.data ? updatedData : item)));
  };

  const handleAddNewRow = (newItem: TItemMaterialRequest) => {
    onItemsChange([...items, newItem]);
  };

  return (
    <Box sx={{ height: 250, width: 'auto' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <Button variant="contained" onClick={() => setPopupOpen(true)}>
          Add New Row
        </Button>
      </Stack>

      <div className="ag-theme-alpine" style={{ height: '82%', width: 'auto', overflowX: 'auto' }}>
        <AgGridReact<TItemMaterialRequest>
          ref={gridRef}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={handleCellValueChanged}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>

      <AddRowPopup
        open={isPopupOpen}
        onClose={() => {
          setPopupOpen(false);
          setEditIndex(null);
        }}
        onAdd={(item) => {
          if (editIndex !== null) {
            const updatedItems = [...items];
            updatedItems[editIndex] = item;
            onItemsChange(updatedItems);
          } else {
            handleAddNewRow(item);
          }
        }}
        prodList={prodList?.tableData || []}
        costList={costList?.tableData || []}
        projectList={projectList?.tableData || []}
        uomList={uomList?.tableData || []}
        l_uomList={l_uomList?.tableData || []}
        initialData={editIndex !== null ? items[editIndex] : undefined}
      />
    </Box>
  );
};

export default MaterialItemDetailsGrid;
