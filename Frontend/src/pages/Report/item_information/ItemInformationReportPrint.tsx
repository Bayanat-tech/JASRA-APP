import React from "react";

interface ItemRow {
  ADDL_ITEM_DESC?: string;   // Description
  L_UOM?: string;            // Unit
  ITEM_L_QTY?: number | string;  // LPO Qty
  ITEM_RATE?: number | string;   // Unit Price
  AMOUNT?: number | string;      // Amount LPO/Cash
  SUPP_NAME?: string;        // Supplier / L.P.O Number (use REF_DOC_NO if available)
  REF_DOC_NO?: string;       // L.P.O Number
  DLVR_TERM?: string;        // Delivery Period
  // pass-through extras
  [key: string]: any;
}

interface ItemInformationReportPrintProps {
  required_values: {
    div_name?: string;
    project_code?: string;
    project_name?: string;
    company_code?: string;
    div_code?: string;
    from_date?: string;
    to_date?: string;
    description?: string;
    items?: ItemRow[];
  };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    color: "#000",
    backgroundColor: "#fff",
    padding: "16px 20px",
    minWidth: "900px",
  },
  header: {
    textAlign: "center",
    marginBottom: "8px",
  },
  title: {
    fontSize: "13px",
    fontWeight: "bold",
    textDecoration: "underline",
    letterSpacing: "0.5px",
    marginBottom: "10px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "11px",
  },
  metaLabel: { fontWeight: "bold" },
  divider: { borderTop: "1px solid #000", margin: "8px 0 10px 0" },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    tableLayout: "fixed" as const,
    fontSize: "10px",
  },
  th: {
    backgroundColor: "#c6efce",
    border: "1px solid #999",
    padding: "4px 5px",
    textAlign: "center" as const,
    fontWeight: "bold",
    verticalAlign: "middle" as const,
    wordWrap: "break-word" as const,
  },
  thDescription: {
    backgroundColor: "#c6efce",
    border: "1px solid #999",
    padding: "4px 5px",
    textAlign: "center" as const,
    fontWeight: "bold",
    verticalAlign: "middle" as const,
    width: "28%",
  },
  thDelivery: {
    backgroundColor: "#f4cccc",
    border: "1px solid #999",
    padding: "4px 5px",
    textAlign: "center" as const,
    fontWeight: "bold",
    verticalAlign: "middle" as const,
    width: "10%",
  },
  td: {
    border: "1px solid #ccc",
    padding: "4px 5px",
    verticalAlign: "middle" as const,
    wordWrap: "break-word" as const,
  },
  tdCenter: {
    border: "1px solid #ccc",
    padding: "4px 5px",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  },
  tdRight: {
    border: "1px solid #ccc",
    padding: "4px 5px",
    textAlign: "right" as const,
    verticalAlign: "middle" as const,
  },
  deliveryCell: {
    border: "1px solid #ccc",
    padding: "4px 5px",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
    fontSize: "9px",
  },
  highlightedDelivery: { backgroundColor: "#f4cccc" },
  footer: { marginTop: "16px", fontSize: "10px", color: "#555" },
};

const formatNumber = (val: number | string | undefined | null) => {
  if (val === undefined || val === null || val === "") return "";
  const n = parseFloat(String(val));
  return isNaN(n)
    ? String(val)
    : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const isDateDelivery = (val?: string | null) => {
  if (!val) return false;
  return /\d{1,2}-[A-Za-z]{3}-\d{2}/.test(val);
};

const ItemInformationReportPrint: React.FC<ItemInformationReportPrintProps> = ({
  required_values,
}) => {
  const {
    div_name,
    project_code,
    project_name,
    from_date,
    to_date,
    description,
    items = [],
  } = required_values;

  const fmtDate = (val?: string) => {
    if (!val) return "All";
    const d = new Date(val);
    return isNaN(d.getTime())
      ? val
      : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={styles.page}>
      {/* Title */}
      <div style={styles.header}>
        <div style={styles.title}>Item Description Information</div>
      </div>

      {/* Meta row — line 1: Div / Project */}
      <div style={styles.metaRow}>
        <span>
          <span style={styles.metaLabel}>Div Name : </span>
          {div_name || "All Divisions"}
        </span>
        <span>
          <span style={styles.metaLabel}>Project Code : </span>
          {project_code ? `${project_code}${project_name ? `  (${project_name})` : ""}` : "All Projects"}
        </span>
      </div>

      {/* Meta row — line 2: Date range */}
      <div style={styles.metaRow}>
        <span>
          <span style={styles.metaLabel}>From Date : </span>
          {fmtDate(from_date)}
        </span>
        <span>
          <span style={styles.metaLabel}>To Date : </span>
          {fmtDate(to_date)}
        </span>
      </div>

      {/* Meta row — line 3: Description search term (only when used) */}
      {description ? (
        <div style={styles.metaRow}>
          <span>
            <span style={styles.metaLabel}>Description Search : </span>
            {description}
          </span>
        </div>
      ) : null}

      {/* Divider */}
      <div style={styles.divider} />

      {/* Table */}
      <table style={styles.table}>
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={styles.thDescription}>Description</th>
            <th style={styles.th}>UNIT</th>
            <th style={styles.th}>LPO Qty</th>
            <th style={styles.th}>Unit Price</th>
            <th style={styles.th}>Amount LPO/Cash</th>
            <th style={styles.th}>L.P.O Number</th>
            <th style={styles.thDelivery}>Delivery Period</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{ ...styles.tdCenter, padding: "16px", color: "#888" }}
              >
                No items to display
              </td>
            </tr>
          ) : (
            items.map((item, idx) => {
              const deliveryVal = item.DLVR_TERM ?? null;
              const lpoNumber = item.REF_DOC_NO ?? item.SUPP_NAME ?? "";
              return (
                <tr
                  key={idx}
                  style={idx % 2 === 1 ? { backgroundColor: "#f9f9f9" } : {}}
                >
                  <td style={styles.td}>{item.ADDL_ITEM_DESC || ""}</td>
                  <td style={styles.tdCenter}>{item.L_UOM || ""}</td>
                  <td style={styles.tdCenter}>{item.ITEM_L_QTY ?? ""}</td>
                  <td style={styles.tdRight}>{formatNumber(item.ITEM_RATE)}</td>
                  <td style={styles.tdRight}>{formatNumber(item.AMOUNT)}</td>
                  <td style={styles.tdCenter}>{lpoNumber}</td>
                  <td
                    style={{
                      ...styles.deliveryCell,
                      ...(isDateDelivery(deliveryVal)
                        ? styles.highlightedDelivery
                        : {}),
                    }}
                  >
                    {deliveryVal || ""}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div style={styles.footer}>
        <p>
          Generated on:{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default ItemInformationReportPrint;