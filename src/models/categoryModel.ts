import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

import CategoryEntity from "../entities/categoryEntity";
import PaginatedCategories from "../types/PaginatedCategories";

const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  note: { type: String, required: false }
});

categorySchema.plugin(paginate);

interface CategoryDocument extends mongoose.Document, CategoryEntity {}

const CategoryModel = mongoose.model<
  CategoryDocument,
  mongoose.PaginateModel<CategoryDocument>
>("Categories", categorySchema);

export const CategoryRepository = Object.freeze({
  findById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("The Id is not valid.");
    }
    return CategoryModel.findById(id);
  },
  findByIds: async (ids: string[]) => {
    if (ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      throw new Error("The Id is not valid.");
    }
    return CategoryModel.find({ _id: { $in: ids } });
  },
  findByName: async (name: string) => CategoryModel.findOne({ name }),
  getAll: async (search?: string, limit?: number, offset?: number) => {
    if (!search && !limit && !offset) {
      const data = await CategoryModel.find({});
      const result: PaginatedCategories = {
        total: data.length,
        items: data,
        offset: 0,
        limit: 0
      };
      return result;
    }
    const condition = search
      ? { name: { $regex: new RegExp(search), $options: "i" } }
      : {};

    try {
      const data = await CategoryModel.paginate(condition, { offset, limit });
      const result: PaginatedCategories = {
        total: data.totalDocs,
        items: data.docs,
        offset: data.offset,
        limit: data.limit
      };
      return result;
    } catch (error) {
      throw new Error(
        error.message || "Some error occurred while retrieving tutorials."
      );
    }
  },
  create: async (name: string, note: string) => {
    const category = new CategoryModel({ name, note });
    return category.save();
  },
  update: async (id: string, update: any) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("The Id is not valid.");
    }
    const filter = { _id: id };
    return CategoryModel.findOneAndUpdate(filter, update, {
      new: true
    });
  },
  delete: async (id: string) => {
    return CategoryModel.findByIdAndDelete(id);
  }
});

export default CategoryModel;
