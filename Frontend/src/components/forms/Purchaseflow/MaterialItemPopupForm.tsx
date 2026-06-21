import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid
} from '@mui/material';

export interface ProdOption {
  prod_code: string;
  prod_name: string;
  upp?: number;
  p_uom?: string;
  l_uom?: string;
}

export interface CostOption {
  cost_code: string;
  cost_name: string;
}

export interface ProjectOption {
  project_code: string;
  project_name: string;
}

export interface MaterialItemData {
  prod_code: string;
  item_rate: number;
  p_uom: string;
  l_uom: string;
  item_p_qty: number;
  item_l_qty: number;
  from_cost_code: string;
  to_cost_code: string;
  from_project_code: string;
  to_project_code: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialItemData) => void;
  prodOptions: ProdOption[];
  costOptions: CostOption[];
  projectOptions: ProjectOption[];
  initialData?: MaterialItemData;
}

const MaterialItemPopupForm: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  prodOptions,
  costOptions,
  projectOptions,
  initialData,
}) => {
  const [form, setForm] = useState<MaterialItemData>({
    prod_code: '',
    item_rate: 0,
    p_uom: '',
    l_uom: '',
    item_p_qty: 0,
    item_l_qty: 0,
    from_cost_code: '',
    to_cost_code: '',
    from_project_code: '',
    to_project_code: '',
  });

  useEffect(() => {
    if (open) {
      setForm(
        initialData || {
          prod_code: '',
          item_rate: 0,
          p_uom: '',
          l_uom: '',
          item_p_qty: 0,
          item_l_qty: 0,
          from_cost_code: '',
          to_cost_code: '',
          from_project_code: '',
          to_project_code: '',
        }
      );
    }
  }, [open, initialData]);

  const handleChange = (key: keyof MaterialItemData, value: string | number) => {
    if (key === 'prod_code') {
      const prod = prodOptions.find((p) => p.prod_code === value);
      if (prod) {
        setForm((prev) => ({
          ...prev,
          prod_code: value as string,
          item_rate: prod.upp || 0,
          p_uom: prod.p_uom || '',
          l_uom: prod.l_uom || '',
        }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.prod_code) {
      alert('Please select a Product Code.');
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Item' : 'Add New Item'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Product Code"
              value={form.prod_code}
              onChange={(e) => handleChange('prod_code', e.target.value)}
            >
              {prodOptions.map((p) => (
                <MenuItem key={p.prod_code} value={p.prod_code}>
                  {p.prod_code} - {p.prod_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Primary Qty"
              type="number"
              value={form.item_p_qty}
              onChange={(e) => handleChange('item_p_qty', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Primary UOM"
              value={form.p_uom}
              onChange={(e) => handleChange('p_uom', e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Secondary Qty"
              type="number"
              value={form.item_l_qty}
              onChange={(e) => handleChange('item_l_qty', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Secondary UOM"
              value={form.l_uom}
              onChange={(e) => handleChange('l_uom', e.target.value)}
            />
          </Grid>
          <Grid item xs={4} />

          <Grid item xs={9}>
            <TextField
              fullWidth
              label="Item Rate"
              type="number"
              value={form.item_rate}
              onChange={(e) => handleChange('item_rate', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="From Project Code"
              value={form.from_project_code}
              onChange={(e) => handleChange('from_project_code', e.target.value)}
            >
              {projectOptions.map((p) => (
                <MenuItem key={p.project_code} value={p.project_code}>
                  {p.project_code} - {p.project_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="To Project Code"
              value={form.to_project_code}
              onChange={(e) => handleChange('to_project_code', e.target.value)}
            >
              {projectOptions.map((p) => (
                <MenuItem key={p.project_code} value={p.project_code}>
                  {p.project_code} - {p.project_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="From Cost Code"
              value={form.from_cost_code}
              onChange={(e) => handleChange('from_cost_code', e.target.value)}
            >
              {costOptions.map((c) => (
                <MenuItem key={c.cost_code} value={c.cost_code}>
                  {c.cost_code} - {c.cost_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="To Cost Code"
              value={form.to_cost_code}
              onChange={(e) => handleChange('to_cost_code', e.target.value)}
            >
              {costOptions.map((c) => (
                <MenuItem key={c.cost_code} value={c.cost_code}>
                  {c.cost_code} - {c.cost_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialItemPopupForm;
