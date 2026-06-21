// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import database connection instance
import { sequelize } from "../../database/connection";
// Import application constants
import constants from "../../helpers/constants";
// Import interface for Division attributes
import { IDivision } from "../../interfaces/wms/division_wms.interface";

// Define Division model class extending Sequelize Model
class Division extends Model<IDivision> {}

// Initialize the Division model with its attributes and configuration
Division.init(
  {
    // Division code identifier
    // Primary key, maximum length of 5 characters
    div_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    // Full name of the division
    // Part of composite primary key, maximum length of 50 characters
    div_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    // Abbreviated division name
    // Maximum length of 10 characters
    div_short_name: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // Primary address line
    // Maximum length of 50 characters
    div_address1: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Secondary address line (optional)
    // Maximum length of 50 characters
    div_address2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // Tertiary address line (optional)
    // Maximum length of 50 characters
    div_address3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // Country identifier
    // ISO country code, maximum length of 3 characters
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    // Contact phone number (optional)
    // Maximum length of 15 characters
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    // Fax number (optional)
    // Maximum length of 15 characters
    fax: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    // Company identifier (optional)
    // Maximum length of 20 characters
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Division email address
    // Maximum length of 100 characters
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    /* Commented out fields for future implementation
    These fields represent additional functionality for:
    - Division management (div_head_id, status)
    - HR operations (payroll settings, working hours)
    - Financial operations (fiscal year, banking details)
    - Employee management (document paths, account groups)
    */
  },
  {
    sequelize,              // Database connection instance
    modelName: "Division", // Model name for Sequelize
    tableName: constants.TABLE.MS_HR_DIVISION, // Actual table name in database
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_at", // Custom column name for update timestamp
  }
);

// Export the Division model
export default Division;

/* Table Purpose:
This model represents organizational divisions with:
- Basic division identification and naming
- Contact information and addressing
- Company association
- Geographic location tracking
- Communication details

Future Capabilities (commented fields):
- Payroll management
- Working hours configuration
- Banking information
- Employee documentation
- Financial year settings
- HR representative assignment

Used for:
- Organizational structure management
- Contact information maintenance
- Company subdivisions tracking
- Geographic distribution management
- Communication routing
*/
