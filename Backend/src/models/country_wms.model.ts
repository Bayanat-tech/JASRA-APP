// Import required dependencies from Sequelize
import { DataTypes, FindOptions, Model } from "sequelize";
import { sequelize } from "../database/connection";
import constants from "../helpers/constants";
import { ICountry } from "../interfaces/wms/gm_wms.interface";

// Extend the FindOptions type to include custom userTimeZone property
export interface FindOptionsWithTimeZone extends FindOptions<ICountry> {
  userTimeZone?: string;
}

// Define Country model class extending Sequelize Model
class Country extends Model<ICountry> {}

// Initialize Country model with its attributes and options
Country.init(
  {
    // Company identifier
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Unique country code identifier
    country_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Full name of the country
    country_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // GCC (Gulf Cooperation Council) status
    country_gcc: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Brief description of the country
    short_desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Nationality associated with the country
    nationality: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // User who last updated the record
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // User who created the record
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Timestamp of record creation
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // Timestamp of last update
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Country",
    tableName: constants.TABLE.MS_COUNTRY,
    createdAt: "created_at",
    updatedAt: "updated_at",
    // Define composite unique index
    indexes: [
      {
        unique: true,
        fields: ["company_code", "country_code"],
      },
    ],
    hooks: {
      // Commented out afterFind hook for timezone conversion
      // afterFind(
      //   instancesOrInstance: Country | readonly Country[] | null,
      //   options: FindOptionsWithTimeZone
      // ): any {
      //   if (!instancesOrInstance) {
      //     return;
      //   }
      //   let instances = Array.isArray(instancesOrInstance)
      //       ? instancesOrInstance
      //       : [instancesOrInstance],
      //     newCreatedAt: string,
      //     newUpdatedAt: string;
      //   instances = instances.map((instance) => {
      //     if (instance.created_at) {
      //       newCreatedAt = moment(instance.created_at)
      //         .tz(options?.userTimeZone || "UTC")
      //         .format();
      //     }
      //     if (instance.updated_at) {
      //       newUpdatedAt = moment(instance.updated_at)
      //         .tz(options?.userTimeZone || "UTC")
      //         .format();
      //     }
      //     return {
      //       ...instance.dataValues,
      //       created_at: newCreatedAt,
      //       updated_at: newUpdatedAt,
      //     };
      //   });
      //   console.log("final:", instances);
      //   // return instances;
      // },
    },
  }
);

// Remove the default auto-generated 'id' column from the model
Country.removeAttribute("id");

export default Country;
