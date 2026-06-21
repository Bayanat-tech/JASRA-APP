import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import dayjs from 'dayjs';
import { TTransactionDocumentReport } from 'pages/accounts/transaction/types/transaction.types';

const TransactionDocumentReport = ({
  handlePrint,
  contentRef,
  data
}: {
  contentRef: React.RefObject<HTMLDivElement>;
  data: TTransactionDocumentReport;
  handlePrint: () => void;
}) => {
  return (
    <div>
      <div className="text-right">
        {/* Button to trigger print functionality */}
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlePrint}>
          Print
        </Button>
      </div>
      <div className="p-1" ref={contentRef}>
        <span className="flex justify-center mt-2">Cheque Payment Report</span>
        <header className="text-center mb-8">
          {/* Company details */}
          <h1 className="text-xl font-bold">{data?.company_name ?? ''}</h1>
          <p className="text-lg font-semibold">{data?.company_address1 ?? ''}</p>
          <p className="text-lg font-semibold">{data?.company_address2 ?? ''}</p>
          <p className="text-lg font-semibold">{data?.company_address3 ?? ''}</p>
        </header>
        <h2 className="text-2xl font-bold text-center mb-8">BANK PAYMENT VOUCHER (Division : BT)</h2>
        <div className="mb-4">
          <div className="flex justify-between w-full">
            <div className="w-1/4">
              {/* Payment details */}
              <p className="flex justify-between">
                <span className="font-bold text-left">A/c Code:</span>
                <span className="text-left"> {data?.hdr_ac_code ?? ''}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-left">Bank:</span>
                <span className="text-left">{data?.bank_name_inv ?? ''}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-left">Cheque No:</span>
                <span className="text-left">{data?.cheque_no ?? ''}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-left">Cheque Date:</span>
                <span className="text-left">{dayjs(data?.cheque_date ?? null)?.format('DD-MM-YYYY') ?? null}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-left">A/c Payee:</span>
                <span className="text-left">{data?.party_name ?? ''}</span>
              </p>
            </div>
            <div className="text-right w-1/4">
              {/* Document details */}
              <p className="flex justify-between">
                <span className="font-bold text-left">Doc No:</span>
                <span className="text-left">{data?.doc_no ?? ''}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-left">Doc Date:</span>
                <span className="text-left">{dayjs(data?.doc_date ?? null)?.format('DD-MM-YYYY') ?? null}</span>
              </p>
            </div>
          </div>
        </div>
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 border">A/c</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map((item, index) => {
              return (
                <>
                  {item.isTotal === true ? (
                    <tr>
                      <th className="px-4 py-2 border" colSpan={2}>
                        Total
                      </th>
                      <th className="px-4 py-2 border"> {item?.total ?? ''} </th>
                    </tr>
                  ) : (
                    <tr key={index} className="text-center">
                      <td className="px-4 py-2 border">{item?.ac_code}</td>
                      <td className="px-4 py-2 border whitespace-pre-line">{item?.ac_name ?? ''}</td>
                      <td className="px-4 py-2 border">{item?.amount}</td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Prepared By / Last Modified By</p>
            <p>{data?.prepared}</p>
          </div>
          <div>
            <p className="font-semibold">Verified By</p>
            <p>{data?.verified}</p>
          </div>
          <div>
            <p className="font-semibold">Approved By</p>
            <p>Name: {data?.party_name}</p>
          </div>
        </div>
        <span className="flex justify-center mt-2">Powered by Bayanat Technology</span>
      </div>
    </div>
  );
};

export default TransactionDocumentReport;
