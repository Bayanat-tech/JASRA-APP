import { DataTypes, Model } from "sequelize";
import { ISmsSegmentmaster  } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class segmentmaster extends Model<ISmsSegmentmaster> {}

segmentmaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    segment_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    segment_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Segmentmaster",
    tableName: constants.TABLE.SMS_SEGMENT,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default segmentmaster;
