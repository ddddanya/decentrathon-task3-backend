import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  date: number;
  providersCount: number;
  transactionsCount: number;
}

const StatisticsSchema: Schema = new Schema({
  date: {
    type: Number
  },
  providersCount: {
    type: Number,
  },
  transactionsCount: {
    type: Number
  }
});

const Statistics = mongoose.model<IProvider>("statistics", StatisticsSchema);

export default Statistics;
