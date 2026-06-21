// src/theme/mui-theme.d.ts
import { Palette, PaletteOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customBlue: Palette['primary'];
  }

  interface PaletteOptions {
    customBlue?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    customBlue: true;
  }
}
