import { getRepository } from "../../database/connection";
import { Product } from "../../entity/WMS/product.entity";
import { In } from "typeorm";

export class ProductService {
  private static getProductRepository() {
    return getRepository(Product);
  }

  static async findByNameAndCompany(
    prodName: string,
    companyCode: string
  ): Promise<Product | null> {
    const repository = this.getProductRepository();
    return await repository.findOne({
      where: { prodName, companyCode },
    });
  }

  static async findByCodeAndCompany(
    prodCode: string,
    companyCode: string
  ): Promise<Product | null> {
    const repository = this.getProductRepository();
    return await repository.findOne({
      where: { prodCode, companyCode },
    });
  }

  static async createProduct(productData: Partial<Product>): Promise<Product> {
    const repository = this.getProductRepository();

    const product = repository.create(productData);
    return await repository.save(product);
  }

  static async updateProduct(
    prodCode: string,
    companyCode: string,
    updateData: Partial<Product>
  ): Promise<boolean> {
    const repository = this.getProductRepository();

    const result = await repository.update(
      { prodCode, companyCode },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteProducts(prodCodes: string[]): Promise<boolean> {
    const repository = this.getProductRepository();

    const result = await repository.delete({
      prodCode: In(prodCodes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkProductExists(
    prodCode: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getProductRepository();
    const count = await repository.count({
      where: { prodCode, companyCode },
    });
    return count > 0;
  }

  static async getProducts(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: Product[]; total: number }> {
    const repository = this.getProductRepository();

    console.log("🔍 ProductService.getProducts called with filters:", filters);
    console.log("📄 Page:", page, "Limit:", limit);

    try {
      // Start with a query builder for more flexibility
      const queryBuilder = repository.createQueryBuilder("product");

      // Always filter by company code
      if (filters.companyCode || filters.company_code) {
        const companyCode = filters.companyCode || filters.company_code;
        console.log("✅ Filtering by company_code:", companyCode);
        queryBuilder.where("product.companyCode = :companyCode", { companyCode });
      }

      // Add product name filter if present
      if (filters.prodName || filters.prod_name) {
        const prodName = filters.prodName || filters.prod_name;
        console.log("✅ Filtering by prod_name:", prodName);
        queryBuilder.andWhere("product.prodName LIKE :prodName", { 
          prodName: `%${prodName}%` 
        });
      }

      // Add product code filter if present
      if (filters.prodCode || filters.prod_code) {
        const prodCode = filters.prodCode || filters.prod_code;
        console.log("✅ Filtering by prod_code:", prodCode);
        queryBuilder.andWhere("product.prodCode LIKE :prodCode", { 
          prodCode: `%${prodCode}%` 
        });
      }

      // Get total count
      const total = await queryBuilder.getCount();
      console.log("📊 Total products found:", total);

      // Apply pagination and get results
      const data = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("product.prodCode", "ASC")
        .getMany();

      console.log("📦 Products fetched:", data.length);
      
      if (data.length > 0) {
        console.log("🔎 First product sample:", JSON.stringify(data[0], null, 2));
      }

      return { data, total };
    } catch (error: any) {
      console.error("❌ Error in ProductService.getProducts:", error.message);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async getByCategoryOrGroup(
    groupCode: string | null,
    categoryAbc: string | null,
    companyCode: string
  ): Promise<Product[]> {
    const repository = this.getProductRepository();
    const whereConditions: any = { companyCode };
    
    if (groupCode) {
      whereConditions.groupCode = groupCode;
    }
    
    if (categoryAbc) {
      whereConditions.categoryAbc = categoryAbc;
    }
    
    return await repository.find({ where: whereConditions });
  }
}
