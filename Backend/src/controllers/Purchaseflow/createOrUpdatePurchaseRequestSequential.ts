import { Request, Response } from "express";
import {
  IPurchaseRequestPf,
  IItemPrRequest,
  IPrtermnscondition,
  IBasicPrRequest,
} from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { upsertPurchaseRequest } from "./puchasedbupateoracle";

// Extend Express Request to include optional user info
interface RequestWithUser extends Request {
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

// ----------------------
// Controller
export const createOrUpdatePurchaseRequestSequential = async (
  req: Request, // Use Express's Request type here
  res: Response
): Promise<void> => {
  try {
    console.log("Incoming request data:", req.body);

    // If you need user info from a middleware, you can cast:
    const user = (req as any).user as { id: string; name: string; email?: string };

    // Map incoming request to Oracle-ready structure
    const purchaseRequest: IPurchaseRequestPf = mapIncomingRequestData(req.body);

    console.log("Before upsertPurchaseRequest with data:", purchaseRequest);

    // Call Oracle upsert function
    const requestNumber = await upsertPurchaseRequest(purchaseRequest);

    console.log("After upsertPurchaseRequest, generated request number:", requestNumber);

    res.status(200).json({
      success: true,
      message: "Purchase request processed successfully.",
      requestNumber,
    });
  } catch (error) {
    console.error("Error saving/updating purchase request:", error);
    res.status(500).json({
      success: false,
      message: "Error saving/updating purchase request.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
// ----------------------
// Map incoming request to IPurchaseRequestPf
// ----------------------
export function mapIncomingRequestData(data: any): IPurchaseRequestPf {
  // Map Items
  console.log(`contract_soft_hard: ${data.contract_soft_hard}`);
console.log(`amc_service_status: ${data.amc_service_status}`);
console.log(`material_mechanical: ${data.material_mechanical}`);
console.log(`material_electrical: ${data.material_electrical}`);
console.log(`material_plumbing: ${data.material_plumbing}`);
console.log(`material_tools: ${data.material_tools}`);
console.log(`material_civil: ${data.material_civil}`);
console.log(`material_ac: ${data.material_ac}`);
console.log(`material_cleaning: ${data.material_cleaning}`);
console.log(`material_other: ${data.material_other}`);
console.log(`services_temp_staff: ${data.services_temp_staff}`);
console.log(`services_rentals: ${data.services_rentals}`);
console.log(`services_subcon_conslt: ${data.services_subcon_conslt}`);
console.log(`services_other: ${data.services_other}`);
console.log(`other_stationery: ${data.other_stationery}`);
console.log(`other_it: ${data.other_it}`);
console.log(`other_new_uniform_ppe: ${data.other_new_uniform_ppe}`);
console.log(`other_rplcmt_uniform: ${data.other_rplcmt_uniform}`);
console.log(`other_other: ${data.other_other}`);
console.log(`good_material_request: ${data.good_material_request}`);
console.log(`service_request: ${data.service_request}`);
console.log(`type_of_contract: ${data.type_of_contract}`);
console.log(`type_of_pr: ${data.type_of_pr}`);
console.log(`covered_by_contract_yes: ${data.covered_by_contract_yes}`);
console.log(`flag_sharing_cost: ${data.flag_sharing_cost}`);
console.log(`budgeted_yes: ${data.budgeted_yes}`);
console.log(`checked_store_yes: ${data.checked_store_yes}`);
  const mapItems: IItemPrRequest[] = Array.isArray(data.items)
    ? data.items.map((item: any) => ({
        item_code: item.item_code || "",
        item_desp: item.item_desp || "",
        item_group_code: item.item_group_code || "",
        item_rate: Number(item.item_rate) || 0,
        p_uom: item.p_uom || "",
        l_uom: item.l_uom || "",
        upp: Number(item.upp) || 0,
        item_l_qty: Number(item.item_l_qty) || 0,
        item_p_qty: Number(item.item_p_qty) || 0,
        appr_upp: Number(item.appr_upp) || 0,
        appr_item_l_qty: Number(item.appr_item_l_qty) || 0,
        appr_item_p_qty: Number(item.appr_item_p_qty) || 0,
        currency_rate: Number(item.currency_rate) || 0,
        amount: Number(item.amount) || 0, // keep as number in items
        discount_amount: Number(item.discount_amount) || 0,
        final_rate: Number(item.final_rate) || 0,
        company_code: item.company_code || "",
        updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
        updated_by: item.updated_by || "",
        request_number: item.request_number || "",
        curr_code: item.curr_code || "",
        lcurr_amt: Number(item.lcurr_amt) || 0,
        allocated_approved_quantity: Number(item.allocated_approved_quantity) || 0,
        supplier: item.supplier || "",
        service_rm_flag: item.service_rm_flag || "",
        addl_item_desc: item.addl_item_desc || "",
        flow_level_running: Number(item.flow_level_running) || 0,
        pr_amount: Number(item.pr_amount) || 0,
        po_amount: Number(item.po_amount) || 0,
        month_budget: Number(item.month_budget) || 0,
        cost_code: item.cost_code || "",
        cost_name: item.cost_name || "",
        item_sequence_no: Number(item.item_sequence_no) || 0,
      }))
    : [];

  // Map Terms & Conditions
  const mapTermsConditions: IPrtermnscondition[] = Array.isArray(data.Termscondition)
    ? data.Termscondition.map((term: any) => ({
        tsupplier: term.tsupplier || "",
        remarks: term.remarks || "",
        dlvr_term: term.dlvr_term || "",
        payment_terms: term.payment_terms || "",
        quotation_reference: term.quatation_reference || "",
        delivery_address: term.delivery_address || "",
      }))
    : [];

  // Map basic purchase request fields
  // Map basic purchase request fields
const basicPrRequest: IBasicPrRequest = {
  last_action: data.last_action || "",
  type_of_pr: data.type_of_pr || "",
  last_updated: data.last_updated || "",
  requestNumber: data.request_number || "",
  requestDate: data.request_date ? new Date(data.request_date) : new Date(),
  description: data.description || "",
  projectCode: data.project_code || "",
  wo_number: data.wo_number || "",
  flow_type: data.flow_type || "PUR",
  remarks: data.remarks || "",
  type_of_contract: data.type_of_contract || "",
  amc_from: data.amc_from ? new Date(data.amc_from) : new Date(),
  amc_to: data.amc_to ? new Date(data.amc_to) : new Date(),
  type_of_material_supply: data.type_of_material_supply || "",
  contract_soft_hard: data.contract_soft_hard || "",
  amc_service_status: data.amc_service_status || "",
  flow_level_running: Number(data.flow_level_running) || 0,
  amount: String(data.amount || "0"),
  need_by_date: data.need_by_date ? new Date(data.need_by_date) : new Date(),
  covered_by_contract_yes: data.covered_by_contract_yes || "N",
  flag_sharing_cost: data.flag_sharing_cost || "N",
  budgeted_yes: data.budgeted_yes || "N",
  checked_store_yes: data.checked_store_yes || "N",

  // -------------------------
  // 🔥 MATERIAL FLAGS
  // -------------------------
  material_mechanical: data.material_mechanical || "N",
  material_electrical: data.material_electrical || "N",
  material_plumbing: data.material_plumbing || "N",
  material_tools: data.material_tools || "N",
  material_civil: data.material_civil || "N",
  material_ac: data.material_ac || "N",
  material_cleaning: data.material_cleaning || "N",
  material_other: data.material_other || "N",

  // -------------------------
  // 🔥 SERVICE FLAGS
  // -------------------------
  services_temp_staff: data.services_temp_staff || "N",
  services_rentals: data.services_rentals || "N",
  services_subcon_conslt: data.services_subcon_conslt || "N",
  services_other: data.services_other || "N",

  // -------------------------
  // 🔥 OTHER CATEGORY FLAGS
  // -------------------------
  other_stationery: data.other_stationery || "N",
  other_it: data.other_it || "N",
  other_new_uniform_ppe: data.other_new_uniform_ppe || "N",
  other_rplcmt_uniform: data.other_rplcmt_uniform || "N",
  other_other: data.other_other || "N",

  // -------------------------
  // 🔥 REQUEST TYPE FLAGS
  // -------------------------
  good_material_request: data.good_material_request || "N",
  service_request: data.service_request || "N",

  // -------------------------
  // Existing fields
  // -------------------------
  service_type: data.service_type || "",
  accommodation: data.accommodation || "",
  div_code: data.div_code || "",
  catering: data.catering || "N",
  laundry_housekeeping: data.laundry_housekeeping || "N",
  medical: data.medical || "N",
  transportation: data.transportation || "N",
  training: data.training || "N",
  recruitment_hr: data.recruitment_hr || "N",
  uniform: data.uniform || "N",
  stationary: data.stationary || "N",
  it_tech: data.it_tech || "N",
  furniture: data.furniture || "N",
  entertainment: data.entertainment || "N",
  barber: data.barber || "N",
  others: data.others || "N",

  requestor_name: data.requestor_name || "",
  created_by: data.created_by || "",
  updated_by: data.updated_by || "",
  created_at: data.created_at ? new Date(data.created_at) : new Date(),
  updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
};
console.log("Basic PR Request:", basicPrRequest);




  // Combine into final object
  const purchaseRequest: IPurchaseRequestPf = {
    ...basicPrRequest,
    companyCode: data.company_code || "",
    items: mapItems,
    termconditions: mapTermsConditions,
  };

  return purchaseRequest;
}
