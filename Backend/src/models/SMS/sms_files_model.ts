import { DataTypes, Model } from "sequelize";
import { ISmsFiles } from "../../interfaces/SMS/sms_files.interface"
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class SmsFiles extends Model<ISmsFiles> {}
SmsFiles.init (
    {
      sr_no: {
         type: DataTypes.INTEGER(),
         allowNull: true,
      },
      company_code: {
         type: DataTypes.STRING(20),
         allowNull: false,
      },
      module: {
         type: DataTypes.STRING(20),
         allowNull: false,
      },
      file_name: {
         type: DataTypes.STRING(300),
         allowNull: false,
      },
      org_file_name: {
         type: DataTypes.STRING(300),
         allowNull: false,
      },
      extension: {
         type: DataTypes.STRING(10),
         allowNull: false,
      },
      aws_file_location: {
         type: DataTypes.STRING(500),
         allowNull: false,
      },
      updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      },
      created_at: {
         type: DataTypes.DATE,
         allowNull: false,
      },
      updated_by: {
         type: DataTypes.STRING(30),
         allowNull: false,
      },
      created_by: {
         type: DataTypes.STRING(30),
         allowNull: false,
      },
   },

    {
        sequelize,
        modelName: "SmsFiles",
        tableName: constants.TABLE.SMS_UPLOADED_FILES,
    },
);
export default SmsFiles;