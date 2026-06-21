import { 
  div_10_clause,
  div_13_clause,
  div_16_clause
} from './clauses';
import {
  headerLogoForDiv10,
  headerTopForDiv10,
  headerLogoForDiv16,
  headerTopForDiv16,
  footerForDiv10,
  logoForDiv13,
  footerForDiv16,
  footerForDiv13first,
  footerForDiv13second
} from './img';

export const dynamicData : { 
      [key: string]: { 
        name: string;
        website: string;
        logo: string; 
        logoYes: boolean;
        logoWidth?: string;
        header: string; 
        headerYes: boolean;
        headerWidth?: string;
        footer: string
        footerYes: boolean;
        footerWidth?: string;
        multipleFooters?: boolean;
        multipleFooterImages?: string[];
        clauses?: {title: string, body: string}[]
      } 
    } ={
      '10': {
        name: 'THE MAINTAINERS:',
        website: 'the-maintainers.com',
        logo: headerLogoForDiv10,
        logoYes: true,
        header: headerTopForDiv10,
        headerYes: true,
        footer: footerForDiv10,
        footerYes: true,
        clauses: div_10_clause,
      },
      '13': {
        name: 'AL JASRA SECURITY SERVICES',
        website: 'aljasrasecurity.com',
        logo: logoForDiv13,
        logoYes: true,
        logoWidth: '100%',
        header: '',
        headerYes: false,
        footer: '',
        footerYes: true,
        multipleFooters: true,
        multipleFooterImages: [footerForDiv13first, footerForDiv13second],
        clauses: div_13_clause,
      },
      '16':{
        name: 'AND Marketing and Events',
        website: 'andagencyqatar.com',
        logo: headerLogoForDiv16,
        logoYes: true,
        header: headerTopForDiv16,
        headerYes: true,
        footer: footerForDiv16,
        footerYes: true,
        clauses: div_16_clause,
      }
    }