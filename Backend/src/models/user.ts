// // Example: get user by loginid
// export async function getUserByLoginId(loginid: string): Promise<PrismaUser | null> {
//   return prisma.user.findUnique({
//     where: { loginid },
//   });
// }

// // Example: create user
// export async function createUser(data: Prisma.UserCreateInput): Promise<PrismaUser> {
//   return prisma.user.create({ data });
// }

// // ...add more functions as needed...
//     // Define the 'loginid' attribute
//     loginid: {
//       type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
//       primaryKey: true, // Set this attribute as the primary key
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'email_id' attribute
//     email_id: {
//       type: DataTypes.STRING(400), // Set the data type to STRING with a length of 400
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'username' attribute
//     username: {
//       type: DataTypes.STRING(400), // Set the data type to STRING with a length of 400
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'contact_name' attribute
//     contact_name: {
//       type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
//     },
//     // Define the 'contact_no' attribute
//     contact_no: {
//       type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
//     },
//     // Define the 'contact_email' attribute
//     contact_email: {
//       type: DataTypes.STRING(1000), // Set the data type to STRING with a length of 1000
//     },
//     // Define the 'updated_at' attribute
//     updated_at: {
//       type: DataTypes.DATE, // Set the data type to DATE
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'updated_by' attribute
//     updated_by: {
//       type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'created_by' attribute
//     created_by: {
//       type: DataTypes.STRING(20), // Set the data type to STRING with a length of 20
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'created_at' attribute
//     created_at: {
//       type: DataTypes.DATE, // Set the data type to DATE
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'userpass' attribute
//     userpass: {
//       type: DataTypes.STRING(200), // Set the data type to STRING with a length of 200
//       allowNull: false, // Set the column as NOT NULL
//     },
//     SEC_PASSWD: {
//       type: DataTypes.STRING(200), // Set the data type to STRING with a length of 200
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'no_of_days' attribute
//     no_of_days: {
//       type: DataTypes.INTEGER, // Set the data type to INTEGER
//     },
//     // Define the 'active_flag' attribute
//     active_flag: {
//       type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
//       allowNull: false, // Set the column as NOT NULL
//     },
//     // Define the 'lang_pref' attribute
//     lang_pref: {
//       type: DataTypes.STRING, // Set the data type to STRING
//       allowNull: false, // Set the column as NOT NULL
//     },
//     APPLICATION: {
//       type: DataTypes.STRING(30), // Set the data type to STRING with a length of 30
//       allowNull: true,
//     },
//   },
//   {
//     oracleDb, // Pass the sequelize instance
//     modelName: "User", // Set the model name
//     tableName: constants.TABLE.SEC_LOGIN, // Set the table name using a constant
//     timestamps: false, // Disable Sequelize's auto timestamps as you have custom fields
//   }
// );

// // Define the association with the Company model
// User.belongsTo(Company, {
//   foreignKey: "company_code", // Specify the foreign key
//   targetKey: "company_code", // Specify the target key in the associated model
// });

// export default User;
