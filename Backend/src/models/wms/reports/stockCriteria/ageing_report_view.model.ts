import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { IAgeingReportView } from "../../../../interfaces/wms/reports/stockCriteria/ageing_report_view.interface";
import constants from "../../../../helpers/constants";
import MsCompanyInfo from "./ms_company_info.interface";
import ReportDate from "./report_date.model";

class AgeingReportView extends Model<IAgeingReportView> {}

AgeingReportView.init(
  {
    company_code: DataTypes.STRING,
    prin_code: DataTypes.STRING,
    prin_name: DataTypes.STRING,
    prod_code: DataTypes.STRING,
    prod_name: DataTypes.STRING,
    txn_date: DataTypes.DATEONLY,
    stock: DataTypes.DECIMAL(34, 1),
    volume: DataTypes.DECIMAL(46, 7),
    l_uom: DataTypes.STRING,
    dept_code: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "AgeingReportView",
    tableName: constants.VIEW.VW_STKLED_FOREXPAGEING,
    timestamps: false,
  }
);
AgeingReportView.belongsTo(MsCompanyInfo, {
  foreignKey: "company_code",
  targetKey: "company_code",
});
AgeingReportView.belongsTo(ReportDate, {
  foreignKey: "txn_date", //inv date
  targetKey: "date_to",
});
export default AgeingReportView;
