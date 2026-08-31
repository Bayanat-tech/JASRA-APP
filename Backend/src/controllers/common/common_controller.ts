import { Request, Response } from "express";


import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";



 

export const procBuildCommonProcedurewmc = async (

  req: Request,

  res: Response

): Promise<void> => {

  let connection;

 

  try {

    const body = req.body;

    console.log('inside procBuildCommon 1')

    if (!body?.parameter || !body?.loginid) {

      res.status(400).json({

        success: false,

        message: "parameter and loginid are required"

      });

      return;

    }

    console.log('inside procBuildCommon 2')
    connection = await oracleDb.getConnection();

    console.log('inside procBuildCommon 5')

    const result = await connection.execute(

      `

      DECLARE

        v_msg CLOB;

      BEGIN

        PROC_BUILD_COMMON_PROCEDURE_WMS(

          :parameter,

          :loginid,

 

          :val1s1, :val1s2, :val1s3, :val1s4, :val1s5,

          :val1s6, :val1s7, :val1s8, :val1s9, :val1s10,

          :val1s11, :val1s12, :val1s13, :val1s14, :val1s15,

          :val1s16, :val1s17, :val1s18, :val1s19, :val1s20,

 

          :val1n1, :val1n2, :val1n3, :val1n4, :val1n5,

          :val1n6, :val1n7, :val1n8, :val1n9, :val1n10,

 

          v_msg

        );

 

        :out_msg := v_msg;

      END;

      `,

      {

        parameter: body.parameter,

        loginid: body.loginid,

 

        // STRING VALUES

        val1s1: body.val1s1, val1s2: body.val1s2,

        val1s3: body.val1s3, val1s4: body.val1s4,

        val1s5: body.val1s5, val1s6: body.val1s6,

        val1s7: body.val1s7, val1s8: body.val1s8,

        val1s9: body.val1s9, val1s10: body.val1s10,

        val1s11: body.val1s11, val1s12: body.val1s12,

        val1s13: body.val1s13, val1s14: body.val1s14,

        val1s15: body.val1s15, val1s16: body.val1s16,

        val1s17: body.val1s17, val1s18: body.val1s18,

        val1s19: body.val1s19, val1s20: body.val1s20,

 

        // NUMBER VALUES

        val1n1: body.val1n1, val1n2: body.val1n2,

        val1n3: body.val1n3, val1n4: body.val1n4,

        val1n5: body.val1n5, val1n6: body.val1n6,

        val1n7: body.val1n7, val1n8: body.val1n8,

        val1n9: body.val1n9, val1n10: body.val1n10,

 

        out_msg: {

          dir: oracledb.BIND_OUT,

          type: oracledb.STRING,

          maxSize: 32767

        }

      }

    );

 

    const message = (result.outBinds as any)?.out_msg;

 

    res.json({

      success: !message?.toLowerCase().includes("unsuccess"),

      message: message ?? "Procedure executed"

    });

 

  } catch (err: any) {

    console.error("Oracle error:", err);

    res.status(500).json({

      success: false,

      message: "Procedure execution failed",

      details: err.message

    });

  } finally {

    if (connection) await connection.close().catch(() => { });

  }

};

 

export const proc_build_dynamic_del_common = async (req: Request, res: Response): Promise<void> => {

  let connection;

 

  try {

    const {

      parameter,

      loginid,

      code1,

      code2,

      code3,

      code4,

      number1,

      number2,

      number3,

      number4,

      date1,

      date2,

      date3,

      date4

    } = req.body;

 

    console.log('Check dynamic delete request:', req.body);

 

    if (!parameter) {

      res.status(400).json({ success: false, message: "Missing required parameter 'parameter'" });

      return;

    }

 

    connection = await oracleDb.getConnection();

    const result = await connection.execute(

      `

      DECLARE

        v_sql VARCHAR2(32767);

      BEGIN

        PROC_BUILD_DYNAMIC_DEL_common(

          :parameter,

          :loginid,

          :code1,

          :code2,

          :code3,

          :code4,

          null,

          :number1,

          :number2,

          :number3,

          :number4,

          :date1,

          :date2,

          :date3,

          :date4,

          v_sql

        );

        :out_sql := v_sql;

      END;

      `,

      {

        parameter,

        loginid,

        code1,

        code2,

        code3,

        code4,

        number1,

        number2,

        number3,

        number4,

        date1,

        date2,

        date3,

        date4,

        out_sql: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }

      }

    );

 

    // TypeScript typing for out binds

    interface ProcOutBinds {

      out_sql: string | null;

    }

 

    const outBinds = result.outBinds as ProcOutBinds;

    const rawSql = outBinds?.out_sql;

 

    if (!rawSql) {

      res.status(400).json({ success: false, message: "Invalid delete parameter or procedure returned nothing" });

      return;

    }

 

    console.log("Generated DELETE SQL:", rawSql);

 

    try {

      // Execute the DELETE SQL

      await connection.execute(rawSql, [], { autoCommit: true });

 

      res.json({

        success: true,

        message: "Record Deleted Successfully"

      });

    } catch (deleteError: any) {

      console.error("Failed to execute DELETE SQL:", deleteError);

      res.status(500).json({

        success: false,

        message: "Record not deleted successfully",

        details: deleteError.message

      });

    }

 

  } catch (error: any) {

    console.error("Oracle Error:", error);

    res.status(500).json({ success: false, message: "Failed to execute procedure", details: error.message });

  } finally {

    if (connection) {

      try {

        await connection.close();

      } catch (closeErr) {

        console.error("Failed to close Oracle connection:", closeErr);

      }

    }

  }

};

 

 

export const proc_build_dynamic_ins_upd_common = async (

  req: Request,

  res: Response

): Promise<void> => {

  let connection;

 

  try {

    const {

      parameter,

      loginid,

 

      // INSERT / UPDATE VALUES

      val1s1,

      val1s2,

      val1s3,

      val1s4,

      val1s5,

      val1s6,

      val1s7,

      val1s8,

      val1s9,

      val1s10,

 

      val1n1,

      val1n2,

      val1n3,

      val1n4,

      val1n5,

 

      val1d1,

      val1d2,

      val1d3,

      val1d4,

      val1d5,

 

      // WHERE VALUES

      wval1s1,

      wval1s2,

      wval1s3,

      wval1s4,

      wval1s5,

 

      wval1n1,

      wval1n2,

      wval1n3,

      wval1n4,

      wval1n5,

 

      wval1d1,

      wval1d2,

      wval1d3,

      wval1d4,

      wval1d5

    } = req.body;

 

    if (!parameter) {

      res.status(400).json({

        success: false,

        message: "Missing required parameter 'parameter'"

      });

      return;

    }

 

    connection = await oracleDb.getConnection();

    const result = await connection.execute(

      `

      DECLARE

        v_sql CLOB;

      BEGIN

        PROC_BUILD_DYNAMIC_INS_UPD_common(

          :parameter,

          :loginid,

 

          :val1s1, :val1s2, :val1s3, :val1s4, :val1s5,

          :val1s6, :val1s7, :val1s8, :val1s9, :val1s10,

 

          :val1n1, :val1n2, :val1n3, :val1n4, :val1n5,

 

          :val1d1, :val1d2, :val1d3, :val1d4, :val1d5,

 

          :wval1s1, :wval1s2, :wval1s3, :wval1s4, :wval1s5,

 

          :wval1n1, :wval1n2, :wval1n3, :wval1n4, :wval1n5,

 

          :wval1d1, :wval1d2, :wval1d3, :wval1d4, :wval1d5,

 

          v_sql

        );

        :out_sql := v_sql;

      END;

      `,

      {

        parameter,

        loginid,

 

        val1s1,

        val1s2,

        val1s3,

        val1s4,

        val1s5,

        val1s6,

        val1s7,

        val1s8,

        val1s9,

        val1s10,

 

        val1n1,

        val1n2,

        val1n3,

        val1n4,

        val1n5,

 

        val1d1,

        val1d2,

        val1d3,

        val1d4,

        val1d5,

 

        wval1s1,

        wval1s2,

        wval1s3,

        wval1s4,

        wval1s5,

 

        wval1n1,

        wval1n2,

        wval1n3,

        wval1n4,

        wval1n5,

 

        wval1d1,

        wval1d2,

        wval1d3,

        wval1d4,

        wval1d5,

 

        out_sql: {

          dir: oracledb.BIND_OUT,

          type: oracledb.STRING,

          maxSize: 32767

        }

      }

    );

 

    interface ProcOut {

      out_sql: string | null;

    }

 

    const outBinds = result.outBinds as ProcOut;

    const dynamicSql = outBinds?.out_sql;

 

    if (!dynamicSql) {

      res.status(400).json({

        success: false,

        message: "Procedure returned no SQL"

      });

      return;

    }

 

    console.log("Generated INSERT/UPDATE SQL:", dynamicSql);

 

    // Execute INSERT / UPDATE

    await connection.execute(dynamicSql, [], { autoCommit: true });

 

    res.json({

      success: true,

      message: "Record inserted / updated successfully"

    });

 

  } catch (error: any) {

    console.error("Oracle Error:", error);

    res.status(500).json({

      success: false,

      message: "Failed to execute insert/update",

      details: error.message

    });

  } finally {

    if (connection) {

      try {

        await connection.close();

      } catch (err) {

        console.error("Connection close error:", err);

      }

    }

  }

};

 

 

export const proc_build_dynamic_sql_common = async (req: Request, res: Response): Promise<void> => {

  let connection;

 

  try {

    const {

      parameter,

      loginid,

      code1,

      code2,

      code3,

      code4,

      number1,

      number2,

      number3,

      number4,

      date1,

      date2,

      date3,

      date4

    } = req.body;

    console.log('check dynamic sql', req.body);

    if (!parameter) {

      res.status(400).json({ error: "Missing required parameter 'parameter'" });

      return;

    }
    connection = await oracleDb.getConnection();

      console.log("Hiting the procedure : proc_build_dynamic_sql_common")
      console.log("parmas",parameter)
 

    const result = await connection.execute(

      `

      DECLARE

        v_sql VARCHAR2(32767);

      BEGIN

        PROC_BUILD_DYNAMIC_SQL_common(

          :parameter,

          :loginid,

          :code1,

          :code2,

          :code3,

          :code4,

          :number1,

          :number2,

          :number3,

          :number4,

          :date1,

          :date2,

          :date3,

          :date4,

          v_sql

        );

        :out_sql := v_sql;

      END;

      `,

      {

        parameter,

        loginid,

        code1,

        code2,

        code3,

        code4,

        number1,

        number2,

        number3,

        number4,

        date1,

        date2,

        date3,

        date4,

        out_sql: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }

      }

    );

 

    interface ProcOutBinds {

      out_sql: string;

    }

 

    const outBinds = result.outBinds as ProcOutBinds;

    const rawSql = outBinds?.out_sql;

 

    if (!rawSql) {

      res.status(500).json({ error: "Procedure did not return SQL" });

      return;

    }

 

    console.log("Generated SQL:", rawSql);

 

    const dataResult = await connection.execute<any[]>(rawSql, [], {

      outFormat: oracledb.OUT_FORMAT_ARRAY

    });

 

    const tableData =

      dataResult.rows?.map((row) => {

        const obj: Record<string, any> = {};

        dataResult.metaData?.forEach((col, i) => {

          obj[col.name.toLowerCase()] = row[i];

        });

        return obj;

      }) || [];

 

    res.json({

      success: true,

      data: tableData,

      totalCount: tableData.length,

    });

 

  } catch (error: any) {

    console.error("Oracle Error:", error);

    res.status(500).json({ error: "Failed to execute SQL", details: error.message });

  } finally {

    if (connection) {

      try {

        await connection.close();

      } catch (closeErr) {

        console.error("Failed to close connection:", closeErr);

      }

    }

  }

};

 

 

export const proc_build_dynamic_sql_common20 = async (

  req: Request,

  res: Response

): Promise<void> => {

 

  let connection;

 

  try {

 

    const {

      parameter,

      loginid,

 

      code1,

      code2,

      code3,

      code4,

      code5,

      code6,

      code7,

      code8,

      code9,

      code10,

      code11,

      code12,

      code13,

      code14,

      code15,

      code16,

      code17,

      code18,

      code19,

      code20,

 

      number1,

      number2,

      number3,

      number4,

 

      date1,

      date2,

      date3,

      date4

 

    } = req.body;

 

    console.log('check dynamic sql common20', req.body);

 

    if (!parameter) {

      res.status(400).json({

        error: "Missing required parameter 'parameter'"

      });

      return;

    }
    connection = await oracleDb.getConnection();

 

    const result = await connection.execute(

 

      `

      DECLARE

        v_sql VARCHAR2(32767);

      BEGIN

 

        PROC_BUILD_DYNAMIC_SQL_COMMON20(

 

          :parameter,

          :loginid,

 

          :code1,

          :code2,

          :code3,

          :code4,

          :code5,

          :code6,

          :code7,

          :code8,

          :code9,

          :code10,

          :code11,

          :code12,

          :code13,

          :code14,

          :code15,

          :code16,

          :code17,

          :code18,

          :code19,

          :code20,

 

          :number1,

          :number2,

          :number3,

          :number4,

 

          :date1,

          :date2,

          :date3,

          :date4,

 

          v_sql

 

        );

 

        :out_sql := v_sql;

 

      END;

      `,

 

      {

 

        parameter,

        loginid,

 

        code1,

        code2,

        code3,

        code4,

        code5,

        code6,

        code7,

        code8,

        code9,

        code10,

        code11,

        code12,

        code13,

        code14,

        code15,

        code16,

        code17,

        code18,

        code19,

        code20,

 

        number1,

        number2,

        number3,

        number4,

 

        date1,

        date2,

        date3,

        date4,

 

        out_sql: {

          dir: oracledb.BIND_OUT,

          type: oracledb.STRING,

          maxSize: 32767

        }

 

      }

 

    );

 

    interface ProcOutBinds {

      out_sql: string;

    }

 

    const outBinds = result.outBinds as ProcOutBinds;

 

    const rawSql = outBinds?.out_sql

      ?.replace(/[\r\n]+/g, " ")

      ?.replace(/\s+/g, " ")

      ?.trim();

 

    if (!rawSql) {

 

      res.status(500).json({

        error: "Procedure did not return SQL"

      });

 

      return;

    }

 

    console.log("Generated SQL:", rawSql);

 

    if (code20?.toUpperCase() === 'RAWSQL') {

 

      res.json({

        success: true,

        rawSql

      });

 

      return;

    }

 

 

    const dataResult = await connection.execute<any[]>(

      rawSql,

      [],

      {

        outFormat: oracledb.OUT_FORMAT_ARRAY

      }

    );

 

    const tableData =

      dataResult.rows?.map((row) => {

 

        const obj: Record<string, any> = {};

 

        dataResult.metaData?.forEach((col, i) => {

          obj[col.name.toLowerCase()] = row[i];

        });

 

        return obj;

 

      }) || [];

 

    res.json({

 

      success: true,

      data: tableData,

      totalCount: tableData.length

 

    });

 

  } catch (error: any) {

 

    console.error("Oracle Error:", error);

 

    res.status(500).json({

 

      error: "Failed to execute SQL",

      details: error.message

 

    });

 

  } finally {

 

    if (connection) {

 

      try {

 

        await connection.close();

 

      } catch (closeErr) {

 

        console.error(

          "Failed to close connection:",

          closeErr

        );

 

      }

 

    }

 

  }

 

};

 

export const proc_build_dynamic_ins_upd_column90 = async (

  req: Request,

  res: Response

): Promise<void> => {

  let connection;

 

  try {

    const {

      parameter,

      loginid,

 

      // INSERT / UPDATE STRING VALUES (1–90)

      val1s1, val1s2, val1s3, val1s4, val1s5,

      val1s6, val1s7, val1s8, val1s9, val1s10,

      val1s11, val1s12, val1s13, val1s14, val1s15,

      val1s16, val1s17, val1s18, val1s19, val1s20,

      val1s21, val1s22, val1s23, val1s24, val1s25,

      val1s26, val1s27, val1s28, val1s29, val1s30,

      val1s31, val1s32, val1s33, val1s34, val1s35,

      val1s36, val1s37, val1s38, val1s39, val1s40,

      val1s41, val1s42, val1s43, val1s44, val1s45,

      val1s46, val1s47, val1s48, val1s49, val1s50,

      val1s51, val1s52, val1s53, val1s54, val1s55,

      val1s56, val1s57, val1s58, val1s59, val1s60,

      val1s61, val1s62, val1s63, val1s64, val1s65,

      val1s66, val1s67, val1s68, val1s69, val1s70,

      val1s71, val1s72, val1s73, val1s74, val1s75,

      val1s76, val1s77, val1s78, val1s79, val1s80,

      val1s81, val1s82, val1s83, val1s84, val1s85,

      val1s86, val1s87, val1s88, val1s89, val1s90,

 

      // INSERT / UPDATE NUMBER VALUES (1–10)

      val1n1, val1n2, val1n3, val1n4, val1n5,

      val1n6, val1n7, val1n8, val1n9, val1n10

    } = req.body;

 

    if (!parameter) {

      res.status(400).json({

        success: false,

        message: "Missing required parameter 'parameter'"

      });

      return;

    }

 

    // Resolve tenantId from context or fallback to loginid lookup

    connection = await oracleDb.getConnection();

 

    // Call procedure to build INSERT / UPDATE SQL

    const result = await connection.execute(

      `

      DECLARE

        v_sql CLOB;

      BEGIN

        PROC_BUILD_DYNAMIC_INS_UPD_COLUMN90(

          :parameter,

          :loginid,

 

          :val1s1,  :val1s2,  :val1s3,  :val1s4,  :val1s5,

          :val1s6,  :val1s7,  :val1s8,  :val1s9,  :val1s10,

          :val1s11, :val1s12, :val1s13, :val1s14, :val1s15,

          :val1s16, :val1s17, :val1s18, :val1s19, :val1s20,

          :val1s21, :val1s22, :val1s23, :val1s24, :val1s25,

          :val1s26, :val1s27, :val1s28, :val1s29, :val1s30,

          :val1s31, :val1s32, :val1s33, :val1s34, :val1s35,

          :val1s36, :val1s37, :val1s38, :val1s39, :val1s40,

          :val1s41, :val1s42, :val1s43, :val1s44, :val1s45,

          :val1s46, :val1s47, :val1s48, :val1s49, :val1s50,

          :val1s51, :val1s52, :val1s53, :val1s54, :val1s55,

          :val1s56, :val1s57, :val1s58, :val1s59, :val1s60,

          :val1s61, :val1s62, :val1s63, :val1s64, :val1s65,

          :val1s66, :val1s67, :val1s68, :val1s69, :val1s70,

          :val1s71, :val1s72, :val1s73, :val1s74, :val1s75,

          :val1s76, :val1s77, :val1s78, :val1s79, :val1s80,

          :val1s81, :val1s82, :val1s83, :val1s84, :val1s85,

          :val1s86, :val1s87, :val1s88, :val1s89, :val1s90,

 

          :val1n1, :val1n2, :val1n3, :val1n4, :val1n5,

          :val1n6, :val1n7, :val1n8, :val1n9, :val1n10,

 

          v_sql

        );

        :out_sql := v_sql;

      END;

      `,

      {

        parameter,

        loginid,

 

        val1s1, val1s2, val1s3, val1s4, val1s5,

        val1s6, val1s7, val1s8, val1s9, val1s10,

        val1s11, val1s12, val1s13, val1s14, val1s15,

        val1s16, val1s17, val1s18, val1s19, val1s20,

        val1s21, val1s22, val1s23, val1s24, val1s25,

        val1s26, val1s27, val1s28, val1s29, val1s30,

        val1s31, val1s32, val1s33, val1s34, val1s35,

        val1s36, val1s37, val1s38, val1s39, val1s40,

        val1s41, val1s42, val1s43, val1s44, val1s45,

        val1s46, val1s47, val1s48, val1s49, val1s50,

        val1s51, val1s52, val1s53, val1s54, val1s55,

        val1s56, val1s57, val1s58, val1s59, val1s60,

        val1s61, val1s62, val1s63, val1s64, val1s65,

        val1s66, val1s67, val1s68, val1s69, val1s70,

        val1s71, val1s72, val1s73, val1s74, val1s75,

        val1s76, val1s77, val1s78, val1s79, val1s80,

        val1s81, val1s82, val1s83, val1s84, val1s85,

        val1s86, val1s87, val1s88, val1s89, val1s90,

 

        val1n1, val1n2, val1n3, val1n4, val1n5,

        val1n6, val1n7, val1n8, val1n9, val1n10,

 

        out_sql: {

          dir: oracledb.BIND_OUT,

          type: oracledb.STRING,

          maxSize: 32767

        }

      }

    );

 

    interface ProcOut {

      out_sql: string | null;

    }

 

    const outBinds = result.outBinds as ProcOut;

    const dynamicSql = outBinds?.out_sql;

 

    if (!dynamicSql) {

      res.status(400).json({

        success: false,

        message: "Procedure returned no SQL"

      });

      return;

    }

 

    console.log("Generated INSERT/UPDATE SQL:", dynamicSql);

 

    // Execute INSERT / UPDATE

    await connection.execute(dynamicSql, [], { autoCommit: true });

 

    res.json({

      success: true,

      message: "Record inserted / updated successfully"

    });

 

  } catch (error: any) {

    console.error("Oracle Error:", error);

    res.status(500).json({

      success: false,

      message: "Failed to execute insert/update",

      details: error.message

    });

  } finally {

    if (connection) {

      try {

        await connection.close();

      } catch (err) {

        console.error("Connection close error:", err);

      }

    }

  }

};
